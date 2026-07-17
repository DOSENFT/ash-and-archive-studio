// SPEC-001 §6 — the Binding transaction: the only path from ash/pencil to ink.
// Three phases: PLAN (pure, no writes — deterministic over the same ash, so the same
// log yields the same planHash), RATIFY (the plan is a value; the ceremony UI edits
// it — no API here), COMMIT (a single SQLite transaction: a killed process may never
// leave a partial Binding). I-1: every commit is executed by a human principal; there
// is no auto-bind. §4.2 write rule: Binding.commit is the second (and last) sanctioned
// writer of entries/entry_versions.
import { createHash } from "node:crypto";
import { ulid } from "../ids.js";
import { ok, fail, type Result } from "../result.js";
import type { DbHandle } from "../vault/platform.js";
import type { Ash } from "../ash/ash.js";
import { stableJson } from "../ash/folds.js";
import {
  BODY_SCHEMA_VERSION, ENTRY_KINDS, INVARIANT_WHEN_LOCKED, KIND_SCHEMAS, LINK_EXCLUSIONS,
  UNKNOWN_STATUS_FIELDS, searchableBodyText,
  type CanonStatus, type EntryKind, type LinkType,
} from "../archive/schemas.js";

// ---- plan value shapes (§6 phase 2: "it's data") ----

export type Disposition = "bind" | "blowAway" | "holdAsAsh";

export type EntryUpsert =
  | { op: "newEntry"; kind: EntryKind; body: Record<string, unknown>; statusIntent?: CanonStatus }
  | { op: "newVersion"; entryId: string; body: Record<string, unknown>; statusIntent?: CanonStatus; note?: string | null }
  | { op: "link"; from: string; to: string; type: LinkType; note?: string | null }
  | { op: "disclosure"; entryId: string; knownBy: string; via: string | null }
  | { op: "alias"; entryId: string; alias: string } // §7.3 — Binding-time attachment of table-coined names
  | { op: "clockAdvance"; entryId: string; step: number };

export interface PlanItem {
  key: string;                 // deterministic (derived from the source event ids, never random)
  upsert: EntryUpsert;
  citations: string[];         // the ash events this item was drafted from (§2.2 citations)
  disposition: Disposition;    // ceremony UI toggles: bind | blowAway | holdAsAsh
  ratifier: string;            // §6 ratification protocol annotation
  ratifiedBy?: string;         // set by the ceremony; commit checks it against ratifier (E-1302)
  challenged: boolean;         // binding.challenged without resolution — forced holdAsAsh
  leverTestFailed: boolean;    // v1.2 — E-1003 fires at binding.plan for truths without unlocks
  conflicts: string[];         // ContradictionCase ids touching this item (§7.4)
}

// §7.4 — typed case shape {kind, entries, versions, explanation}.
export interface ContradictionCase {
  id: string;
  kind: "name-collision" | "explicit-contradiction" | "link-contradiction";
  entries: string[];
  versions: string[];
  explanation: string;
}

export type RatificationProtocol = "player-ownership" | "dm-only" | "consensus";

export interface BindingPlan {
  worldId: string;
  sessionId: string;
  scenes: { sceneId: string | null; eventIds: string[]; struckEventIds: string[] }[];
  items: PlanItem[];
  conflicts: ContradictionCase[];
  ratificationProtocol: RatificationProtocol;
  planHash: string;            // stable hash of the ordered upsert list (see plan())
}

export interface BindingReceipt {
  planHash: string;
  mode: "full" | "banked";
  sessionId: string;
  chronicleEntry: string;      // the chronicle Session entry (both modes commit it)
  boundVersions: string[];
  ratifiedEvent: string;
  sealedEvent: string;
}

// ---- row shapes ----

interface EventRow {
  eventId: string; sessionId: string | null; sceneId: string | null; type: string;
  payload: string; actor: string; deviceSeq: number; struck: number;
}
interface HeadRow {
  id: string; kind: string; name: string; aliases: string; canonStatus: string;
  provenance: string; headVersion: string; archivedAt: string | null;
}
interface HeadVersionRow { versionId: string; ordinal: number; body: string }

// Case/diacritic-insensitive comparison for detector 1 (§7.4). Exported as the
// canon-semantics primitive the §7 Charter's docket and lock-time detection share.
export const normalizeName = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const normalize = normalizeName;

export class Binding {
  constructor(
    private readonly db: DbHandle,
    private readonly worldId: string,
    private readonly ash: Ash,
  ) {}

  // ---- Phase 1 — PLAN (pure; no writes) ----

  plan(sessionId: string): Result<BindingPlan> {
    const opened = this.db.get<{ eventId: string }>(
      `SELECT eventId FROM events WHERE type='session.opened' AND sessionId=?`, sessionId);
    if (!opened) return fail("E-1101", `Session not found: ${sessionId}`);

    const rows = this.db.all<EventRow>(
      `SELECT eventId, sessionId, sceneId, type, payload, actor, deviceSeq, struck
       FROM events WHERE sessionId=? ORDER BY lamport, deviceId`, sessionId);

    // Group by scene in order of first appearance; struck events arrive pre-judged
    // "blow away" (§3.4) — visible in the groups, never drafted into upserts.
    const scenes: BindingPlan["scenes"] = [];
    const sceneIx = new Map<string | null, number>();
    for (const r of rows) {
      let ix = sceneIx.get(r.sceneId);
      if (ix === undefined) {
        ix = scenes.length;
        sceneIx.set(r.sceneId, ix);
        scenes.push({ sceneId: r.sceneId, eventIds: [], struckEventIds: [] });
      }
      if (r.struck === 1) scenes[ix]!.struckEventIds.push(r.eventId);
      else scenes[ix]!.eventIds.push(r.eventId);
    }

    const unstruck = rows.filter((r) => r.struck === 0);
    const protocol = this.ratificationProtocol();
    const dismissed = new Set<string>();
    for (const r of unstruck) {
      if (r.type === "pencil.dismissed") dismissed.add((JSON.parse(r.payload) as { proposalId: string }).proposalId);
    }
    const unresolvedChallenges = this.unresolvedChallengeTargets();

    const items: PlanItem[] = [];
    const clockItemIx = new Map<string, number>();
    const clockFinal = new Map<string, number>();
    const aliasSeen = new Set<string>();
    const discloseSeen = new Set<string>();
    const sessionActors = [...new Set(unstruck.map((r) => r.actor))].sort();

    const mkItem = (key: string, upsert: EntryUpsert, citations: string[], actor: string): PlanItem => ({
      key, upsert, citations, disposition: "bind",
      ratifier: protocol === "dm-only" ? "owner" : protocol === "player-ownership" ? actor : "table",
      challenged: false, leverTestFailed: false, conflicts: [],
    });

    for (const r of unstruck) {
      const p = JSON.parse(r.payload) as Record<string, unknown>;
      switch (r.type) {
        case "pencil.proposed": {
          const proposalId = String(p.proposalId);
          if (dismissed.has(proposalId)) break;
          // Already drafted through archive.draft(provenance:'pencil')? Then the plan
          // proposes binding that working entry to ink; otherwise the proposal itself
          // is the draft of a new entry. Only pencil WORKING versions count — ink
          // versions (e.g., the chronicle entry) also cite events, but they are the
          // product of a Binding, not the draft of this proposal.
          const drafted = this.db.get<{ entryId: string }>(
            `SELECT entryId FROM entry_versions WHERE provenance='pencil' AND citations LIKE ? LIMIT 1`,
            `%"${r.eventId}"%`);
          if (drafted) {
            const head = this.head(drafted.entryId);
            if (!head || head.archivedAt !== null) break;
            const body = JSON.parse(this.headVersion(head.headVersion)?.body ?? "{}") as Record<string, unknown>;
            items.push(mkItem(`pp:${r.eventId}`,
              { op: "newVersion", entryId: drafted.entryId, body, note: null }, [r.eventId], r.actor));
          } else {
            const kind = String(p.targetKind) as EntryKind;
            items.push(mkItem(`pp:${r.eventId}`,
              { op: "newEntry", kind, body: (p.draft ?? {}) as Record<string, unknown> }, [r.eventId], r.actor));
          }
          break;
        }
        case "alias.noted": {
          const k = `${String(p.entryId)} ${String(p.alias)}`;
          if (aliasSeen.has(k)) break;
          aliasSeen.add(k);
          items.push(mkItem(`al:${r.eventId}`,
            { op: "alias", entryId: String(p.entryId), alias: String(p.alias) }, [r.eventId], r.actor));
          break;
        }
        case "truth.revealed": {
          // 'table' expands to the distinct actors seen in this session's ash — the
          // deterministic reading available inside the world file (see build report).
          const to = p.toActors === "table" ? sessionActors : (p.toActors as string[]);
          for (const knownBy of to) {
            const k = `${String(p.entryId)} ${knownBy}`;
            if (discloseSeen.has(k)) continue;
            discloseSeen.add(k);
            items.push(mkItem(`dc:${r.eventId}:${knownBy}`,
              { op: "disclosure", entryId: String(p.entryId), knownBy, via: r.eventId }, [r.eventId], r.actor));
          }
          break;
        }
        case "clock.ticked":
        case "clock.reversed": {
          const entryId = String(p.entryId);
          const step = Number(p.step);
          clockFinal.set(entryId, r.type === "clock.ticked" ? step : Math.max(0, step - 1));
          const ix = clockItemIx.get(entryId);
          if (ix === undefined) {
            clockItemIx.set(entryId, items.length);
            items.push(mkItem(`ck:${r.eventId}`,
              { op: "clockAdvance", entryId, step: 0 }, [r.eventId], r.actor));
          } else {
            items[ix]!.citations.push(r.eventId);
          }
          break;
        }
        default: break; // resident-fold material; it informs the ceremony, it drafts nothing
      }
    }
    for (const [entryId, ix] of clockItemIx) {
      (items[ix]!.upsert as { step: number }).step = clockFinal.get(entryId) ?? 0;
    }

    // Challenges (§6): items whose citations or target entry carry an unresolved
    // binding.challenged are forced to holdAsAsh until resolved.
    for (const item of items) {
      const entryId = "entryId" in item.upsert ? item.upsert.entryId : null;
      if (item.citations.some((c) => unresolvedChallenges.has(c)) || (entryId !== null && unresolvedChallenges.has(entryId))) {
        item.challenged = true;
        item.disposition = "holdAsAsh";
      }
    }

    // v1.2 — E-1003 Lever Test fires at binding.plan: a truth entering the Binding
    // must carry an active `unlocks` consequence. Failing items are marked and held;
    // commit() refuses to bind them (the teaching message text is the caller layer's).
    for (const item of items) {
      const u = item.upsert;
      const isTruth =
        (u.op === "newEntry" && u.kind === "truth") ||
        (u.op === "newVersion" && this.head(u.entryId)?.kind === "truth");
      if (!isTruth) continue;
      if (!this.passesLeverTest(u, items)) {
        item.leverTestFailed = true;
        if (item.disposition === "bind") item.disposition = "holdAsAsh";
      }
    }

    // §7.4 contradiction detection (runs inside binding.plan) — conflicts are marked,
    // not blocking; the ceremony resolves or defers them.
    const conflicts = this.detect(items);

    // planHash — stable hash of the ordered upsert list. sessionId and citations are
    // folded in so the hash identifies THIS session's material (idempotency is by
    // planHash across the world's whole event log; see build report).
    const planHash = createHash("sha256")
      .update(stableJson({ sessionId, upserts: items.map((i) => ({ upsert: i.upsert, citations: i.citations })) }))
      .digest("hex");

    return ok({ worldId: this.worldId, sessionId, scenes, items, conflicts, ratificationProtocol: protocol, planHash });
  }

  // ---- Phase 3 — COMMIT (single SQLite transaction) ----

  commit(plan: BindingPlan, actor: string, mode: "full" | "banked"): Result<BindingReceipt> {
    if (this.ash.isReadOnly()) return fail("E-1202", "Ash is read-only; the Binding cannot seal.");

    // Idempotency by planHash: E-1301 AlreadyBound → the original receipt (no writes).
    const prior = this.findReceipt(plan.planHash);
    if (prior) return fail("E-1301", `Plan ${plan.planHash} is already bound (idempotent return).`, prior);

    // 'banked' commits ONLY the chronicle Session entry + seal; every upsert is left
    // as holdAsAsh for later ratification at the Desk (§6).
    const bindItems = mode === "full" ? plan.items.filter((i) => i.disposition === "bind") : [];

    // Validate everything before writing anything (errors are values; the transaction
    // below still guards the storage layer).
    const unresolvedChallenges = this.unresolvedChallengeTargets();
    for (const item of bindItems) {
      const entryId = "entryId" in item.upsert ? item.upsert.entryId : null;
      const challenged = item.challenged
        || item.citations.some((c) => unresolvedChallenges.has(c))
        || (entryId !== null && unresolvedChallenges.has(entryId));
      if (challenged) {
        return fail("E-1303", `Item ${item.key} is challenged and unresolved; it must holdAsAsh.`);
      }
      if (plan.ratificationProtocol !== "consensus") {
        const ratifiedBy = item.ratifiedBy ?? actor;
        if (ratifiedBy !== item.ratifier) {
          return fail("E-1302", `Item ${item.key} must be ratified by '${item.ratifier}', not '${ratifiedBy}' (${plan.ratificationProtocol}).`);
        }
      }
      const v = this.validateUpsert(item, plan);
      if (!v.ok) return v as Result<BindingReceipt>;
    }

    const now = new Date().toISOString();
    const boundVersions: string[] = [];
    const created = new Map<string, string>(); // item key -> entryId minted at commit
    this.db.exec("BEGIN");
    try {
      for (const item of bindItems) {
        const vid = this.applyUpsert(item, actor, now, created);
        if (vid !== null) boundVersions.push(vid);
      }

      // The chronicle Session entry — committed in BOTH modes (§6 banked: "commits
      // ONLY the chronicle Session entry + seal").
      const sessionOrdinal = (this.db.get<{ c: number }>(
        `SELECT COUNT(*) c FROM entries WHERE kind='session'`)?.c ?? 0) + 1;
      const chronicleEntry = ulid();
      const chronicleVersion = ulid();
      const chronicleCitations = plan.scenes.flatMap((s) => s.eventIds);
      this.db.run(
        `INSERT INTO entries (id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt)
         VALUES (?,?,?,?,'locked','ink',?,?,?,NULL)`,
        chronicleEntry, "session", `Session ${sessionOrdinal}`, "[]", chronicleVersion, now, now);
      const chronicleBody = { name: `Session ${sessionOrdinal}`, sessionId: plan.sessionId };
      this.db.run(
        `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
         VALUES (?,?,1,?,?,'locked','ink',?,?,NULL,NULL,?)`,
        chronicleVersion, chronicleEntry, JSON.stringify(chronicleBody), BODY_SCHEMA_VERSION,
        actor, JSON.stringify(chronicleCitations), now);
      this.ftsIndex(chronicleEntry, `Session ${sessionOrdinal}`, [], chronicleBody);
      boundVersions.push(chronicleVersion);

      // Emitted BY the Binding transaction (§3.2) — same transaction, or nothing.
      const ratified = this.ash.appendInTx("binding.ratified",
        { planHash: plan.planHash, boundVersions }, { actor, sessionId: plan.sessionId });
      if (!ratified.ok) { this.db.exec("ROLLBACK"); this.ash.txRolledBack(); return ratified as Result<BindingReceipt>; }
      const sealed = this.ash.appendInTx("binding.sealed",
        { mode, chronicleEntry }, { actor, sessionId: plan.sessionId });
      if (!sealed.ok) { this.db.exec("ROLLBACK"); this.ash.txRolledBack(); return sealed as Result<BindingReceipt>; }

      // Docket unresolved conflicts to the Charter: entry-pair cases surface as
      // machine-written `contradicts` links (§2.3 — the one machine-writable type);
      // the §7 docket reads them (step 5).
      if (mode === "full") this.docketConflicts(plan, created, now);

      this.db.exec("COMMIT");
      this.ash.txCommitted();
      return ok({
        planHash: plan.planHash, mode, sessionId: plan.sessionId,
        chronicleEntry, boundVersions,
        ratifiedEvent: ratified.value.eventId, sealedEvent: sealed.value.eventId,
      });
    } catch (err) {
      this.db.exec("ROLLBACK");
      this.ash.txRolledBack();
      throw err; // storage failure is a defect surface; the vault holds no partial Binding
    }
  }

  // ---- internal: plan helpers ----

  /** §6 — the protocol is a world setting stored as a Ruling entry; default player-ownership. */
  private ratificationProtocol(): RatificationProtocol {
    const rows = this.db.all<{ body: string }>(
      `SELECT v.body FROM entries e JOIN entry_versions v ON v.versionId=e.headVersion
       WHERE e.kind='ruling' AND e.archivedAt IS NULL ORDER BY e.id DESC`);
    for (const r of rows) {
      const p = (JSON.parse(r.body) as Record<string, unknown>).ratificationProtocol;
      if (p === "player-ownership" || p === "dm-only" || p === "consensus") return p;
    }
    return "player-ownership";
  }

  private unresolvedChallengeTargets(): Set<string> {
    const challenged = this.db.all<{ payload: string }>(
      `SELECT payload FROM events WHERE type='binding.challenged' AND struck=0`);
    const resolved = new Set(this.db.all<{ payload: string }>(
      `SELECT payload FROM events WHERE type='binding.challenge.resolved' AND struck=0`)
      .map((r) => (JSON.parse(r.payload) as { target: string }).target));
    const out = new Set<string>();
    for (const c of challenged) {
      const target = (JSON.parse(c.payload) as { target: string }).target;
      if (!resolved.has(target)) out.add(target);
    }
    return out;
  }

  /** v1.2 Lever Test: an active `unlocks` link from the truth, or a bind-disposed
   *  link upsert in this very plan adding one. */
  private passesLeverTest(u: EntryUpsert, items: PlanItem[]): boolean {
    const entryId = u.op === "newVersion" ? u.entryId : null;
    if (entryId !== null) {
      const active = this.db.get<{ id: string }>(
        `SELECT id FROM links WHERE fromEntry=? AND type='unlocks' AND endedByVersion IS NULL`, entryId);
      if (active) return true;
    }
    return items.some((i) =>
      i.disposition !== "blowAway" && i.upsert.op === "link" && i.upsert.type === "unlocks"
      && entryId !== null && i.upsert.from === entryId);
  }

  /** §7.4 — the three deterministic detectors (the floor that works with AI absent).
   *  Public as a canon-semantics primitive (§1.1): plan() runs it, and the ceremony
   *  re-runs it over an edited plan value (phase 2 edits drafts; the marks must follow).
   *  Items' conflict marks are recomputed in place; the fresh case list is returned. */
  detect(items: PlanItem[]): ContradictionCase[] {
    for (const item of items) item.conflicts = [];
    const cases: ContradictionCase[] = [];
    const file = (item: PlanItem, c: ContradictionCase): void => {
      cases.push(c);
      item.conflicts.push(c.id);
    };
    for (const item of items) {
      const u = item.upsert;
      if (u.op === "newEntry") {
        // 1 — name/alias collision, same kind, case/diacritic-insensitive.
        const names = [u.body.name, ...(Array.isArray(u.body.aliases) ? u.body.aliases : [])]
          .filter((n): n is string => typeof n === "string").map(normalize);
        const existing = this.db.all<HeadRow>(
          `SELECT id, kind, name, aliases, canonStatus, provenance, headVersion, archivedAt
           FROM entries WHERE kind=? AND archivedAt IS NULL`, u.kind);
        for (const e of existing) {
          const theirs = [e.name, ...(JSON.parse(e.aliases) as string[])].map(normalize);
          if (names.some((n) => theirs.includes(n))) {
            file(item, {
              id: `case:name:${item.key}:${e.id}`, kind: "name-collision",
              entries: [e.id], versions: [e.headVersion],
              explanation: `New ${u.kind} '${String(u.body.name)}' collides with existing entry '${e.name}' (${e.id}).`,
            });
          }
        }
      }
      if (u.op === "newVersion") {
        // 2 — explicit contradiction on invariantWhenLocked fields of a locked version.
        const head = this.head(u.entryId);
        if (head && head.canonStatus === "locked") {
          const hv = this.headVersion(head.headVersion);
          const current = hv ? (JSON.parse(hv.body) as Record<string, unknown>) : {};
          for (const field of INVARIANT_WHEN_LOCKED[head.kind as EntryKind] ?? []) {
            if (field in current && stableJson(current[field]) !== stableJson(u.body[field])) {
              file(item, {
                id: `case:invariant:${item.key}:${field}`, kind: "explicit-contradiction",
                entries: [u.entryId], versions: [head.headVersion],
                explanation: `Proposed version contradicts LOCKED ${head.kind} '${head.name}' on invariant field '${field}'.`,
              });
            }
          }
        }
      }
      if (u.op === "link") {
        // 3 — duplicate-with-conflict per the declared exclusion table.
        for (const [a, b] of LINK_EXCLUSIONS) {
          const other = u.type === a ? b : u.type === b ? a : null;
          if (other === null) continue;
          const clash = this.db.get<{ id: string; sinceVersion: string }>(
            `SELECT id, sinceVersion FROM links WHERE fromEntry=? AND toEntry=? AND type=? AND endedByVersion IS NULL`,
            u.from, u.to, other);
          const inPlan = items.some((i) => i !== item && i.disposition !== "blowAway"
            && i.upsert.op === "link" && i.upsert.from === u.from && i.upsert.to === u.to && i.upsert.type === other);
          if (clash || inPlan) {
            file(item, {
              id: `case:link:${item.key}:${other}`, kind: "link-contradiction",
              entries: [u.from, u.to], versions: clash ? [clash.sinceVersion] : [],
              explanation: `'${u.type}' and '${other}' cannot both be active between ${u.from} and ${u.to}.`,
            });
          }
        }
      }
    }
    return cases;
  }

  // ---- internal: commit helpers ----

  /** Reconstruct the original receipt from the ash (receipts are event-derived, not stored). */
  private findReceipt(planHash: string): BindingReceipt | null {
    const ratified = this.db.get<{ eventId: string; sessionId: string | null; payload: string; deviceSeq: number }>(
      `SELECT eventId, sessionId, payload, deviceSeq FROM events
       WHERE type='binding.ratified' AND struck=0 AND json_extract(payload,'$.planHash')=?
       ORDER BY deviceSeq ASC LIMIT 1`, planHash);
    if (!ratified) return null;
    const sealed = this.db.get<{ eventId: string; payload: string }>(
      `SELECT eventId, payload FROM events WHERE type='binding.sealed' AND struck=0 AND deviceSeq>?
       ORDER BY deviceSeq ASC LIMIT 1`, ratified.deviceSeq);
    const rp = JSON.parse(ratified.payload) as { planHash: string; boundVersions: string[] };
    const sp = sealed ? (JSON.parse(sealed.payload) as { mode: "full" | "banked"; chronicleEntry: string }) : null;
    return {
      planHash: rp.planHash, mode: sp?.mode ?? "full", sessionId: ratified.sessionId ?? "",
      chronicleEntry: sp?.chronicleEntry ?? "", boundVersions: rp.boundVersions,
      ratifiedEvent: ratified.eventId, sealedEvent: sealed?.eventId ?? "",
    };
  }

  private validateUpsert(item: PlanItem, plan: BindingPlan): Result<void> {
    const u = item.upsert;
    switch (u.op) {
      case "newEntry": {
        if (!ENTRY_KINDS.includes(u.kind)) return fail("E-1001", `Unknown entry kind: ${u.kind} (item ${item.key})`);
        const parsed = KIND_SCHEMAS[u.kind].safeParse(u.body);
        if (!parsed.success) {
          return fail("E-1001", `Body schema mismatch for kind '${u.kind}' (item ${item.key})`,
            parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
        }
        const status = u.statusIntent ?? "provisional";
        if (status === "unknown") {
          const un = UNKNOWN_STATUS_FIELDS.safeParse(u.body);
          if (!un.success) {
            return fail("E-1001", `canonStatus 'unknown' requires bounds/whyUnknown/tableTests/payoff (item ${item.key})`,
              un.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
          }
        }
        if (u.kind === "truth" && item.leverTestFailed) {
          return fail("E-1003", `Truth in item ${item.key} has no unlocks consequence (Lever Test, v1.2).`);
        }
        return ok(undefined);
      }
      case "newVersion": {
        const head = this.head(u.entryId);
        if (!head) return fail("E-1101", `Entry not found: ${u.entryId} (item ${item.key})`);
        const kind = head.kind as EntryKind;
        const parsed = KIND_SCHEMAS[kind].safeParse(u.body);
        if (!parsed.success) {
          return fail("E-1001", `Body schema mismatch for kind '${kind}' (item ${item.key})`,
            parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
        }
        const st = this.resolveStatus(head.canonStatus as CanonStatus, u.statusIntent);
        if (!st.ok) return fail(st.error.code, `${st.error.message} (item ${item.key})`);
        if (st.value === "unknown") {
          const un = UNKNOWN_STATUS_FIELDS.safeParse(u.body);
          if (!un.success) {
            return fail("E-1001", `canonStatus 'unknown' requires bounds/whyUnknown/tableTests/payoff (item ${item.key})`,
              un.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
          }
        }
        if (kind === "truth" && !this.passesLeverTest(u, plan.items)) {
          return fail("E-1003", `Truth ${u.entryId} has no active unlocks consequence (Lever Test, v1.2).`);
        }
        return ok(undefined);
      }
      case "link": {
        if (u.from === u.to) return fail("E-1001", `Self-links are invalid (§2.3, item ${item.key}).`);
        if (!this.head(u.from)) return fail("E-1101", `Entry not found: ${u.from} (item ${item.key})`);
        if (!this.head(u.to)) return fail("E-1101", `Entry not found: ${u.to} (item ${item.key})`);
        const dup = this.db.get<{ id: string }>(
          `SELECT id FROM links WHERE fromEntry=? AND toEntry=? AND type=? AND endedByVersion IS NULL`,
          u.from, u.to, u.type);
        if (dup) return fail("E-1103", `Duplicate active link ${u.from} -[${u.type}]-> ${u.to} (item ${item.key})`);
        return ok(undefined);
      }
      case "disclosure":
      case "alias":
      case "clockAdvance": {
        if (!this.head(u.entryId)) return fail("E-1101", `Entry not found: ${u.entryId} (item ${item.key})`);
        return ok(undefined);
      }
    }
  }

  /** §2/§7.1 status machine at the Binding: provisional→locked ("binding with lock
   *  intent"), unknown→provisional|locked ("discovery ratified"), otherwise a new
   *  version keeps its status. locked never demotes here (charter.demote only). */
  private resolveStatus(current: CanonStatus, intent: CanonStatus | undefined): Result<CanonStatus> {
    if (intent === undefined || intent === current) {
      return ok(current);
    }
    if (current === "provisional" && intent === "locked") return ok("locked");
    if (current === "unknown" && (intent === "provisional" || intent === "locked")) return ok(intent);
    return fail("E-1001", `Invalid status transition ${current} → ${intent} (§7.1).`);
  }

  /** Apply one bind-disposed upsert inside the open transaction. Returns the written
   *  versionId for version-producing ops, null otherwise. Preconditions were validated. */
  private applyUpsert(item: PlanItem, actor: string, now: string, created: Map<string, string>): string | null {
    const u = item.upsert;
    switch (u.op) {
      case "newEntry": {
        const status = u.statusIntent ?? "provisional";
        const entryId = ulid();
        created.set(item.key, entryId);
        const versionId = ulid();
        const body = KIND_SCHEMAS[u.kind].parse(u.body) as Record<string, unknown>;
        const name = body.name as string;
        this.db.run(
          `INSERT INTO entries (id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt)
           VALUES (?,?,?,?,?,'ink',?,?,?,NULL)`,
          entryId, u.kind, name, "[]", status, versionId, now, now);
        this.db.run(
          `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
           VALUES (?,?,1,?,?,?,'ink',?,?,NULL,NULL,?)`,
          versionId, entryId, JSON.stringify(body), BODY_SCHEMA_VERSION, status, actor,
          JSON.stringify(item.citations), now);
        this.ftsIndex(entryId, name, [], body);
        return versionId;
      }
      case "newVersion":
        return this.writeVersion(u.entryId, u.body, u.statusIntent, u.note ?? null, item.citations, actor, now);
      case "clockAdvance": {
        // Clock advances are canon as a new ink version carrying the confirmed step.
        const head = this.head(u.entryId)!;
        const body = JSON.parse(this.headVersion(head.headVersion)?.body ?? "{}") as Record<string, unknown>;
        return this.writeVersion(u.entryId, { ...body, currentStep: u.step }, undefined,
          `binding: clock advanced to step ${u.step}`, item.citations, actor, now);
      }
      case "link": {
        const from = this.head(u.from)!;
        this.db.run(
          `INSERT INTO links (id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt)
           VALUES (?,?,?,?,?,NULL,?,?)`,
          ulid(), u.from, u.to, u.type, from.headVersion, u.note ?? null, now);
        return null;
      }
      case "disclosure": {
        const head = this.head(u.entryId)!;
        this.db.run(
          `INSERT INTO disclosures (id,entryId,atVersion,knownBy,via,createdAt) VALUES (?,?,?,?,?,?)
           ON CONFLICT(entryId, knownBy) DO UPDATE SET atVersion=excluded.atVersion, via=excluded.via`,
          ulid(), u.entryId, head.headVersion, u.knownBy, u.via, now);
        return null;
      }
      case "alias": {
        // §7.3 — Binding-time attachment of a table-coined name; head-level, no version.
        const head = this.head(u.entryId)!;
        const aliases = JSON.parse(head.aliases) as string[];
        if (!aliases.includes(u.alias) && u.alias !== head.name) {
          aliases.push(u.alias);
          this.db.run(`UPDATE entries SET aliases=? WHERE id=?`, JSON.stringify(aliases), u.entryId);
          const body = JSON.parse(this.headVersion(head.headVersion)?.body ?? "{}") as Record<string, unknown>;
          this.ftsIndex(u.entryId, head.name, aliases, body);
        }
        return null;
      }
    }
  }

  private writeVersion(
    entryId: string, rawBody: Record<string, unknown>, statusIntent: CanonStatus | undefined,
    note: string | null, citations: string[], actor: string, now: string,
  ): string {
    const head = this.head(entryId)!;
    const kind = head.kind as EntryKind;
    const body = KIND_SCHEMAS[kind].parse(rawBody) as Record<string, unknown>;
    const st = this.resolveStatus(head.canonStatus as CanonStatus, statusIntent);
    const status = st.ok ? st.value : (head.canonStatus as CanonStatus); // validated earlier; defensive
    const hv = this.headVersion(head.headVersion)!;
    const name = body.name as string;
    const aliases = JSON.parse(head.aliases) as string[];
    if (name !== head.name && !aliases.includes(head.name)) aliases.push(head.name); // §7.3
    const versionId = ulid();
    this.db.run(
      `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
       VALUES (?,?,?,?,?,?,'ink',?,?,?,?,?)`,
      versionId, entryId, hv.ordinal + 1, JSON.stringify(body), BODY_SCHEMA_VERSION,
      status, actor, JSON.stringify(citations), head.headVersion, note, now);
    this.db.run(
      `UPDATE entries SET headVersion=?, name=?, aliases=?, canonStatus=?, boundAt=? WHERE id=?`,
      versionId, name, JSON.stringify(aliases), status, now, entryId);
    this.ftsIndex(entryId, name, aliases, body);
    return versionId;
  }

  /** Unresolved conflicts docket to the Charter as machine-written `contradicts`
   *  links between entry pairs (§2.3 machine-writable; §7 reads the docket). A case
   *  on a newEntry item pairs with the entry this very commit minted. Single-entry
   *  cases (e.g., an invariant conflict inside one entry) re-surface at the next
   *  plan() — their persistence is §7 Charter territory (step 5). */
  private docketConflicts(plan: BindingPlan, created: Map<string, string>, now: string): void {
    const caseById = new Map(plan.conflicts.map((c) => [c.id, c]));
    for (const item of plan.items) {
      if (item.conflicts.length === 0 || item.disposition === "blowAway") continue;
      const own = created.get(item.key) ?? ("entryId" in item.upsert ? item.upsert.entryId : null);
      for (const caseId of item.conflicts) {
        const c = caseById.get(caseId);
        if (!c) continue;
        const candidates = [...new Set([...(own !== null ? [own] : []), ...c.entries])];
        if (candidates.length < 2) continue;
        const [a, b] = [candidates[0]!, candidates[1]!];
        if (!this.head(a) || !this.head(b)) continue;
        const dup = this.db.get<{ id: string }>(
          `SELECT id FROM links WHERE type='contradicts' AND endedByVersion IS NULL
           AND ((fromEntry=? AND toEntry=?) OR (fromEntry=? AND toEntry=?))`, a, b, b, a);
        if (dup) continue;
        this.db.run(
          `INSERT INTO links (id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt)
           VALUES (?,?,?,'contradicts',?,NULL,?,?)`,
          // Note carries the case kind as a machine-readable prefix so the §7 docket
          // reconstructs the typed ContradictionCase from the link (step 5).
          ulid(), a, b, this.head(a)!.headVersion, `[${c.kind}] ${c.explanation}`, now);
      }
    }
  }

  private head(id: string): HeadRow | undefined {
    return this.db.get<HeadRow>(
      `SELECT id, kind, name, aliases, canonStatus, provenance, headVersion, archivedAt
       FROM entries WHERE id=?`, id);
  }

  private headVersion(versionId: string): HeadVersionRow | undefined {
    return this.db.get<HeadVersionRow>(
      `SELECT versionId, ordinal, body FROM entry_versions WHERE versionId=?`, versionId);
  }

  private ftsIndex(entryId: string, name: string, aliases: string[], body: Record<string, unknown>): void {
    const row = this.db.get<{ rowid: number }>(`SELECT rowid FROM entries WHERE id=?`, entryId);
    if (!row) return;
    this.db.run(`INSERT INTO entries_fts (rowid,name,aliases,bodyText) VALUES (?,?,?,?)`,
      row.rowid, name, aliases.join(" "), searchableBodyText(body));
  }
}
