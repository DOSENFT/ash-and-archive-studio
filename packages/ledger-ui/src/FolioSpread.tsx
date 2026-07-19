// The spread — Turn's jurisdiction (the one spread-level verb of the six-verb
// grammar; SPEC-002 §2.2). Executes turns in the Transition register (520ms
// page motion; 200ms crossfade under reduced motion, GENESIS 03 §VI). The earned
// wheel's shell half lives here: offers render as a gold edge whisper; N=3
// consecutive accepts prompt for consent in ink (ADR-002-A); the grant itself is
// appended by the shell through onConsent — this component holds no canon state.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Folio, MarginSlot, Ribbon, TurnDirective } from "@ash-archive/composer";
import { FolioView } from "./FolioView.js";
import type { VerbHandler } from "./elements.js";

export interface FolioSpreadProps {
  folios: Folio[]; // ordered, precomposed (the runtime keeps them warm)
  activeKey: string;
  onNavigate: (key: string, manual: boolean) => void;
  onVerb: VerbHandler;
  onRibbon?: (ribbon: Ribbon) => void;
  onPencil?: (slot: MarginSlot & { kind: "pencil" }, action: "keep" | "dismiss") => void;
  /** The pending directive for the active spread (from the last delta), if any. */
  directive?: TurnDirective;
  /** Resolve a FolioRole to this spread's folio key (profile.roles). */
  resolveRole: (role: "my-actions" | "my-vitals" | "on-combat-end") => string;
  /** N consecutive accepted offers → the shell appends autoturn.granted. */
  onConsent?: (eventType: string) => void;
  reducedMotion: boolean;
}

const CONSENT_N = 3; // ADR-002-A default; overridable by the shell, non-canon

export function FolioSpread({
  folios, activeKey, onNavigate, onVerb, onRibbon, onPencil,
  directive, resolveRole, onConsent, reducedMotion,
}: FolioSpreadProps) {
  const [turning, setTurning] = useState<"fwd" | "back" | null>(null);
  const accepts = useRef<Record<string, number>>({});
  const [consentAsk, setConsentAsk] = useState<string | null>(null);
  const handled = useRef<TurnDirective | undefined>(undefined);

  const keys = folios.map((f) => f.key);
  const idx = Math.max(0, keys.indexOf(activeKey));
  const active = folios[idx];

  const go = useCallback((to: string, manual: boolean) => {
    if (to === activeKey) return;
    const dir = keys.indexOf(to) > idx ? "fwd" : "back";
    setTurning(dir);
    onNavigate(to, manual);
    const ms = reducedMotion ? 200 : 520;
    window.setTimeout(() => setTurning(null), ms);
  }, [activeKey, idx, keys, onNavigate, reducedMotion]);

  // Execute the composed disposition — the shell executes, never decides (C-6).
  useEffect(() => {
    if (directive === undefined || directive === handled.current) return;
    handled.current = directive;
    if (directive.kind === "auto") {
      go(resolveRole(directive.toRole), false);
    }
  }, [directive, go, resolveRole]);

  // Keyboard: the spread's turn surface (arrows; PgUp/PgDn walk the same spread).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (idx < keys.length - 1) { e.preventDefault(); go(keys[idx + 1]!, true); }
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (idx > 0) { e.preventDefault(); go(keys[idx - 1]!, true); }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go, idx, keys]);

  if (active === undefined) return null;

  const offer = directive?.kind === "offer" ? directive : null;
  const acceptOffer = () => {
    if (offer === null) return;
    const n = (accepts.current[offer.eventType] ?? 0) + 1;
    accepts.current[offer.eventType] = n;
    go(resolveRole(offer.toRole), false);
    if (n >= CONSENT_N && onConsent !== undefined) setConsentAsk(offer.eventType);
  };

  return (
    <div className={`lf-spread${turning !== null ? ` lf-turning-${turning}` : ""}${reducedMotion ? " lf-reduced" : ""}`}>
      <FolioView
        folio={active}
        onVerb={onVerb}
        {...(onRibbon !== undefined ? { onRibbon } : {})}
        {...(onPencil !== undefined ? { onPencil } : {})}
        footer={
          <nav className="lf-turn-nav" aria-label="Turn">
            {folios.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`lf-turn-dot${f.key === activeKey ? " lf-here" : ""}`}
                aria-label={`Turn to ${f.key}`}
                aria-current={f.key === activeKey ? "page" : undefined}
                onClick={() => go(f.key, true)}
              />
            ))}
          </nav>
        }
      />
      {offer !== null ? (
        <div className="lf-offer-whisper" role="note">
          <span className="lf-offer-whisper-text">{offer.whisper}</span>
          <button type="button" className="lf-offer-accept" onClick={acceptOffer}>turn</button>
        </div>
      ) : null}
      {consentAsk !== null ? (
        <div className="lf-consent" role="note">
          <span>The book can make this turn itself from now on.</span>
          <button
            type="button"
            onClick={() => { onConsent?.(consentAsk); setConsentAsk(null); }}
          >
            let it
          </button>
          <button type="button" onClick={() => setConsentAsk(null)}>I&rsquo;ll turn</button>
        </div>
      ) : null}
    </div>
  );
}
