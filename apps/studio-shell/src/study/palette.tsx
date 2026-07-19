// SH1 §2.6 — the palette is SOVEREIGN, instant, and world-free forever. It opens
// the moment ⌘K/Ctrl+K lands, over any surface; selection lands via drift-cut at
// most. No world pixel moves for it (canon clause 8).
import { useEffect, useMemo, useRef, useState } from "react";

export interface PaletteCommand {
  id: string;
  label: string;
  hint?: string;
  run(): void;
}

export function Palette({ commands, open, onClose }: {
  commands: PaletteCommand[];
  open: boolean;
  onClose(): void;
}) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || (c.hint ?? "").toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => { setSel(0); }, [query]);

  if (!open) return null;
  return (
    <div className="st-palette-veil" onClick={onClose} role="presentation">
      <div
        className="st-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="st-palette-input"
          value={query}
          placeholder="Where to?"
          aria-label="Search commands"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); onClose(); }
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(hits.length - 1, s + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
            if (e.key === "Enter") {
              e.preventDefault();
              const hit = hits[sel];
              if (hit !== undefined) { onClose(); hit.run(); }
            }
          }}
        />
        <ul className="st-palette-list" role="listbox" aria-label="Commands">
          {hits.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === sel}>
              <button
                type="button"
                className={`st-palette-item${i === sel ? " st-sel" : ""}`}
                onMouseEnter={() => setSel(i)}
                onClick={() => { onClose(); c.run(); }}
              >
                <span>{c.label}</span>
                {c.hint !== undefined ? <span className="st-palette-hint">{c.hint}</span> : null}
              </button>
            </li>
          ))}
          {hits.length === 0 ? <li className="st-palette-empty">nothing answers to that</li> : null}
        </ul>
      </div>
    </div>
  );
}
