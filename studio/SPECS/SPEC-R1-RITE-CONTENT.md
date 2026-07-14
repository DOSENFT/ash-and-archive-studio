# SPEC-R1 — 5E RITE-SET CONTENT: SCHEMA, PIPELINE, ACCEPTANCE
### Canonical engineering specification for `@ash-archive/rites-5e` content — the schema, pipeline, and acceptance bar for authoring 5e rules content that plugs into SPEC-001 §5.7
*v1.1 · Status: **SEALED CANON — patched per adversarial verification 2026-07-12 (all defects resolved)** · Substrate: SPEC-001 v1.1*

> **Scope of this document.** This specifies the *machine content is poured into and validated by* — the authoring schemas, the compile/validate/package/register pipeline, and the golden-test acceptance bar for the 5e Rite set. It is subordinate to SPEC-001 v1.1 (`studio/SPECS/SPEC-001-FOUNDATION.md`), which is law for the Foundation. Where SPEC-001 speaks, it governs; where this document extends it, it does so only through SPEC-001's sanctioned extension mechanisms (§14). **It does NOT author SRD content** (spells, monsters). It specifies the shape and the acceptance machine for that content.
>
> **Naming.** SPEC-001 §1.2 and §5.7 name the shipping package `@ash-archive/rites-5e` and the registered RiteSet id `aa.rites.5e`. This document uses both consistently. "The composer" = `@ash-archive/composer` (SPEC-001 §1.2, SPEC-002). "The Table" = Codex GENESIS `04-THE-TABLE.md`.

---

## 0. RELATIONSHIP TO SPEC-001 (the contract this document implements)

SPEC-001 §5.7 fixes the RiteSet interface exactly:

```ts
interface RiteSet {
  id: string; version: string;                       // 'aa.rites.5e' semver
  schemas: Record<string, ZodSchema>;                // rite body extensions (spell, feature, statblock)
  legality(q: LegalityQuery, graph: ReadonlyArchive, fold: FoldState<'combat'>): LegalityAnswer;   // pure
  derive(d: DerivationQuery, graph): DerivedValue;                                                  // pure
  interrupts(e: AshEvent, graph, fold): InterruptOffer[];                                           // pure
  conditions: ConditionTable;                        // id, name, severity 1..5, mechanical text
  compositionHints(stance, fold, graph): CompositionHint[];                                         // ranking
}
vault.rites.register(set: RiteSet): Result<void>;    // pure-function contract smoke-tested at registration
```

This document adds **nothing** to that interface. It specifies (a) the `schemas` map contents, (b) the closed data vocabulary that the five pure functions interpret, (c) the pipeline that produces a valid `RiteSet` object, and (d) the tests that prove a `RiteSet` correct. The five functions are **fixed, versioned TypeScript in `@ash-archive/rites-5e`** (an *interpreter*); authored content is **data** those functions read. That separation is the spine of the whole design (§4) and the reason SPEC-001's purity invariant (I-8, §5.6, §5.7) survives content authoring.

**Load-bearing SPEC-001 anchors** (cited inline throughout): §2.2 (`rite` kind, `bodySchemaVersion`, UNKNOWN discipline, `body.ext[<ns>]` namespacing), §3.2 (combat/interrupt/condition event vocabulary — the events the rules must drive and read), §5.6 (`FoldState<'combat'>`, pure reducers, determinism CI), §5.7 (RiteSet, homebrew rule), §11 v1.1 (error taxonomy `Result`/`AAError`; **E-17xx ceded to registered Rite sets**), §14 (extension mechanisms), §15 v1.1 (**paint-path performance budgets — law, adopted verbatim in §7.2**). Table consumption anchors from Codex GENESIS `04-THE-TABLE.md` (§II composed hand, interrupt/reaction ribbon, concentration, Cohorts, statblock unfold) and severity rendering from `03-DESIGN-LANGUAGE.md` §II (five-stop ramp). Composer seams: SPEC-002 §9.2 (perspective filtering of interrupt offers), §11.4 (budget consumption argument), §12 (composer-boundary catch as backstop).

---

## 1. ARCHITECTURE OVERVIEW — WHERE CONTENT LIVES vs WHERE LOGIC LIVES

```
 AUTHORED CONTENT (data)                    RITE SET (fixed pure code)              FOUNDATION (SPEC-001)
 ─────────────────────────                  ──────────────────────────             ─────────────────────
 source/spells/*.rite.yaml   ── compile ──▶ aa.rites.5e/schemas   ── register ──▶  vault.rites.register()
 source/features/*.rite.yaml     (author     legality() interpreter   (load-time    validates purity +
 source/conditions/*.rite.yaml    time)      derive() interpreter      smoke test)   schemas, mounts set
 source/statblocks/*.rite.yaml               interrupts() interpreter
 source/resources/*.rite.yaml                conditions ConditionTable            ── consumed by ──▶
 source/rests/*.rite.yaml                    compositionHints() ranker             composer (80ms folio),
 source/damage-types/*.rite.yaml             ── all PURE (§5.6/5.7) ──             Table folios, Binding
        │                                                                          contradiction (§7.4)
        └── each compiles to a `rite`-kind Entry body (SPEC-001 §2.2)
            + a namespaced body.ext['aa.rites.5e'].<kind> block (SPEC-001 §14.3)
```

**Two artifacts per authored piece** (both required by SPEC-001):

1. A **`rite`-kind Entry** (SPEC-001 §2.2 — `rite` is one of the eleven frozen kinds). Its `body` carries the human/canon-facing fields (name, prose, canon status, UNKNOWN discipline fields if unknown). This is what the Archive stores, exports (SPEC-001 §9), binds (§6), and runs contradiction detection over (§7.4).
2. A **namespaced body extension** `body.ext['aa.rites.5e'].<contentKind>` (SPEC-001 §14.3: "a Rite set may *extend* a kind's body schema under its own namespace key … core validates namespaced extensions against the registrant's schema; core never reads inside them"). This carries the **machine-executable data** the RiteSet interpreter reads. **Core never reads inside it** — only `aa.rites.5e` does. This is the exact seam SPEC-001 §14.3 provides, used verbatim.

*Confidence: High.* Both artifacts are named directly by SPEC-001 §2.2 and §14.3; nothing invented.

---

## 2. THE CONTENT SCHEMAS (Zod-shaped, versioned via `bodySchemaVersion`)

All schemas below are the contents of the `RiteSet.schemas` map (SPEC-001 §5.7). Each is a Zod schema; JSON-Schema mirrors are build-generated for non-TS tooling (mirrors SPEC-001 §2.2's "JSON-Schema mirrors generated at build"). Every schema carries a `bodySchemaVersion: number` — the versioning axis SPEC-001 §2.2 mandates (`bodySchemaVersion`, monotonic per schema family per SPEC-001 §2.1 `SchemaVersion`). **Every enum below is closed**; opening one is a schema version bump (§5.4) and, for behavioral atoms, an interpreter code change (§4).

### 2.0 Shared primitives (closed vocabularies)

```ts
const zSchemaVersion = z.number().int().nonnegative();
const zEntryRef = z.string().length(26);              // ULID → an EntryId (SPEC-001 §2.1)
const zSlug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

// Closed enums — opening any is a version bump (§5.4).
const ActionCost = z.enum(['action','bonus','reaction','movement','free','legendary','lair','special']);
//   'action'|'bonus'|'reaction'|'movement' mirror SPEC-001 §3.2 action.spent.slot EXACTLY.
//   'legendary'|'lair' mirror 04-THE-TABLE §II ("Legendary and lair actions render as stage-level marks").
const CastTimeUnit = z.enum(['action','bonus','reaction','minute','hour','ritual']);
const AbilityId    = z.enum(['str','dex','con','int','wis','cha']);
const DamageTypeId = zSlug;                            // FK into the DamageType registry (§2.8); NOT a free enum
const SchoolId     = z.enum(['abjuration','conjuration','divination','enchantment',
                             'evocation','illusion','necromancy','transmutation']);
const RestKind     = z.enum(['short','long']);         // mirrors SPEC-001 §3.2 rest.taken.kind EXACTLY
const SlotFamily   = z.enum(['spell','pact','psionic']);
const Severity     = z.number().int().min(1).max(5);   // SPEC-001 §5.7 ConditionTable severity 1..5
const SrdScope     = z.enum(['srd-5.1','homebrew','provisional-homebrew']);  // §5.6 licensing boundary
```

**Purity guard on the type level:** no schema field may hold a function, a JS closure, or free-form code. Behavioral conditionality is expressed *only* through the closed **Effect Atom** and **Predicate** vocabularies (§4). This is the schema-level enforcement of SPEC-001 §5.6/§5.7 purity (see §4 for the mechanism and the ADR-002 that chooses it).

### 2.1 `Spell`

```ts
const zSpell = z.object({
  bodySchemaVersion: zSchemaVersion,
  contentKind: z.literal('spell'),
  slug: zSlug, name: z.string().min(1),
  level: z.number().int().min(0).max(9),              // 0 = cantrip
  school: SchoolId,
  castTime: z.object({ unit: CastTimeUnit, amount: z.number().int().positive().default(1) }),
  ritual: z.boolean().default(false),
  range: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('self') }),
    z.object({ kind: z.literal('touch') }),
    z.object({ kind: z.literal('ranged'), feet: z.number().int().nonnegative() }),
    z.object({ kind: z.literal('sight') }), z.object({ kind: z.literal('unlimited') }),
  ]),
  components: z.object({
    verbal: z.boolean(), somatic: z.boolean(),
    material: z.union([z.literal(false), z.object({
      text: z.string(), consumed: z.boolean().default(false),
      costGp: z.number().nonnegative().nullable().default(null),
    })]),
  }),
  duration: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('instantaneous') }),
    z.object({ kind: z.literal('timed'), unit: z.enum(['round','minute','hour','day']),
               amount: z.number().int().positive(), concentration: z.boolean() }),
    z.object({ kind: z.literal('untilDispelled'), concentration: z.boolean() }),
    z.object({ kind: z.literal('special') }),
  ]),
  targeting: zTargeting,                               // §2.10 — SEALED
  // ── MACHINE-EXECUTABLE effect graph (interpreted by legality/derive/interrupts) ──
  onCast: z.array(zEffectAtom),                        // §4.2 — closed atom vocabulary
  scaling: z.array(zScalingRule).default([]),          // higher-slot / cantrip-level scaling, §4.4
  offersReactionInterrupts: z.array(zInterruptOffer).default([]),   // §2.10, §3 hook binding, §4.5
  legalityGuards: z.array(zPredicate).default([]),     // extra guards beyond the standard slot/conc/components checks
  provokes: z.array(zTriggerTag).default([]),          // events THIS spell emits that others may interrupt
  prose: z.string(),                                   // full rules text (human-facing; rendered on unfold, 04 §II)
  srdScope: SrdScope,                                  // §5.6
}).strict();
```

Field→behavior binding is specified worked-example-style in §3. `.strict()` (reject unknown keys) is mandatory on every content schema — an authored typo becomes `E-1001 BodySchemaMismatch` (SPEC-001 §11), never a silent no-op.

### 2.2 `Feature` / `Trait`

Class features, subclass features, racial traits, feats, monster traits — one schema, discriminated by `source`.

```ts
const zFeature = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('feature'),
  slug: zSlug, name: z.string().min(1),
  source: z.enum(['class','subclass','race','feat','background','monster','item']),
  activation: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('passive') }),                       // always-on; feeds derive() only
    z.object({ kind: z.literal('active'), cost: ActionCost }),      // shows in the composed hand (04 §II)
    z.object({ kind: z.literal('reaction'), trigger: zTriggerTag }),// feeds interrupts() (04 §II ribbon)
    z.object({ kind: z.literal('triggered'), trigger: zTriggerTag })// auto-surfaced, e.g. concentration save
  ]),
  uses: z.union([z.literal('atWill'),
    z.object({ resourceKey: zSlug, amount: z.number().int().positive() })]),  // FK into Resource (§2.5)
  effects: z.array(zEffectAtom).default([]),
  modifiers: z.array(zModifier).default([]),           // passive derive() contributions, §4.3
  legalityGuards: z.array(zPredicate).default([]),
  prose: z.string(), srdScope: SrdScope,
}).strict();
```

### 2.3 `Action`

Generic Table actions (Attack, Dash, Dodge, Disengage, Grapple, Shove, Help, Ready, Hide, Search, Use-Object) — the atoms of `action.spent` (SPEC-001 §3.2). Weapons are `Action` instances with an `attack` effect.

```ts
const zAction = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('action'),
  slug: zSlug, name: z.string().min(1),
  cost: ActionCost,                                    // → action.spent.slot (SPEC-001 §3.2)
  category: z.enum(['attack','move','defend','utility','social','object']),
  effects: z.array(zEffectAtom).default([]),
  legalityGuards: z.array(zPredicate).default([]),
  provokes: z.array(zTriggerTag).default([]),          // e.g. 'leaves-reach' → provokes opportunity attacks
  prose: z.string(), srdScope: SrdScope,
}).strict();
```

### 2.4 `Condition`

Drives SPEC-001 §3.2 `condition.applied/saved/removed` and the ConditionTable of §5.7; severity feeds the five-stop rubrication ramp (`03-DESIGN-LANGUAGE.md` §II).

```ts
const zCondition = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('condition'),
  slug: zSlug, name: z.string().min(1),
  severity: Severity,                                  // 1..5 → OKLCH stop (03 §II: hue 50→30, L 0.65→0.40)
  modifiers: z.array(zModifier).default([]),           // what the condition changes: adv/dis, speed 0, etc.
  suppressesActions: z.array(z.enum(['action','bonus','reaction','movement'])).default([]),
                                                        // e.g. Incapacitated suppresses action+bonus+reaction
  incapacitates: z.boolean().default(false),           // feeds "your turn" definition (04 §I: "able to act")
  endsOn: z.array(zSaveSpec).default([]),              // save-ends conditions → condition.saved (§3.2)
  rubricationText: z.string(),                         // the exact header rewrite (03 §IX rubrication)
  stacksWith: z.enum(['no','severityMax','count']).default('no'),
  prose: z.string(), srdScope: SrdScope,
}).strict();
```

The **canonical condition→severity map** ships as data here (satisfying `03-DESIGN-LANGUAGE.md` §II: "The canonical condition→severity mapping … ships as a table in the Rite set, is … user-editable in the Charter Room"). User overrides are homebrew Condition entries (§2.11).

### 2.5 `Resource` / `Pool`

Spell slots, pact slots, Channel Divinity, ki, rage, Lay-on-Hands pool, sorcery points, superiority dice, legendary resistances. Drives SPEC-001 §3.2 `slot.spent/restored`, `resource.spent`, and Folio IV (04 §II RESOURCES).

```ts
const zResource = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('resource'),
  slug: zSlug, name: z.string().min(1),
  key: zSlug,                                          // → resource.spent.resourceKey / slot.spent.level (§3.2)
  family: z.enum(['slot','pool','charges','dice','points']),
  slotFamily: SlotFamily.nullable().default(null),    // set iff family==='slot'
  max: zResourceExpr,                                  // §4.6 — a closed arithmetic expr over derive() inputs
  recharge: z.array(z.object({
    on: z.enum(['shortRest','longRest','dawn','initiative','turnStart','never']),  // rest → SPEC-001 §3.2 rest.taken
    //   ⚠ 'dawn' has NO backing event in SPEC-001 §3.2 — see GAP-E. Until resolved, 'dawn' content
    //   fails validation gate 2 (§5.2) with E-1704-class guidance; it is schema-reserved, not live.
    amount: z.union([z.literal('full'), zResourceExpr]),
  })).default([]),
  display: z.enum(['pips','measure','dice','number']).default('pips'),  // 04 §II ("gold pips","poured measure")
  srdScope: SrdScope,
}).strict();
```

### 2.6 `Statblock` / `Cohort`

The unfold-in-place statblock (04 §II STAGE: "unfolds the full Rite-set statblock in place — AC, HP, saves, actions"). A `Cohort` is a statblock with `cohort` set (04 §II: "N identical creatures stage as one hexagon … a Cohort *is* one Being").

```ts
const zStatblock = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('statblock'),
  slug: zSlug, name: z.string().min(1),
  size: z.enum(['tiny','small','medium','large','huge','gargantuan']),
  type: z.string(), cr: z.number().nonnegative(),
  ac: z.number().int(), hp: z.object({ average: z.number().int(), formula: zDiceExpr }),  // §4.6
  speeds: z.record(z.enum(['walk','fly','swim','climb','burrow']), z.number().int()),
  abilities: z.record(AbilityId, z.number().int()),
  saves: z.record(AbilityId, z.number().int()).partial().default({}),
  skills: z.record(zSlug, z.number().int()).default({}),
  resistances: z.array(DamageTypeId).default([]),
  immunities: z.array(DamageTypeId).default([]),
  vulnerabilities: z.array(DamageTypeId).default([]),
  conditionImmunities: z.array(zSlug).default([]),     // FK into Condition slugs (§2.4)
  senses: z.record(z.string(), z.number().int()).default({}),
  traits: z.array(zEntryRef).default([]),              // → Feature entries (source:'monster')
  actions: z.array(zEntryRef).default([]),             // → Action entries
  legendary: z.object({ count: z.number().int(), actions: z.array(zEntryRef) }).nullable().default(null),
  lair: z.object({ initiative: z.number().int(), actions: z.array(zEntryRef) }).nullable().default(null),
  cohort: z.object({ memberCount: z.number().int().positive(),
                     sharedInitiative: z.boolean().default(true) }).nullable().default(null),
  srdScope: SrdScope,
}).strict();
```

### 2.7 `Rest`

The rest mechanic itself (recovery rules), driving SPEC-001 §3.2 `rest.taken{kind:'short'|'long'}` and `slot.restored`/`resource.spent` restoration; a ceremony act at the Table (04 §II: "rest is a *ceremony act*, press-and-hold").

```ts
const zRest = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('rest'),
  slug: zSlug, kind: RestKind,                          // → rest.taken.kind (SPEC-001 §3.2)
  restores: z.array(z.object({
    what: z.enum(['hp','hitDice','slots','resource']),
    resourceKey: zSlug.nullable().default(null),        // set iff what==='resource'
    amount: z.union([z.literal('full'), zResourceExpr]),
  })),
  requiresHours: z.number().nonnegative(),
  interruptedIf: z.array(zPredicate).default([]),
  srdScope: SrdScope,
}).strict();
```

### 2.8 `DamageType`

The closed registry every `DamageTypeId` FK resolves against; drives `damage.taken.damageType` (SPEC-001 §3.2) and statblock resist/immune/vuln (§2.6).

```ts
const zDamageType = z.object({
  bodySchemaVersion: zSchemaVersion, contentKind: z.literal('damageType'),
  slug: zSlug, name: z.string().min(1),
  physical: z.boolean(),                                // bludgeoning/piercing/slashing = true
  srdScope: SrdScope,
}).strict();
```

### 2.9 Compiled derivations (the load-time cache)

Authored content is the *source of truth*; the compile step (§5.3) produces a **`Compiled` sidecar** — a denormalized, index-ready form the interpreter reads at paint-path speed (§7.2). It is a build artifact, never authored, never bound to canon, never exported as canon.

```ts
interface CompiledRiteIndex {
  riteSetId: 'aa.rites.5e'; riteSetVersion: string;    // semver of the content build
  spellsBySlug: Map<string, CompiledSpell>;            // effect atoms pre-parsed; guards pre-linearized
  triggerIndex: Map<TriggerTag, InterruptSource[]>;    // reverse index: event tag → who can react (§3.3)
  conditionTable: ConditionTable;                      // SPEC-001 §5.7 shape, severity-sorted
  damageTypes: Map<string, DamageType>;
  resourceDefs: Map<string, CompiledResource>;
  provenanceFlags: Map<string, 'valid'|'provisional-homebrew'>;  // §2.11 homebrew exclusion (§5.7)
  contentHash: string;                                 // sha256 over sorted source — golden-test & migration key
}
```

`triggerIndex` is the performance-critical derivation: `interrupts(e)` must not scan all content per event — it is what makes the **p99 ≤3ms per-delta budget SPEC-001 §15 v1.1 assigns to `interrupts()`** achievable (the budget row itself cites "via compiled trigger index — SPEC-R1"). It is built once at compile/register time. *Confidence: High* (directly serves SPEC-001 §15 v1.1 budgets + 04 §II reaction ribbon latency).

### 2.10 Sealed sub-schemas — `zTargeting`, `zSaveSpec`, `zInterruptOffer` (summary depth)

These three are **sealed here to summary depth** — the same grade as SPEC-002's Element union: the discriminants, fields, and types are law; only closed-enum *membership* (e.g. the area-shape slug registry) is deferred to the golden-content pass (**GAP-A**). Every field below is derived from this document's own §2/§3 usage — nothing new is introduced.

```ts
// zTargeting — who/what a piece may target. Derived from: zSpell.targeting, the 'targets-creature'
// provoke tag (§3.1), and zScalingRule addTargets{count} (§4.4).
const zTargeting = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('self') }),
  z.object({ kind: z.literal('creatures'),
             count: z.number().int().positive(),               // base target count; scaling may add (§4.4)
             restriction: zPredicate.nullable().default(null) }), // PEL guard, e.g. only-visible, only-willing
  z.object({ kind: z.literal('objects'),
             count: z.number().int().positive(),
             restriction: zPredicate.nullable().default(null) }),
  z.object({ kind: z.literal('area'),
             shape: zSlug,                                     // FK into a closed shape registry — membership GAP-A
             sizeFeet: z.number().int().positive(),
             origin: z.enum(['point','self']) }),
]); // each variant .strict()

// zSaveSpec — a saving-throw demand. Derived from: zCondition.endsOn (save-ends → condition.saved, §3.2)
// and the applyCondition atom's `save` field (§4.2); DC expression shape matches savingThrow.dcExpr.
const zSaveSpec = z.object({
  ability: AbilityId,
  dcExpr: zResourceExpr,                               // integer PEL — same surface as savingThrow.dcExpr (§4.2)
  at: z.enum(['immediate','turnStart','turnEnd']),     // when the save is offered; 'turnEnd' = classic save-ends
}).strict();

// zInterruptOffer — the AUTHORED declaration of a reaction/interrupt a piece offers. Derived from §3.1's
// Counterspell/Shield rows: a trigger tag, a cost, an optional PEL guard (Shield: attackTotal < ac+5),
// and the effect atoms that fire on acceptance.
const zInterruptOffer = z.object({
  trigger: zTriggerTag,                                // → triggerIndex key (§2.9, §3.3)
  cost: ActionCost.default('reaction'),
  guard: zPredicate.nullable().default(null),          // PEL; offer emitted only when the guard holds
  effects: z.array(zEffectAtom),
}).strict();
```

The *runtime* `InterruptOffer[]` returned by `interrupts()` (SPEC-001 §5.7) is the interpreter's projection of these authored declarations onto a concrete event: `{ beingId, riteRef, triggerEvent (keyed to e), cost }` — who may react, with what, keyed to the triggering event. `interrupts()` returns **all** offers for **every** eligible creature; perspective filtering is the composer's job (§3.2, M3; SPEC-002 §9.2).

`zModifier` is fully specified in §4.3; `zScalingRule` in §4.4; `zResourceExpr`/`zDiceExpr`/`zPredicate` (the PEL surface) in §4.7.

### 2.11 Homebrew-override rules

**Homebrew-override rule (SPEC-001 §5.7, verbatim binding):** a homebrew content piece is a `rite`-kind Entry whose `body.ext['aa.rites.5e'].<kind>` validates against `set.schemas`.

- **Valid homebrew** → `srdScope:'homebrew'`, participates fully in legality/derive/interrupts.
- **Invalid homebrew** → SPEC-001 §5.7: "storable as `provisional` but flagged and excluded from legality answers until repaired." Concretely: the Entry is stored with `canonStatus:'provisional'` (SPEC-001 §2.2), `srdScope:'provisional-homebrew'`, and `provenanceFlags[slug]='provisional-homebrew'` in the compiled index. `legality()`, `derive()`, `interrupts()`, `compositionHints()` **must skip** any content whose flag is `provisional-homebrew` (a single central guard, mirroring SPEC-001 §3.4's "fold framework skips struck events centrally"). It remains visible/editable at the Desk and re-validates on revision (SPEC-001 §5.3 `reviseDraft`). *Confidence: High.*

---

## 3. DATA → BEHAVIOR BINDING (the worked hook mapping — invention-proofing the Builder)

This is the section that prevents Builder invention: it binds **schema field → RiteSet function behavior → SPEC-001 event/fold** explicitly. Worked for a spell; the same table shape governs every content kind.

### 3.1 Worked example — *a concentration attack-roll spell with a Shield/Counterspell interaction*

Take an authored spell with: `level:1`, `components.somatic:true, verbal:true`, `duration.concentration:true`, `castTime.unit:'action'`, `onCast:[{atom:'attackRoll', ...},{atom:'applyDamage', damageType:'fire', ...}]`, `provokes:['spell-cast','targets-creature']`, `offersReactionInterrupts:[]`.

| Schema field(s) | RiteSet hook | What the hook does | SPEC-001 anchor |
|---|---|---|---|
| `level`, `castTime.unit:'action'` | `legality()` reads `fold:FoldState<'combat'>` action-economy for the caster | Emits `legal:false, reason:'action-spent'` if `action.spent{slot:'action'}` already seen this turn | §3.2 `action.spent`; §5.7 `legality(q,graph,fold)` |
| `level:1` + caster's slot resource (§2.5) | `legality()` reads `fold` slot state | `legal:false, reason:'no-slot'` if no level-≥1 slot remains (folded from `slot.spent`/`slot.restored`) | §3.2 `slot.spent`/`slot.restored`; §5.6 combat fold |
| `duration.concentration:true` | `legality()` reads `fold` concentration state | `legal:true, warning:'breaks-concentration'` if caster already has `concentration.started` unresolved — the composed hand flags it (04 §II "concentration conflicts flagged by rubrication") | §3.2 `concentration.started`/`broken`; 04 §II |
| `components.verbal/somatic/material` | `legality()` reads caster conditions from `fold` | Silenced ⇒ verbal illegal; grappled/restrained-hands ⇒ somatic illegal; missing costly material ⇒ illegal | §3.2 `condition.applied`; §2.4 Condition `suppressesActions`/`modifiers` |
| `onCast:[attackRoll,...]` + `provokes:['spell-cast']` | `interrupts(e:'action.spent'\|'roll.made', graph, fold)` | For **every** creature, looks up `triggerIndex['spell-cast']` → emits `InterruptOffer` for **Counterspell** (a reaction Feature §2.2 with `trigger:'spell-cast'`), keyed to the caster's cast event. All eligible offers are returned; the composer filters to `perspective` (M3; SPEC-002 §9.2) | §3.2 `reaction.offered`; §5.7 `interrupts()`; 04 §II ribbon |
| `onCast:[attackRoll{vs:'ac'}]` | `interrupts(e:'roll.made'{context:'attack'}, ...)` | Looks up `triggerIndex['targeted-by-attack']` → emits **Shield** offer for the target (reaction Feature, `trigger:'targeted-by-attack'`, guard `attackTotal < ac+5`) | §3.2 `reaction.offered`; 04 §II ("Shield … legality computed by the Rite set") |
| `onCast:[applyDamage{damageType:'fire'}]` | consumed by the **combat fold** (SPEC-001 §5.6), not the RiteSet | Author's atom is data; when the table resolves it, `damage.taken{damageType:'fire'}` is appended; fold applies resist/vuln from target statblock (§2.6) | §3.2 `damage.taken`; §5.6 |
| target is concentrating + `applyDamage` | `interrupts(e:'damage.taken', graph, fold)` | If target has `concentration.started` unresolved → emits a **concentration-save** triggered offer, DC computed by `derive()` (`max(10, amount/2)` — PEL floor division, §4.7) | §3.2 `concentration.check`; 04 §II ("Damage inscribed against a concentrating creature auto-surfaces the concentration save") |
| `scaling` (§4.4) | `derive(d:'spellEffect', graph)` | Pure computation of dice/targets at the slot level actually spent; no fold, no randomness | §5.7 `derive()`; I-8 determinism |
| `severity` on any Condition this spell applies | `compositionHints()` + ConditionTable | Ranks the spell "best-against-stage" (04 §II ranking) and drives rubrication color (03 §II severity ramp) | §5.7 `conditions`, `compositionHints`; 03 §II |

### 3.2 The five hooks — inputs, outputs, and the pure contract

| Hook | Reads (only) | Returns | Drives at the Table |
|---|---|---|---|
| `legality(q, graph, fold)` | the LegalityQuery, ReadonlyArchive (statblocks, features, resources), `FoldState<'combat'>` (action economy, slots, conditions, concentration) | `LegalityAnswer{ legal, reason?, warnings[], costPreview }` | Folio II composed hand: "only what is *currently legal and relevant*" (04 §II); legal-first ranking |
| `derive(d, graph)` | DerivationQuery + ReadonlyArchive | `DerivedValue` (attack bonus, save DC, damage dice, resource max, AC) | statblock unfold values (04 §II), scaling, DCs |
| `interrupts(e, graph, fold)` | one `AshEvent`, ReadonlyArchive, `FoldState<'combat'>` | `InterruptOffer[]` — **ALL offers for every eligible creature, perspective-blind**; the composer filters to `perspective` (SPEC-002 §9.2). The RiteSet never sees or reasons about perspective | reaction ribbon / interrupt layer (04 §II); `reaction.offered` (§3.2) |
| `conditions` (ConditionTable) | — (static table) | `{id,name,severity 1..5,mechanical text}[]` | rubrication color (03 §II), Vitals condition badges (04 §II) |
| `compositionHints(stance, fold, graph)` | Stance, `FoldState<'combat'>`, ReadonlyArchive | `CompositionHint[]` ranked | Folio II ranking order: legal-first, stage-match second (04 §II); "best-against-stage" pencil suggestions |

**Purity contract (SPEC-001 §5.6/§5.7, restated as an executable constraint):** none of the five may read `Date.now`, `Math.random`, `wallTime` (SPEC-001 §3.1 forbids wallTime in ordering/logic), any IO, or any mutable module state. Inputs are the arguments; output is a value. This is smoke-tested at `register()` (SPEC-001 §5.7: "pure-function contract smoke-tested at registration") — see §6.4 for the harness.

**Error contract (M4):** the five hooks **return values, never throw**, for every domain outcome — including malformed or provisional homebrew content (SPEC-001 §11: "errors are values"; `Result`/`AAError`). A hook encountering excluded/invalid content returns a well-formed answer (e.g. `legal:false, reason:'unruled-homebrew'`) or omits the piece; it does not raise. SPEC-002 §12's catch at the composer boundary ("`riteSet.legality` throws … caught, card renders `blocked`") is a **defense-in-depth backstop for defects only**, never the designed error path. A hook that actually throws is a defect (fails dev/CI loudly per SPEC-001 §11's global law). *Confidence: High.*

### 3.3 The trigger vocabulary (`TriggerTag`) — the reaction-economy backbone

40% of 5e combat is reactions (04 §II). Reactions require a **closed trigger vocabulary** so `interrupts()` is a table lookup, not a scan. `TriggerTag` is a closed enum, versioned with `VOCAB_VERSION`-style discipline (mirrors SPEC-001 §3.2's closed vocabulary rule). Minimum set derived from SPEC-001 §3.2 events + 04 §II named reactions:

```
'spell-cast' · 'targeted-by-attack' · 'hit-by-attack' · 'damage-taken' · 'leaves-reach'
'enters-reach' · 'ally-attacked-adjacent' · 'creature-moves-in-sight' · 'save-failed'
'concentration-damage' · 'turn-starts' · 'turn-ends' · 'creature-drops-to-0' · 'ally-drops-to-0'
```

Each maps to the SPEC-001 §3.2 event(s) that fire it (e.g. `leaves-reach` ← movement resolution; `spell-cast` ← `action.spent{ref=spell}`; `concentration-damage` ← `damage.taken` on a concentrator). Adding a tag is an interpreter change + `VOCAB_VERSION`-style bump. **ADR-004** covers whether `TriggerTag` is owned by `aa.rites.5e` or promoted to core alongside SPEC-001 §3.2. *Confidence: Med* — the *need* for a closed trigger set is High-confidence (derived from 04 §II + §3.2); the exact membership is a first cut and flagged in the GAP register (GAP-A).

---

## 4. DETERMINISM — HOW DATA-AUTHORED CONTENT KEEPS THE HOOKS PURE

SPEC-001 §5.6/§5.7 and I-8 require the hooks pure and the whole Foundation deterministic (same log ⇒ same fold, byte-identical across Node/Tauri-Rust/WASM). Content is data; logic is fixed interpreter code. The open question is **how much conditional logic content must express**, and in what form. This is **ADR-002** (below). This section specifies the chosen mechanism.

### 4.1 The two-layer model (accepted in ADR-002)

1. **Effect Atoms** — a closed, tagged-union vocabulary of *what a piece of content does*. The interpreter has exactly one handler per atom. Content composes atoms; content cannot introduce new atoms (that is an interpreter code change + version bump). This is the spine and covers the SRD near-completely.
2. **A constrained Predicate Expression Language (PEL)** — a small, *total*, side-effect-free boolean/arithmetic language for **guards and scaling amounts only** (never for control flow that could loop or allocate). Fully specified below. It exists so homebrew and edge-case SRD spells (e.g. "advantage if target is prone") need not force an interpreter release for every predicate.

### 4.2 Effect Atom vocabulary (closed union — excerpt; full set in Appendix B §10)

```ts
const zEffectAtom = z.discriminatedUnion('atom', [
  z.object({ atom: z.literal('attackRoll'), ability: AbilityId, vs: z.enum(['ac']),
             onHit: z.array(z.lazy(()=>zEffectAtom)), onMiss: z.array(z.lazy(()=>zEffectAtom)).default([]) }),
  z.object({ atom: z.literal('savingThrow'), ability: AbilityId, dcExpr: zResourceExpr,
             onFail: z.array(z.lazy(()=>zEffectAtom)), onSave: z.array(z.lazy(()=>zEffectAtom)).default([]) }),
  z.object({ atom: z.literal('applyDamage'), damageType: DamageTypeId, diceExpr: zDiceExpr,
             half: z.enum(['none','onSave']).default('none') }),
  z.object({ atom: z.literal('applyCondition'), condition: zSlug, save: zSaveSpec.nullable().default(null) }),
  z.object({ atom: z.literal('heal'), diceExpr: zDiceExpr }),
  z.object({ atom: z.literal('grantTempHp'), diceExpr: zDiceExpr }),
  z.object({ atom: z.literal('modifyRoll'), which: zTriggerTag, delta: zResourceExpr }),  // e.g. Shield: +5 AC
  z.object({ atom: z.literal('move'), mode: z.enum(['push','pull','teleport']), feet: z.number().int() }),
  z.object({ atom: z.literal('guard'), when: zPredicate, then: z.array(z.lazy(()=>zEffectAtom)) }),
]).strict?.() ?? z.discriminatedUnion; // (each variant .strict)
```

`onHit`/`onFail`/`then` nest atoms → the *only* branching is a finite, statically-bounded tree (no loops, no recursion beyond authored depth — capped at `MAX_ATOM_DEPTH=8`, `E-1702` on exceed, §7.1; the cap value is a tuning constant, **GAP-T**). The interpreter is a recursive walk with a depth guard; termination is structurally guaranteed. *This is why purity + determinism survive.* *Confidence: High.*

### 4.3 Modifiers (passive `derive()` contributions)

```ts
const zModifier = z.object({
  target: z.enum(['ac','attack','damage','save','skill','speed','initiative','hp-max','resource-max']),
  filter: zPredicate.nullable().default(null),         // e.g. only vs 'targeted-by-attack' of type melee
  op: z.enum(['add','set','advantage','disadvantage','multiply','min','max']),
  value: zResourceExpr,
}).strict();
```

`derive()` folds all applicable modifiers deterministically in a **fully total, specified order (M2)** — every op class is its own tier; no two ops share a tier:

```
1. set  →  2. add  →  3. multiply  →  4. min  →  5. max  →  6. advantage  →  7. disadvantage
```

Within a tier, application order is content `slug` lexical (bytewise) order. `advantage`/`disadvantage` are flags folded last and cap at one each (5e stacking rule — a golden invariant, §6.2). This total order is law for the interpreter; whether it *reproduces 5e's intended arithmetic* in every case is validated by the adv/dis and half-on-save golden suites (**GAP-M**). *Confidence: High on totality (I-8 demands it); Med on 5e fidelity of the tier order pending goldens.*

### 4.4 Scaling rules

```ts
const zScalingRule = z.object({
  axis: z.enum(['slotLevel','characterLevel','casterLevel']),
  perStep: z.number().int().positive().default(1),
  effect: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('addDice'), toAtom: z.number().int(), dice: zDiceExpr }),
    z.object({ kind: z.literal('addTargets'), count: z.number().int() }),
    z.object({ kind: z.literal('replaceDice'), table: z.array(z.object({ at: z.number().int(), dice: zDiceExpr })) }),
  ]),
}).strict();
```

### 4.5–4.6 InterruptOffer authoring, Resource/Dice expressions

`zInterruptOffer` is sealed at §2.10. `zResourceExpr`, `zDiceExpr`, `zPredicate` full grammars: the **PEL** surface, §4.7; exhaustive operator/atom membership review rides the golden-content pass (Appendix C §10, GAP-A).

### 4.7 The Predicate Expression Language (PEL) — full grammar (ADR-002 deliverable)

PEL is a total, pure, non-Turing-complete expression language. **No loops, no recursion, no user functions, no allocation, no IO.** It evaluates against a fixed, read-only context object supplied by the interpreter. Grammar (EBNF):

```ebnf
expr        := orExpr ;
orExpr      := andExpr  { "or"  andExpr } ;
andExpr     := notExpr  { "and" notExpr } ;
notExpr     := [ "not" ] cmpExpr ;
cmpExpr     := addExpr [ ("=="|"!="|"<"|"<="|">"|">=") addExpr ] ;
addExpr     := mulExpr { ("+"|"-") mulExpr } ;
mulExpr     := unary   { ("*"|"/"|"min"|"max") unary } ;   (* "/" = floor division; div-by-zero => 0, flagged *)
unary       := [ "-" ] atom ;
atom        := NUMBER | BOOL | ref | "(" expr ")" | call ;
ref         := IDENT { "." IDENT } ;                        (* dotted path into the fixed context, whitelisted *)
call        := ("abs"|"has"|"count") "(" [ expr { "," expr } ] ")" ;
NUMBER      := INTEGER-LITERAL ;                            (* integers only — no float literals exist in PEL (L2) *)
```

- **`floor`/`ceil` removed (L2):** under integer-only PEL with floor division, both were identity no-ops; they are not in the call set. Division itself floors (`19/2 = 9`); authors write `amount/2`, not `floor(amount/2)`.
- **Context whitelist** (the *only* readable refs): `caster.*`, `target.*`, `slot.level`, `spell.level`, `fold.*` (combat fold projections), `condition(<slug>)` via `has()`. Any non-whitelisted ref ⇒ compile-time `E-1701 UnknownReference` (§7.1). No dynamic property access — refs are static, resolved at compile.
- **Totality:** every operator is total (division floors; `x/0 ⇒ 0` with a `W-17xx` warning at compile; `min`/`max` binary). No expression can diverge. Evaluation is a fixed-depth AST walk (author depth capped at `MAX_PEL_DEPTH=12` — tuning constant, **GAP-T**).
- **Purity/determinism:** integer arithmetic only (no floats in PEL — dice/values are integer domains; avoids cross-platform float divergence, protecting I-8's byte-identical requirement). Booleans and integers are the only value types.
- **Dice expressions** (`zDiceExpr`) are PEL-adjacent: `NdM(+K)` where `N`,`K` may themselves be PEL integer expressions (for scaling), `M` is a literal die face from `{4,6,8,10,12,20,100}`. Rolls are *not* evaluated in `derive()` (that would need randomness) — `derive()` returns the *dice notation and static bonuses*; actual rolls happen via `roll.made` events (SPEC-001 §3.2) at the Table and enter the fold. **This is the critical purity boundary: content computes formulas; the Ash rolls dice.** *Confidence: High* — directly enforces SPEC-001 §5.7 `derive` purity + §3.2 `roll.made`.

*Confidence for §4 overall: High on mechanism (ADR-002 accepted; verification pass confirmed the purity boundary and PEL design sound); Med on exact atom/PEL membership, pressure-tested by golden content (§6) — GAP-A.*

---

## 5. THE AUTHORING PIPELINE

### 5.1 Source format (ADR-001)

**Recommended: YAML-with-schema, one file per content piece**, foldered by kind (`source/spells/fireball.rite.yaml`). Rationale: human-diffable (SPEC-001 §9.2 ownership/legibility ethos), git-reviewable, comment-bearing, and it round-trips through the same YAML-frontmatter export shape SPEC-001 §9.1 already uses for entries. Alternatives (TS-as-source, JSON) weighed in ADR-001. YAML is source; it compiles to the two artifacts of §1. *Confidence: Med — this is an ADR, not a canon derivation.*

### 5.2 Validation gates (author-time, ordered; first failure stops)

1. **Structural** — Zod parse against the content schema (§2). Fail ⇒ `E-1001 BodySchemaMismatch` with field paths (SPEC-001 §11).
2. **Referential** — every FK resolves: `DamageTypeId` → registry (§2.8), condition slugs → Condition set (§2.4), `zEntryRef` in statblocks → existing rite entries, recharge triggers → backed events (GAP-E). Fail ⇒ `E-1704 DanglingReference`.
3. **PEL/atom** — every PEL expr parses, references whitelisted, depth ≤ caps; every effect-atom tree depth ≤ `MAX_ATOM_DEPTH`. Fail ⇒ `E-1701/E-1702`.
4. **Purity lint** — static check that no schema field smuggled a function/string-of-code (belt-and-suspenders over §2.0). Fail ⇒ `E-1705 NonDeclarativeContent`.
5. **SRD boundary** — `srdScope` present and consistent (§5.6). Fail ⇒ `E-1706 SrdScopeMissing`.
6. **Golden** — the piece's declared golden tests (§6) pass. Fail ⇒ build red.

Gates 1–5 run in <content-lint>; gate 6 runs in the test job. All six are CI-blocking (§6.5).

### 5.3 The compile step (author-time, not load-time)

Compile is **build-time** (produces the `CompiledRiteIndex` §2.9 shipped inside `@ash-archive/rites-5e`), for the perf reason in §7.2: `register()` and per-event `interrupts()` cannot afford to parse YAML or re-link FKs at the Table — the SPEC-001 §15 v1.1 per-call budgets (≤1ms/≤3ms/≤2ms) leave no room for parsing. Load-time (`register()`) does only: schema-shape verify of the compiled index, purity smoke test (§6.4), and mount. Author-time vs load-time split is explicit so the 80ms envelope (04 §II) is never spent on parsing. *Confidence: High.*

### 5.4 Versioning & migration of content against schema evolution

- Every content schema carries `bodySchemaVersion` (SPEC-001 §2.2). The content build declares the `bodySchemaVersion` per kind it targets.
- Schema evolution follows SPEC-001 §14/§2.2: additive fields = minor version, no migration; field removal/reshape = major version + a **content migration** that transforms authored source, replayed against golden fixtures (mirrors SPEC-001 §16.7 "every shipped migration replays the previous version's golden fixtures").
- Content in a *bound Entry* (SPEC-001 §2.2 `EntryVersion.bodySchemaVersion`) migrates via the Foundation's own `migration.applied` event path (SPEC-001 §3.2). The Rite content build ships a `migrations/<from>-<to>.ts` per major bump; core replays it. **The Rite set never migrates canon in place** — it supplies the transform; the Foundation appends the migration event (I-2 append-only). *Confidence: High.*

### 5.5 Packaging & registration (`vault.rites.register`)

- Package: `@ash-archive/rites-5e`, semver `version` on the RiteSet (SPEC-001 §5.7 `'aa.rites.5e' semver`). Ships: the five pure functions, `schemas` map, `conditions` table, and the embedded `CompiledRiteIndex`.
- Registration: `vault.rites.register(set)` (SPEC-001 §5.7) → core runs the purity smoke test and validates `schemas`; on pass, mounts the set so `body.ext['aa.rites.5e']` validation (SPEC-001 §14.3) and the five hooks are live. Failure returns a `Result` error (SPEC-001 §11), never throws for a domain outcome (SPEC-001 §5 "errors are values").
- Homebrew registers as content *within* an already-registered set (Entry-level `body.ext`), not as a second RiteSet — consistent with SPEC-001 §5.7 "Homebrew = Entry-level overrides validated against `set.schemas`." *Confidence: High.*

### 5.6 SRD scope / licensing boundary (per-entry) — **policy RESOLVED**

Every content piece carries `srdScope` (§2.0): `'srd-5.1'`, `'homebrew'`, or `'provisional-homebrew'`. **Policy (resolved by Marcus, 2026-07-12 — ADR-LOG "ADR-R1-005"): the v1 content boundary is the 5e SRD 5.1 under CC-BY-4.0.** Attribution text is carried in `WORLD.md`/package metadata (SPEC-001 §9.1); non-SRD packs are future *separate* registered sets. The tracking mechanism (this closed enum + a build report enumerating every non-`srd-5.1` piece, §6.5 gate 7) is unchanged from draft. GAP-L is closed. *Confidence: High — mechanism and policy both settled.*

---

## 6. THE ACCEPTANCE BAR — GOLDEN-TEST METHODOLOGY

A content piece is "correct and shippable" iff it passes structural validation (§5.2) **and** its golden tests (below) **and** the set-level determinism/purity harness.

### 6.1 The golden test unit — a rules interaction → expected hook output

A golden test is a pure triple: **(fixture world + combat fold state) × (query/event) → (expected `LegalityAnswer` | `InterruptOffer[]` | `DerivedValue`)**, asserted byte-exact (JSON). Example shapes:

- **Legality golden:** "Wizard, 0 level-1 slots left, in combat, action unspent → cast a level-1 spell ⇒ `legal:false, reason:'no-slot'`."
- **Interrupt golden:** "Creature A casts a spell within 60ft of Wizard B who has Counterspell prepared and a reaction available ⇒ `interrupts(action.spent{spell})` includes an offer for B keyed to A's event." (04 §II Counterspell.)
- **Derivation golden:** "Fireball at slot 5 ⇒ `derive` returns `8d6` (base 8d6? — content-defined) fire, DC = 8+prof+casterMod." (Values are content's; the test asserts the *derivation math*, not authored numbers.)
- **Concentration golden:** "Concentrating target takes 19 damage ⇒ triggered concentration-save offer, DC 10 (`max(10, 19/2) = max(10,9) = 10`, floor division §4.7)." (04 §II; SPEC-001 §3.2 `concentration.check`.)

Golden fixtures live in `spec-fixtures/rites-5e/` mirroring SPEC-001 §16.1's checked-in accept/reject tables.

### 6.2 Coverage requirements

- **Per piece:** ≥1 golden per declared hook the piece participates in (a passive Feature needs a `derive` golden; a reaction Feature needs an `interrupts` golden; an active spell needs `legality`+`derive`, plus `interrupts` if it `provokes` or `offersReactionInterrupts`).
- **Per interaction class** (the hard-won 5e edge cases, each a named golden suite): concentration break on damage; Counterspell-vs-Counterspell; Shield vs already-resolved hit; opportunity attack on forced vs voluntary movement; Cohort member death vs Cohort defeat (04 §II); legendary/lair action interrupts; save-ends condition on `condition.saved` (§3.2); half-on-save damage; advantage/disadvantage stacking (max one each — a `derive` invariant golden, validating the §4.3 total order — GAP-M).
- **Coverage floor** aligns to SPEC-001 §16: 100% of the interpreter's atom handlers and PEL operators exercised by golden content; 90% line floor on `@ash-archive/rites-5e`.

### 6.3 The "does the table behave correctly" e2e check

Beyond unit goldens: an **event-replay e2e** that drives a scripted combat as an Ash event log (SPEC-001 §3.2 events) through the real combat fold (§5.6) + the registered RiteSet, and asserts the *composed hand* and *reaction ribbon* the composer would show at each turn (04 §II). This is the analog of SPEC-001 §16.2 fold-determinism but at the content layer: it proves data→behavior→Table, end to end. It asserts, e.g., "at Wizard's turn with these slots/conditions, the legal-first ranked hand is exactly [X,Y,Z]" (04 §II ranking: legal-first, stage-match second, muscle-memory third). *Confidence: High.*

### 6.4 Purity & determinism harness (the `register()` smoke test, expanded)

- **Purity smoke test** (SPEC-001 §5.7): call each hook twice with identical frozen inputs; assert deep-equal outputs; run under a sandbox that traps `Date.now`/`Math.random`/IO and fails on access. Fail ⇒ `register()` returns `E-1707 ImpureRiteFunction`.
- **Cross-runtime determinism** (SPEC-001 §5.6/I-8): the same golden triples replayed on Node, Tauri-Rust-hosted, and WASM must yield byte-identical JSON — extends SPEC-001 §16.2 to RiteSet outputs. Integer-only PEL (§4.7) is what makes this achievable.

### 6.5 CI gates (all blocking)

1. Content lint (§5.2 gates 1–5). 2. Golden suite (§6.1–6.2). 3. e2e table-behavior (§6.3). 4. Purity + cross-runtime determinism (§6.4). 5. Migration replay for any `bodySchemaVersion` bump (§5.4; SPEC-001 §16.7). 6. Performance budget on the SPEC-001 §15 harness (§7.2). 7. SRD-scope report generated and non-empty-`srd-5.1` diffs surfaced for review (§5.6). No content merges red. Mirrors SPEC-001 §16's CI posture. *Confidence: High.*

---

## 7. ERRORS, PERFORMANCE, AND MALFORMED-CONTENT BEHAVIOR

### 7.1 Error taxonomy (E-17xx — ceded range, owned here)

**SPEC-001 §11 v1.1 cedes the E-17xx range to registered Rite sets (executed 2026-07-12 — ADR-003 EXECUTED): "core reserves the range; a registered set owns its codes … Core never mints E-17xx itself."** `aa.rites.5e` therefore owns and mints the codes below; no further core sign-off is required. **Reconciliation (M1):** the code names SPEC-001 §11 v1.1 prints (`E-1701 InvalidRiteContent`, `E-1702 UnruledHomebrew`) are *illustrative examples* in core's table; this registry is the **owning, normative assignment** for `aa.rites.5e` and supersedes those examples. All codes return as `AAError` values (SPEC-001 §11), `retryable:false` unless noted:

| Code | Meaning | Behavior |
|---|---|---|
| E-1701 UnknownReference | PEL ref outside whitelist | reject at compile (§5.2) |
| E-1702 ExpressionTooDeep | PEL/atom depth > cap | reject at compile |
| E-1703 InvalidHomebrew | `body.ext` fails `set.schemas` | store as `provisional-homebrew`, exclude from hooks (SPEC-001 §5.7); NOT a hard error at the Table |
| E-1704 DanglingReference | FK unresolved | reject at compile |
| E-1705 NonDeclarativeContent | code smuggled into data | reject at compile |
| E-1706 SrdScopeMissing | `srdScope` absent | reject at compile |
| E-1707 ImpureRiteFunction | purity smoke test failed | `register()` fails (SPEC-001 §5.7) |
| E-1708 ContentContradiction | two pieces define same slug incompatibly, or condition-severity map conflict | surfaced to Charter contradiction (SPEC-001 §7.4); provisional pieces excluded |

### 7.2 Performance budget — SPEC-001 §15 v1.1, adopted verbatim (C1)

The hook budgets are **not** estimates apportioned by this spec — they are **executed law**: SPEC-001 §15 v1.1 (amended 2026-07-12, ADR-002-D) budgets the paint path directly. This spec adopts those rows verbatim; CI asserts them on the **SPEC-001 §15 seeded harness** (S/M/L/XL fixture worlds):

| Hook call | Budget (SPEC-001 §15 v1.1 — law) | Why it holds |
|---|---|---|
| `RiteSet.legality` (per call, paint-path) | **p99 ≤ 1ms** | reads pre-linearized guards + folded combat state; no parse (§5.3) |
| `RiteSet.derive` (per call, paint-path) | **p99 ≤ 1ms** | integer PEL walk, depth ≤ `MAX_PEL_DEPTH` |
| `RiteSet.interrupts` (per delta, via compiled trigger index) | **p99 ≤ 3ms** | `triggerIndex` reverse lookup (§2.9), not a content scan — the §15 row names this index |
| `RiteSet.compositionHints` (per compose) | **p99 ≤ 2ms** | ranking only, bounded by candidate count |

**Envelope consumption** (SPEC-002 §11.4's corrected argument): `legality` runs for all candidates — a worst-case 20-card hand costs ≤20ms of legality inside the composer's ≤80ms envelope, with the fitter capping `derive`/render to ≤7 live elements. There is no separate whole-hand budget in this spec; the per-call §15 rows and SPEC-002's fitter are jointly sufficient. If any hook risks the envelope under load, the composer degrades to unranked-but-legal (SPEC-001 §11 global law: "the Foundation never blocks play"). **GAP-P is retargeted accordingly: not "estimate the splits" but *prove the fixed §15 v1.1 budgets hold* for the compiled index implementation on the §15 harness.** *Confidence: High — the numbers are canon; only the proof-by-measurement remains (GAP-P).*

### 7.3 Defined behavior for malformed / partial / contradictory content

- **Malformed** (fails §5.2 at build) ⇒ never ships; CI red. At *runtime* (homebrew authored live), invalid ⇒ `E-1703`, stored `provisional-homebrew`, excluded from all five hooks (SPEC-001 §5.7), visible/repairable at the Desk. The Table shows valid content only; it never crashes on bad homebrew (SPEC-001 §11 never-block law; hooks return values, never throw — §3.2 M4).
- **Partial** (a Feature references a not-yet-authored Resource) ⇒ `E-1704` at build; at runtime a dangling ref makes the *piece* provisional-excluded, not the set — one bad spell never disables the RiteSet.
- **Contradictory** (two pieces claim the same `slug`, or a homebrew condition remaps a severity that a locked ruling fixed) ⇒ `E-1708`, routed to the Charter contradiction bench (SPEC-001 §7.4 — name/alias & explicit-contradiction detectors already exist; content contradiction is a same-shaped `ContradictionCase`). Human resolves (SPEC-001 §7.4 `minimal|clean|story`); until then the incoming piece is provisional-excluded. **No automatic merge** (consistent with SPEC-001 §13 conflict philosophy). *Confidence: High.*

---

## 8. ADR REGISTER

**ADR-001 — Source authoring format.** *Status: Accepted (recommendation stands).*
*Context:* content must be human-diffable, reviewable, and round-trip with SPEC-001 §9 export. *Options:* (a) YAML-per-file; (b) JSON-per-file; (c) TypeScript-as-source (typed literals). *Decision:* **(a) YAML**, comment-bearing and matching §9.1 frontmatter shape. *Consequences:* needs a YAML→compiled build; loses compile-time TS typing at author time (recovered via Zod gate §5.2). *What would change it:* if authors are exclusively engineers, (c) removes a toolchain layer.

**ADR-002 — Expression DSL vs pure code-plugins vs pure-data atoms.** *(The load-bearing one.)* *Status: Accepted — atoms+PEL (ADR-LOG lean confirmed; adversarial verification 2026-07-12 held the mechanism sound).*
*Context:* SPEC-001 §5.6/§5.7 demand pure, deterministic hooks; content needs conditional expressivity. *Options:* (a) pure closed **Effect Atoms only** — maximal determinism, but every predicate/edge case is an interpreter release; (b) **code-plugins** (content ships JS) — rejected: violates §5.6 purity/§2.0 and can't be cross-runtime-guaranteed (I-8); (c) **atoms + a constrained, total, integer-only PEL** for guards/amounts (§4.7). *Decision:* **(c)**. It keeps hooks pure (interpreter is fixed code; PEL is total and sandboxed), bounds homebrew without interpreter releases, and protects I-8 via integer-only arithmetic. *Consequences:* a small language to specify, test (§6.4), and version. *What would change it:* if golden content shows the atom set alone covers SRD + realistic homebrew, drop PEL and take (a) for simplicity.

**ADR-003 — Error-code range ownership (E-17xx).** *Status: **EXECUTED** — SPEC-001 §11 amended to v1.1 (2026-07-12): E-17xx ceded to registered Rite sets; core reserves the range, never mints in it. This spec's §7.1 table is the owning registry for `aa.rites.5e`. Closed.*

**ADR-004 — `TriggerTag` vocabulary ownership.** *Status: Accepted (recommendation stands).*
*Context:* reactions need a closed trigger vocabulary (§3.3); it maps 1:1 onto SPEC-001 §3.2 events. *Options:* (a) owned by `aa.rites.5e`; (b) promoted to core beside §3.2 with `VOCAB_VERSION`. *Decision:* **(a) for v1** (5e-specific), with a documented seam to promote if a second RiteSet needs it (SPEC-001 §18 "system-agnostic promise"). *Consequences:* a future system-agnostic RiteSet may duplicate concepts. *What would change it:* committing to a second system before v1 ships → (b).

**ADR-005 — SRD version & licensing policy.** *Status: **RESOLVED by Marcus, 2026-07-12** (ADR-LOG "ADR-R1-005 · SRD license → YES, SRD 5.1"): the v1 boundary is **SRD 5.1 under CC-BY-4.0**; attribution in `WORLD.md`/package (SPEC-001 §9.1); non-SRD content as future separate registered sets. Legal ratified; engineering proceeds (§5.6). Closed.*

---

## 9. CONFIDENCE SUMMARY

| Section | Confidence | Note |
|---|---|---|
| 0–1 Architecture / SPEC-001 seam | **High** | §2.2 + §14.3 give the two-artifact model verbatim |
| 2 Content schemas | **High** (shapes, incl. §2.10 sealed sub-schemas) / **Med** (exact enum membership) | field *types* canon-driven; enum *contents* are 5e-domain first cuts (GAP-A) |
| 3 Data→behavior binding | **High** | every row cites a §3.2 event / §5.7 hook; perspective + never-throw contracts pinned to SPEC-002 §9.2/§12 |
| 4 Determinism / atoms / PEL | **High** (mechanism) / **Med** (membership) | ADR-002 accepted; modifier fold order now total (§4.3) |
| 5 Pipeline | **Med-High** | source format is ADR-001; compile/version/register are canon-derived; SRD policy resolved |
| 6 Acceptance bar | **High** | mirrors SPEC-001 §16 methodology directly |
| 7 Errors / perf / malformed | **High** | E-17xx ceded (owned here); budgets are §15 v1.1 law, not estimates |
| 8 ADRs | n/a | 003 executed · 005 resolved · 001/002/004 accepted |

---

## 10. APPENDICES (remaining deferred membership — narrowed, flagged GAP-A)

`zTargeting`, `zSaveSpec`, `zInterruptOffer` are **sealed at §2.10** (H1 resolved); `zModifier` at §4.3; `zScalingRule` at §4.4; the PEL grammar at §4.7. What remains deferred is **closed-enum membership only**: Appendix B (the exhaustive Effect Atom union beyond the §4.2 excerpt), the `TriggerTag` final membership (§3.3), the area-shape slug registry (§2.10), and the exhaustive PEL context-whitelist paths. Membership is finalized by the first golden-content pass (§6) — authoring `fireball`, `counterspell`, `shield`, `grapple`, `poisoned`, and one Cohort will reveal the true minimal complete atom set. Shipping exhaustive membership before that pass would be invention. **GAP-A** tracks this and *only* this.

---

## 11. BUILDER FRICTION INDEX & GAP REGISTER

### Builder Friction Index: **72 / 100** *(verifier scale: 100 = build-ready with zero further decisions, 0 = blocked; as-drafted honest score was ~44 with C1/H1 start-blocking)*
Justification: the two start-blockers are gone — budgets are now SPEC-001 §15 v1.1 law adopted verbatim (C1) and all authored schemas including the three formerly-undefined sub-schemas are sealed to interface grade (H1) — and every non-Builder decision is executed or resolved (E-17xx ceded, SRD 5.1 ratified); the only deferred item is closed-enum *membership*, gated on the golden-content pass (GAP-A), which blocks vocabulary completeness, not the interpreter, schemas, pipeline, or CI harness.

### GAP REGISTER (refreshed post-verification)
- **GAP-A (atom/PEL/TriggerTag/shape *membership* only):** structures sealed; exact closed-enum memberships are first-draft and finalized by authoring ~6 canonical pieces (§10). *Owner: Rite content lead. Blocks: content completeness, not scaffolding.*
- **GAP-M (modifier tier order vs 5e fidelity):** the §4.3 total order is law for determinism; its 5e arithmetic fidelity is validated against adv/dis and half-on-save goldens. *Owner: Rite content lead.*
- **GAP-D (derive/roll boundary edge cases):** confirm every SRD "roll now, use result" case fits the `derive`-returns-formula / Ash-rolls split (§4.7). *Owner: golden-content pass.*
- **GAP-P (budget proof — retargeted):** the §15 v1.1 budgets are fixed law; prove the compiled-index implementation meets them on the SPEC-001 §15 seeded harness (S/M/L/XL). *Owner: Foundation perf harness.*
- **GAP-T (depth caps — new, L1):** `MAX_ATOM_DEPTH=8` and `MAX_PEL_DEPTH=12` are tuning constants, not canon derivations; validate against the deepest SRD golden piece and log the final values as a ruled ADR if they move. *Owner: Rite content lead.*
- **GAP-E (`'dawn'` recharge — new, L3):** `recharge.on:'dawn'` has **no backing event** in SPEC-001 §3.2; either a time-of-day event lands via the §14.5 vocabulary process (core minor + `VOCAB_VERSION` bump) or `'dawn'` is dropped at membership finalization. Until resolved it is schema-reserved and rejected at gate 2 (§5.2). *Owner: Foundation (event vocab) + Rite content lead.*
- ~~**GAP-B (E-17xx ownership)**~~ — **RESOLVED/EXECUTED** 2026-07-12: SPEC-001 §11 v1.1 cedes the range (ADR-003).
- ~~**GAP-L (SRD licensing policy)**~~ — **RESOLVED** 2026-07-12: SRD 5.1 / CC-BY-4.0 ratified by Marcus (ADR-005).

---
*This spec is subordinate to SPEC-001 v1.1. Its two former seams are executed: E-17xx is ceded (§11 v1.1) and the `interrupts()` ≤3ms budget is ratified (§15 v1.1, ADR-002-D). `body.ext['aa.rites.5e']` schema blessing occurs at `register()` per SPEC-001 §14.3, as designed.*
