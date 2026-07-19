// SPEC-002 §3.4 stage 1 (GATHER) + §6 folio catalog — resolve each folio's pinned
// elements and candidate body elements from GameState + entryGraph + riteSet, per
// the folio's sealed contract. Pure reads only. Where core's v1 folds do not yet
// carry a field the catalog names (action economy, concentration, readied state),
// the composer reads the fold STRUCTURALLY and renders honest absence — recorded
// seams (BR-005 ⚑), never invented data.

import { EntryQuery, type EntryView, type ReadonlyArchive, type RiteSet } from "@ash-archive/core";
import type {
  ActionEconomy, AdvancePrompt, ClockQuarter, CohortMark, ConditionBadge,
  DamageHealInput, DeathSave, DiceMandala, Element, HandCard, HpFolio, IfThenIndex,
  MarginSlot, OfferLine, PacingThread, Quill, QuickDc, ResolveInscription,
  ResourceStrip, RestInstrument, SceneFrame, StageRailMark, StatReadout, ToyCard,
  TruthCard, WorldReadout,
} from "./model.js";
import type { GameState, UiState } from "./folds.js";
import {
  bodyField, bodyNumber, bodyString, elementProvenance, getEntry, statline,
} from "./graph-view.js";
import { askLegality, conditionName, severityOf } from "./rites-view.js";
import { a11y, byUlid } from "./util.js";

export interface Gathered {
  pinned: Element[];
  candidates: Element[];
  margin: MarginSlot[]; // ink whispers + concentration marks; pencil arrives via enrich() only
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function conditionRows(
  riteSet: RiteSet | null,
  ids: string[],
): { id: string; name: string; severity: 1 | 2 | 3 | 4 | 5 }[] {
  return ids
    .map((id) => ({
      id,
      name: conditionName(riteSet, id),
      severity: severityOf(riteSet, id) ?? (3 as const),
    }))
    .sort((x, y) => y.severity - x.severity || byUlid(x.id, y.id)); // §7.5 stable order
}

/** The perspective's primary being (deterministic: as supplied by the runtime, H1). */
function primaryBeing(gs: GameState): string | null {
  return gs.perspectiveBeings.length > 0 ? gs.perspectiveBeings[0]! : null;
}

// ————— VITALS (player folio I) —————

function gatherVitals(
  gs: GameState,
  graph: ReadonlyArchive,
  riteSet: RiteSet | null,
): Gathered {
  const beingId = primaryBeing(gs);
  const being = beingId !== null ? getEntry(graph, beingId) : null;
  const stat = statline(being);
  const delta = beingId !== null ? (gs.resources.hpDelta[beingId] ?? 0) : 0;
  const current = stat.hpMax !== null ? Math.max(0, stat.hpMax + delta) : delta;

  const hp: HpFolio = {
    kind: "hp", id: `hp:${beingId ?? "∅"}`,
    provenance: elementProvenance(being), live: false, affords: [],
    current, max: stat.hpMax, temp: 0,
    distressMarks: stat.hpMax !== null && stat.hpMax > 0 ? (current <= stat.hpMax / 4 ? 2 : current <= stat.hpMax / 2 ? 1 : 0) : 0,
    a11y: a11y("status", `Hit points ${current}${stat.hpMax !== null ? ` of ${stat.hpMax}` : ""}`, elementProvenance(being), being),
  };
  const stats: StatReadout = {
    kind: "stats", id: `stats:${beingId ?? "∅"}`,
    provenance: elementProvenance(being), live: false, affords: [],
    ac: stat.ac, speed: stat.speed,
    a11y: a11y("status", `Armor class ${stat.ac ?? "unknown"}, speed ${stat.speed ?? "unknown"}`, elementProvenance(being), being),
  };
  // Seam (BR-005 ⚑): core's v1 combat fold does not carry per-being action economy;
  // read structurally, default to available — honest absence, never invention.
  const eco = isRecord((gs.combat as unknown as Record<string, unknown>).economy)
    ? ((gs.combat as unknown as Record<string, unknown>).economy as Record<string, unknown>)[beingId ?? ""]
    : undefined;
  const pip = (k: string): "available" | "spent" =>
    isRecord(eco) && eco[k] === "spent" ? "spent" : "available";
  const economy: ActionEconomy = {
    kind: "economy", id: `economy:${beingId ?? "∅"}`,
    provenance: "ash", live: false, affords: [],
    action: pip("action"), bonus: pip("bonus"), reaction: pip("reaction"), movement: pip("movement"),
    a11y: a11y("status", "Action economy", "ash"),
  };

  const pinned: Element[] = [hp, stats, economy];
  const candidates: Element[] = [];
  const margin: MarginSlot[] = [];

  // Death-save ceremony takes the whole folio (§6.1)
  const saves = beingId !== null ? gs.combat.deathSaves[beingId] : undefined;
  if (saves !== undefined) {
    const death: DeathSave = {
      kind: "death-save", id: `death-save:${beingId}`,
      provenance: "ash", live: true, affords: [],
      beingId: beingId!, success: saves.success, failure: saves.failure,
      a11y: a11y("alert", `Death saves: ${saves.success} successes, ${saves.failure} failures`, "ash"),
    };
    return { pinned, candidates: [death], margin };
  }

  const condIds = beingId !== null ? (gs.combat.conditions[beingId] ?? []) : [];
  if (condIds.length > 0) {
    const rows = conditionRows(riteSet, condIds);
    const badge: ConditionBadge = {
      kind: "conditions", id: `conditions:${beingId}`,
      provenance: "ash", live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      count: rows.length, conditions: rows,
      a11y: a11y("status", `${rows.length} condition${rows.length === 1 ? "" : "s"}: ${rows.map((r) => r.name).join(", ")}`, "ash"),
    };
    candidates.push(badge);
  }

  if (beingId !== null) {
    const dmg: DamageHealInput = {
      kind: "damage-heal", id: `damage-heal:${beingId}`,
      provenance: "ash", live: false, affords: [{ verb: "inscribe" }],
      beingId,
      a11y: a11y("form", "Damage and healing entry", "ash"),
    };
    candidates.push(dmg);
  }

  // Seam (BR-005 ⚑): concentration is not folded in core v1; structural read.
  const conc = (gs.combat as unknown as Record<string, unknown>).concentration;
  if (isRecord(conc) && beingId !== null && typeof conc[beingId] === "string") {
    margin.push({
      kind: "concentration", provenance: "ash",
      riteName: String(conc[beingId]), guttering: false,
      a11y: a11y("status", `Concentrating on ${String(conc[beingId])}`, "ash"),
    });
  }

  return { pinned, candidates, margin };
}

// ————— ACTION (player folio II) —————

function gatherAction(
  gs: GameState,
  graph: ReadonlyArchive,
  riteSet: RiteSet | null,
): Gathered {
  const beingId = primaryBeing(gs);
  const being = beingId !== null ? getEntry(graph, beingId) : null;
  // The hand: rite refs authored on the being (rite-namespace first — SPEC-R1 owns
  // the schema; plain facet honored for rules-blind worlds).
  const refs = [
    ...asStringArray(bodyField(being, "ext", "aa.rites.5e", "hand")),
    ...asStringArray(bodyField(being, "hand")),
  ];
  const seen = new Set<string>();
  const candidates: Element[] = [];
  for (const riteRef of refs) {
    if (seen.has(riteRef)) continue;
    seen.add(riteRef);
    const rite = getEntry(graph, riteRef);
    const view = askLegality(
      riteSet,
      { kind: "action", riteRef, beingId },
      graph,
      gs.combat,
    );
    const card: HandCard = {
      kind: "hand-card", id: `hand-card:${riteRef}`,
      provenance: elementProvenance(rite), live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      name: rite?.name ?? riteRef,
      rank: 0, // stamped by RANK (§7.2)
      castTime: bodyString(rite, "castTime") ?? "action",
      legality: view.legality,
      ...(view.blockReason !== undefined ? { blockReason: view.blockReason } : {}),
      riteRef,
      previewLine: bodyString(rite, "previewLine") ?? bodyString(rite, "summary") ?? "",
      readied: false, // seam: readied state is not folded in core v1
      foldedIntoStack: false,
      a11y: a11y("button", `${rite?.name ?? riteRef}, ${view.legality}`, elementProvenance(rite), rite),
    };
    candidates.push(card);
  }
  return { pinned: [], candidates, margin: [] };
}

// ————— STAGE (player folio III) —————

function cohortOf(entry: EntryView | null): { members: number; alive: number } | null {
  const c = bodyField(entry, "cohort");
  if (!isRecord(c)) return null;
  const members = typeof c.members === "number" ? c.members : null;
  if (members === null) return null;
  const alive = typeof c.alive === "number" ? c.alive : members;
  return { members, alive };
}

function gatherStage(
  gs: GameState,
  graph: ReadonlyArchive,
  riteSet: RiteSet | null,
): Gathered {
  const candidates: Element[] = [];

  // Initiative order (§7.3): from the combat fold; ties break by beingId ULID (C-1).
  const order = [...gs.combat.order].sort(
    (x, y) => y.value - x.value || byUlid(x.beingId, y.beingId),
  );
  for (const slot of order) {
    const entry = getEntry(graph, slot.beingId);
    const active = gs.combat.activeTurn === slot.beingId;
    const cohort = cohortOf(entry);
    if (cohort !== null) {
      const mark: CohortMark = {
        kind: "cohort-mark", id: `cohort-mark:${slot.beingId}`,
        provenance: elementProvenance(entry),
        live: cohort.alive > 0, // defeated cohort stays on the rail, live:false (M5)
        affords: [{ verb: "unfold", target: "inline-detail" }],
        cohortId: slot.beingId, name: entry?.name ?? slot.beingId,
        members: cohort.members, alive: cohort.alive,
        statblockRef: bodyString(entry, "statblockRef"), active,
        a11y: a11y("listitem", `${entry?.name ?? slot.beingId}, cohort of ${cohort.members}, ${cohort.alive} standing${active ? ", acting now" : ""}`, elementProvenance(entry), entry),
      };
      candidates.push(mark);
      continue;
    }
    const condIds = gs.combat.conditions[slot.beingId] ?? [];
    const conds = conditionRows(riteSet, condIds)
      .slice(0, 2) // §7.5: up to 2 shown; rest fold into the mark's unfold
      .map((r) => ({ id: r.id, severity: r.severity }));
    const mine = gs.perspectiveBeings.includes(slot.beingId);
    const stat = statline(entry);
    const delta = gs.resources.hpDelta[slot.beingId] ?? 0;
    const mark: StageRailMark = {
      kind: "stage-mark", id: `stage-mark:${slot.beingId}`,
      provenance: elementProvenance(entry), live: active,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      beingId: slot.beingId, name: entry?.name ?? slot.beingId,
      initiative: slot.value, active,
      // Own beings only: the rail never leaks another's numbers (perspective discipline).
      ...(mine && stat.hpMax !== null
        ? { hp: { cur: Math.max(0, stat.hpMax + delta), max: stat.hpMax } }
        : {}),
      conditions: conds,
      a11y: a11y("listitem", `${entry?.name ?? slot.beingId}, initiative ${slot.value}${active ? ", acting now" : ""}`, elementProvenance(entry), entry),
    };
    candidates.push(mark);
  }

  // Clocks (§7.5 ordering: descending step, then ULID). Redaction is upstream (§3.2).
  candidates.push(...gatherClockQuarters(gs, graph, /*visibleOnly*/ true));

  // The scene frame.
  const scene = latestScene(graph);
  if (scene !== null) {
    const frame: SceneFrame = {
      kind: "scene-frame", id: `scene-frame:${scene.id}`,
      provenance: elementProvenance(scene), live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      frame: bodyString(scene, "frame") ?? scene.name,
      ...(bodyString(scene, "place") !== null ? { place: bodyString(scene, "place")! } : {}),
      a11y: a11y("heading", `Scene: ${bodyString(scene, "frame") ?? scene.name}`, elementProvenance(scene), scene),
    };
    candidates.push(frame);
  }

  return { pinned: [], candidates, margin: [] };
}

function latestScene(graph: ReadonlyArchive): EntryView | null {
  const r = graph.query(EntryQuery.kind("scene").orderBy("createdAt", "desc").limit(1));
  return r.ok && r.value.length > 0 ? r.value[0]! : null;
}

function gatherClockQuarters(
  gs: GameState,
  graph: ReadonlyArchive,
  visibleOnly: boolean,
): ClockQuarter[] {
  const out: ClockQuarter[] = [];
  const ids = Object.keys(gs.clocks.steps).sort(byUlid);
  for (const entryId of ids) {
    const entry = getEntry(graph, entryId);
    if (entry === null) continue; // redacted or absent — compose what the graph grants
    if (visibleOnly && entry.canonStatus === "unknown") continue;
    const rawStep = gs.clocks.steps[entryId] ?? 0;
    const step = (Math.max(0, Math.min(4, rawStep)) as 0 | 1 | 2 | 3 | 4);
    const q: ClockQuarter = {
      kind: "clock", id: `clock:${entryId}`,
      provenance: elementProvenance(entry), live: step > 0,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      entryId, name: entry.name, step,
      ...(bodyString(entry, "advances") !== null ? { advanceHint: bodyString(entry, "advances")! } : {}),
      a11y: a11y("status", `${entry.name}, step ${step} of 4`, elementProvenance(entry), entry),
    };
    out.push(q);
  }
  // §7.5: descending step (urgency), then ascending ULID.
  out.sort((x, y) => y.step - x.step || byUlid(x.entryId, y.entryId));
  return out;
}

// ————— RESOURCES (player folio IV) —————

function gatherResources(gs: GameState, graph: ReadonlyArchive): Gathered {
  const beingId = primaryBeing(gs);
  const being = beingId !== null ? getEntry(graph, beingId) : null;
  const candidates: Element[] = [];

  // Slot table: rite namespace first (SPEC-R1), plain facet honored.
  const slotTable =
    bodyField(being, "ext", "aa.rites.5e", "slots") ?? bodyField(being, "slots");
  if (isRecord(slotTable) && beingId !== null) {
    const levels = Object.keys(slotTable)
      .filter((k) => typeof slotTable[k] === "number")
      .sort((x, y) => Number(x) - Number(y) || byUlid(x, y)); // §7.5: ascending spell level
    for (const level of levels) {
      const max = Number(slotTable[level]);
      const spent = gs.resources.slotsSpent[beingId]?.[level] ?? 0;
      const remaining = Math.max(0, max - spent);
      const strip: ResourceStrip = {
        kind: "resource-strip", id: `resource-strip:slots:${level}`,
        provenance: "ash", live: remaining > 0, // depleted strips are live:false (§7.5)
        affords: [{ verb: "unfold", target: "inline-detail" }],
        key: `slots:${level}`, label: `Level ${level}`,
        remaining, max, stripKind: "slots",
        a11y: a11y("status", `Level ${level} slots: ${remaining} of ${max}`, "ash"),
      };
      candidates.push(strip);
    }
  }

  const pools = bodyField(being, "ext", "aa.rites.5e", "pools") ?? bodyField(being, "pools");
  if (isRecord(pools) && beingId !== null) {
    const keys = Object.keys(pools).filter((k) => typeof pools[k] === "number").sort(byUlid);
    for (const key of keys) {
      const max = Number(pools[key]);
      const spent = gs.resources.resources[beingId]?.[key] ?? 0;
      const remaining = Math.max(0, max - spent);
      const strip: ResourceStrip = {
        kind: "resource-strip", id: `resource-strip:pool:${key}`,
        provenance: "ash", live: remaining > 0,
        affords: [{ verb: "unfold", target: "inline-detail" }],
        key: `pool:${key}`, label: key,
        remaining, max, stripKind: "pool",
        a11y: a11y("status", `${key}: ${remaining} of ${max}`, "ash"),
      };
      candidates.push(strip);
    }
  }

  if (beingId !== null) {
    const rest: RestInstrument = {
      kind: "rest", id: `rest:${beingId}`,
      provenance: "ash", live: false,
      affords: [{ verb: "bind" }], // press-and-hold bind-class ceremony (§6.1)
      beingId,
      a11y: a11y("button", "Rest instrument: short or long rest, press and hold", "ash"),
    };
    candidates.push(rest);
  }

  return { pinned: [], candidates, margin: [] };
}

// ————— DM SCENE (folio I) —————

function toyFacets(entry: EntryView): { goal: string; method: string; activeProblem: string; lever: string } | null {
  const goal = bodyString(entry, "goal");
  const method = bodyString(entry, "method");
  if (goal === null && method === null) return null;
  return {
    goal: goal ?? "",
    method: method ?? "",
    activeProblem: bodyString(entry, "activeProblem") ?? "",
    lever: bodyString(entry, "lever") ?? "",
  };
}

function gatherDmScene(gs: GameState, graph: ReadonlyArchive): Gathered {
  const candidates: Element[] = [];
  const scene = latestScene(graph);
  if (scene !== null) {
    const frame: SceneFrame = {
      kind: "scene-frame", id: `scene-frame:${scene.id}`,
      provenance: elementProvenance(scene), live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      frame: bodyString(scene, "frame") ?? scene.name,
      ...(bodyString(scene, "place") !== null ? { place: bodyString(scene, "place")! } : {}),
      a11y: a11y("heading", `Scene: ${bodyString(scene, "frame") ?? scene.name}`, elementProvenance(scene), scene),
    };
    candidates.push(frame);
    const offer = bodyString(scene, "offer");
    const ask = bodyString(scene, "ask");
    if (offer !== null) {
      const line: OfferLine = {
        kind: "offer-line", id: `offer-line:offer:${scene.id}`,
        provenance: elementProvenance(scene), live: true, affords: [],
        role: "offer", text: offer,
        a11y: a11y("note", `Offer: ${offer}`, elementProvenance(scene), scene),
      };
      candidates.push(line);
    }
    if (ask !== null) {
      const line: OfferLine = {
        kind: "offer-line", id: `offer-line:ask:${scene.id}`,
        provenance: elementProvenance(scene), live: true, affords: [],
        role: "ask", text: ask,
        a11y: a11y("note", `Ask: ${ask}`, elementProvenance(scene), scene),
      };
      candidates.push(line);
    }
  }
  // Kindled toys (≤5 stage beings is the fitter's concern via the live budget).
  for (const entryId of gs.stage.kindled) {
    const entry = getEntry(graph, entryId);
    if (entry === null) continue;
    const facets = toyFacets(entry);
    if (facets === null) continue;
    const toy: ToyCard = {
      kind: "toy-card", id: `toy-card:${entryId}`,
      provenance: elementProvenance(entry), live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }, { verb: "kindle", entryId }],
      entryId, name: entry.name, ...facets, hooksFolded: true,
      a11y: a11y("article", `Toy: ${entry.name}. Goal, ${facets.goal}`, elementProvenance(entry), entry),
    };
    candidates.push(toy);
  }
  return { pinned: [], candidates, margin: [] };
}

// ————— DM RESOLUTION (folio II) —————

function gatherDmResolution(): Gathered {
  const dice: DiceMandala = {
    kind: "dice", id: "dice:mandala",
    provenance: "ash", live: false,
    affords: [{ verb: "inscribe" }],
    notation: "d20", advantage: null,
    a11y: a11y("button", "The dice mandala. Roll a d20", "ash"),
  };
  const dc: QuickDc = {
    kind: "quick-dc", id: "quick-dc:main",
    provenance: "ash", live: false, affords: [{ verb: "inscribe" }],
    dc: null,
    a11y: a11y("form", "Quick difficulty class", "ash"),
  };
  const resolve: ResolveInscription = {
    kind: "resolve", id: "resolve:main",
    provenance: "ash", live: false, affords: [{ verb: "inscribe" }],
    a11y: a11y("button", "Resolve: capture the ruling", "ash"),
  };
  return { pinned: [], candidates: [dice, dc, resolve], margin: [] };
}

// ————— DM HIDDEN (folio III) —————

function gatherDmHidden(gs: GameState, graph: ReadonlyArchive): Gathered {
  const candidates: Element[] = [];
  // Staged Truths: kindled entries of kind truth (DM perspective is omniscient upstream).
  for (const entryId of gs.stage.kindled) {
    const entry = getEntry(graph, entryId);
    if (entry === null || entry.kind !== "truth") continue;
    const truth: TruthCard = {
      kind: "truth-card", id: `truth-card:${entryId}`,
      provenance: elementProvenance(entry), live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }, { verb: "kindle", entryId }],
      entryId, name: entry.name,
      lever: bodyString(entry, "lever") ?? "",
      revealed: gs.stage.revealed.includes(entryId),
      vectorsCovered: asStringArray(bodyField(entry, "vectors")).length,
      a11y: a11y("article", `Truth: ${entry.name}${gs.stage.revealed.includes(entryId) ? ", revealed" : ", hidden"}`, elementProvenance(entry), entry),
    };
    candidates.push(truth);
  }
  // Advance-condition prompts for clocks with authored advance conditions.
  const clockIds = Object.keys(gs.clocks.steps).sort(byUlid);
  for (const entryId of clockIds) {
    const entry = getEntry(graph, entryId);
    if (entry === null) continue;
    const advances = bodyString(entry, "advances");
    if (advances === null) continue;
    const prompt: AdvancePrompt = {
      kind: "advance-prompt", id: `advance-prompt:${entryId}`,
      provenance: elementProvenance(entry), live: true,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      clockEntryId: entryId, condition: advances,
      a11y: a11y("note", `${entry.name} advances when: ${advances}`, elementProvenance(entry), entry),
    };
    candidates.push(prompt);
  }
  // The If/Then one-tap kindle index, authored on the scene.
  const scene = latestScene(graph);
  const ifThen = bodyField(scene, "ifThen");
  if (Array.isArray(ifThen)) {
    const rows = ifThen
      .filter(isRecord)
      .map((r) => ({
        ifText: typeof r.if === "string" ? r.if : "",
        thenEntryId: typeof r.then === "string" ? r.then : "",
        thenName:
          typeof r.then === "string" ? (getEntry(graph, r.then)?.name ?? r.then) : "",
      }))
      .filter((r) => r.ifText !== "" && r.thenEntryId !== "");
    if (rows.length > 0) {
      const index: IfThenIndex = {
        kind: "if-then", id: `if-then:${scene!.id}`,
        provenance: elementProvenance(scene), live: true,
        affords: rows.map((r) => ({ verb: "kindle" as const, entryId: r.thenEntryId })),
        rows,
        a11y: a11y("list", `If–then index, ${rows.length} prepared`, elementProvenance(scene), scene),
      };
      candidates.push(index);
    }
  }
  return { pinned: [], candidates, margin: [] };
}

// ————— DM WORLD (folio IV) —————

function gatherDmWorld(gs: GameState, graph: ReadonlyArchive): Gathered {
  const candidates: Element[] = [];
  // ALL active clocks — the WORLD folio is uncapped (M3); visibleOnly=false (DM sees UNKNOWN bounds too).
  candidates.push(...gatherClockQuarters(gs, graph, false));

  // Structural readouts from rulings (scarcity, gravity) — SPEC-003 domain mapping.
  const rulings = graph.query(EntryQuery.kind("ruling").orderBy("createdAt", "asc").limit(24));
  if (rulings.ok) {
    for (const entry of rulings.value) {
      const layer = bodyString(entry, "layer");
      if (layer !== "structural" && layer !== "gravity") continue;
      const label = layer === "structural" ? "Scarcity" : "Gravity";
      const value = bodyString(entry, "scarcityVector") ?? bodyString(entry, "statement") ?? entry.name;
      const readout: WorldReadout = {
        kind: "world-readout", id: `world-readout:${entry.id}`,
        provenance: elementProvenance(entry), live: false,
        affords: [{ verb: "unfold", target: "inline-detail" }],
        label, value,
        a11y: a11y("status", `${label}: ${value}`, elementProvenance(entry), entry),
      };
      candidates.push(readout);
    }
  }

  // The pacing thread — a sessionMeta read, rendered as observation. Wall-clock pacing
  // is not in the fold (wallTime is display-only, SPEC-001 §3.1); the observation is
  // count-based until the fold carries more. Seam recorded (BR-005 ⚑).
  const m = gs.sessionMeta;
  const rulingsMade = m.countsByType["ruling.made"] ?? 0;
  const rollsMade = m.countsByType["roll.made"] ?? 0;
  const pacing: PacingThread = {
    kind: "pacing", id: "pacing:session",
    provenance: "ash", live: false, affords: [],
    observation: `${m.scenesFramed} scene${m.scenesFramed === 1 ? "" : "s"} framed · ${rulingsMade} ruling${rulingsMade === 1 ? "" : "s"} · ${rollsMade} roll${rollsMade === 1 ? "" : "s"}`,
    a11y: a11y("status", "Pacing observation", "ash"),
  };
  candidates.push(pacing);

  return { pinned: [], candidates, margin: [] };
}

// ————— dispatch —————

export function gather(
  folioKey: string,
  profileId: string,
  gs: GameState,
  graph: ReadonlyArchive,
  riteSet: RiteSet | null,
  _ui: UiState,
): Gathered {
  let g: Gathered;
  if (profileId === "codex.table.player") {
    g =
      folioKey === "vitals" ? gatherVitals(gs, graph, riteSet)
      : folioKey === "action" ? gatherAction(gs, graph, riteSet)
      : folioKey === "stage" ? gatherStage(gs, graph, riteSet)
      : folioKey === "resources" ? gatherResources(gs, graph)
      : { pinned: [], candidates: [], margin: [] };
  } else if (profileId === "codex.table.dm") {
    g =
      folioKey === "scene" ? gatherDmScene(gs, graph)
      : folioKey === "resolution" ? gatherDmResolution()
      : folioKey === "hidden" ? gatherDmHidden(gs, graph)
      : folioKey === "world" ? gatherDmWorld(gs, graph)
      : { pinned: [], candidates: [], margin: [] };
  } else {
    g = { pinned: [], candidates: [], margin: [] };
  }
  // The Quill is present on every Table folio (§2.1; live:false) — except ceremony pages.
  const inCeremony = g.candidates.some((c) => c.kind === "death-save");
  if (!inCeremony) {
    const quill: Quill = {
      kind: "quill", id: `quill:${folioKey}`,
      provenance: "ash", live: false, affords: [{ verb: "inscribe" }],
      a11y: a11y("button", "The quill: inscribe a note", "ash"),
    };
    g.candidates.push(quill);
  }
  return g;
}
