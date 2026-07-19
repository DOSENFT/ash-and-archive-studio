// The Chronicle — the Ledger stance (SPEC-001 §6; GENESIS 06 Part One).
// The Binding ceremony renders the plan as a value (phase 2 is data, not API):
// dispositions toggle on a local copy, ratification is audit-not-judgment, and
// the commit is the one place full ceremony weight is allowed — a press-and-hold
// gold instrument whose fill runs the ceremony register. No confetti, no
// spectacle: the gravity is stillness. Below, the shelf: bound chapters as
// spines, and the open session's recent ash as a quiet log.
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Vault, AshEvent, BindingPlan, BindingReceipt, Disposition, EntryUpsert, EntryView,
} from "@ash-archive/core";
import { EntryQuery } from "@ash-archive/core";

const DISPOSITIONS: { d: Disposition; label: string }[] = [
  { d: "bind", label: "bind" },
  { d: "blowAway", label: "blow away" },
  { d: "holdAsAsh", label: "hold as ash" },
];

// One quiet line of a payload — the log reads, it does not dump (GENESIS 06 §I:
// "not a log dump"). Presentation is spec-silent; most restrained: key: value pairs.
function readPayload(payload: unknown): string {
  if (payload === null || typeof payload !== "object") return String(payload ?? "");
  const parts = Object.entries(payload as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
  const line = parts.join(" · ");
  return line.length > 96 ? `${line.slice(0, 96)}…` : line;
}

export function ChronicleRoom({ vault, sessionId, announce, reducedMotion }: {
  vault: Vault;
  sessionId: string;
  announce(text: string): void;
  reducedMotion: boolean;
}) {
  const [tick, setTick] = useState(0);
  const [plan, setPlan] = useState<BindingPlan | null>(null);
  const [ratified, setRatified] = useState(false);
  const [receipt, setReceipt] = useState<BindingReceipt | null>(null);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);

  const nameOf = useCallback((id: string): string => {
    const r = vault.archive.get(id);
    return r.ok ? r.value.name : id;
  }, [vault]);

  // §6 phase 1 — plan() is pure and deterministic over the same ash; reopening
  // the room reproduces the identical plan (same planHash).
  useEffect(() => {
    if (sessionId === "") { setPlan(null); return; }
    const r = vault.binding.plan(sessionId);
    setPlan(r.ok && r.value.items.length > 0 ? r.value : null);
    setRatified(false);
  }, [vault, sessionId, tick]);

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  // ---- phase 2 — RATIFY: the plan is a value; the ceremony edits it ----

  const setDisposition = (key: string, d: Disposition) => {
    if (plan === null) return;
    const next = structuredClone(plan);
    const item = next.items.find((i) => i.key === key);
    if (item === undefined) return;
    // §6 — challenged items are forced to holdAsAsh until resolved; and commit()
    // refuses to bind a Lever-Test failure (E-1003), so bind is not offered for it.
    if (item.challenged) return;
    if (d === "bind" && item.leverTestFailed) return;
    item.disposition = d;
    // §7.4 / binding.detect doc — the ceremony re-runs detection over the edited
    // plan value so the conflict marks follow the edits.
    next.conflicts = vault.binding.detect(next.items);
    setPlan(next);
    setRatified(false);
  };

  const ratify = () => {
    if (plan === null) return;
    const next = structuredClone(plan);
    for (const item of next.items) {
      if (item.disposition === "bind") item.ratifiedBy = "owner";
    }
    setPlan(next);
    setRatified(true);
    announce("Ratified."); // spec-silent copy; audit, not judgment (GENESIS 06 §I)
  };

  // ---- phase 3 — COMMIT ----

  const commit = (mode: "full" | "banked") => {
    if (plan === null) return;
    const r = vault.binding.commit(plan, "owner", mode);
    if (!r.ok) { announce(r.error.message); return; } // teaching text, never raw codes
    setReceipt(r.value);
    announce("Bound. The Chronicle turns.");
    setTick((t) => t + 1);
  };

  // The seal is a held act, never a click: the hold runs the ceremony register
  // (--dur-ceremony 880ms; 120ms under reduced motion, per tokens.css — sacredness
  // must not tax accessibility). Values mirror the tokens; the fill is CSS-timed.
  const startHold = () => {
    if (!ratified || plan === null) return;
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setHolding(false);
      commit("full");
    }, reducedMotion ? 120 : 880);
  };
  const cancelHold = () => {
    if (holdTimer.current !== null) { window.clearTimeout(holdTimer.current); holdTimer.current = null; }
    setHolding(false);
  };

  // ---- the shelf: bound chapters, newest first ----

  const [spines, setSpines] = useState<EntryView[]>([]);
  const [ash, setAsh] = useState<AshEvent[]>([]);
  useEffect(() => {
    const s = vault.archive.query(EntryQuery.kind("session").orderBy("boundAt", "desc"));
    setSpines(s.ok ? s.value : []);
    // The recent ash of the open session — struck events included so they can be
    // shown struck-through (§3: strike marks, it never erases).
    const w = sessionId === "" ? null : vault.ash.window({ sessionId }, { includeStruck: true });
    setAsh(w !== null && w.ok ? w.value.slice(-20) : []);
  }, [vault, sessionId, tick]);

  const describe = (u: EntryUpsert): string => {
    switch (u.op) {
      case "newEntry": {
        const n = typeof u.body["name"] === "string" ? (u.body["name"] as string) : "unnamed";
        return `new ${u.kind} — ${n}`;
      }
      case "newVersion": return `new version — ${nameOf(u.entryId)}`;
      case "link": return `link — ${nameOf(u.from)} —${u.type}→ ${nameOf(u.to)}`;
      case "disclosure": return `disclosure — ${nameOf(u.entryId)}, known by ${u.knownBy}`;
      case "alias": return `alias — ${nameOf(u.entryId)}, also “${u.alias}”`;
      case "clockAdvance": return `clock — ${nameOf(u.entryId)} to step ${u.step}`;
    }
  };

  return (
    <div className={`lr-room${reducedMotion ? " lr-reduced" : ""}`}>

      {/* ————— the Binding ceremony (§6) ————— */}
      <section className="lr-sheet">
        <p className="lr-title"><i>the</i> BINDING</p>
        {receipt !== null ? (
          <div className="lr-receipt">
            {/* The seal's gravity is stillness — the receipt states, nothing performs. */}
            <p className="lr-receipt-line">Bound{receipt.mode === "banked" ? ", banked" : ""}.</p>
            <p className="lr-note">chapter: {nameOf(receipt.chronicleEntry)}</p>
            <p className="lr-note">{receipt.boundVersions.length} version{receipt.boundVersions.length === 1 ? "" : "s"} bound to ink</p>
          </div>
        ) : plan === null ? (
          <p className="lr-void">The Binding waits for ash. Play first; the ceremony follows the session.</p>
        ) : (
          <>
            <div className="lr-scenes">
              {plan.scenes.map((s, i) => (
                <span key={s.sceneId ?? `s${i}`} className="lr-scene">
                  scene {i + 1} · {s.eventIds.length} event{s.eventIds.length === 1 ? "" : "s"}
                  {s.struckEventIds.length > 0 ? ` · ${s.struckEventIds.length} struck` : ""}
                </span>
              ))}
            </div>
            {plan.items.map((item) => (
              <div key={item.key} className="lr-item">
                <div className="lr-item-head">
                  <span className="lr-item-desc">{describe(item.upsert)}</span>
                  <span className="lr-item-meta">
                    {item.citations.length} citation{item.citations.length === 1 ? "" : "s"}
                    {" · "}ratifier: {item.ratifier}
                    {item.ratifiedBy !== undefined ? ` · ratified by ${item.ratifiedBy}` : ""}
                  </span>
                </div>
                {item.conflicts.map((cid) => {
                  const c = plan.conflicts.find((x) => x.id === cid);
                  return c === undefined ? null : (
                    <p key={cid} className="lr-conflict"><span className="lr-flag" aria-hidden="true">⚑</span> {c.explanation}</p>
                  );
                })}
                {item.leverTestFailed ? (
                  // v1.2 / E-1003 — the Lever Test teaching (message text is this layer's).
                  <p className="lr-teach">the Lever Test — this truth unlocks nothing yet; it holds as ash until it opens a door.</p>
                ) : null}
                {item.challenged ? (
                  <p className="lr-teach">challenged — it holds as ash until the table resolves it.</p>
                ) : null}
                <div className="lr-dispo" role="radiogroup" aria-label="Disposition">
                  {DISPOSITIONS.map(({ d, label }) => (
                    <button key={d} type="button"
                      className={`lr-dispo-btn${item.disposition === d ? " lr-on" : ""}`}
                      role="radio" aria-checked={item.disposition === d}
                      disabled={item.challenged || (d === "bind" && item.leverTestFailed)}
                      onClick={() => setDisposition(item.key, d)}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="lr-seal-row">
              <button type="button" className="lr-quiet" onClick={ratify} disabled={ratified}>
                {ratified ? "ratified — the record stands" : "ratify — this record stands"}
              </button>
              <button
                type="button"
                className={`lr-seal${holding ? " lr-holding" : ""}`}
                disabled={!ratified}
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onKeyDown={(e) => {
                  // Keyboard parity with the lf-rest-btn instrument: the held act
                  // completes on activation; the hold is a pointer's ceremony.
                  if ((e.key === "Enter" || e.key === " ") && ratified) { e.preventDefault(); commit("full"); }
                }}
              >
                seal the Binding
                <span className="lr-seal-fill" aria-hidden="true" />
              </button>
              <span className="lr-seal-hint">press and hold</span>
              {/* Bank the fire — the two-minute variant (GENESIS 06 §I v2): seal
                  provisionally, defer ratification to the Desk. A quiet affordance. */}
              <button type="button" className="lr-quiet lr-bank" onClick={() => commit("banked")}>
                bank the fire
              </button>
            </div>
          </>
        )}
      </section>

      {/* ————— the Chronicle shelf ————— */}
      <section className="lr-sheet">
        <p className="lr-title"><i>the</i> CHRONICLE</p>
        {spines.length === 0 ? (
          <p className="lr-void">Nothing is bound yet. Play first; the Binding waits for ash.</p>
        ) : (
          <div className="lr-spines">
            {spines.map((e) => (
              <div key={e.id} className="lr-spine">
                <span className="lr-spine-name">{e.name}</span>
                <span className="lr-spine-date">{e.boundAt !== null ? e.boundAt.slice(0, 10) : ""}</span>
              </div>
            ))}
          </div>
        )}
        <p className="lr-sub">recent ash</p>
        {ash.length === 0 ? (
          <p className="lr-void">No ash yet this sitting.</p>
        ) : (
          <div className="lr-ash-log">
            {ash.map((ev) => (
              <p key={ev.eventId} className={`lr-ash-row${ev.struck ? " lr-struck" : ""}`}>
                <span className="lr-ash-type">{ev.type}</span>
                <span className="lr-ash-read">{readPayload(ev.payload)}</span>
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
