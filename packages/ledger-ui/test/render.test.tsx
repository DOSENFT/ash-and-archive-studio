// The render contract: every variant of the closed Element union renders; the
// A11yContract reaches the DOM; provenance/status render as ink behavior;
// pencil renders margin-only with the ° mark; the runner is the region label.
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Element, Folio } from "@ash-archive/composer";
import { ElementView, FolioView } from "../src/index.js";

const a11y = (label: string) => ({ role: "status", label, provenanceAnnouncement: "Ink, human-authored" });
const base = { provenance: "ink" as const, live: true, affords: [], a11y: a11y("x") };

const ELEMENTS: Element[] = [
  { ...base, kind: "hp", id: "hp:1", current: 42, max: 64, temp: 3, distressMarks: 1 },
  { ...base, kind: "stats", id: "stats:1", ac: 17, speed: 30 },
  { ...base, kind: "economy", id: "economy:1", action: "available", bonus: "spent", reaction: "available", movement: "available" },
  { ...base, kind: "conditions", id: "conditions:1", count: 2, conditions: [{ id: "c1", name: "Stunned", severity: 5 }, { id: "c2", name: "Prone", severity: 2 }] },
  { ...base, kind: "damage-heal", id: "dh:1", beingId: "b1", affords: [{ verb: "inscribe" }] },
  { ...base, kind: "death-save", id: "ds:1", beingId: "b1", success: 2, failure: 1 },
  { ...base, kind: "hand-card", id: "hc:1", name: "Firebolt", rank: 1, castTime: "action", legality: "legal", riteRef: "r1", previewLine: "zap", readied: false, foldedIntoStack: false, affords: [{ verb: "unfold", target: "inline-detail" }] },
  { ...base, kind: "cast-stack", id: "cs:1", spentCount: 2 },
  { ...base, kind: "stage-mark", id: "sm:1", beingId: "b1", name: "Serena", initiative: 18, active: true, hp: { cur: 40, max: 64 }, conditions: [{ id: "c1", severity: 3 }] },
  { ...base, kind: "cohort-mark", id: "cm:1", cohortId: "co1", name: "Goblins", members: 8, alive: 5, statblockRef: null, active: false },
  { ...base, kind: "clock", id: "ck:1", entryId: "e1", name: "Doom", step: 3, advanceHint: "when provoked" },
  { ...base, kind: "scene-frame", id: "sf:1", frame: "Rain hammers the shutters", place: "The Salt Inn" },
  { ...base, kind: "resource-strip", id: "rs:1", key: "slots:1", label: "Level 1", remaining: 2, max: 4, stripKind: "slots" },
  { ...base, kind: "rest", id: "rest:1", beingId: "b1", affords: [{ verb: "bind" }] },
  { ...base, kind: "offer-line", id: "ol:1", role: "offer", text: "The door is unlocked" },
  { ...base, kind: "toy-card", id: "tc:1", entryId: "e1", name: "Duke Vane", goal: "hold the March", method: "debt", activeProblem: "heirless", lever: "his ledger", hooksFolded: true },
  { ...base, kind: "truth-card", id: "tr:1", entryId: "e2", name: "The Forged Seal", lever: "the wax is wrong", revealed: false, vectorsCovered: 3 },
  { ...base, kind: "dice", id: "d:1", notation: "d20", advantage: "adv", lastResult: 17, affords: [{ verb: "inscribe" }] },
  { ...base, kind: "quick-dc", id: "dc:1", dc: 15, affords: [{ verb: "inscribe" }] },
  { ...base, kind: "resolve", id: "res:1", affords: [{ verb: "inscribe" }] },
  { ...base, kind: "advance-prompt", id: "ap:1", clockEntryId: "e1", condition: "the bell rings" },
  { ...base, kind: "if-then", id: "it:1", rows: [{ ifText: "they run", thenEntryId: "e3", thenName: "The Chase" }], affords: [{ verb: "kindle", entryId: "e3" }] },
  { ...base, kind: "world-readout", id: "wr:1", label: "Scarcity", value: "grain is dear" },
  { ...base, kind: "pacing", id: "p:1", observation: "3 scenes framed" },
  { ...base, kind: "quill", id: "q:1", affords: [{ verb: "inscribe" }] },
  { ...base, kind: "more", id: "m:1", count: 3, ids: ["a", "b", "c"], affords: [{ verb: "unfold", target: "inline-detail" }] },
  { ...base, kind: "chapter", id: "chap:1", title: "The Long Winter", prose: "Snow came early that year." },
  { ...base, kind: "growth-rung", id: "gr:1", rung: "Confident", attained: true },
];

describe("the Element roster (closed union, exhaustive)", () => {
  it("every variant renders with its a11y label and data-element mark", () => {
    for (const el of ELEMENTS) {
      const html = renderToStaticMarkup(<ElementView el={el} onVerb={() => {}} />);
      expect(html, el.kind).toContain(`data-element="${el.kind}"`);
      expect(html, el.kind).toContain(`aria-label`);
    }
  });

  it("ash provenance renders the ▵ mark; ink does not", () => {
    const ash = { ...ELEMENTS[0]!, provenance: "ash" as const };
    expect(renderToStaticMarkup(<ElementView el={ash} onVerb={() => {}} />)).toContain("▵");
    expect(renderToStaticMarkup(<ElementView el={ELEMENTS[0]!} onVerb={() => {}} />)).not.toContain("▵");
  });

  it("provisional status renders as the dotted-underline class", () => {
    const prov = { ...ELEMENTS[16]!, a11y: { ...a11y("t"), status: "provisional" as const } };
    expect(renderToStaticMarkup(<ElementView el={prov} onVerb={() => {}} />)).toContain("lf-provisional");
  });

  it("the HP numeral carries emphasis ink via its class; honest absence renders the em-dash", () => {
    const bare = { ...ELEMENTS[0]!, kind: "hp" as const, max: null, current: 0, temp: 0, distressMarks: 0 };
    const html = renderToStaticMarkup(<ElementView el={bare} onVerb={() => {}} />);
    expect(html).toContain("lf-hp-numeral");
    expect(html).toContain("of —");
  });
});

describe("FolioView", () => {
  const folio: Folio = {
    key: "vitals", stance: "table", profile: "codex.table.player",
    runner: "· · the · vitals · ·",
    index: { ordinal: 2, total: 4 },
    pinned: [ELEMENTS[0]!], body: [ELEMENTS[3]!],
    margin: [
      { kind: "whisper", provenance: "ink", text: "your turn", a11y: a11y("whisper") },
      { kind: "pencil", provenance: "pencil", text: "the Duke would notice", proposalId: "p1", a11y: a11y("pencil") },
    ],
    ribbons: [{ kind: "reaction", triggerEvent: "e1", interruptKind: "opportunity-attack", affordance: { verb: "kindle", interrupt: "oa" }, a11y: a11y("ribbon") }],
    rubricated: true,
    budgetReport: { liveCount: 1, liveBudget: 7, folded: [], pinnedCount: 1, marginUsed: 2 },
    provenanceSeal: "ink",
    directive: { kind: "none" },
    a11yLiveRegion: "The book turned to the Vitals folio, 2 of 4.",
  };

  it("renders the runner as the region label, roman pagination, ribbons, and the polite live region", () => {
    const html = renderToStaticMarkup(<FolioView folio={folio} onVerb={() => {}} />);
    expect(html).toContain('role="region"');
    expect(html).toContain("aria-labelledby");
    expect(html).toContain("II OF IV");
    expect(html).toContain("lf-ribbon-reaction");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("The book turned to the Vitals folio");
  });

  it("pencil renders in the margin with the ° mark; the body never carries pencil", () => {
    const html = renderToStaticMarkup(<FolioView folio={folio} onVerb={() => {}} />);
    expect(html).toContain("lf-margin-pencil");
    expect(html).toContain("°");
  });

  it("the rubricated page carries the cast custom property", () => {
    const withRubric: Folio = {
      ...folio,
      pinned: [{ ...ELEMENTS[0]!, rubric: { severity: 4, cssVar: "--severity-4" } }],
    };
    const html = renderToStaticMarkup(<FolioView folio={withRubric} onVerb={() => {}} />);
    expect(html).toContain("lf-folio-rubricated");
    expect(html).toContain("--severity-4");
  });
});
