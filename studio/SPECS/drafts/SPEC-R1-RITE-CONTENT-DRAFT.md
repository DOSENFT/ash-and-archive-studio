# SPEC-R1 — THE RITE CONTENT AUTHORING SYSTEM
### Canonical engineering specification for `@ash-archive/rites-5e` content — the schema, pipeline, and acceptance bar for authoring 5e rules content that plugs into SPEC-001 §5.7
*v0.1 · DRAFT · Status: **SEALED DRAFT — zero-invention; every non-cited claim is an ADR or GAP***

> **Scope of this document.** This specifies the *machine content is poured into and validated by* — the authoring schemas, the compile/validate/package/register pipeline, and the golden-test acceptance bar for the 5e Rite set. It is subordinate to SPEC-001 (`studio/SPECS/SPEC-001-FOUNDATION.md`), which is law for the Foundation. Where SPEC-001 speaks, it governs; where this document extends it, it does so only through SPEC-001's sanctioned extension mechanisms (§14). **It does NOT author SRD content** (spells, monsters). It specifies the shape and the acceptance machine for that content.
>
> **Naming.** SPEC-001 §1.2 and §5.7 name the shipping package `@ash-archive/rites-5e` and the registered RiteSet id `aa.rites.5e`. This document uses both consistently. "The composer" = `@ash-archive/composer` (SPEC-001 §1.2). "The Table" = Codex GENESIS `04-THE-TABLE.md`.

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

**Load-bearing SPEC-001 anchors** (cited inline throughout): §2.2 (`rite` kind, `bodySchemaVersion`, UNKNOWN discipline, `body.ext[<ns>]` namespacing), §3.2 (combat/interrupt/condition event vocabulary — the events the rules must drive and read), §5.6 (`FoldState<'combat'>`, pure reducers, determinism CI), §5.7 (RiteSet, homebrew rule), §11 (error taxonomy `Result`/`AAError`), §14 (extension mechanisms), §15 (performance budgets). Table consumption anchors from Codex GENESIS `04-THE-TABLE.md` (§II composed hand, interrupt/reaction ribbon, concentration, Cohorts, statblock unfold) and severity rendering from `03-DESIGN-LANGUAGE.md` §II (five-stop ramp).

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
const DamageTypeId = zSlug;                            // FK into the DamageType registry (§2.9); NOT a free enum
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
  targeting: zTargeting,                               // §2.10
  // ── MACHINE-EXECUTABLE effect graph (interpreted by legality/derive/interrupts) ──
  onCast: z.array(zEffectAtom),                        // §4.2 — closed atom vocabulary
  scaling: z.array(zScalingRule).default([]),          // higher-slot / cantrip-level scaling, §4.4
  offersReactionInterrupts: z.array(zInterruptOffer).default([]),   // §3 hook binding, §4.5
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

Authored content is the *source of truth*; the compile step (§5.3) produces a **`Compiled` sidecar** — a denormalized, index-ready form the interpreter reads at 80ms speed (§7.2). It is a build artifact, never authored, never bound to canon, never exported as canon.

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

`triggerIndex` is the performance-critical derivation: `interrupts(e)` must not scan all content per event (§7.2). It is built once at compile/register time. *Confidence: High* (directly serves SPEC-001 §15 budgets + 04 §II reaction ribbon latency).

### 2.10–2.11 Targeting, Modifier, Save, and homebrew-override rules

`zTargeting`, `zModifier`, `zSaveSpec`, `zScalingRule` are closed sub-schemas defined in Appendix A (§10). **Homebrew-override rule (SPEC-001 §5.7, verbatim binding):** a homebrew content piece is a `rite`-kind Entry whose `body.ext['aa.rites.5e'].<kind>` validates against `set.schemas`.

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
| `onCast:[attackRoll,...]` + `provokes:['spell-cast']` | `interrupts(e:'action.spent'|'roll.made', graph, fold)` | For every *other* creature, looks up `triggerIndex['spell-cast']` → emits `InterruptOffer` for **Counterspell** (a reaction Feature §2.2 with `trigger:'spell-cast'`), keyed to the caster's cast event | §3.2 `reaction.offered`; §5.7 `interrupts()`; 04 §II ribbon |
| `onCast:[attackRoll{vs:'ac'}]` | `interrupts(e:'roll.made'{context:'attack'}, ...)` | Looks up `triggerIndex['targeted-by-attack']` → emits **Shield** offer for the target (reaction Feature, `trigger:'targeted-by-attack'`, guard `attackTotal < ac+5`) | §3.2 `reaction.offered`; 04 §II ("Shield … legality computed by the Rite set") |
| `onCast:[applyDamage{damageType:'fire'}]` | consumed by the **combat fold** (SPEC-001 §5.6), not the RiteSet | Author's atom is data; when the table resolves it, `damage.taken{damageType:'fire'}` is appended; fold applies resist/vuln from target statblock (§2.6) | §3.2 `damage.taken`; §5.6 |
| target is concentrating + `applyDamage` | `interrupts(e:'damage.taken', graph, fold)` | If target has `concentration.started` unresolved → emits a **concentration-save** triggered offer, DC computed by `derive()` (`max(10, floor(amount/2))`) | §3.2 `concentration.check`; 04 §II ("Damage inscribed against a concentrating creature auto-surfaces the concentration save") |
| `scaling` (§4.4) | `derive(d:'spellEffect', graph)` | Pure computation of dice/targets at the slot level actually spent; no fold, no randomness | §5.7 `derive()`; I-8 determinism |
| `severity` on any Condition this spell applies | `compositionHints()` + ConditionTable | Ranks the spell "best-against-stage" (04 §II ranking) and drives rubrication color (03 §II severity ramp) | §5.7 `conditions`, `compositionHints`; 03 §II |

### 3.2 The five hooks — inputs, outputs, and the pure contract

| Hook | Reads (only) | Returns | Drives at the Table |
|---|---|---|---|
| `legality(q, graph, fold)` | the LegalityQuery, ReadonlyArchive (statblocks, features, resources), `FoldState<'combat'>` (action economy, slots, conditions, concentration) | `LegalityAnswer{ legal, reason?, warnings[], costPreview }` | Folio II composed hand: "only what is *currently legal and relevant*" (04 §II); legal-first ranking |
| `derive(d, graph)` | DerivationQuery + ReadonlyArchive | `DerivedValue` (attack bonus, save DC, damage dice, resource max, AC) | statblock unfold values (04 §II), scaling, DCs |
| `interrupts(e, graph, fold)` | one `AshEvent`, ReadonlyArchive, `FoldState<'combat'>` | `InterruptOffer[]` (who may react, with what, keyed to `e`) | reaction ribbon / interrupt layer (04 §II); `reaction.offered` (§3.2) |
| `conditions` (ConditionTable) | — (static table) | `{id,name,severity 1..5,mechanical text}[]` | rubrication color (03 §II), Vitals condition badges (04 §II) |
| `compositionHints(stance, fold, graph)` | Stance, `FoldState<'combat'>`, ReadonlyArchive | `CompositionHint[]` ranked | Folio II ranking order: legal-first, stage-match second (04 §II); "best-against-stage" pencil suggestions |

**Purity contract (SPEC-001 §5.6/§5.7, restated as an executable constraint):** none of the five may read `Date.now`, `Math.random`, `wallTime` (SPEC-001 §3.1 forbids wallTime in ordering/logic), any IO, or any mutable module state. Inputs are the arguments; output is a value. This is smoke-tested at `register()` (SPEC-001 §5.7: "pure-function contract smoke-tested at registration") — see §6.4 for the harness. *Confidence: High.*

### 3.3 The trigger vocabulary (`TriggerTag`) — the reaction-economy backbone

40% of 5e combat is reactions (04 §II). Reactions require a **closed trigger vocabulary** so `interrupts()` is a table lookup, not a scan. `TriggerTag` is a closed enum, versioned with `VOCAB_VERSION`-style discipline (mirrors SPEC-001 §3.2's closed vocabulary rule). Minimum set derived from SPEC-001 §3.2 events + 04 §II named reactions:

```
'spell-cast' · 'targeted-by-attack' · 'hit-by-attack' · 'damage-taken' · 'leaves-reach'
'enters-reach' · 'ally-attacked-adjacent' · 'creature-moves-in-sight' · 'save-failed'
'concentration-damage' · 'turn-starts' · 'turn-ends' · 'creature-drops-to-0' · 'ally-drops-to-0'
```

Each maps to the SPEC-001 §3.2 event(s) that fire it (e.g. `leaves-reach` ← movement resolution; `spell-cast` ← `action.spent{ref=spell}`; `concentration-damage` ← `damage.taken` on a concentrator). Adding a tag is an interpreter change + `VOCAB_VERSION`-style bump. **ADR-004** covers whether `TriggerTag` is owned by `aa.rites.5e` or promoted to core alongside SPEC-001 §3.2. *Confidence: Med* — the *need* for a closed trigger set is High-confidence (derived from 04 §II + §3.2); the exact membership is a first cut and flagged in the GAP register.

---

## 4. DETERMINISM — HOW DATA-AUTHORED CONTENT KEEPS THE HOOKS PURE

SPEC-001 §5.6/§5.7 and I-8 require the hooks pure and the whole Foundation deterministic (same log ⇒ same fold, byte-identical across Node/Tauri-Rust/WASM). Content is data; logic is fixed interpreter code. The open question is **how much conditional logic content must express**, and in what form. This is **ADR-002** (below). This section specifies the chosen mechanism.

### 4.1 The two-layer model (recommended in ADR-002)

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

`onHit`/`onFail`/`then` nest atoms → the *only* branching is a finite, statically-bounded tree (no loops, no recursion beyond authored depth — capped at `MAX_ATOM_DEPTH=8`, `E-17xx` on exceed, §7.1). The interpreter is a recursive walk with a depth guard; termination is structurally guaranteed. *This is why purity + determinism survive.* *Confidence: High.*

### 4.3 Modifiers (passive `derive()` contributions)

```ts
const zModifier = z.object({
  target: z.enum(['ac','attack','damage','save','skill','speed','initiative','hp-max','resource-max']),
  filter: zPredicate.nullable().default(null),         // e.g. only vs 'targeted-by-attack' of type melee
  op: z.enum(['add','set','advantage','disadvantage','multiply','min','max']),
  value: zResourceExpr,
}).strict();
```

`derive()` folds all applicable modifiers deterministically in a **fixed, specified order** (op precedence: `set` → `add`/`multiply` → `min`/`max` → adv/dis flags; ties broken by content `slug` lexical order). Order-independence of the *result* is a golden test (§6). *Confidence: High* — determinism demands a total order; the exact precedence is a defensible first cut flagged in GAP.

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

`zInterruptOffer`, `zResourceExpr`, `zDiceExpr`, `zPredicate` full grammars in Appendix C (§10). `zResourceExpr` and `zDiceExpr` are the **PEL** surface.

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
call        := ("floor"|"ceil"|"abs"|"has"|"count") "(" [ expr { "," expr } ] ")" ;
```

- **Context whitelist** (the *only* readable refs): `caster.*`, `target.*`, `slot.level`, `spell.level`, `fold.*` (combat fold projections), `condition(<slug>)` via `has()`. Any non-whitelisted ref ⇒ compile-time `E-1701 UnknownReference` (§7.1). No dynamic property access — refs are static, resolved at compile.
- **Totality:** every operator is total (division floors; `x/0 ⇒ 0` with a `W-17xx` warning at compile; `min`/`max` binary). No expression can diverge. Evaluation is a fixed-depth AST walk (author depth capped at `MAX_PEL_DEPTH=12`).
- **Purity/determinism:** integer arithmetic only (no floats in PEL — dice/values are integer domains; avoids cross-platform float divergence, protecting I-8's byte-identical requirement). Booleans and integers are the only value types.
- **Dice expressions** (`zDiceExpr`) are PEL-adjacent: `NdM(+K)` where `N`,`K` may themselves be PEL integer expressions (for scaling), `M` is a literal die face from `{4,6,8,10,12,20,100}`. Rolls are *not* evaluated in `derive()` (that would need randomness) — `derive()` returns the *dice notation and static bonuses*; actual rolls happen via `roll.made` events (SPEC-001 §3.2) at the Table and enter the fold. **This is the critical purity boundary: content computes formulas; the Ash rolls dice.** *Confidence: High* — directly enforces SPEC-001 §5.7 `derive` purity + §3.2 `roll.made`.

*Confidence for §4 overall: Med-High.* The mechanism is sound and canon-compatible; the exact atom membership and PEL surface are first-draft and will be pressure-tested by golden content (§6) — flagged in GAP.

---

## 5. THE AUTHORING PIPELINE

### 5.1 Source format (ADR-001)

**Recommended: YAML-with-schema, one file per content piece**, foldered by kind (`source/spells/fireball.rite.yaml`). Rationale: human-diffable (SPEC-001 §9.2 ownership/legibility ethos), git-reviewable, comment-bearing, and it round-trips through the same YAML-frontmatter export shape SPEC-001 §9.1 already uses for entries. Alternatives (TS-as-source, JSON) weighed in ADR-001. YAML is source; it compiles to the two artifacts of §1. *Confidence: Med — this is an ADR, not a canon derivation.*

### 5.2 Validation gates (author-time, ordered; first failure stops)

1. **Structural** — Zod parse against the content schema (§2). Fail ⇒ `E-1001 BodySchemaMismatch` with field paths (SPEC-001 §11).
2. **Referential** — every FK resolves: `DamageTypeId` → registry (§2.8), condition slugs → Condition set (§2.4), `zEntryRef` in statblocks → existing rite entries. Fail ⇒ `E-1704 DanglingReference`.
3. **PEL/atom** — every PEL expr parses, references whitelisted, depth ≤ caps; every effect-atom tree depth ≤ `MAX_ATOM_DEPTH`. Fail ⇒ `E-1701/E-1702`.
4. **Purity lint** — static check that no schema field smuggled a function/string-of-code (belt-and-suspenders over §2.0). Fail ⇒ `E-1705 NonDeclarativeContent`.
5. **SRD boundary** — `srdScope` present and consistent (§5.6). Fail ⇒ `E-1706 SrdScopeMissing`.
6. **Golden** — the piece's declared golden tests (§6) pass. Fail ⇒ build red.

Gates 1–5 run in <content-lint>; gate 6 runs in the test job. All six are CI-blocking (§6.5).

### 5.3 The compile step (author-time, not load-time)

Compile is **build-time** (produces the `CompiledRiteIndex` §2.9 shipped inside `@ash-archive/rites-5e`), for the perf reason in §7.2: `register()` and per-event `interrupts()` cannot afford to parse YAML or re-link FKs at the Table. Load-time (`register()`) does only: schema-shape verify of the compiled index, purity smoke test (§6.4), and mount. Author-time vs load-time split is explicit so the 80ms budget (04 §II; SPEC-001 §15) is never spent on parsing. *Confidence: High.*

### 5.4 Versioning & migration of content against schema evolution

- Every content schema carries `bodySchemaVersion` (SPEC-001 §2.2). The content build declares the `bodySchemaVersion` per kind it targets.
- Schema evolution follows SPEC-001 §14/§2.2: additive fields = minor version, no migration; field removal/reshape = major version + a **content migration** that transforms authored source, replayed against golden fixtures (mirrors SPEC-001 §16.7 "every shipped migration replays the previous version's golden fixtures").
- Content in a *bound Entry* (SPEC-001 §2.2 `EntryVersion.bodySchemaVersion`) migrates via the Foundation's own `migration.applied` event path (SPEC-001 §3.2). The Rite content build ships a `migrations/<from>-<to>.ts` per major bump; core replays it. **The Rite set never migrates canon in place** — it supplies the transform; the Foundation appends the migration event (I-2 append-only). *Confidence: High.*

### 5.5 Packaging & registration (`vault.rites.register`)

- Package: `@ash-archive/rites-5e`, semver `version` on the RiteSet (SPEC-001 §5.7 `'aa.rites.5e' semver`). Ships: the five pure functions, `schemas` map, `conditions` table, and the embedded `CompiledRiteIndex`.
- Registration: `vault.rites.register(set)` (SPEC-001 §5.7) → core runs the purity smoke test and validates `schemas`; on pass, mounts the set so `body.ext['aa.rites.5e']` validation (SPEC-001 §14.3) and the five hooks are live. Failure returns a `Result` error (SPEC-001 §11), never throws for a domain outcome (SPEC-001 §5 "errors are values").
- Homebrew registers as content *within* an already-registered set (Entry-level `body.ext`), not as a second RiteSet — consistent with SPEC-001 §5.7 "Homebrew = Entry-level overrides validated against `set.schemas`." *Confidence: High.*

### 5.6 SRD scope / licensing boundary (per-entry)

Every content piece carries `srdScope` (§2.0): `'srd-5.1'` (SRD 5.1 content boundary), `'homebrew'`, or `'provisional-homebrew'`. Rationale/anchor: SPEC-001 does not name a licensing model, so tracking mechanism is specified here and the *policy* (what may ship) is flagged **GAP-L** and **ADR-005** (which SRD version; attribution text placement; whether non-SRD packs are a separate registered set). The mechanism (a closed enum field + a build report enumerating every non-`srd-5.1` piece) is safe to specify; the legal policy is Marcus's to set. *Confidence: High on mechanism; the policy is an explicit GAP.*

---

## 6. THE ACCEPTANCE BAR — GOLDEN-TEST METHODOLOGY

A content piece is "correct and shippable" iff it passes structural validation (§5.2) **and** its golden tests (below) **and** the set-level determinism/purity harness.

### 6.1 The golden test unit — a rules interaction → expected hook output

A golden test is a pure triple: **(fixture world + combat fold state) × (query/event) → (expected `LegalityAnswer` | `InterruptOffer[]` | `DerivedValue`)**, asserted byte-exact (JSON). Example shapes:

- **Legality golden:** "Wizard, 0 level-1 slots left, in combat, action unspent → cast a level-1 spell ⇒ `legal:false, reason:'no-slot'`."
- **Interrupt golden:** "Creature A casts a spell within 60ft of Wizard B who has Counterspell prepared and a reaction available ⇒ `interrupts(action.spent{spell})` includes an offer for B keyed to A's event." (04 §II Counterspell.)
- **Derivation golden:** "Fireball at slot 5 ⇒ `derive` returns `8d6` (base 8d6? — content-defined) fire, DC = 8+prof+casterMod." (Values are content's; the test asserts the *derivation math*, not authored numbers.)
- **Concentration golden:** "Concentrating target takes 19 damage ⇒ triggered concentration-save offer, DC 10." (04 §II; SPEC-001 §3.2 `concentration.check`.)

Golden fixtures live in `spec-fixtures/rites-5e/` mirroring SPEC-001 §16.1's checked-in accept/reject tables.

### 6.2 Coverage requirements

- **Per piece:** ≥1 golden per declared hook the piece participates in (a passive Feature needs a `derive` golden; a reaction Feature needs an `interrupts` golden; an active spell needs `legality`+`derive`, plus `interrupts` if it `provokes` or `offersReactionInterrupts`).
- **Per interaction class** (the hard-won 5e edge cases, each a named golden suite): concentration break on damage; Counterspell-vs-Counterspell; Shield vs already-resolved hit; opportunity attack on forced vs voluntary movement; Cohort member death vs Cohort defeat (04 §II); legendary/lair action interrupts; save-ends condition on `condition.saved` (§3.2); half-on-save damage; advantage/disadvantage stacking (max one each — a `derive` invariant golden).
- **Coverage floor** aligns to SPEC-001 §16: 100% of the interpreter's atom handlers and PEL operators exercised by golden content; 90% line floor on `@ash-archive/rites-5e`.

### 6.3 The "does the table behave correctly" e2e check

Beyond unit goldens: an **event-replay e2e** that drives a scripted combat as an Ash event log (SPEC-001 §3.2 events) through the real combat fold (§5.6) + the registered RiteSet, and asserts the *composed hand* and *reaction ribbon* the composer would show at each turn (04 §II). This is the analog of SPEC-001 §16.2 fold-determinism but at the content layer: it proves data→behavior→Table, end to end. It asserts, e.g., "at Wizard's turn with these slots/conditions, the legal-first ranked hand is exactly [X,Y,Z]" (04 §II ranking: legal-first, stage-match second, muscle-memory third). *Confidence: High.*

### 6.4 Purity & determinism harness (the `register()` smoke test, expanded)

- **Purity smoke test** (SPEC-001 §5.7): call each hook twice with identical frozen inputs; assert deep-equal outputs; run under a sandbox that traps `Date.now`/`Math.random`/IO and fails on access. Fail ⇒ `register()` returns `E-1707 ImpureRiteFunction`.
- **Cross-runtime determinism** (SPEC-001 §5.6/I-8): the same golden triples replayed on Node, Tauri-Rust-hosted, and WASM must yield byte-identical JSON — extends SPEC-001 §16.2 to RiteSet outputs. Integer-only PEL (§4.7) is what makes this achievable.

### 6.5 CI gates (all blocking)

1. Content lint (§5.2 gates 1–5). 2. Golden suite (§6.1–6.2). 3. e2e table-behavior (§6.3). 4. Purity + cross-runtime determinism (§6.4). 5. Migration replay for any `bodySchemaVersion` bump (§5.4; SPEC-001 §16.7). 6. Performance budget (§7.2). 7. SRD-scope report generated and non-empty-`srd-5.1` diffs surfaced for review (§5.6). No content merges red. Mirrors SPEC-001 §16's CI posture. *Confidence: High.*

---

## 7. ERRORS, PERFORMANCE, AND MALFORMED-CONTENT BEHAVIOR

### 7.1 Error taxonomy (extends SPEC-001 §11; reserves the E-17xx Rites family)

SPEC-001 §11 owns E-10xx…E-16xx; the Rites family needs a reserved range. **Reserving E-17xx here is an interface extension to SPEC-001 §11 and therefore requires core sign-off — flagged ADR-003.** Proposed codes (all returned as `AAError` values, SPEC-001 §11, `retryable:false` unless noted):

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

### 7.2 Performance budget

The composer's **80ms first-response law** (Codex GENESIS 04 §II; SPEC-001 §15 `archive.subgraph` 50ms sits under it) bounds the hooks. Derived budgets (CI-asserted, SPEC-001 §15 harness style):

| Hook call | Budget | Why it holds |
|---|---|---|
| `legality()` single query | p99 ≤ 2ms | reads pre-linearized guards + folded combat state; no parse (§5.3) |
| full composed-hand recompose (N≈40 candidate actions) | p95 ≤ 20ms | inside the 80ms turn-start recompose (04 §II "re-rank … once, 280ms" — hook cost must be a fraction) |
| `interrupts(e)` per event | p99 ≤ 3ms | `triggerIndex` reverse lookup (§2.9), not a content scan |
| `derive()` single value | p99 ≤ 1ms | integer PEL walk, depth ≤ 12 |
| `compositionHints()` full folio | p95 ≤ 20ms | bounded by candidate count; ranking only |

If any hook risks the 80ms envelope under load, the composer degrades to unranked-but-legal (SPEC-001 §11 global law: "the Foundation never blocks play"). *Confidence: Med-High — budgets are derived from 04 §II + §15 by apportionment; the exact ms splits are estimates flagged in GAP.*

### 7.3 Defined behavior for malformed / partial / contradictory content

- **Malformed** (fails §5.2 at build) ⇒ never ships; CI red. At *runtime* (homebrew authored live), invalid ⇒ `E-1703`, stored `provisional-homebrew`, excluded from all five hooks (SPEC-001 §5.7), visible/repairable at the Desk. The Table shows valid content only; it never crashes on bad homebrew (SPEC-001 §11 never-block law).
- **Partial** (a Feature references a not-yet-authored Resource) ⇒ `E-1704` at build; at runtime a dangling ref makes the *piece* provisional-excluded, not the set — one bad spell never disables the RiteSet.
- **Contradictory** (two pieces claim the same `slug`, or a homebrew condition remaps a severity that a locked ruling fixed) ⇒ `E-1708`, routed to the Charter contradiction bench (SPEC-001 §7.4 — name/alias & explicit-contradiction detectors already exist; content contradiction is a same-shaped `ContradictionCase`). Human resolves (SPEC-001 §7.4 `minimal|clean|story`); until then the incoming piece is provisional-excluded. **No automatic merge** (consistent with SPEC-001 §13 conflict philosophy). *Confidence: High.*

---

## 8. ADR REGISTER (decisions that are NOT canon derivations — each needs a ruling)

**ADR-001 — Source authoring format.**
*Context:* content must be human-diffable, reviewable, and round-trip with SPEC-001 §9 export. *Options:* (a) YAML-per-file; (b) JSON-per-file; (c) TypeScript-as-source (typed literals). *Recommendation:* **(a) YAML**, comment-bearing and matching §9.1 frontmatter shape. *Consequences:* needs a YAML→compiled build; loses compile-time TS typing at author time (recovered via Zod gate §5.2). *What would change it:* if authors are exclusively engineers, (c) removes a toolchain layer.

**ADR-002 — Expression DSL vs pure code-plugins vs pure-data atoms.** *(The load-bearing one.)*
*Context:* SPEC-001 §5.6/§5.7 demand pure, deterministic hooks; content needs conditional expressivity. *Options:* (a) pure closed **Effect Atoms only** (no content-side expressions) — maximal determinism, but every predicate/edge case is an interpreter release; (b) **code-plugins** (content ships JS) — rejected: violates §5.6 purity/§2.0 and can't be cross-runtime-guaranteed (I-8); (c) **atoms + a constrained, total, integer-only PEL** for guards/amounts (§4.7). *Recommendation:* **(c)**. It keeps hooks pure (interpreter is fixed code; PEL is total and sandboxed), bounds homebrew without interpreter releases, and protects I-8 via integer-only arithmetic. *Consequences:* a small language to specify, test (§6.4), and version. *What would change it:* if golden content shows the atom set alone covers SRD + realistic homebrew, drop PEL and take (a) for simplicity.

**ADR-003 — Error-code range ownership (E-17xx).**
*Context:* SPEC-001 §11 owns the code space; Rites need codes. *Options:* (a) reserve E-17xx in the Rites package (this draft) and PR SPEC-001 §11 to bless it; (b) core pre-allocates a Rites range in a SPEC-001 minor. *Recommendation:* **(b)** — codes are a stable telemetered contract (SPEC-001 §11); core should own the registry. *Consequences:* a SPEC-001 §11 amendment (its governance: signed change note + version bump). *What would change it:* if RiteSets are meant to own private code ranges, (a).

**ADR-004 — `TriggerTag` vocabulary ownership.**
*Context:* reactions need a closed trigger vocabulary (§3.3); it maps 1:1 onto SPEC-001 §3.2 events. *Options:* (a) owned by `aa.rites.5e`; (b) promoted to core beside §3.2 with `VOCAB_VERSION`. *Recommendation:* **(a) for v1** (5e-specific), with a documented seam to promote if a second RiteSet needs it (SPEC-001 §18 "system-agnostic promise"). *Consequences:* a future system-agnostic RiteSet may duplicate concepts. *What would change it:* committing to a second system before v1 ships → (b).

**ADR-005 — SRD version & licensing policy.**
*Context:* mechanism is specified (§5.6); policy is not canon. *Options:* SRD 5.1 (CC-BY-4.0) only; SRD 5.1 + separately-licensed packs as distinct registered sets; SRD 5.2. *Recommendation:* **SRD 5.1 under CC-BY-4.0** as the v1 boundary, attribution carried in `WORLD.md`/package (SPEC-001 §9.1), non-SRD as future separate sets. *Consequences:* determines what content may ship in `@ash-archive/rites-5e`. *What would change it:* a licensing decision by Marcus. **This is a legal decision, not an engineering one — flagged for the owner.**

---

## 9. CONFIDENCE SUMMARY

| Section | Confidence | Note |
|---|---|---|
| 0–1 Architecture / SPEC-001 seam | **High** | §2.2 + §14.3 give the two-artifact model verbatim |
| 2 Content schemas | **High** (shapes) / **Med** (exact enum membership) | field *types* canon-driven; enum *contents* are 5e-domain first cuts |
| 3 Data→behavior binding | **High** | every row cites a §3.2 event / §5.7 hook |
| 4 Determinism / atoms / PEL | **Med-High** | mechanism sound (ADR-002); atom+PEL membership is first-draft |
| 5 Pipeline | **Med-High** | source format is ADR-001; compile/version/register are canon-derived |
| 6 Acceptance bar | **High** | mirrors SPEC-001 §16 methodology directly |
| 7 Errors / perf / malformed | **Med-High** | codes need ADR-003; ms budgets apportioned from §15+04 |
| 8 ADRs | n/a | five raised |

---

## 10. APPENDICES (deferred sub-schema bodies — placeholders, flagged GAP-A)

Appendix A (`zTargeting`, `zSaveSpec`, `zModifier` full), Appendix B (full Effect Atom union), Appendix C (`zInterruptOffer`, `zResourceExpr`, `zDiceExpr`, `zPredicate` full EBNF + Zod) are specified to interface grade above but their **exhaustive membership is deferred to the first golden-content pass** (§6), which is the correct forcing function — authoring `fireball`, `counterspell`, `shield`, `grapple`, `poisoned`, and one Cohort will reveal the true minimal complete atom set. Shipping the appendices before that pass would be invention. **GAP-A** tracks this.

---

## 11. BUILDER FRICTION INDEX & GAP REGISTER

### Builder Friction Index: **34 / 100**
*(0 = a Builder could implement with zero further decisions; 100 = blocked.)* The spine (two-artifact model, five-hook binding, atom+PEL determinism, golden-test bar, pipeline) is canon-anchored and unambiguous — a Builder can start the interpreter, schemas, and CI harness today. Friction is concentrated in (a) the exact atom/PEL/TriggerTag *membership*, deliberately deferred to the first golden-content pass as the correct forcing function, and (b) two decisions that are not the Builder's to make (E-17xx range ownership; SRD licensing policy). None of the open items block starting; all block *completing* the atom vocabulary.

### GAP REGISTER
- **GAP-A (atom/PEL/TriggerTag membership):** exact closed vocabularies are first-draft; must be finalized by authoring ~6 canonical pieces (§10). *Owner: Rite content lead. Blocks: content completeness, not scaffolding.*
- **GAP-B (E-17xx ownership):** codes reserved provisionally; SPEC-001 §11 amendment needed (ADR-003). *Owner: Foundation.*
- **GAP-L (SRD licensing policy):** mechanism ready; legal policy undecided (ADR-005). *Owner: Marcus — legal, not engineering.*
- **GAP-P (perf ms splits):** hook budgets apportioned from §15+04 §II by estimate; must be measured against the seeded harness (SPEC-001 §15). *Owner: Foundation perf harness.*
- **GAP-M (modifier precedence):** the fixed fold order (§4.3) is a defensible first cut; validate against adv/dis and half-on-save goldens. *Owner: Rite content lead.*
- **GAP-D (derive/roll boundary edge cases):** confirm every SRD "roll now, use result" case fits the `derive`-returns-formula / Ash-rolls split (§4.7). *Owner: golden-content pass.*

---
*This draft is subordinate to SPEC-001. Nothing herein amends the Foundation; the two seams it touches (E-17xx in §11, and blessing `body.ext['aa.rites.5e']` schemas at register) are raised as ADRs against SPEC-001's governance, not assumed.*
