// SPEC-001 §7 — Canon semantics: the Charter surface.
// lock/demote (the §7.1 status machine as explicit Charter acts), the Contradiction
// docket over the machine-written `contradicts` links (§7.4, written by Binding.commit
// and by lock-time detection here), resolve() executing the methodology's three patches,
// the §7.5 Readiness Gate (v1.2 enumerated ReadinessReport; readiness-visibility rule:
// only core kind-body fields are read — never body.ext), and the rulings surface.
// NOTE (§3.2): the closed 68-type event vocabulary contains no charter.* event types;
// Charter acts therefore create EntryVersions (§7.1 "all transitions create versions")
// and append no ash — minting a type would violate §14.5.
import { ulid } from "../ids.js";
import { ok, fail, type Result } from "../result.js";
import type { DbHandle } from "../vault/platform.js";
import { stableJson } from "../ash/folds.js";
import { normalizeName, type ContradictionCase } from "../binding/binding.js";
import type { Archive, EntryView } from "../archive/archive.js";
import {
  BODY_SCHEMA_VERSION, INVARIANT_WHEN_LOCKED, KIND_SCHEMAS, LINK_EXCLUSIONS,
  searchableBodyText, type CanonStatus, type EntryKind,
} from "../archive/schemas.js";

// ---- §7.4 resolution shapes (the methodology's three patches) ----
// PatchChoice concrete shapes are not enumerated by SPEC-001; these are the minimal
// typed carriers of the three dictated semantics (see build report — non-silent).
export type PatchChoice =
  | { patch: "minimal"; entryId: string; body: Record<string, unknown>; note?: string } // edit the incoming draft
  | { patch: "clean"; entryId: string; body: Record<string, unknown>; note?: string }   // new version of the existing entry
  | { patch: "story"; truthBody: Record<string, unknown>; note?: string };              // both stand; a new truth explains

// ---- §7.5 v1.2 — the enumerated ReadinessReport shape ----
// Domain identifiers follow SPEC-003 §5's sealed domain→room routing table.
export type ReadinessDomainKey =
  | "gravity-truths" | "power-lattice" | "constraints-chokepoints" | "constraints-scarcity"
  | "faith-magic" | "toys" | "truths" | "unknowns";

export interface ReadinessDomain { domain: ReadinessDomainKey; count: number; min: number; met: boolean }
export interface MissingMinimum { domain: ReadinessDomainKey; need: number; have: number }
export interface BuildStep { action: "draft" | "link" | "revise"; kind: EntryKind; hint: string }
export interface ReadinessReport {
  verdict: "pass" | "borderline" | "fail";
  domains: ReadinessDomain[];
  missing: MissingMinimum[];
  smallestNextBuild: BuildStep[];
}

// §7.5 — thresholds are data (a Ruling entry), not code. Defaults are the checklist's.
interface Thresholds {
  gravityMin: number; gravityMax: number;
  latticeActors: number; latticePairs: number;
  chokepoints: number; scarcity: number; faithMagic: number;
  toys: number; truths: number; unknowns: number;
}
const DEFAULT_THRESHOLDS: Thresholds = {
  gravityMin: 3, gravityMax: 7, latticeActors: 5, latticePairs: 2,
  chokepoints: 3, scarcity: 1, faithMagic: 1, toys: 12, truths: 10, unknowns: 3,
};
// Ruling-body keys that override defaults (domain names per the sealed routing table;
// the two compound criteria carry suffixed keys).
const THRESHOLD_KEYS: Record<string, keyof Thresholds> = {
  "gravity-truths": "gravityMin", "gravity-truths-max": "gravityMax",
  "power-lattice": "latticeActors", "power-lattice-pairs": "latticePairs",
  "constraints-chokepoints": "chokepoints", "constraints-scarcity": "scarcity",
  "faith-magic": "faithMagic", "toys": "toys", "truths": "truths", "unknowns": "unknowns",
};

interface HeadRow {
  id: string; kind: string; name: string; aliases: string; canonStatus: string;
  provenance: string; headVersion: string; createdAt: string; archivedAt: string | null;
}
interface VersionRow { versionId: string; ordinal: number; body: string; canonStatus: string }
interface LinkRow { id: string; fromEntry: string; toEntry: string; type: string; sinceVersion: string; note: string | null }

const nonempty = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;

// SPEC-003 §2 (domain mapping over core §2.2 bodies): a complete Toy carries
// {goal, method, activeProblem, hooks[2], lever, escalation}.
function toyComplete(body: Record<string, unknown>): boolean {
  return nonempty(body.goal) && nonempty(body.method) && nonempty(body.activeProblem)
    && Array.isArray(body.hooks) && body.hooks.filter(nonempty).length >= 2
    && nonempty(body.lever) && nonempty(body.escalation);
}

export class Charter {
  constructor(
    private readonly db: DbHandle,
    private readonly worldId: string,
    private readonly archive: Archive,
  ) {}

  // ---- §7.2 lock / demote (§7.1 status machine) ----

  lock(entryId: string, actor: string, note?: string): Result<EntryView> {
    const head = this.head(entryId);
    if (!head || head.archivedAt !== null) return fail("E-1101", `Entry not found: ${entryId}`);
    // I-4/§8 — pencil can never transition directly to LOCKED without a Binding;
    // pencil-provenance versions cannot be cited by charter.lock().
    if (head.provenance === "pencil") {
      return fail("E-1001", `Entry ${entryId} is pencil provenance; only a Binding can carry it to canon (I-4).`);
    }
    // §7.1 — the only lock edge is provisional → locked. unknown transitions only via
    // a Binding ("discovery ratified"); locked → locked is not a transition.
    if (head.canonStatus !== "provisional") {
      return fail("E-1001", `Invalid status transition ${head.canonStatus} → locked (§7.1).`);
    }
    // v1.2 / ADR-003-D — the Lever Test fires HERE (and at binding.plan), never at draft.
    if (head.kind === "truth" && !this.hasActiveUnlocks(entryId)) {
      return fail("E-1003", `Truth ${entryId} has no active unlocks consequence (Lever Test, v1.2).`);
    }
    const hv = this.version(head.headVersion);
    if (!hv) return fail("E-1101", `Head version missing for entry ${entryId}`);
    const body = JSON.parse(hv.body) as Record<string, unknown>;
    const now = new Date().toISOString();
    this.db.exec("BEGIN");
    try {
      this.writeVersion(head, body, "locked", note ?? null, actor, now, true);
      // §7.4 — contradiction detection runs on charter.lock(). Findings are marks
      // (docketed contradicts links), never a rejection (ADR-003-D's philosophy;
      // §7.3: name collisions are legal but surfaced as docket-level warnings).
      this.docketLockFindings(head, now);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err; // storage failure is a defect surface, not a domain outcome
    }
    return this.archive.get(entryId);
  }

  demote(entryId: string, actor: string, note: string): Result<EntryView> {
    if (!nonempty(note)) return fail("E-1001", "charter.demote requires a note (§7.2).");
    const head = this.head(entryId);
    if (!head || head.archivedAt !== null) return fail("E-1101", `Entry not found: ${entryId}`);
    // §7.1 — locked → provisional (with note) is the only demote edge; locked → unknown
    // is invalid (you cannot un-know).
    if (head.canonStatus !== "locked") {
      return fail("E-1001", `Invalid status transition ${head.canonStatus} → provisional via demote (§7.1: demote applies to locked).`);
    }
    const hv = this.version(head.headVersion);
    if (!hv) return fail("E-1101", `Head version missing for entry ${entryId}`);
    const body = JSON.parse(hv.body) as Record<string, unknown>;
    const now = new Date().toISOString();
    this.db.exec("BEGIN");
    try {
      this.writeVersion(head, body, "provisional", note, actor, now, false);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
    return this.archive.get(entryId);
  }

  // ---- §7.2 docket ----

  /** The Contradiction Bench's worklist. Sources, all deterministic from state:
   *  (1) active `contradicts` links (machine-written by Binding.commit / lock-time
   *      detection, or human/pencil-filed through the same APIs — §7.4);
   *  (2) the §7.3 naming-sprawl guard — live same-kind name/alias collisions;
   *  (3) live link-exclusion violations (both of an excluded pair active);
   *  (4) single-entry invariant cases — a LOCKED head whose invariant fields differ
   *      from the latest prior LOCKED version (the §7.4 detector-2 mark, persistent
   *      until a resolution version re-affirms the fields). */
  docket(): Result<ContradictionCase[]> {
    const cases: ContradictionCase[] = [];
    const links = this.db.all<LinkRow>(
      `SELECT id, fromEntry, toEntry, type, sinceVersion, note FROM links WHERE endedByVersion IS NULL`);
    const contradictsPairs = new Set<string>();
    const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

    // (1) link-backed cases
    for (const l of links) {
      if (l.type !== "contradicts") continue;
      contradictsPairs.add(pairKey(l.fromEntry, l.toEntry));
      const m = /^\[(name-collision|explicit-contradiction|link-contradiction)\]\s*/.exec(l.note ?? "");
      cases.push({
        id: `case:docket:${l.id}`,
        // Human/Dramaturg-filed contradicts links assert a content contradiction;
        // machine-written links carry their detector kind in the note prefix.
        kind: (m?.[1] as ContradictionCase["kind"]) ?? "explicit-contradiction",
        entries: [l.fromEntry, l.toEntry],
        versions: [l.sinceVersion],
        explanation: (l.note ?? "").replace(/^\[[a-z-]+\]\s*/, ""),
      });
    }

    const heads = this.db.all<HeadRow>(
      `SELECT id, kind, name, aliases, canonStatus, provenance, headVersion, createdAt, archivedAt
       FROM entries WHERE archivedAt IS NULL ORDER BY id ASC`);

    // (2) naming-sprawl guard (§7.3 — legal, surfaced as a docket-level warning).
    // Compares CURRENT display names only: aliases are history (renames never replace),
    // so alias↔name matching would re-flag every resolve-by-rename forever. The full
    // name/alias matching of detector 1 still runs on new material at plan/lock.
    const byKind = new Map<string, { id: string; name: string; names: string[]; headVersion: string }[]>();
    for (const h of heads) {
      const names = [normalizeName(h.name)];
      const list = byKind.get(h.kind) ?? [];
      list.push({ id: h.id, name: h.name, names, headVersion: h.headVersion });
      byKind.set(h.kind, list);
    }
    for (const [kind, list] of byKind) {
      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const a = list[i]!, b = list[j]!;
          if (!a.names.some((n) => b.names.includes(n))) continue;
          if (contradictsPairs.has(pairKey(a.id, b.id))) continue; // already docketed as a link
          cases.push({
            id: `case:naming:${a.id}:${b.id}`, kind: "name-collision",
            entries: [a.id, b.id], versions: [a.headVersion, b.headVersion],
            explanation: `${kind} '${a.name}' (${a.id}) and '${b.name}' (${b.id}) share a name/alias (naming-sprawl guard, §7.3).`,
          });
        }
      }
    }

    // (3) link-exclusion violations (§7.4 detector 3 over standing state)
    const active = new Map<string, LinkRow>();
    for (const l of links) active.set(`${l.fromEntry}|${l.toEntry}|${l.type}`, l);
    for (const l of links) {
      for (const [x, y] of LINK_EXCLUSIONS) {
        if (l.type !== x) continue; // visit each violating pair once, from the x side
        const other = active.get(`${l.fromEntry}|${l.toEntry}|${y}`);
        if (!other) continue;
        if (contradictsPairs.has(pairKey(l.fromEntry, l.toEntry))) continue;
        cases.push({
          id: `case:exclusion:${l.fromEntry}:${l.toEntry}`, kind: "link-contradiction",
          entries: [l.fromEntry, l.toEntry], versions: [l.sinceVersion, other.sinceVersion],
          explanation: `'${x}' and '${y}' cannot both be active between ${l.fromEntry} and ${l.toEntry}.`,
        });
      }
    }

    // (4) single-entry invariant cases (persist until a version re-affirms the fields)
    for (const h of heads) {
      if (h.canonStatus !== "locked") continue;
      const invariants = INVARIANT_WHEN_LOCKED[h.kind as EntryKind] ?? [];
      if (invariants.length === 0) continue;
      const hv = this.version(h.headVersion);
      if (!hv) continue;
      const prior = this.db.get<VersionRow>(
        `SELECT versionId, ordinal, body, canonStatus FROM entry_versions
         WHERE entryId=? AND canonStatus='locked' AND ordinal<? ORDER BY ordinal DESC LIMIT 1`,
        h.id, hv.ordinal);
      if (!prior) continue;
      const cur = JSON.parse(hv.body) as Record<string, unknown>;
      const old = JSON.parse(prior.body) as Record<string, unknown>;
      const changed = invariants.filter((f) => (f in old || f in cur) && stableJson(old[f]) !== stableJson(cur[f]));
      if (changed.length === 0) continue;
      cases.push({
        id: `case:invariant:${h.id}`, kind: "explicit-contradiction",
        entries: [h.id], versions: [prior.versionId, h.headVersion],
        explanation: `LOCKED ${h.kind} '${h.name}' changed invariant field(s) ${changed.join(", ")} across locked versions (§7.4).`,
      });
    }

    cases.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)); // deterministic
    return ok(cases);
  }

  // ---- §7.2/§7.4 resolve ----

  resolve(caseId: string, resolution: PatchChoice, actor: string): Result<EntryView[]> {
    const docket = this.docket();
    if (!docket.ok) return docket as unknown as Result<EntryView[]>;
    const c = docket.value.find((x) => x.id === caseId);
    if (!c) return fail("E-1101", `Docket case not found: ${caseId}`);
    const backingLinkId = caseId.startsWith("case:docket:") ? caseId.slice("case:docket:".length) : null;
    const now = new Date().toISOString();

    if (resolution.patch === "minimal" || resolution.patch === "clean") {
      // minimal = edit the incoming draft · clean = new version of the existing entry.
      // Which entry is which is the Bench's judgment; the choice names it explicitly
      // and must point inside the case.
      if (!c.entries.includes(resolution.entryId)) {
        return fail("E-1001", `PatchChoice entry ${resolution.entryId} is not part of case ${caseId}.`);
      }
      const head = this.head(resolution.entryId);
      if (!head || head.archivedAt !== null) return fail("E-1101", `Entry not found: ${resolution.entryId}`);
      const parsed = KIND_SCHEMAS[head.kind as EntryKind].safeParse(resolution.body);
      if (!parsed.success) {
        return fail("E-1001", `Body schema mismatch for kind '${head.kind}'`,
          parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
      }
      const note = resolution.note ?? `charter.resolve: ${resolution.patch} patch for ${caseId}`;
      this.db.exec("BEGIN");
      try {
        // Status is preserved (§7.1: same status unless explicitly transitioned) —
        // for a LOCKED entry this IS I-3's "canon correction is a new EntryVersion".
        this.writeVersion(head, parsed.data as Record<string, unknown>,
          head.canonStatus as CanonStatus, note, actor, now, false);
        if (backingLinkId !== null) this.endLinkInTx(backingLinkId);
        this.db.exec("COMMIT");
      } catch (err) {
        this.db.exec("ROLLBACK");
        throw err;
      }
      const view = this.archive.get(resolution.entryId);
      return view.ok ? ok([view.value]) : (view as unknown as Result<EntryView[]>);
    }

    // story — both stand; a new `truth` entry explains the discrepancy in-world;
    // the `contradicts` link ends (§7.4). Executed in ONE transaction, so the truth
    // is written here rather than through archive.draft (see build report).
    const parsed = KIND_SCHEMAS.truth.safeParse(resolution.truthBody);
    if (!parsed.success) {
      return fail("E-1001", "Body schema mismatch for kind 'truth'",
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
    }
    const body = parsed.data as Record<string, unknown>;
    const truthId = ulid();
    const truthVersion = ulid();
    this.db.exec("BEGIN");
    try {
      // Mirrors Archive.draft's ink working-version shape exactly (provisional, no boundBy).
      this.db.run(
        `INSERT INTO entries (id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt)
         VALUES (?,?,?,?,'provisional','ink',?,?,NULL,NULL)`,
        truthId, "truth", body.name as string, "[]", truthVersion, now);
      this.db.run(
        `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
         VALUES (?,?,1,?,?,'provisional','ink',NULL,'[]',NULL,?,?)`,
        truthVersion, truthId, JSON.stringify(body), BODY_SCHEMA_VERSION,
        resolution.note ?? `charter.resolve: story patch for ${caseId}`, now);
      this.ftsIndex(truthId, body.name as string, [], body);
      if (backingLinkId !== null) this.endLinkInTx(backingLinkId);
      // A single-entry invariant case has no link to end; the case clears by a
      // re-affirming version of the entry, noted against the story truth.
      let touched: string | null = null;
      if (caseId.startsWith("case:invariant:") && c.entries.length === 1) {
        const head = this.head(c.entries[0]!);
        if (head) {
          const hv = this.version(head.headVersion);
          if (hv) {
            this.writeVersion(head, JSON.parse(hv.body) as Record<string, unknown>,
              head.canonStatus as CanonStatus,
              `charter.resolve: story patch — discrepancy explained by truth ${truthId}`, actor, now, false);
            touched = head.id;
          }
        }
      }
      this.db.exec("COMMIT");
      const out: EntryView[] = [];
      const tv = this.archive.get(truthId);
      if (tv.ok) out.push(tv.value);
      if (touched !== null) {
        const ev = this.archive.get(touched);
        if (ev.ok) out.push(ev.value);
      }
      return ok(out);
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  // ---- §7.2/§7.5 readiness ----

  readiness(scope: string): Result<ReadinessReport> {
    let member: Set<string> | null = null; // null = whole world
    if (scope !== this.worldId) {
      const region = this.head(scope);
      if (!region || region.archivedAt !== null) {
        return fail("E-1101", `Readiness scope is neither this world nor an entry: ${scope}`);
      }
      // Region membership is not defined by SPEC-001; the region entry plus its
      // direct active-link neighborhood is used (see build report — non-silent).
      member = new Set<string>([scope]);
      for (const l of this.db.all<{ fromEntry: string; toEntry: string }>(
        `SELECT fromEntry, toEntry FROM links WHERE endedByVersion IS NULL AND (fromEntry=? OR toEntry=?)`,
        scope, scope)) {
        member.add(l.fromEntry).add(l.toEntry);
      }
    }

    const rows = this.db.all<HeadRow & { body: string }>(
      `SELECT e.id, e.kind, e.name, e.aliases, e.canonStatus, e.provenance, e.headVersion,
              e.createdAt, e.archivedAt, v.body
       FROM entries e JOIN entry_versions v ON v.versionId = e.headVersion
       WHERE e.archivedAt IS NULL ORDER BY e.id ASC`);
    const entries = rows
      .filter((r) => member === null || member.has(r.id))
      .map((r) => ({ ...r, parsed: JSON.parse(r.body) as Record<string, unknown> }));
    const links = this.db.all<LinkRow>(
      `SELECT id, fromEntry, toEntry, type, sinceVersion, note FROM links WHERE endedByVersion IS NULL`)
      .filter((l) => member === null || member.has(l.fromEntry)); // the counted object owns the link

    const t = this.thresholds();
    const beingIds = new Set(entries.filter((e) => e.kind === "being").map((e) => e.id));
    const activeUnlocksFrom = new Set(links.filter((l) => l.type === "unlocks").map((l) => l.fromEntry));

    const gravity = entries.filter((e) => e.kind === "ruling" && e.parsed.layer === "gravity").length;
    const actors = entries.filter((e) => e.kind === "being"
      && nonempty(e.parsed.goal) && nonempty(e.parsed.method) && nonempty(e.parsed.enforcement)).length;
    const tensionPairs = new Set(
      links.filter((l) => (l.type === "threatens" || l.type === "serves")
        && beingIds.has(l.fromEntry) && beingIds.has(l.toEntry))
        .map((l) => (l.fromEntry < l.toEntry ? `${l.fromEntry}|${l.toEntry}` : `${l.toEntry}|${l.fromEntry}`))).size;
    const chokepoints = entries.filter((e) => e.kind === "place" && e.parsed.chokepoint === true).length;
    const scarcity = entries.filter((e) => e.kind === "ruling" && nonempty(e.parsed.scarcityVector)).length;
    const faithMagic = entries.filter((e) => e.kind === "ruling"
      && Array.isArray(e.parsed.discernmentTells) && e.parsed.discernmentTells.filter(nonempty).length >= 3).length;
    // SPEC-003 §2 seals the Toy facet over being | place | thing — a carved-token
    // location is as much a Toy as a person (defect fix 2026-07-19: place was
    // omitted, so complete place-toys never counted toward the gate).
    const toys = entries.filter((e) => (e.kind === "being" || e.kind === "place" || e.kind === "thing") && toyComplete(e.parsed)).length;
    // v1.2/ADR-003-D — readiness counts ONLY truths with an ACTIVE unlocks link.
    const truths = entries.filter((e) => e.kind === "truth" && activeUnlocksFrom.has(e.id)).length;
    const unknowns = entries.filter((e) => e.canonStatus === "unknown"
      && Array.isArray(e.parsed.tableTests) && e.parsed.tableTests.filter(nonempty).length >= 1).length;

    const domains: ReadinessDomain[] = [
      { domain: "gravity-truths", count: gravity, min: t.gravityMin, met: gravity >= t.gravityMin && gravity <= t.gravityMax },
      { domain: "power-lattice", count: actors, min: t.latticeActors, met: actors >= t.latticeActors && tensionPairs >= t.latticePairs },
      { domain: "constraints-chokepoints", count: chokepoints, min: t.chokepoints, met: chokepoints >= t.chokepoints },
      { domain: "constraints-scarcity", count: scarcity, min: t.scarcity, met: scarcity >= t.scarcity },
      { domain: "faith-magic", count: faithMagic, min: t.faithMagic, met: faithMagic >= t.faithMagic },
      { domain: "toys", count: toys, min: t.toys, met: toys >= t.toys },
      { domain: "truths", count: truths, min: t.truths, met: truths >= t.truths },
      { domain: "unknowns", count: unknowns, min: t.unknowns, met: unknowns >= t.unknowns },
    ];

    const missing: MissingMinimum[] = [];
    const steps: BuildStep[] = [];
    const short = (domain: ReadinessDomainKey, need: number, have: number, step: BuildStep): void => {
      missing.push({ domain, need, have });
      steps.push(step);
    };
    if (gravity < t.gravityMin) {
      short("gravity-truths", t.gravityMin, gravity, {
        action: "draft", kind: "ruling",
        hint: `Add ${t.gravityMin - gravity} gravity ruling(s) (layer 'gravity').` });
    } else if (gravity > t.gravityMax) {
      short("gravity-truths", t.gravityMax, gravity, {
        action: "revise", kind: "ruling",
        hint: `Merge or demote ${gravity - t.gravityMax} gravity ruling(s); the checklist holds ${t.gravityMin}–${t.gravityMax}.` });
    }
    if (actors < t.latticeActors) {
      short("power-lattice", t.latticeActors, actors, {
        action: "draft", kind: "being",
        hint: `Add ${t.latticeActors - actors} lattice actor(s) with goal, method, and enforcement.` });
    }
    if (tensionPairs < t.latticePairs) {
      short("power-lattice", t.latticePairs, tensionPairs, {
        action: "link", kind: "being",
        hint: `Add ${t.latticePairs - tensionPairs} active threatens/serves pair(s) between lattice actors.` });
    }
    if (chokepoints < t.chokepoints) {
      short("constraints-chokepoints", t.chokepoints, chokepoints, {
        action: "draft", kind: "place",
        hint: `Flag ${t.chokepoints - chokepoints} more place(s) as chokepoints.` });
    }
    if (scarcity < t.scarcity) {
      short("constraints-scarcity", t.scarcity, scarcity, {
        action: "draft", kind: "ruling",
        hint: `Add ${t.scarcity - scarcity} scarcity ruling(s) (scarcityVector).` });
    }
    if (faithMagic < t.faithMagic) {
      short("faith-magic", t.faithMagic, faithMagic, {
        action: "draft", kind: "ruling",
        hint: `Add a faith/magic ruling with 3-channel discernment tells.` });
    }
    if (toys < t.toys) {
      short("toys", t.toys, toys, {
        action: "draft", kind: "being",
        hint: `Complete ${t.toys - toys} more Toy(s) (goal, method, activeProblem, 2 hooks, lever, escalation).` });
    }
    if (truths < t.truths) {
      short("truths", t.truths, truths, {
        action: "link", kind: "truth",
        hint: `Give ${t.truths - truths} truth(s) an active unlocks consequence (Lever Test).` });
    }
    if (unknowns < t.unknowns) {
      short("unknowns", t.unknowns, unknowns, {
        action: "draft", kind: "truth",
        hint: `Bound ${t.unknowns - unknowns} UNKNOWN(s) with bounds, whyUnknown, tableTests, payoff.` });
    }

    // Smallest first: ascending shortfall, stable on the domain order above.
    const order = steps.map((s, i) => ({ s, i, shortfall: Math.abs(missing[i]!.need - missing[i]!.have) }));
    order.sort((a, b) => a.shortfall - b.shortfall || a.i - b.i);
    const smallestNextBuild = order.map((o) => o.s);

    // Verdict rule (SPEC-001 does not quantify 'borderline'; see build report):
    // pass = every domain met; borderline = total shortfall ≤ 2; else fail.
    const totalShortfall = missing.reduce((acc, m) => acc + Math.abs(m.need - m.have), 0);
    const verdict: ReadinessReport["verdict"] =
      missing.length === 0 ? "pass" : totalShortfall <= 2 ? "borderline" : "fail";

    return ok({ verdict, domains, missing, smallestNextBuild });
  }

  // ---- §7.2 rulings ----

  rulings(layer?: "gravity" | "structural" | "dynamic" | "local"): Result<EntryView[]> {
    const rows = this.db.all<{ id: string; body: string }>(
      `SELECT e.id, v.body FROM entries e JOIN entry_versions v ON v.versionId = e.headVersion
       WHERE e.kind='ruling' AND e.archivedAt IS NULL ORDER BY e.createdAt ASC, e.id ASC`);
    const out: EntryView[] = [];
    for (const r of rows) {
      if (layer !== undefined && (JSON.parse(r.body) as Record<string, unknown>).layer !== layer) continue;
      const v = this.archive.get(r.id);
      if (v.ok) out.push(v.value);
    }
    return ok(out);
  }

  // ---- internal ----

  /** §7.5 — thresholds live in a Ruling entry's `readinessThresholds` object;
   *  the newest non-archived carrier wins. */
  private thresholds(): Thresholds {
    const t = { ...DEFAULT_THRESHOLDS };
    const rows = this.db.all<{ body: string }>(
      `SELECT v.body FROM entries e JOIN entry_versions v ON v.versionId = e.headVersion
       WHERE e.kind='ruling' AND e.archivedAt IS NULL ORDER BY e.id DESC`);
    for (const r of rows) {
      const rt = (JSON.parse(r.body) as Record<string, unknown>).readinessThresholds;
      if (rt === null || typeof rt !== "object" || Array.isArray(rt)) continue;
      for (const [key, field] of Object.entries(THRESHOLD_KEYS)) {
        const v = (rt as Record<string, unknown>)[key];
        if (typeof v === "number" && Number.isInteger(v) && v >= 0) t[field] = v;
      }
      break; // newest carrier only
    }
    return t;
  }

  private hasActiveUnlocks(entryId: string): boolean {
    return this.db.get<{ id: string }>(
      `SELECT id FROM links WHERE fromEntry=? AND type='unlocks' AND endedByVersion IS NULL`,
      entryId) !== undefined;
  }

  /** §7.4 lock-time detectors 1 & 3 for the locking entry. Findings docket as
   *  machine-written contradicts links (§2.3), note-prefixed with the case kind. */
  private docketLockFindings(head: HeadRow, now: string): void {
    const findings: { other: string; kind: ContradictionCase["kind"]; explanation: string }[] = [];
    // Detector 1 — name/alias collision, same kind, case/diacritic-insensitive.
    const mine = [head.name, ...(JSON.parse(head.aliases) as string[])].map(normalizeName);
    for (const e of this.db.all<HeadRow>(
      `SELECT id, kind, name, aliases, canonStatus, provenance, headVersion, createdAt, archivedAt
       FROM entries WHERE kind=? AND archivedAt IS NULL AND id<>?`, head.kind, head.id)) {
      const theirs = [e.name, ...(JSON.parse(e.aliases) as string[])].map(normalizeName);
      if (mine.some((n) => theirs.includes(n))) {
        findings.push({ other: e.id, kind: "name-collision",
          explanation: `Locked ${head.kind} '${head.name}' collides with existing entry '${e.name}' (${e.id}).` });
      }
    }
    // Detector 3 — both of an excluded pair active from this entry to the same target.
    for (const [x, y] of LINK_EXCLUSIONS) {
      for (const l of this.db.all<{ toEntry: string }>(
        `SELECT a.toEntry FROM links a JOIN links b
           ON b.fromEntry=a.fromEntry AND b.toEntry=a.toEntry AND b.type=? AND b.endedByVersion IS NULL
         WHERE a.fromEntry=? AND a.type=? AND a.endedByVersion IS NULL`, y, head.id, x)) {
        findings.push({ other: l.toEntry, kind: "link-contradiction",
          explanation: `'${x}' and '${y}' cannot both be active between ${head.id} and ${l.toEntry}.` });
      }
    }
    for (const f of findings) {
      const dup = this.db.get<{ id: string }>(
        `SELECT id FROM links WHERE type='contradicts' AND endedByVersion IS NULL
         AND ((fromEntry=? AND toEntry=?) OR (fromEntry=? AND toEntry=?))`,
        head.id, f.other, f.other, head.id);
      if (dup) continue;
      this.db.run(
        `INSERT INTO links (id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt)
         VALUES (?,?,?,'contradicts',?,NULL,?,?)`,
        ulid(), head.id, f.other, head.headVersion, `[${f.kind}] ${f.explanation}`, now);
    }
  }

  /** §7.1 — all transitions create versions. Writes the new version + head update
   *  inside the caller's open transaction; alias protocol on rename (§7.3). */
  private writeVersion(
    head: HeadRow, body: Record<string, unknown>, status: CanonStatus,
    note: string | null, actor: string, now: string, setBoundAt: boolean,
  ): string {
    const hv = this.version(head.headVersion)!;
    const name = body.name as string;
    const aliases = JSON.parse(head.aliases) as string[];
    if (name !== head.name && !aliases.includes(head.name)) aliases.push(head.name); // §7.3
    const versionId = ulid();
    this.db.run(
      `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
       VALUES (?,?,?,?,?,?,'ink',?,'[]',?,?,?)`,
      versionId, head.id, hv.ordinal + 1, JSON.stringify(body), BODY_SCHEMA_VERSION,
      status, actor, head.headVersion, note, now);
    if (setBoundAt) {
      this.db.run(
        `UPDATE entries SET headVersion=?, name=?, aliases=?, canonStatus=?, provenance='ink', boundAt=? WHERE id=?`,
        versionId, name, JSON.stringify(aliases), status, now, head.id);
    } else {
      this.db.run(
        `UPDATE entries SET headVersion=?, name=?, aliases=?, canonStatus=? WHERE id=?`,
        versionId, name, JSON.stringify(aliases), status, head.id);
    }
    this.ftsIndex(head.id, name, aliases, body);
    return versionId;
  }

  /** Ends a link inside the caller's open transaction (§2.3: links end, never delete). */
  private endLinkInTx(linkId: string): void {
    const row = this.db.get<{ fromEntry: string }>(
      `SELECT fromEntry FROM links WHERE id=? AND endedByVersion IS NULL`, linkId);
    if (!row) return; // already ended; resolution stands
    const f = this.db.get<{ headVersion: string }>(`SELECT headVersion FROM entries WHERE id=?`, row.fromEntry);
    if (!f) return;
    this.db.run(`UPDATE links SET endedByVersion=? WHERE id=?`, f.headVersion, linkId);
  }

  private head(id: string): HeadRow | undefined {
    return this.db.get<HeadRow>(
      `SELECT id, kind, name, aliases, canonStatus, provenance, headVersion, createdAt, archivedAt
       FROM entries WHERE id=?`, id);
  }

  private version(versionId: string): VersionRow | undefined {
    return this.db.get<VersionRow>(
      `SELECT versionId, ordinal, body, canonStatus FROM entry_versions WHERE versionId=?`, versionId);
  }

  private ftsIndex(entryId: string, name: string, aliases: string[], body: Record<string, unknown>): void {
    const row = this.db.get<{ rowid: number }>(`SELECT rowid FROM entries WHERE id=?`, entryId);
    if (!row) return;
    this.db.run(`INSERT INTO entries_fts (rowid,name,aliases,bodyText) VALUES (?,?,?,?)`,
      row.rowid, name, aliases.join(" "), searchableBodyText(body));
  }
}
