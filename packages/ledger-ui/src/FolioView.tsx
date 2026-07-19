// The composed page. GENESIS 03 law rendered: the vertical runner as the region's
// accessible label (§IV.4/§X), roman pagination (§XI-a), the pinned zone (§V),
// margins that carry meaning (whisper · concentration · pencil °), ribbons as edge
// affordances, the rubricated page-cast at --severity-cast-opacity. The live
// region is POLITE, never assertive (§X).
import { useId, type ReactNode } from "react";
import type { Folio, MarginSlot, Ribbon } from "@ash-archive/composer";
import { roman } from "@ash-archive/composer";
import { ElementView, type VerbHandler } from "./elements.js";

export interface FolioViewProps {
  folio: Folio;
  onVerb: VerbHandler;
  onRibbon?: (ribbon: Ribbon) => void;
  onPencil?: (slot: MarginSlot & { kind: "pencil" }, action: "keep" | "dismiss") => void;
  /** Rendered under the pagination — the shell's spread controls live here. */
  footer?: ReactNode;
}

function MarginSlotView({ slot, onPencil }: {
  slot: MarginSlot;
  onPencil?: FolioViewProps["onPencil"];
}) {
  switch (slot.kind) {
    case "whisper":
      return <div className="lf-margin-whisper" role="note" aria-label={slot.a11y.label}>{slot.text}</div>;
    case "concentration":
      return (
        <div className={`lf-margin-conc${slot.guttering ? " lf-guttering" : ""}`} role="status" aria-label={slot.a11y.label}>
          <span className="lf-flame" aria-hidden="true">🕯</span> {slot.riteName}
        </div>
      );
    case "pencil":
      return (
        <div className="lf-margin-pencil" role="note" aria-label={slot.a11y.label}>
          <span className="lf-pencil-mark" aria-hidden="true">°</span>
          {slot.text}
          {onPencil !== undefined ? (
            <span className="lf-pencil-acts">
              <button type="button" onClick={() => onPencil(slot, "keep")}>keep</button>
              <button type="button" onClick={() => onPencil(slot, "dismiss")}>dismiss</button>
            </span>
          ) : null}
        </div>
      );
  }
}

function RibbonView({ ribbon, onRibbon }: { ribbon: Ribbon; onRibbon?: ((r: Ribbon) => void) | undefined }) {
  if (ribbon.kind === "reaction") {
    return (
      <button
        type="button"
        className="lf-ribbon lf-ribbon-reaction"
        onClick={() => onRibbon?.(ribbon)}
        aria-label={ribbon.a11y.label}
      >
        {ribbon.interruptKind}
      </button>
    );
  }
  return (
    <div className={`lf-ribbon lf-ribbon-${ribbon.kind}`} role="note" aria-label={ribbon.a11y.label}>
      {ribbon.kind === "previously" ? ribbon.summary : ribbon.text}
    </div>
  );
}

/** Runner text "· · the · vitals · ·" → the italic-the + small-caps pattern. */
function RunnerLabel({ runner, id }: { runner: string; id: string }) {
  const m = /·\s*the\s*·\s*([^·]+)\s*·/.exec(runner);
  const name = m?.[1]?.trim() ?? runner;
  return (
    <span id={id} className="lf-runner">
      <span aria-hidden="true">· · </span><i>the</i><span aria-hidden="true"> · </span>{name}<span aria-hidden="true"> · ·</span>
    </span>
  );
}

export function FolioView({ folio, onVerb, onRibbon, onPencil, footer }: FolioViewProps) {
  const runnerId = useId();
  const cast = folio.rubricated
    ? folio.pinned.concat(folio.body).reduce<string | null>((top, el) =>
        el.rubric !== undefined ? `var(${el.rubric.cssVar})` : top, null)
    : null;
  return (
    <section
      className={`lf-folio${folio.rubricated ? " lf-folio-rubricated" : ""}`}
      role="region"
      aria-labelledby={runnerId}
      data-folio={folio.key}
      style={cast !== null ? { ["--page-cast" as string]: cast } : undefined}
    >
      {folio.ribbons.length > 0 ? (
        <div className="lf-ribbons">
          {folio.ribbons.map((r, i) => <RibbonView key={i} ribbon={r} onRibbon={onRibbon} />)}
        </div>
      ) : null}

      <RunnerLabel runner={folio.runner} id={runnerId} />

      {folio.pinned.length > 0 ? (
        <div className="lf-pinned">
          {folio.pinned.map((el) => <ElementView key={el.id} el={el} onVerb={onVerb} />)}
        </div>
      ) : null}

      <div className="lf-body">
        {folio.body.map((el) => <ElementView key={el.id} el={el} onVerb={onVerb} />)}
      </div>

      {folio.margin.length > 0 ? (
        <aside className="lf-margin" aria-label="Margin">
          {folio.margin.map((slot, i) => <MarginSlotView key={i} slot={slot} onPencil={onPencil} />)}
        </aside>
      ) : null}

      <footer className="lf-foot">
        <span className="lf-pagination lf-num" aria-label={`Folio ${folio.index.ordinal} of ${folio.index.total}`}>
          {roman(folio.index.ordinal)} OF {roman(folio.index.total)}
        </span>
        {footer}
      </footer>

      <div className="lf-live" role="status" aria-live="polite">{folio.a11yLiveRegion ?? ""}</div>
    </section>
  );
}
