// The Table stance — SPEC-002's two sealed spreads over the live vault. The shell
// binds gestures to affordances (the composer decided everything else): damage and
// healing are inscriptions, the quill writes ash, rests are held ceremonies, dice
// land in the log, the earned wheel turns only where the disposition said so.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Vault, EntryView } from "@ash-archive/core";
import { EntryQuery } from "@ash-archive/core";
import {
  CODEX_TABLE_DM, CODEX_TABLE_PLAYER, ComposerRuntime,
  type Element, type Folio, type Ribbon, type TurnDirective, type VerbAffordance,
} from "@ash-archive/composer";
import { FolioSpread } from "@ash-archive/ledger-ui";

type Side = "player" | "dm";

function beingActorMap(vault: Vault): Record<string, string> {
  const r = vault.archive.query(EntryQuery.kind("being"));
  const map: Record<string, string> = {};
  if (r.ok) {
    for (const e of r.value) {
      const body = e.body as Record<string, unknown> | null;
      const player = body !== null && typeof body["player"] === "string" ? (body["player"] as string) : "owner";
      map[e.id] = player;
    }
  }
  return map;
}

export function TableRoom({ vault, sessionId, announce, reducedMotion }: {
  vault: Vault;
  sessionId: string;
  announce(text: string): void;
  reducedMotion: boolean;
}) {
  const [side, setSide] = useState<Side>("dm");
  const [tick, setTick] = useState(0); // re-render pulse from the runtime
  const [directive, setDirective] = useState<TurnDirective | undefined>(undefined);
  const [active, setActive] = useState<string>(side === "dm" ? "scene" : "vitals");
  const runtimeRef = useRef<ComposerRuntime | null>(null);

  const profile = side === "dm" ? CODEX_TABLE_DM : CODEX_TABLE_PLAYER;
  const perspective = "owner"; // the seated hand; player-side views redact upstream

  useEffect(() => {
    const beingToActor = beingActorMap(vault);
    const rt = new ComposerRuntime(vault, profile, {
      graph: vault.archive,
      riteSet: null, // rules-blind until @ash-archive/rites-5e registers (§12 row 1)
      beingToActor,
      sessionId,
    });
    rt.mount(profile.folios.map((f) => f.key), {
      steering: { autoturn: {}, margins: { "1": null, "2": null } },
      ribbonState: { dismissed: [] },
      perspective,
      reducedMotion,
      plainPage: false,
      tableLight: false,
    });
    rt.onDelta((_folio, _next, turn) => {
      setTick((t) => t + 1);
      if (turn !== undefined) setDirective(turn);
    });
    runtimeRef.current = rt;
    setActive(profile.folios[0]!.key);
    setTick((t) => t + 1);
    return () => { rt.dispose(); runtimeRef.current = null; };
  }, [vault, sessionId, side, profile, reducedMotion]);

  const folios: Folio[] = useMemo(() => {
    void tick;
    const rt = runtimeRef.current;
    if (rt === null) return [];
    try {
      return profile.folios.map((f) => rt.current(f.key));
    } catch {
      return [];
    }
  }, [tick, profile]);

  const append = useCallback((type: string, payload: Record<string, unknown>) => {
    const r = vault.ash.append(type as never, payload as never, { actor: "owner", sessionId });
    if (!r.ok) announce(`The page refused: ${r.error.message}`);
    runtimeRef.current?.noteGraphChanged; // graph unchanged; folds recompose via subscription
    return r.ok;
  }, [vault, sessionId, announce]);

  const onVerb = useCallback((el: Element, affordance: VerbAffordance) => {
    // Element ids carry the gesture payload after '#': `${id}#${detail}`.
    const [id, detail] = el.id.includes("#") ? [el.id.slice(0, el.id.indexOf("#")), el.id.slice(el.id.indexOf("#") + 1)] : [el.id, ""];
    if (affordance.verb === "inscribe") {
      if (el.kind === "damage-heal" && detail !== "") {
        const [mode, n] = detail.split(":");
        const amount = Number(n);
        if (mode === "damage") append("damage.taken", { beingId: el.beingId, amount });
        else append("healing.applied", { beingId: el.beingId, amount });
        return;
      }
      if (el.kind === "quill" && detail !== "") {
        if (append("inscription.added", { text: detail })) announce("Inscribed.");
        return;
      }
      if (el.kind === "dice") {
        const results = [1 + Math.floor(Math.random() * 20)];
        append("roll.made", { notation: "d20", results, total: results[0] });
        announce(`Rolled ${results[0]}.`);
        return;
      }
      if (el.kind === "quick-dc" && detail !== "") {
        append("ruling.made", { text: `DC ${detail}` });
        return;
      }
      if (el.kind === "resolve") {
        append("ruling.made", { text: "resolved as rolled" });
        return;
      }
    }
    if (affordance.verb === "bind" && el.kind === "rest" && (detail === "short" || detail === "long")) {
      append("rest.taken", { beingId: el.beingId, kind: detail });
      announce(detail === "long" ? "A long rest. The fire banks low." : "A short rest.");
      return;
    }
    if (affordance.verb === "kindle") {
      if (el.kind === "hand-card") {
        append("action.spent", { beingId: firstBeing(vault) ?? "", slot: "action", ref: affordance.entryId });
        return;
      }
      append("entry.kindled", { entryId: affordance.entryId });
      return;
    }
    void id;
  }, [append, announce, vault]);

  const onRibbon = useCallback((ribbon: Ribbon) => {
    if (ribbon.kind === "reaction") {
      const being = firstBeing(vault);
      if (being !== null) {
        append("reaction.taken", { beingId: being, kind: ribbon.interruptKind, triggerEvent: ribbon.triggerEvent });
        announce(`Reaction: ${ribbon.interruptKind}.`);
      }
    }
  }, [append, announce, vault]);

  const onConsent = useCallback((eventType: string) => {
    append("autoturn.granted", { eventType });
    announce("The book will turn itself for that, now.");
  }, [append, announce]);

  const onNavigate = useCallback((key: string, manual: boolean) => {
    setActive(key);
    if (manual && directive !== undefined) {
      // A manual turn revokes consent for the scene (C-6); state, not a hidden flag.
      if (directive.kind === "auto") {
        append("autoturn.revoked", { eventType: directive.eventType, scope: "scene" });
      }
      setDirective(undefined);
    }
  }, [directive, append]);

  if (folios.length === 0) {
    return (
      <div className="st-empty">
        <p className="st-empty-title"><i>the</i> TABLE</p>
        <p>No session is warm yet. The Table composes itself from play — open the Forge to author the world it will draw on.</p>
      </div>
    );
  }

  return (
    <div className="st-table">
      <div className="st-side-toggle" role="tablist" aria-label="Which side of the screen">
        <button type="button" role="tab" aria-selected={side === "dm"} className={side === "dm" ? "st-on" : ""} onClick={() => setSide("dm")}>DM side</button>
        <button type="button" role="tab" aria-selected={side === "player"} className={side === "player" ? "st-on" : ""} onClick={() => setSide("player")}>player side</button>
      </div>
      <FolioSpread
        folios={folios}
        activeKey={active}
        onNavigate={onNavigate}
        onVerb={onVerb}
        onRibbon={onRibbon}
        {...(directive !== undefined ? { directive } : {})}
        resolveRole={(role) => profile.roles[role]}
        onConsent={onConsent}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

function firstBeing(vault: Vault): string | null {
  const r = vault.archive.query(EntryQuery.kind("being").orderBy("createdAt", "asc").limit(1));
  return r.ok && r.value.length > 0 ? (r.value[0] as EntryView).id : null;
}
