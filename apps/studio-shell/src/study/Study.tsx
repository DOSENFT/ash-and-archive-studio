// THE STUDY — the seated workspace over the live Foundation. Rooms are seated
// pages of one continuous building (SH1): the palette is sovereign and instant
// (⌘K, world-free forever); movement between seated rooms is the drift-cut
// asymptote — 240ms crossfade with a 12px directional drift, destination
// interactive at frame 0 (tier-3 law; the full Passage belongs to the approach).
// The bench is silent: while a room is seated, no world pixel moves.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OpenedStudio } from "../vault/boot.js";
import { Palette, type PaletteCommand } from "./palette.js";
import { TableRoom } from "./TableRoom.js";
import { ForgeRoom } from "./ForgeRoom.js";
import { CharterRoom } from "./CharterRoom.js";
import { ChronicleRoom } from "./ChronicleRoom.js";

export type RoomKey = "table" | "forge" | "charter" | "chronicle";

const ROOM_ORDER: RoomKey[] = ["table", "forge", "charter", "chronicle"];
const ROOM_NAMES: Record<RoomKey, string> = {
  table: "the Table",
  forge: "the Forge",
  charter: "the Charter Room",
  chronicle: "the Chronicle",
};
/** SH1 pose per room — the still behind the seated page. */
export const ROOM_POSES: Record<RoomKey, string> = {
  table: "bench.stage",
  forge: "bench.forge",
  charter: "bench.charter",
  chronicle: "bench.chronicle",
};

interface TauriInvoke {
  core: { invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> };
}
const tauri = (): TauriInvoke | undefined =>
  (window as unknown as { __TAURI__?: TauriInvoke }).__TAURI__;

export function Study({ opened, initialRoom, announce, reducedMotion, onRoomChanged, onLeave }: {
  opened: OpenedStudio;
  initialRoom: RoomKey;
  announce(text: string): void;
  reducedMotion: boolean;
  /** The vanilla shell swaps the backdrop still (world law stays out of React). */
  onRoomChanged(room: RoomKey): void;
  onLeave(): void; // back to the Codex desk
}) {
  const { vault } = opened;
  const [room, setRoom] = useState<RoomKey>(initialRoom);
  const [drift, setDrift] = useState<"fwd" | "back" | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // One open session per sitting: reuse the current one or open fresh.
  if (sessionIdRef.current === null) {
    const current = vault.session.current();
    if (current !== null) {
      sessionIdRef.current = current;
    } else {
      const r = vault.session.open({ actor: "owner" });
      sessionIdRef.current = r.ok ? (r.value.sessionId ?? null) : null;
    }
  }
  const sessionId = sessionIdRef.current ?? "";

  const go = useCallback((to: RoomKey) => {
    if (to === room) return;
    const dir = ROOM_ORDER.indexOf(to) > ROOM_ORDER.indexOf(room) ? "fwd" : "back";
    setDrift(dir);
    setRoom(to);
    onRoomChanged(to);
    announce(`${ROOM_NAMES[to]}. Seated.`);
    // SH1 §2.8 — fire-and-forget transit row; the shell never waits on it.
    tauri()?.core.invoke("log_transit", {
      routeKey: `study:${room}->${to}`, tier: 3, plannedMs: 240, actualMs: 240,
      skipped: false, skippedAtMs: null, ttfiMs: 0,
      degradeClass: "drift-cut", fallbackUsed: false, fallbackReason: null,
    }).catch(() => {});
    window.setTimeout(() => setDrift(null), reducedMotion ? 0 : 240);
  }, [room, announce, onRoomChanged, reducedMotion]);

  // The palette is sovereign: it opens on ⌘K/Ctrl+K from any surface, instantly.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape" && paletteOpen) setPaletteOpen(false);
    };
    addEventListener("keydown", onKey, { capture: true });
    return () => removeEventListener("keydown", onKey, { capture: true } as EventListenerOptions);
  }, [paletteOpen]);

  const commands: PaletteCommand[] = useMemo(() => [
    ...ROOM_ORDER.map((r) => ({
      id: `go:${r}`,
      label: ROOM_NAMES[r],
      hint: r === room ? "you are here" : "go",
      run: () => go(r),
    })),
    { id: "go:codex", label: "the Codex", hint: "the desk", run: onLeave },
  ], [room, go, onLeave]);

  const props = { vault, sessionId, announce, reducedMotion };

  return (
    <div className={`st-study${drift !== null ? ` st-drift-${drift}` : ""}${reducedMotion ? " st-reduced" : ""}`}>
      <div className="st-room" key={room}>
        {room === "table" ? <TableRoom {...props} /> : null}
        {room === "forge" ? <ForgeRoom {...props} /> : null}
        {room === "charter" ? <CharterRoom {...props} /> : null}
        {room === "chronicle" ? <ChronicleRoom {...props} /> : null}
      </div>
      <nav className="st-doors" aria-label="Rooms">
        {ROOM_ORDER.map((r) => (
          <button
            key={r}
            type="button"
            className={`st-door${r === room ? " st-here" : ""}`}
            aria-current={r === room ? "page" : undefined}
            onClick={() => go(r)}
          >
            {ROOM_NAMES[r].replace(/^the /, "")}
          </button>
        ))}
        <span className="st-doors-rule" aria-hidden="true" />
        <button type="button" className="st-door" onClick={onLeave}>desk</button>
        <span className="st-doors-hint" aria-hidden="true">⌘K</span>
      </nav>
      <Palette commands={commands} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
