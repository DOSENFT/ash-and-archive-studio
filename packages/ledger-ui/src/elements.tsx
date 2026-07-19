// GENESIS 08-VII — the component roster: one renderer per Element variant of the
// sealed SPEC-002 §2.1 union. Rendering law is GENESIS 03: ink hierarchy (body
// text warm grey, never white), gold means actionable-now (the Gold Law), data
// numerals in Plex Mono, display moments in Crimson Pro, semantic color never
// alone (icon/weight pairing, §X). Every interactive target ≥44px.
import { useState, type ReactNode } from "react";
import type { Element, VerbAffordance } from "@ash-archive/composer";

export type VerbHandler = (element: Element, affordance: VerbAffordance) => void;

interface P {
  el: Element;
  onVerb: VerbHandler;
}

/** Common wrapper: provenance + rubric + a11y carried onto the DOM. */
function Unit({ el, className, children }: { el: Element; className: string; children: ReactNode }) {
  const status = el.a11y.status;
  return (
    <div
      className={[
        "lf-el",
        className,
        el.provenance === "ash" ? "lf-ash" : "lf-ink",
        status === "provisional" ? "lf-provisional" : "",
        status === "unknown" ? "lf-unknown" : "",
        el.rubric !== undefined ? "lf-rubricated" : "",
      ].filter(Boolean).join(" ")}
      style={el.rubric !== undefined ? { ["--rubric" as string]: `var(${el.rubric.cssVar})` } : undefined}
      role={el.a11y.role === "status" || el.a11y.role === "alert" ? el.a11y.role : undefined}
      aria-label={el.a11y.label}
      data-element={el.kind}
      data-provenance={el.provenance}
    >
      {el.provenance === "ash" ? <span className="lf-ash-mark" aria-hidden="true">▵</span> : null}
      {children}
    </div>
  );
}

function UnfoldButton({ el, onVerb, open, setOpen }: P & { open: boolean; setOpen: (b: boolean) => void }) {
  const unfold = el.affords.find((a) => a.verb === "unfold");
  if (unfold === undefined) return null;
  return (
    <button
      type="button"
      className="lf-unfold"
      aria-expanded={open}
      onClick={() => { setOpen(!open); onVerb(el, unfold); }}
    >
      {open ? "fold" : "unfold"}
    </button>
  );
}

// ————— Vitals —————

function Hp({ el }: P) {
  if (el.kind !== "hp") return null;
  return (
    <Unit el={el} className="lf-hp">
      <span className="lf-hp-numeral">{el.current}</span>
      <span className="lf-hp-of"> of {el.max ?? "—"}</span>
      {el.temp > 0 ? <span className="lf-hp-temp"> +{el.temp}</span> : null}
      {el.distressMarks > 0 ? (
        <span className="lf-hp-distress" aria-hidden="true">{"·".repeat(el.distressMarks)}</span>
      ) : null}
    </Unit>
  );
}

function Stats({ el }: P) {
  if (el.kind !== "stats") return null;
  return (
    <Unit el={el} className="lf-stats">
      <span className="lf-stat"><span className="lf-stat-label">AC</span> <span className="lf-num">{el.ac ?? "—"}</span></span>
      <span className="lf-dot" aria-hidden="true">·</span>
      <span className="lf-stat"><span className="lf-stat-label">SPD</span> <span className="lf-num">{el.speed ?? "—"}</span></span>
      {el.initiativeMod !== undefined ? (<>
        <span className="lf-dot" aria-hidden="true">·</span>
        <span className="lf-stat"><span className="lf-stat-label">INIT</span> <span className="lf-num">{el.initiativeMod >= 0 ? `+${el.initiativeMod}` : el.initiativeMod}</span></span>
      </>) : null}
    </Unit>
  );
}

function Economy({ el }: P) {
  if (el.kind !== "economy") return null;
  const pip = (label: string, state: "available" | "spent") => (
    <span className={`lf-pip ${state === "spent" ? "lf-pip-spent" : ""}`} aria-label={`${label} ${state}`}>
      <span className="lf-pip-dot" aria-hidden="true" />
      <span className="lf-pip-label">{label}</span>
    </span>
  );
  return (
    <Unit el={el} className="lf-economy">
      {pip("action", el.action)}{pip("bonus", el.bonus)}{pip("reaction", el.reaction)}{pip("move", el.movement)}
    </Unit>
  );
}

function Conditions(props: P) {
  const { el } = props;
  const [open, setOpen] = useState(false);
  if (el.kind !== "conditions") return null;
  return (
    <Unit el={el} className="lf-conditions">
      <div className="lf-conditions-head">
        <span className="lf-badge-count lf-num">{el.count}</span>
        <span className="lf-conditions-names">
          {el.conditions.map((c) => c.name).join(" · ")}
        </span>
        <UnfoldButton {...props} open={open} setOpen={setOpen} />
      </div>
      {open ? (
        <ul className="lf-conditions-list">
          {el.conditions.map((c) => (
            <li key={c.id} className={`lf-severity-${c.severity}`}>
              <span className="lf-severity-mark" aria-hidden="true">{"!".repeat(Math.min(3, c.severity))}</span>
              {c.name}
            </li>
          ))}
        </ul>
      ) : null}
    </Unit>
  );
}

function DamageHeal({ el, onVerb }: P) {
  const [amount, setAmount] = useState("");
  if (el.kind !== "damage-heal") return null;
  const inscribe = el.affords.find((a) => a.verb === "inscribe");
  const send = (mode: "damage" | "heal") => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0 || inscribe === undefined) return;
    onVerb({ ...el, id: `${el.id}#${mode}:${n}` }, inscribe);
    setAmount("");
  };
  return (
    <Unit el={el} className="lf-damage-heal">
      <input
        className="lf-num-input"
        inputMode="numeric"
        pattern="[0-9]*"
        value={amount}
        aria-label="Amount"
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => { if (e.key === "Enter") send("damage"); }}
      />
      <button type="button" className="lf-wound-btn" onClick={() => send("damage")}>
        <span className="lf-glyph" aria-hidden="true">▾</span> wound
      </button>
      <button type="button" className="lf-heal-btn" onClick={() => send("heal")}>
        <span className="lf-glyph" aria-hidden="true">▴</span> heal
      </button>
    </Unit>
  );
}

function Death({ el }: P) {
  if (el.kind !== "death-save") return null;
  return (
    <Unit el={el} className="lf-death">
      <div className="lf-death-title"><i>the</i> DOOR</div>
      <div className="lf-death-row">
        <span className="lf-death-label">holds</span>
        <span className="lf-death-marks">{["●", "●", "●"].map((m, i) => (
          <span key={i} className={i < el.success ? "lf-death-mark on" : "lf-death-mark"} aria-hidden="true">{m}</span>
        ))}</span>
        <span className="lf-death-count lf-num" aria-label={`${el.success} successes`}>{el.success}</span>
      </div>
      <div className="lf-death-row">
        <span className="lf-death-label">opens</span>
        <span className="lf-death-marks">{["●", "●", "●"].map((m, i) => (
          <span key={i} className={i < el.failure ? "lf-death-mark grave on" : "lf-death-mark grave"} aria-hidden="true">{m}</span>
        ))}</span>
        <span className="lf-death-count lf-num" aria-label={`${el.failure} failures`}>{el.failure}</span>
      </div>
    </Unit>
  );
}

// ————— Action —————

function Hand(props: P) {
  const { el, onVerb } = props;
  const [open, setOpen] = useState(false);
  if (el.kind !== "hand-card") return null;
  const badge =
    el.legality === "spent" ? "spent"
    : el.legality === "blocked" ? (el.blockReason ?? "blocked")
    : el.legality === "unruled" ? "unruled"
    : null;
  return (
    <Unit el={el} className={`lf-hand-card lf-legality-${el.legality}${el.readied ? " lf-readied" : ""}`}>
      <div className="lf-card-head">
        <span className="lf-card-name">{el.name}</span>
        <span className="lf-card-cast lf-num">{el.castTime}</span>
      </div>
      {el.previewLine !== "" ? <div className="lf-card-preview">{el.previewLine}</div> : null}
      {badge !== null ? <div className="lf-card-badge">{badge}</div> : null}
      <UnfoldButton {...props} open={open} setOpen={setOpen} />
      {open ? <div className="lf-card-detail">{el.previewLine !== "" ? el.previewLine : "No further detail staged."}</div> : null}
      {el.legality === "legal" ? (
        <button
          type="button"
          className="lf-card-act"
          onClick={() => onVerb(el, { verb: "kindle", entryId: el.riteRef })}
        >
          use
        </button>
      ) : null}
    </Unit>
  );
}

function CastStack({ el }: P) {
  if (el.kind !== "cast-stack") return null;
  return (
    <Unit el={el} className="lf-cast-stack">
      <span className="lf-cast-rule" aria-hidden="true" />
      <span className="lf-cast-label">cast this turn · {el.spentCount}</span>
      <span className="lf-cast-rule" aria-hidden="true" />
    </Unit>
  );
}

// ————— Stage —————

function StageMark(props: P) {
  const { el } = props;
  const [open, setOpen] = useState(false);
  if (el.kind !== "stage-mark") return null;
  return (
    <Unit el={el} className={`lf-stage-mark${el.active ? " lf-active" : ""}`}>
      <span className="lf-hex" aria-hidden="true">⬡</span>
      <span className="lf-mark-name">{el.name}</span>
      <span className="lf-mark-init lf-num">{el.initiative}</span>
      {el.hp !== undefined ? <span className="lf-mark-hp lf-num">{el.hp.cur}/{el.hp.max}</span> : null}
      {el.conditions.length > 0 ? (
        <span className="lf-mark-conds">
          {el.conditions.map((c) => (
            <span key={c.id} className={`lf-cond-dot lf-severity-${c.severity}`} aria-hidden="true">!</span>
          ))}
        </span>
      ) : null}
      <UnfoldButton {...props} open={open} setOpen={setOpen} />
      {open ? <div className="lf-card-detail">initiative {el.initiative}{el.conditions.length > 0 ? ` · ${el.conditions.length} condition(s)` : ""}</div> : null}
    </Unit>
  );
}

function Cohort({ el }: P) {
  if (el.kind !== "cohort-mark") return null;
  return (
    <Unit el={el} className={`lf-cohort${el.active ? " lf-active" : ""}${el.alive === 0 ? " lf-defeated" : ""}`}>
      <span className="lf-hex" aria-hidden="true">⬡</span>
      <span className="lf-mark-name">{el.name}</span>
      <span className="lf-cohort-pips" aria-label={`${el.alive} of ${el.members} standing`}>
        {Array.from({ length: el.members }, (_, i) => (
          <span key={i} className={i < el.alive ? "lf-member on" : "lf-member"} aria-hidden="true">·</span>
        ))}
      </span>
    </Unit>
  );
}

function Clock({ el }: P) {
  if (el.kind !== "clock") return null;
  return (
    <Unit el={el} className="lf-clock">
      <span className={`lf-clock-quarter lf-clock-step-${el.step}`} aria-hidden="true">
        {["○", "◔", "◑", "◕", "●"][el.step]}
      </span>
      <span className="lf-clock-name">{el.name}</span>
      <span className="lf-clock-step lf-num">{el.step}/4</span>
      {el.advanceHint !== undefined ? <span className="lf-clock-hint">{el.advanceHint}</span> : null}
    </Unit>
  );
}

function Scene({ el }: P) {
  if (el.kind !== "scene-frame") return null;
  return (
    <Unit el={el} className="lf-scene">
      <div className="lf-scene-frame">{el.frame}</div>
      {el.place !== undefined ? <div className="lf-scene-place">{el.place}</div> : null}
    </Unit>
  );
}

// ————— Resources —————

function Strip({ el }: P) {
  if (el.kind !== "resource-strip") return null;
  return (
    <Unit el={el} className={`lf-strip${el.remaining === 0 ? " lf-depleted" : ""}`}>
      <span className="lf-strip-label">{el.label}</span>
      <span className="lf-strip-pips" aria-hidden="true">
        {Array.from({ length: el.max }, (_, i) => (
          <span key={i} className={i < el.remaining ? "lf-slot on" : "lf-slot"}>▮</span>
        ))}
      </span>
      <span className="lf-strip-count lf-num">{el.remaining}/{el.max}</span>
    </Unit>
  );
}

function Rest({ el, onVerb }: P) {
  const [holding, setHolding] = useState<false | "short" | "long">(false);
  if (el.kind !== "rest") return null;
  const bind = el.affords.find((a) => a.verb === "bind");
  const start = (kind: "short" | "long") => setHolding(kind);
  const cancel = () => setHolding(false);
  const complete = (kind: "short" | "long") => {
    if (holding === kind && bind !== undefined) onVerb({ ...el, id: `${el.id}#${kind}` }, bind);
    setHolding(false);
  };
  const btn = (kind: "short" | "long", label: string) => (
    <button
      type="button"
      className={`lf-rest-btn${holding === kind ? " lf-holding" : ""}`}
      onPointerDown={() => start(kind)}
      onPointerUp={() => complete(kind)}
      onPointerLeave={cancel}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (bind) onVerb({ ...el, id: `${el.id}#${kind}` }, bind); } }}
    >
      {label}
      <span className="lf-rest-fill" aria-hidden="true" />
    </button>
  );
  return (
    <Unit el={el} className="lf-rest">
      {btn("short", "short rest")}{btn("long", "long rest")}
      <span className="lf-rest-hint">press and hold</span>
    </Unit>
  );
}

// ————— DM —————

function Offer({ el }: P) {
  if (el.kind !== "offer-line") return null;
  return (
    <Unit el={el} className={`lf-offer lf-offer-${el.role}`}>
      <span className="lf-offer-role">{el.role === "offer" ? "OFFER" : "ASK"}</span>
      <span className="lf-offer-text">{el.text}</span>
    </Unit>
  );
}

function Toy(props: P) {
  const { el, onVerb } = props;
  const [open, setOpen] = useState(false);
  if (el.kind !== "toy-card") return null;
  const kindle = el.affords.find((a) => a.verb === "kindle");
  return (
    <Unit el={el} className="lf-toy">
      <div className="lf-card-head">
        <span className="lf-card-name">{el.name}</span>
        {kindle !== undefined ? (
          <button type="button" className="lf-kindle" onClick={() => onVerb(el, kindle)}>kindle</button>
        ) : null}
      </div>
      <dl className="lf-toy-facets">
        <div><dt>goal</dt><dd>{el.goal}</dd></div>
        <div><dt>method</dt><dd>{el.method}</dd></div>
        {open ? (<>
          <div><dt>problem</dt><dd>{el.activeProblem}</dd></div>
          <div><dt>lever</dt><dd>{el.lever}</dd></div>
        </>) : null}
      </dl>
      <UnfoldButton {...props} open={open} setOpen={setOpen} />
    </Unit>
  );
}

function Truth(props: P) {
  const { el } = props;
  if (el.kind !== "truth-card") return null;
  return (
    <Unit el={el} className={`lf-truth${el.revealed ? " lf-revealed" : ""}`}>
      <div className="lf-card-head">
        <span className="lf-card-name">{el.name}</span>
        <span className="lf-truth-state">{el.revealed ? "revealed" : "hidden"}</span>
      </div>
      <div className="lf-truth-lever"><span className="lf-facet-label">lever</span> {el.lever}</div>
      <div className="lf-truth-vectors lf-num">{el.vectorsCovered} vector{el.vectorsCovered === 1 ? "" : "s"}</div>
    </Unit>
  );
}

function Dice({ el, onVerb }: P) {
  if (el.kind !== "dice") return null;
  const inscribe = el.affords.find((a) => a.verb === "inscribe");
  return (
    <Unit el={el} className="lf-dice">
      <button
        type="button"
        className="lf-dice-face"
        onClick={() => { if (inscribe) onVerb(el, inscribe); }}
        aria-label={`Roll ${el.notation}`}
      >
        <span className="lf-dice-notation">{el.notation}</span>
        {el.lastResult !== undefined ? <span className="lf-dice-result lf-num">{el.lastResult}</span> : null}
      </button>
      {el.advantage !== null ? <span className="lf-dice-adv">{el.advantage}</span> : null}
    </Unit>
  );
}

function Dc({ el, onVerb }: P) {
  const [dc, setDc] = useState(el.kind === "quick-dc" && el.dc !== null ? String(el.dc) : "");
  if (el.kind !== "quick-dc") return null;
  const inscribe = el.affords.find((a) => a.verb === "inscribe");
  return (
    <Unit el={el} className="lf-quick-dc">
      <span className="lf-facet-label">DC</span>
      <input
        className="lf-num-input"
        inputMode="numeric"
        value={dc}
        aria-label="Difficulty class"
        onChange={(e) => setDc(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && inscribe && dc !== "") onVerb({ ...el, id: `${el.id}#${dc}` }, inscribe);
        }}
      />
    </Unit>
  );
}

function Resolve({ el, onVerb }: P) {
  if (el.kind !== "resolve") return null;
  const inscribe = el.affords.find((a) => a.verb === "inscribe");
  return (
    <Unit el={el} className="lf-resolve">
      <button type="button" className="lf-resolve-btn" onClick={() => { if (inscribe) onVerb(el, inscribe); }}>
        RESOLVE
      </button>
    </Unit>
  );
}

function Advance({ el }: P) {
  if (el.kind !== "advance-prompt") return null;
  return (
    <Unit el={el} className="lf-advance">
      <span className="lf-facet-label">advances when</span> {el.condition}
    </Unit>
  );
}

function IfThen({ el, onVerb }: P) {
  if (el.kind !== "if-then") return null;
  return (
    <Unit el={el} className="lf-ifthen">
      <ul>
        {el.rows.map((r) => {
          const kindle = el.affords.find((a) => a.verb === "kindle" && a.entryId === r.thenEntryId);
          return (
            <li key={`${r.ifText}:${r.thenEntryId}`}>
              <span className="lf-ifthen-if">if {r.ifText}</span>
              <button
                type="button" className="lf-kindle"
                onClick={() => { if (kindle) onVerb(el, kindle); }}
              >
                then {r.thenName}
              </button>
            </li>
          );
        })}
      </ul>
    </Unit>
  );
}

function Readout({ el }: P) {
  if (el.kind !== "world-readout") return null;
  return (
    <Unit el={el} className="lf-readout">
      <span className="lf-facet-label">{el.label}</span> {el.value}
    </Unit>
  );
}

function Pacing({ el }: P) {
  if (el.kind !== "pacing") return null;
  return <Unit el={el} className="lf-pacing">{el.observation}</Unit>;
}

// ————— shared —————

function QuillEl({ el, onVerb }: P) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  if (el.kind !== "quill") return null;
  const inscribe = el.affords.find((a) => a.verb === "inscribe");
  return (
    <Unit el={el} className="lf-quill">
      {open ? (
        <span className="lf-quill-row">
          <input
            className="lf-quill-input"
            value={text}
            aria-label="Inscribe a note"
            /* the caret is the actionable metal — gold, via CSS */
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim() !== "" && inscribe) {
                onVerb({ ...el, id: `${el.id}#${text.trim()}` }, inscribe);
                setText("");
                setOpen(false);
              }
              if (e.key === "Escape") { setText(""); setOpen(false); }
            }}
            autoFocus
          />
        </span>
      ) : (
        <button type="button" className="lf-quill-btn" onClick={() => setOpen(true)} aria-label="The quill: inscribe a note">
          ❧
        </button>
      )}
    </Unit>
  );
}

function More(props: P) {
  const { el } = props;
  const [open, setOpen] = useState(false);
  if (el.kind !== "more") return null;
  return (
    <Unit el={el} className="lf-more">
      <UnfoldButton {...props} open={open} setOpen={setOpen} />
      <span className="lf-more-count">{el.count} more, folded</span>
    </Unit>
  );
}

function ChapterEl({ el }: P) {
  if (el.kind !== "chapter") return null;
  const cap = el.prose.charAt(0);
  const rest = el.prose.slice(1);
  return (
    <Unit el={el} className="lf-chapter">
      <h3 className="lf-chapter-title">{el.title}</h3>
      <p className="lf-chapter-prose"><span className="lf-dropcap" aria-hidden="true">{cap}</span><span className="lf-dropcap-sr">{cap}</span>{rest}</p>
    </Unit>
  );
}

function Rung({ el }: P) {
  if (el.kind !== "growth-rung") return null;
  return (
    <Unit el={el} className={`lf-rung${el.attained ? " lf-attained" : ""}`}>
      <span className="lf-rung-mark" aria-hidden="true">{el.attained ? "●" : "○"}</span>
      {el.rung}
    </Unit>
  );
}

/** The roster dispatch — closed union, exhaustive. */
export function ElementView(props: P): ReactNode {
  switch (props.el.kind) {
    case "hp": return <Hp {...props} />;
    case "stats": return <Stats {...props} />;
    case "economy": return <Economy {...props} />;
    case "conditions": return <Conditions {...props} />;
    case "damage-heal": return <DamageHeal {...props} />;
    case "death-save": return <Death {...props} />;
    case "hand-card": return <Hand {...props} />;
    case "cast-stack": return <CastStack {...props} />;
    case "stage-mark": return <StageMark {...props} />;
    case "cohort-mark": return <Cohort {...props} />;
    case "clock": return <Clock {...props} />;
    case "scene-frame": return <Scene {...props} />;
    case "resource-strip": return <Strip {...props} />;
    case "rest": return <Rest {...props} />;
    case "offer-line": return <Offer {...props} />;
    case "toy-card": return <Toy {...props} />;
    case "truth-card": return <Truth {...props} />;
    case "dice": return <Dice {...props} />;
    case "quick-dc": return <Dc {...props} />;
    case "resolve": return <Resolve {...props} />;
    case "advance-prompt": return <Advance {...props} />;
    case "if-then": return <IfThen {...props} />;
    case "world-readout": return <Readout {...props} />;
    case "pacing": return <Pacing {...props} />;
    case "quill": return <QuillEl {...props} />;
    case "more": return <More {...props} />;
    case "chapter": return <ChapterEl {...props} />;
    case "growth-rung": return <Rung {...props} />;
  }
}
