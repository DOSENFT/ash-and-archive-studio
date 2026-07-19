// The Forge stance — SPEC-003's Desk rooms over the sealed core. Six quiet tabs
// (Substrate · Toybox · Web · Atlas · Bestiary · Eras) under the persistent
// Readiness Gate strip; the Charter Room is the shared room next door (§3), not
// forked here. Every instrument is an Entry or a link, never a new kind (W-1);
// every save is a working version via archive.draft/reviseDraft (W-2 — there is
// deliberately NO lock affordance anywhere in this file); readiness is computed
// by charter.readiness(), rendered and never overridden (W-3); the Lever Test
// and UNKNOWN discipline surface as craft teaching, never raw errors (W-4).
import { useCallback, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { EntryKind, EntryView, LinkType, ReadinessDomainKey, ReadinessReport, Vault } from "@ash-archive/core";
import { ENTRY_KINDS, EntryQuery, LINK_TYPES } from "@ash-archive/core";

type ForgeTab = "substrate" | "toybox" | "web" | "atlas" | "bestiary" | "eras";
type Body = Record<string, unknown>;

// ---- small body readers (bodies are §2.2 loose objects; read defensively) ----
const bodyOf = (e: EntryView): Body =>
  typeof e.body === "object" && e.body !== null ? (e.body as Body) : {};
const str = (b: Body, k: string): string => (typeof b[k] === "string" ? (b[k] as string) : "");
const arr = (b: Body, k: string): string[] =>
  Array.isArray(b[k]) ? (b[k] as unknown[]).filter((x): x is string => typeof x === "string") : [];

function queryEntries(vault: Vault, q: EntryQuery): EntryView[] {
  const r = vault.archive.query(q);
  return r.ok ? r.value : [];
}

// §9 / W-4 — Result errors surface as craft teaching, never raw codes.
function teach(error: { code: string; message: string }): string {
  switch (error.code) {
    case "E-1104": // LockedEntry — demote-to-revise is a Charter act (§4), not a Forge one
      return "That page is locked by the Charter. Demote it there, with a note, before revising — the Forge never forces canon.";
    case "E-1102": // StaleHead — another pane revised first (§4 H5a); nothing is overwritten
      return "The page turned under another hand. Set this aside, reopen the entry, and fold your changes back in.";
    case "E-1003": // LeverTestFailed (ADR-003-D) — the §4 craft line
      return "A truth that changes nothing is trivia — what does knowing this let someone do? Give it a lever, and link what it unlocks.";
    case "E-1001":
      return "The page would not take that shape. Check what the craft asks of this instrument and try again.";
    default:
      return `The page refused: ${error.message}`;
  }
}

// ---- §5 sealed domain → room routing (the Charter Room's domains land next door;
//      `unknowns` routes per-step by kind — the domain strip itself seats at the
//      Substrate, the room the Gate heads, spec silent on a strip-level home) ----
const ROOM_OF_DOMAIN: Record<ReadinessDomainKey, ForgeTab> = {
  "gravity-truths": "substrate",
  "power-lattice": "bestiary",
  "constraints-chokepoints": "atlas",
  "constraints-scarcity": "substrate",
  "faith-magic": "substrate",
  toys: "toybox",
  truths: "toybox",
  unknowns: "substrate",
};
// smallest-next-build steps route by the step's kind (§5: "opens that room's
// editor pre-set to the step's kind").
const ROOM_OF_KIND: Partial<Record<EntryKind, ForgeTab>> = {
  ruling: "substrate", being: "bestiary", place: "atlas",
  thing: "toybox", truth: "toybox", clock: "toybox", scene: "eras",
};

const DOMAIN_NAMES: Record<ReadinessDomainKey, string> = {
  "gravity-truths": "gravity truths",
  "power-lattice": "power lattice",
  "constraints-chokepoints": "chokepoints",
  "constraints-scarcity": "scarcity",
  "faith-magic": "faith & magic",
  toys: "toys",
  truths: "portable truths",
  unknowns: "bounded unknowns",
};
// Teaching lines per domain (W-3: minimums render as craft, never raw validation).
const DOMAIN_TEACHING: Record<ReadinessDomainKey, string> = {
  "gravity-truths": "the non-negotiables the world always enforces",
  "power-lattice": "actors with goals, methods, and teeth — at least two in tension",
  "constraints-chokepoints": "places where movement narrows and friction lives",
  "constraints-scarcity": "something wanted, structurally short",
  "faith-magic": "one contract, discernible through three channels",
  toys: "complete toys — goal, method, problem, two hooks, a lever, an escalation",
  truths: "truths whose lever is live — an active unlocks link",
  unknowns: "bounded unknowns, testable at the table",
};
const VERDICT_WORD: Record<ReadinessReport["verdict"], string> = {
  pass: "pass", borderline: "borderline", fail: "not yet",
};
const VERDICT_LINE: Record<ReadinessReport["verdict"], string> = {
  pass: "— this world can generate play.",
  borderline: "— close. The smallest next build is below.",
  fail: "— the world cannot yet generate play. Build the smallest next thing.",
};

// ---- the §5 Readiness Gate strip — rendered from the report, computed by core ----
function GateStrip({ vault, refresh, onRoute }: {
  vault: Vault;
  refresh: number;
  onRoute(tab: ForgeTab): void;
}) {
  const report = useMemo(() => {
    void refresh; // links and drafts move the Gate; recompute on the pulse
    const r = vault.charter.readiness(vault.worldId);
    return r.ok ? r.value : null;
  }, [vault, refresh]);

  if (report === null) {
    return (
      <section className="fg-gate" role="status" aria-label="The Readiness Gate">
        <p className="fg-gate-quiet">The Gate could not be read this moment; the world stands as it was.</p>
      </section>
    );
  }
  return (
    <section className={`fg-gate fg-verdict-${report.verdict}`} role="status" aria-label="The Readiness Gate">
      <p className="fg-verdict">
        <span className="fg-verdict-word">{VERDICT_WORD[report.verdict]}</span> {VERDICT_LINE[report.verdict]}
      </p>
      <ul className="fg-domains">
        {report.domains.map((d) => {
          const state = d.met ? "met" : d.count > 0 ? "partial" : "empty";
          const pct = d.min > 0 ? Math.min(100, Math.round((d.count / d.min) * 100)) : 100;
          return (
            <li key={d.domain}>
              <button
                type="button"
                className={`fg-domain fg-domain-${state}`}
                onClick={() => onRoute(ROOM_OF_DOMAIN[d.domain])}
              >
                <span className="fg-domain-name">{DOMAIN_NAMES[d.domain]}</span>
                <span className="fg-domain-count">{d.count}/{d.min}{d.met ? " · met" : ""}</span>
                <span className="fg-meter" aria-hidden="true">
                  <span className="fg-meter-fill" style={{ width: `${pct}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {report.missing.length > 0 ? (
        <ul className="fg-missing">
          {report.missing.map((m) => (
            <li key={`${m.domain}:${m.need}`}>
              {DOMAIN_NAMES[m.domain]} — {m.have} of {m.need}: {DOMAIN_TEACHING[m.domain]}.
            </li>
          ))}
        </ul>
      ) : null}
      {report.smallestNextBuild.length > 0 ? (
        <ol className="fg-steps" aria-label="The smallest next build">
          {report.smallestNextBuild.map((s, i) => (
            <li key={`${s.kind}-${i}`}>
              <button type="button" className="fg-step" onClick={() => onRoute(ROOM_OF_KIND[s.kind] ?? "substrate")}>
                {s.hint}
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

// ---- form editors (§4 / ADR-003-C: forms mutate; overview lists render state) ----
interface FieldDef {
  key: string;
  label: string;
  kind: "line" | "prose" | "lines" | "choice";
  count?: number;                 // exact-count lines (hooks: 2, clock steps: 4, tells: 3)
  lineLabels?: readonly string[]; // per-line labels for exact-count lines
  options?: readonly string[];    // for "choice"
  hint?: string;
}

interface InstrumentSpec {
  title: string;
  invite: string; // GENESIS 03 §XII — the editorial void, a sentence in the room's voice
  kinds: readonly EntryKind[];
  fields: readonly FieldDef[];
  fixed?: Body; // the instrument's sealed facet values (§2), e.g. layer / chokepoint
  detail?: (b: Body) => string;
  groupBy?: (e: EntryView) => string;
  groups?: readonly string[];
}

// Bounded UNKNOWNs (§2 row 9) — any kind may draft these fields; the toggle reveals them.
const UNKNOWN_FIELDS: readonly FieldDef[] = [
  { key: "bounds", label: "bounds", kind: "prose", hint: "what stays fixed around the unknown" },
  { key: "whyUnknown", label: "why unknown", kind: "prose" },
  { key: "tableTests", label: "table tests", kind: "lines", hint: "one per line — at least one way play can probe it" },
  { key: "payoff", label: "payoff", kind: "prose", hint: "what resolving it pays the table" },
];

function Instrument({ spec, entries, vault, announce, bump, marks, kindle }: {
  spec: InstrumentSpec;
  entries: EntryView[];
  vault: Vault;
  announce(text: string): void;
  bump(): void;
  marks?: (e: EntryView) => string[];
  kindle?: { live: boolean; fire(e: EntryView): void };
}) {
  const uid = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [kind, setKind] = useState<EntryKind>(spec.kinds[0] ?? "thing");
  const [editing, setEditing] = useState<EntryView | null>(null);
  const [unknown, setUnknown] = useState(false);

  const set = (key: string, v: string) => setValues((vs) => ({ ...vs, [key]: v }));
  const activeFields: readonly FieldDef[] = unknown ? [...spec.fields, ...UNKNOWN_FIELDS] : spec.fields;

  const collect = (): Body => {
    // Revision merges over the existing body — fields outside this form survive (§4).
    const body: Body = editing !== null ? { ...bodyOf(editing) } : {};
    if (spec.fixed !== undefined) Object.assign(body, spec.fixed);
    for (const f of activeFields) {
      if (f.kind === "lines" && f.count !== undefined) {
        const items: string[] = [];
        for (let i = 0; i < f.count; i++) items.push((values[`${f.key}#${i}`] ?? "").trim());
        if (items.some((s) => s !== "")) body[f.key] = items;
        else delete body[f.key];
      } else if (f.kind === "lines") {
        const items = (values[f.key] ?? "").split("\n").map((s) => s.trim()).filter((s) => s !== "");
        if (items.length > 0) body[f.key] = items;
        else delete body[f.key];
      } else {
        const v = (values[f.key] ?? "").trim();
        if (v !== "") body[f.key] = v;
        else delete body[f.key];
      }
    }
    return body;
  };

  const reset = () => {
    setValues({});
    setEditing(null);
    setUnknown(false);
    setKind(spec.kinds[0] ?? "thing");
  };

  const beginEdit = (e: EntryView) => {
    const b = bodyOf(e);
    const next: Record<string, string> = {};
    for (const f of [...spec.fields, ...UNKNOWN_FIELDS]) {
      if (f.kind === "lines" && f.count !== undefined) {
        const a = arr(b, f.key);
        for (let i = 0; i < f.count; i++) next[`${f.key}#${i}`] = a[i] ?? "";
      } else if (f.kind === "lines") next[f.key] = arr(b, f.key).join("\n");
      else next[f.key] = str(b, f.key);
    }
    setValues(next);
    setEditing(e);
    setKind(e.kind);
    setUnknown(arr(b, "tableTests").length > 0 || str(b, "bounds") !== "");
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const body = collect();
    if (typeof body.name !== "string" || body.name === "") {
      announce("Give it a name first — every entry begins with one.");
      return;
    }
    // W-2: ink drafts only; provisional until the Charter, elsewhere, binds it.
    const r = editing !== null
      ? vault.archive.reviseDraft(editing.id, body, "owner")
      : vault.archive.draft(kind, body, { provenance: "ink", actor: "owner" });
    if (!r.ok) {
      announce(teach(r.error));
      return; // the draft stays open for repair (§9 — never a lost edit)
    }
    announce(editing !== null
      ? "Revised, in ink. Still provisional until the Charter binds it."
      : "Drafted, in ink. Provisional until the Charter binds it.");
    reset();
    bump();
  };

  const renderField = (f: FieldDef): ReactNode => {
    if (f.kind === "choice") {
      const id = `${uid}-${f.key}`;
      return (
        <div className="fg-field" key={f.key}>
          <label htmlFor={id}>{f.label}</label>
          <select id={id} className="fg-input" value={values[f.key] ?? ""} onChange={(ev) => set(f.key, ev.target.value)}>
            <option value="">—</option>
            {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {f.hint !== undefined ? <p className="fg-hint">{f.hint}</p> : null}
        </div>
      );
    }
    if (f.kind === "lines" && f.count !== undefined) {
      return (
        <fieldset className="fg-lineset" key={f.key}>
          <legend>{f.label}</legend>
          {Array.from({ length: f.count }, (_, i) => {
            const id = `${uid}-${f.key}-${i}`;
            const label = f.lineLabels?.[i] ?? `${f.label} ${i + 1}`;
            return (
              <div className="fg-field" key={id}>
                <label htmlFor={id}>{label}</label>
                <input id={id} className="fg-input" type="text"
                  value={values[`${f.key}#${i}`] ?? ""}
                  onChange={(ev) => set(`${f.key}#${i}`, ev.target.value)} />
              </div>
            );
          })}
          {f.hint !== undefined ? <p className="fg-hint">{f.hint}</p> : null}
        </fieldset>
      );
    }
    const id = `${uid}-${f.key}`;
    return (
      <div className="fg-field" key={f.key}>
        <label htmlFor={id}>{f.label}</label>
        {f.kind === "line" ? (
          <input id={id} className="fg-input" type="text" value={values[f.key] ?? ""}
            onChange={(ev) => set(f.key, ev.target.value)} />
        ) : (
          <textarea id={id} className="fg-input" rows={f.kind === "lines" ? 3 : 2}
            value={values[f.key] ?? ""} onChange={(ev) => set(f.key, ev.target.value)} />
        )}
        {f.hint !== undefined ? <p className="fg-hint">{f.hint}</p> : null}
      </div>
    );
  };

  const renderCard = (e: EntryView): ReactNode => {
    const b = bodyOf(e);
    const d = spec.detail?.(b) ?? "";
    const ms = marks?.(e) ?? [];
    return (
      <li className="fg-card" key={e.id}>
        <div className="fg-card-head">
          <span className="fg-card-name">{e.name}</span>
          <span className="fg-chip">{e.canonStatus}</span>
        </div>
        {d !== "" ? <p className="fg-card-detail">{d}</p> : null}
        {ms.map((m, i) => <p className="fg-mark" key={i}>{m}</p>)}
        <div className="fg-card-acts">
          <button type="button" onClick={() => beginEdit(e)}>revise</button>
          {kindle !== undefined ? (
            // §6 M3 — with no live session the kindle greys, visible, never hidden
            <button type="button" className="fg-kindle" disabled={!kindle.live}
              title={kindle.live ? undefined : "no live session"}
              onClick={() => kindle.fire(e)}>kindle</button>
          ) : null}
        </div>
      </li>
    );
  };

  let listBlock: ReactNode;
  if (entries.length === 0) {
    listBlock = <p className="fg-void">{spec.invite}</p>;
  } else if (spec.groupBy !== undefined) {
    const groupOf = spec.groupBy;
    const map = new Map<string, EntryView[]>();
    for (const e of entries) {
      const g = groupOf(e);
      const cur = map.get(g);
      if (cur !== undefined) cur.push(e);
      else map.set(g, [e]);
    }
    const sealed = spec.groups ?? [];
    const order = [...sealed, ...[...map.keys()].filter((g) => !sealed.includes(g))];
    listBlock = (
      <div className="fg-groups">
        {order.filter((g) => map.has(g)).map((g) => (
          <div key={g}>
            <h4 className="fg-group-title">{g}</h4>
            <ul className="fg-cards">{(map.get(g) ?? []).map(renderCard)}</ul>
          </div>
        ))}
      </div>
    );
  } else {
    listBlock = <ul className="fg-cards">{entries.map(renderCard)}</ul>;
  }

  const kindId = `${uid}-kind`;
  return (
    <section className="fg-inst" aria-label={spec.title}>
      <h3 className="fg-inst-title">{spec.title}</h3>
      {listBlock}
      <form className="fg-form" onSubmit={onSubmit}>
        <h4 className="fg-form-title">{editing !== null ? `revise — ${editing.name}` : "draft"}</h4>
        {spec.kinds.length > 1 && editing === null ? (
          <div className="fg-field">
            <label htmlFor={kindId}>as</label>
            <select id={kindId} className="fg-input" value={kind}
              onChange={(ev) => setKind(ev.target.value as EntryKind)}>
              {spec.kinds.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        ) : null}
        {spec.fields.map(renderField)}
        <label className="fg-unknown">
          <input type="checkbox" checked={unknown} onChange={(ev) => setUnknown(ev.target.checked)} />
          draft as a bounded unknown
        </label>
        {unknown ? UNKNOWN_FIELDS.map(renderField) : null}
        <div className="fg-form-acts">
          <button type="submit" className="fg-submit">{editing !== null ? "revise, in ink" : "draft, in ink"}</button>
          {editing !== null ? <button type="button" onClick={reset}>set aside</button> : null}
        </div>
      </form>
    </section>
  );
}

// ---- the §2 domain mapping, instrument by instrument (no invention: kinds,
//      facet fields, and layers come from the sealed table) ----
const NAME: FieldDef = { key: "name", label: "name", kind: "line" };

const GRAVITY: InstrumentSpec = {
  title: "gravity truths",
  invite: "No gravity yet. Write the first law this world always enforces — the sentence nothing gets to break.",
  kinds: ["ruling"],
  fixed: { layer: "gravity" }, // §2 row 1
  fields: [NAME,
    { key: "statement", label: "statement", kind: "prose" },
    { key: "constrains", label: "constrains", kind: "line", hint: "what this law forbids or narrows" },
    { key: "produces", label: "produces", kind: "line", hint: "what this law reliably causes" },
  ],
  detail: (b) => str(b, "statement"),
};

const SCARCITY: InstrumentSpec = {
  title: "scarcity",
  invite: "Nothing is scarce yet. Name what is wanted and structurally short.",
  kinds: ["ruling"],
  fixed: { layer: "structural" }, // §2 row 7
  fields: [NAME,
    { key: "scarcityVector", label: "scarcity vector", kind: "line", hint: "what is short, and along which line it bites" },
  ],
  detail: (b) => str(b, "scarcityVector"),
};

const FAITH: InstrumentSpec = {
  title: "faith & magic contract",
  invite: "No contract yet. What does the numinous cost here — and how would anyone tell the real thing?",
  kinds: ["ruling"],
  // §2 row 8 names `layer` among the contract's fields but seals no value for it;
  // it stays unset at draft (core keeps layer draft-optional) — the restrained reading.
  fields: [NAME,
    { key: "discernmentTells", label: "discernment tells", kind: "lines", count: 3,
      lineLabels: ["procedural tell", "sensory tell", "cultural tell"],
      hint: "three channels — how the real thing is told from the false (§2)" },
    { key: "socialMeaning", label: "social meaning", kind: "prose" },
    { key: "costs", label: "costs", kind: "prose" },
  ],
  detail: (b) => arr(b, "discernmentTells").filter((s) => s !== "").join(" · "),
};

const ACTOR_FIELDS: readonly FieldDef[] = [NAME,
  { key: "beingType", label: "being type", kind: "choice", options: ["person", "faction", "org", "creature"] }, // ADR-003-A
  { key: "goal", label: "goal", kind: "line" },
  { key: "method", label: "method", kind: "line" },
  { key: "enforcement", label: "enforcement", kind: "line", hint: "how this actor makes its will stick" },
  { key: "legitimacy", label: "legitimacy", kind: "line", hint: "why anyone accepts it — if anyone does" },
];

const LATTICE: InstrumentSpec = {
  title: "power lattice",
  invite: "The lattice is empty. Draft the first actor with a goal and the means to press it.",
  kinds: ["being"],
  fields: ACTOR_FIELDS,
  detail: (b) => str(b, "goal"),
};

const BESTIARY: InstrumentSpec = {
  ...LATTICE,
  title: "beings",
  invite: "The bestiary is empty. Someone lives here — draft them.",
  groupBy: (e) => { const t = str(bodyOf(e), "beingType"); return t !== "" ? t : "unsorted"; },
  groups: ["person", "faction", "org", "creature", "unsorted"],
};

const CHOKEPOINTS: InstrumentSpec = {
  title: "chokepoints",
  invite: "No chokepoints yet. Where does movement narrow enough to matter?",
  kinds: ["place"],
  fixed: { chokepoint: true }, // §2 row 6 (core field, v1.2)
  fields: [NAME,
    { key: "friction", label: "friction", kind: "prose", hint: "what slows, taxes, or inspects whoever passes" },
  ],
  detail: (b) => str(b, "friction"),
};

const TOYS: InstrumentSpec = {
  title: "toys",
  invite: "The toybox is empty. Build the first thing a table can pick up and play with.",
  kinds: ["being", "place", "thing"], // §2 row 3
  fields: [NAME,
    { key: "goal", label: "goal", kind: "line" },
    { key: "method", label: "method", kind: "line" },
    { key: "activeProblem", label: "active problem", kind: "line" },
    { key: "hooks", label: "hooks", kind: "lines", count: 2 },
    { key: "lever", label: "lever", kind: "line" },
    { key: "escalation", label: "escalation", kind: "line", hint: "what it does if ignored" }, // §2 Toy Card field
  ],
  detail: (b) => str(b, "activeProblem"),
};

const CLOCKS: InstrumentSpec = {
  title: "pressure clocks",
  invite: "No pressure yet. Set a clock — four steps toward something that should not happen.",
  kinds: ["clock"],
  fields: [NAME,
    { key: "steps", label: "steps", kind: "lines", count: 4 }, // core §2.2: four steps, exactly
    { key: "advances", label: "advances when", kind: "line" },
    { key: "slows", label: "slows when", kind: "line" },
  ],
  detail: (b) => arr(b, "steps").filter((s) => s !== "").join(" → "),
};

const TRUTHS: InstrumentSpec = {
  title: "portable truths",
  invite: "No portable truths yet. Write something worth learning — and what learning it unlocks.",
  kinds: ["truth"],
  // v1.2: a truth is draftable lever-less; the gate teaches the Lever Test (marks below).
  fields: [NAME,
    { key: "lever", label: "lever", kind: "line", hint: "what knowing this lets someone do" },
    { key: "vectors", label: "vectors", kind: "lines", hint: "one per line — who or what carries it; three make it sturdy" },
    { key: "whoHidesIt", label: "who hides it", kind: "line" },
  ],
  detail: (b) => str(b, "lever"),
};

const PLACES: InstrumentSpec = {
  title: "places",
  invite: "The atlas is blank. Draft the first place — what it looks, sounds, and smells like, and its twist.",
  kinds: ["place"],
  fields: [NAME,
    { key: "sensoryAnchors", label: "sensory anchors", kind: "lines", hint: "one per line — what the senses catch on arrival" },
    { key: "twist", label: "twist", kind: "prose" },
  ],
  detail: (b) => {
    const parts: string[] = [];
    if (b.chokepoint === true) parts.push("chokepoint");
    const anchors = arr(b, "sensoryAnchors").join(" · ");
    if (anchors !== "") parts.push(anchors);
    if (str(b, "twist") !== "") parts.push(str(b, "twist"));
    return parts.join(" — ");
  },
};

const ERAS: InstrumentSpec = {
  title: "eras",
  invite: "No eras yet. Mark the first world-time event and what it changed.",
  kinds: ["scene"], // ADR-003-B: a timeline event is a scene with worldTime, no session tie
  fields: [NAME,
    { key: "worldTime", label: "world time", kind: "line", hint: "as the world reckons it — the timeline orders by this text" },
    { key: "whatChanged", label: "what changed", kind: "prose" },
  ],
  detail: (b) => [str(b, "worldTime"), str(b, "whatChanged")].filter((s) => s !== "").join(" — "),
};

// ---- the rooms ----
interface RoomCtx {
  vault: Vault;
  refresh: number;
  announce(text: string): void;
  bump(): void;
}

function SubstrateRoom({ vault, refresh, announce, bump }: RoomCtx) {
  const rulings = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("ruling").orderBy("name")); }, [vault, refresh]);
  const beings = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("being").orderBy("name")); }, [vault, refresh]);
  const places = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("place").orderBy("name")); }, [vault, refresh]);
  // Rulings sort into their instruments by the §2 facet that names them; a
  // contract is the ruling that carries discernmentTells (see build report).
  const isFaith = (e: EntryView) => Array.isArray(bodyOf(e).discernmentTells);
  const gravity = rulings.filter((e) => str(bodyOf(e), "layer") === "gravity" && !isFaith(e));
  const scarcity = rulings.filter((e) => str(bodyOf(e), "layer") === "structural" && !isFaith(e));
  const faith = rulings.filter(isFaith);
  const chokepoints = places.filter((e) => bodyOf(e).chokepoint === true);
  const shared = { vault, announce, bump };
  return (
    <div className="fg-room">
      <Instrument spec={GRAVITY} entries={gravity} {...shared} />
      <Instrument spec={SCARCITY} entries={scarcity} {...shared} />
      <Instrument spec={FAITH} entries={faith} {...shared} />
      <Instrument spec={LATTICE} entries={beings} {...shared} />
      <Instrument spec={CHOKEPOINTS} entries={chokepoints} {...shared} />
    </div>
  );
}

function ToyboxRoom({ vault, refresh, announce, bump, kindle }: RoomCtx & {
  kindle: { live: boolean; fire(e: EntryView): void };
}) {
  const toys = useMemo(() => {
    void refresh;
    const out: EntryView[] = [];
    for (const k of ["being", "place", "thing"] as const) {
      out.push(...queryEntries(vault, EntryQuery.kind(k).orderBy("name")));
    }
    // A Toy is any being/place/thing carrying the Toy facet (§2 row 3); its
    // distinctive fields are activeProblem/hooks — plain lattice actors and
    // atlas places stay in their own rooms (see build report).
    return out
      .filter((e) => { const b = bodyOf(e); return str(b, "activeProblem") !== "" || arr(b, "hooks").length > 0; })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [vault, refresh]);
  const clocks = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("clock").orderBy("name")); }, [vault, refresh]);
  const truths = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("truth").orderBy("name")); }, [vault, refresh]);

  // §3 Toybox coverage marks (W-4) — craft teaching, never raw validation.
  const toyMarks = useCallback((e: EntryView): string[] => {
    const b = bodyOf(e);
    const whole = str(b, "goal") !== "" && str(b, "method") !== "" && str(b, "activeProblem") !== ""
      && arr(b, "hooks").filter((h) => h.trim() !== "").length >= 2
      && str(b, "lever") !== "" && str(b, "escalation") !== "";
    return whole ? [] : ["incomplete — a complete toy carries a goal, a method, an active problem, two hooks, a lever, and an escalation."];
  }, []);
  const truthMarks = useCallback((e: EntryView): string[] => {
    void refresh;
    const b = bodyOf(e);
    const out: string[] = [];
    if (str(b, "lever") === "") {
      // §4 — the persistent "lever missing" mark, the craft line verbatim
      out.push("lever missing — a truth that changes nothing is trivia. What does knowing this let someone do?");
    } else {
      // ADR-003-D / §4 H5c — readiness counts only truths with a live unlocks link
      const links = vault.archive.links(e.id, { type: "unlocks", direction: "from" });
      if (!links.ok || links.value.length === 0) {
        out.push("lever not yet live — draw the unlocks link in the Web; readiness counts only truths whose lever unlocks something.");
      }
    }
    const vs = arr(b, "vectors");
    if (vs.length === 0) out.push("no vectors yet — who or what carries this truth into play?");
    else if (vs.length < 3) out.push("fragile — fewer than three vectors carry this truth."); // §2 M1 soft minimum
    return out;
  }, [vault, refresh]);

  const shared = { vault, announce, bump, kindle };
  return (
    <div className="fg-room">
      {/* §8 deployability: toys, clocks, and truths all kindle from here in ≤2 gestures */}
      <Instrument spec={TOYS} entries={toys} {...shared} marks={toyMarks} />
      <Instrument spec={CLOCKS} entries={clocks} {...shared} />
      <Instrument spec={TRUTHS} entries={truths} {...shared} marks={truthMarks} />
    </div>
  );
}

// The consequence graph, list-rendered (§6: the model and interactions are the
// Forge's; force-directed layout is the component library's, per §1.2).
function WebRoom({ vault, refresh, announce, bump }: RoomCtx) {
  const uid = useId();
  const all = useMemo(() => {
    void refresh;
    const out: EntryView[] = [];
    for (const k of ENTRY_KINDS) out.push(...queryEntries(vault, EntryQuery.kind(k).orderBy("name")));
    return out;
  }, [vault, refresh]);
  const names = useMemo(() => new Map(all.map((e) => [e.id, e.name])), [all]);
  const linked = useMemo(
    () => all
      .map((e) => {
        const r = vault.archive.links(e.id); // active links, both directions
        return { e, links: r.ok ? r.value : [] };
      })
      .filter((x) => x.links.length > 0),
    [all, vault],
  );

  const [from, setFrom] = useState("");
  const [type, setType] = useState<LinkType>("threatens");
  const [to, setTo] = useState("");

  const onLink = (ev: FormEvent) => {
    ev.preventDefault();
    if (from === "" || to === "") {
      announce("Pick both ends — a consequence needs a from and a to.");
      return;
    }
    const r = vault.archive.link(from, to, type, "owner");
    if (!r.ok) {
      announce(teach(r.error));
      return;
    }
    announce("Linked, in ink. The web remembers.");
    setTo("");
    bump();
  };

  const pick = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <div className="fg-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="fg-input" value={value} onChange={(ev) => onChange(ev.target.value)}>
        <option value="">—</option>
        {all.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.kind})</option>)}
      </select>
    </div>
  );

  return (
    <section className="fg-inst" aria-label="the relationship web">
      <h3 className="fg-inst-title">the relationship web</h3>
      {linked.length === 0 ? (
        <p className="fg-void">No consequences drawn yet. When entries exist, link what threatens what, and what serves whom.</p>
      ) : (
        <ul className="fg-web-nodes">
          {linked.map(({ e, links }) => (
            <li className="fg-web-node" key={e.id}>
              <div className="fg-card-head">
                <span className="fg-card-name">{e.name}</span>
                <span className="fg-chip">{e.kind}</span>
              </div>
              {LINK_TYPES.map((t) => {
                const ls = links.filter((l) => l.type === t);
                if (ls.length === 0) return null;
                return (
                  <div className="fg-web-group" key={t}>
                    <span className="fg-linktype">{t}</span>
                    <ul>
                      {ls.map((l) => (
                        <li key={l.id}>
                          {l.from === e.id
                            ? `→ ${names.get(l.to) ?? l.to}`
                            : `← ${names.get(l.from) ?? l.from}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      )}
      {/* §4 — links are first-class authoring: from → type → to, one archive.link */}
      <form className="fg-link-form" onSubmit={onLink} aria-label="Draw a consequence link">
        {pick(`${uid}-from`, "from", from, setFrom)}
        <div className="fg-field">
          <label htmlFor={`${uid}-type`}>consequence</label>
          <select id={`${uid}-type`} className="fg-input" value={type}
            onChange={(ev) => setType(ev.target.value as LinkType)}>
            {LINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {pick(`${uid}-to`, "to", to, setTo)}
        <div className="fg-form-acts">
          <button type="submit" className="fg-submit">link, in ink</button>
        </div>
      </form>
    </section>
  );
}

function AtlasRoom({ vault, refresh, announce, bump }: RoomCtx) {
  const places = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("place").orderBy("name")); }, [vault, refresh]);
  return (
    <div className="fg-room">
      <Instrument spec={PLACES} entries={places} vault={vault} announce={announce} bump={bump} />
    </div>
  );
}

function BestiaryRoom({ vault, refresh, announce, bump }: RoomCtx) {
  const beings = useMemo(() => { void refresh; return queryEntries(vault, EntryQuery.kind("being").orderBy("name")); }, [vault, refresh]);
  // §5 routing seats the power-lattice actor editor here; the Instrument's form
  // carries the full ADR-003-A actor fields.
  return (
    <div className="fg-room">
      <Instrument spec={BESTIARY} entries={beings} vault={vault} announce={announce} bump={bump} />
    </div>
  );
}

function ErasRoom({ vault, refresh, announce, bump }: RoomCtx) {
  const eras = useMemo(() => {
    void refresh;
    // ADR-003-B — the timeline reads scenes with worldTime set; EntryQuery orders
    // by name/createdAt only, so world-time ordering is client-side by that text.
    return queryEntries(vault, EntryQuery.kind("scene").orderBy("createdAt"))
      .filter((e) => str(bodyOf(e), "worldTime") !== "")
      .sort((a, b) => str(bodyOf(a), "worldTime").localeCompare(str(bodyOf(b), "worldTime")));
  }, [vault, refresh]);
  return (
    <div className="fg-room">
      <Instrument spec={ERAS} entries={eras} vault={vault} announce={announce} bump={bump} />
    </div>
  );
}

// ---- the Forge ----
const FORGE_TABS: ReadonlyArray<{ key: ForgeTab; label: string }> = [
  { key: "substrate", label: "substrate" },
  { key: "toybox", label: "toybox" },
  { key: "web", label: "web" },
  { key: "atlas", label: "atlas" },
  { key: "bestiary", label: "bestiary" },
  { key: "eras", label: "eras" },
];

export function ForgeRoom({ vault, sessionId, announce, reducedMotion }: {
  vault: Vault;
  sessionId: string;
  announce(text: string): void;
  reducedMotion: boolean;
}) {
  const [tab, setTab] = useState<ForgeTab>("substrate");
  const [refresh, setRefresh] = useState(0); // the recompose pulse after a draft/link
  const bump = useCallback(() => setRefresh((n) => n + 1), []);

  // §8 deployability — deploy-to-stage in ≤2 gestures: the card is one, this is two.
  const kindle = useMemo(() => ({
    live: sessionId !== "", // §6 M3 — kindle wants an open session; greyed otherwise
    fire: (e: EntryView) => {
      const r = vault.ash.append("entry.kindled", { entryId: e.id }, { actor: "owner", sessionId });
      announce(r.ok ? `${e.name}, kindled. It waits on the stage.` : teach(r.error));
    },
  }), [vault, sessionId, announce]);

  const ctx: RoomCtx = { vault, refresh, announce, bump };

  return (
    <div className={`fg-forge${reducedMotion ? " fg-reduced" : ""}`}>
      <GateStrip vault={vault} refresh={refresh} onRoute={setTab} />
      <div className="fg-tabs" role="tablist" aria-label="Forge rooms">
        {FORGE_TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
            className={`fg-tab${tab === t.key ? " fg-here" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="fg-room-body">
        {tab === "substrate" ? <SubstrateRoom {...ctx} /> : null}
        {tab === "toybox" ? <ToyboxRoom {...ctx} kindle={kindle} /> : null}
        {tab === "web" ? <WebRoom {...ctx} /> : null}
        {tab === "atlas" ? <AtlasRoom {...ctx} /> : null}
        {tab === "bestiary" ? <BestiaryRoom {...ctx} /> : null}
        {tab === "eras" ? <ErasRoom {...ctx} /> : null}
      </div>
    </div>
  );
}
