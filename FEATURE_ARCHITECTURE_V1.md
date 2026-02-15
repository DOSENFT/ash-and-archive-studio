# Ash & Archive: The Studio — Feature Architecture Blueprint
## Version 1.0 — Feature Ideation Session — February 15, 2026

---

# ORIGINAL SESSION PROMPT (Preserved for Future Reference)

> Feature ideation session, extremely powerful session tonight. We need to figure out, powerfully plan, savant caliber strategize and plan for each feature we are aiming to offer, and do so as a 7 figure, executive senior dev mindset built for quality, astonishing performance and longevity of performance, jaw dropping power, and alcatraz security. Im talking about World Building Engine, Campaign Building, DM Training Academy, The Toy Method.
>
> Every powerful feature within these categories (extremely powerful rp training, voice acting training, improv training, etc. Im talking the world builder engine. The campaign builder features. AI done extremely smoothly without massive files. Interactive city builder, dungeon designer, geography and climate modeling, etc. the brilliantly smooth connection to World Anvil. Story spine and three-act structure tools, Dynamic timeline with branching possibilities, Session planner with pacing guides, Lore integration and continuity tracking, Plot thread management system. Voice acting fundamentals and exercises, Improvisation drills and confidence builders, Character physicality workshops, Pacing and dramatic timing mastery, Handling difficult player situations. NPC Toys: Personality, motivation, and quirk modules, World Toys: Plug-and-play locations and environments, Lore Toys: Connectable history and mythology pieces, Encounter Toys: Scalable challenge frameworks, Combine freely for infinite variety.
>
> All of these powerful features must be brilliantly and masterfully and accurately mapped to a flawless "how exactly it will be accomplished masterfully" strategy and plan/blueprint/tool. Feature ideation, concrete features that will work extremely well in execution, longevity and smoothness, and ultimate insanely immersive and interactive/valuable user experience. We are aiming to perfectly execute our planned features and how we will powerfully and effectively implement everything promised in the app. Innovation and creativity is paramount. Efficiency and security is paramount.
>
> Remember our budget of <$20 until this is so well performing that its capable of making money. Remember, this must well exceed earning the right to be up to $49/month and more. Exceptional in all fronts. 7 figure quality.

**Reference Links Provided:**
- https://github.com/jokerhutt/ludolang — Duolingo-inspired learning platform (hierarchical content model)
- https://github.com/Naresh-Khatri/3d-portfolio — 3D interactive portfolio with Spline, GSAP, Framer Motion
- https://coss.com/ui — 449-component UI library
- Various React community examples

---

## Executive Summary

**Vision:** Transform DMs into elite storytellers through professional training, world-building tools, and modular content creation — all for $49/month while staying under $20/month infrastructure until profitable.

**Four Pillars:**
1. World Building Engine
2. Campaign Building
3. DM Training Academy
4. The Toy Method

---

## Current Foundation (Phase 2 Complete)

**Established:**
- React 18 + TypeScript + Vite + Tailwind
- Dashboard: SessionNexus, CampaignHub, TheForge, WorldPulse, ToyDock, CommandPalette
- TypeScript interfaces: Campaign, Session, PlotThread, Training, Skill, Achievement, WorldActivity, Toy
- Design system: 4-pillar colors (arcane/cyan, ember/amber, verdant/green, eldritch/purple)
- Hooks: useSessionProximity, useDashboardMode, useCommandPalette
- Full landing page + routing

**Key Files:**
- `src/data/mockDashboardData.ts` — All TypeScript interfaces
- `src/components/dashboard/*` — 15+ components
- `src/styles/globals.css` — Design tokens, animations

---

## Pillar 1: World Building Engine

### Features

| Feature | Implementation | Complexity |
|---------|---------------|------------|
| **Interactive City Builder** | Grid-based district editor with demographics, atmosphere, danger levels | Medium |
| **Procedural Dungeon Designer** | Room palette + corridor tool + encounter overlay on grid canvas | Medium |
| **Geography & Climate Modeling** | Terrain tiles, weather patterns, seasonal cycles | Low-Medium |
| **Faction Relationship Mapping** | D3.js force-directed graph with alliance/rivalry dynamics | Medium |
| **AI Name/Description Generation** | Client-side Markov chains + pre-bundled suggestion banks (50KB) | Low |

### Core Interfaces

```typescript
interface City {
  id: string; name: string; population: number
  districts: District[]
  demographics: { races: {race: string, percentage: number}[] }
  government: GovernmentType
}

interface Dungeon {
  id: string; name: string; theme: DungeonTheme
  difficulty: 1-5; floors: DungeonFloor[]
  loot: LootTable
}

interface Faction {
  id: string; name: string; type: FactionType
  influence: number; relationships: FactionRelationship[]
  goals: FactionGoal[]; secrets: string[]
}
```

### Components to Build

```
src/components/worldbuilding/
├── MapEditor/
│   ├── MapCanvas.tsx         # Grid-based terrain editor
│   ├── TerrainPalette.tsx    # Terrain type selector
│   └── POIMarker.tsx         # Points of interest
├── CityBuilder/
│   ├── CityCanvas.tsx        # District placement
│   ├── DistrictPanel.tsx     # Configure district details
│   └── DemographicsChart.tsx # Population breakdown
├── DungeonDesigner/
│   ├── DungeonCanvas.tsx     # Room/corridor grid
│   ├── RoomPalette.tsx       # Room types
│   └── EncounterOverlay.tsx  # Place encounters
└── FactionSystem/
    ├── FactionGraph.tsx      # D3 relationship visualization
    └── FactionCard.tsx       # Individual faction details
```

---

## Pillar 2: Campaign Building

### Features

| Feature | Implementation | Complexity |
|---------|---------------|------------|
| **Story Spine & Three-Act Structure** | Act editor with beat board visualization | Medium |
| **Dynamic Timeline with Branching** | Visual timeline canvas with branch diagram | Medium-High |
| **Session Planner with Pacing Guides** | Drag-drop encounter slots + pacing curve visualization | Medium |
| **Lore Integration & Continuity Tracking** | Searchable index + cross-reference graph | Medium |
| **Plot Thread Management** | Status tracking (active/dormant/resolved) + dependencies | Low |
| **NPC Relationship Web** | Force-directed graph with secrets/motivations | Medium |

### Core Interfaces

```typescript
interface StorySpine {
  id: string; campaignId: string
  premise: string; acts: StoryAct[]
  themes: string[]; centralConflict: string
  stakes: { personal: string; local: string; cosmic: string }
}

interface StoryAct {
  number: 1 | 2 | 3; name: string
  keyEvents: KeyEvent[]
  possibleBranches: StoryBranch[]
  status: 'planning' | 'active' | 'completed'
}

interface SessionPlan {
  sessionId: string
  pacingGuide: PacingSection[]  // opening, rising, peak, falling, closing
  encounters: PlannedEncounter[]
  contingencies: Contingency[]
}

interface NPCRelationshipWeb {
  npcs: NPCNode[]
  relationships: NPCRelationship[]  // family, friend, rival, romantic, secret
}
```

### Components to Build

```
src/components/campaign/
├── StorySpine/
│   ├── ActEditor.tsx         # Three-act structure
│   ├── BeatBoard.tsx         # Story beats visualization
│   └── BranchDiagram.tsx     # Branching possibilities
├── Timeline/
│   ├── CampaignTimeline.tsx  # Visual timeline
│   ├── EventCard.tsx         # Individual events
│   └── CalendarEditor.tsx    # Custom calendar system
├── SessionPlanner/
│   ├── SessionBuilder.tsx    # Plan session structure
│   ├── PacingCurve.tsx       # Energy level visualization
│   └── EncounterSlot.tsx     # Drag-drop encounters
├── LoreManager/
│   ├── LoreIndex.tsx         # Searchable database
│   └── CrossReferenceMap.tsx # Connections visualization
└── NPCWeb/
    ├── RelationshipWeb.tsx   # Force-directed NPC graph
    └── SecretTracker.tsx     # Who knows what
```

---

## Pillar 3: DM Training Academy

### Features (Ludolang-Inspired Hierarchy)

**Structure:** Path → Module → Lesson → Exercise

| Path | Modules | Exercise Types |
|------|---------|---------------|
| **Voice Acting** | Accent Fundamentals, Character Voices, Emotional Range | Voice recording, accent drills |
| **Improvisation** | Yes-And Basics, Handling Curveballs, NPC Improv | Scenario response, timing drills |
| **Worldbuilding** | Faction Design, Culture Creation, Geography | Description challenges |
| **Storytelling** | Pacing Mastery, Dramatic Tension, Plot Threading | Beat analysis |
| **Table Management** | Difficult Players, Group Dynamics, Session Flow | Conflict scenarios |

### Core Interfaces

```typescript
interface TrainingPath {
  id: string; name: string
  pillar: 'voice' | 'improv' | 'worldbuilding' | 'storytelling' | 'table_management'
  color: 'arcane' | 'ember' | 'verdant' | 'eldritch'
  modules: TrainingModule[]
  estimatedHours: number
}

interface Exercise {
  id: string; type: ExerciseType
  instructions: string
  recordingEnabled: boolean  // For voice exercises
  rubric?: ExerciseRubric
}

type ExerciseType =
  | 'voice_recording' | 'scenario_response' | 'timing_drill'
  | 'description_challenge' | 'improv_prompt' | 'character_switch'

interface UserProgress {
  totalXP: number; level: number
  currentStreak: number; longestStreak: number
  pathProgress: { pathId: string; progress: number }[]
  achievements: Achievement[]
  practiceLog: PracticeSession[]
}
```

### Components to Build

```
src/components/academy/
├── Paths/
│   ├── PathSelector.tsx      # Choose training path
│   ├── PathProgress.tsx      # Progress visualization
│   └── PathMap.tsx           # Visual path representation
├── Modules/
│   ├── ModuleViewer.tsx      # Module content display
│   └── LessonCard.tsx        # Individual lesson
├── Exercises/
│   ├── VoiceRecorder.tsx     # MediaRecorder API (local only)
│   ├── ImprovPrompt.tsx      # Improvisation drills
│   ├── TimingDrill.tsx       # Pacing practice
│   └── ScenarioPlayer.tsx    # Interactive scenarios
└── Progress/
    ├── XPCounter.tsx         # Animated XP display
    ├── StreakTracker.tsx     # Streak maintenance
    ├── SkillRadar.tsx        # Radar chart skills
    └── AchievementGallery.tsx
```

### Voice Recording (Zero Infrastructure)

```typescript
// Uses browser MediaRecorder API
// Recordings stored as Blobs in IndexedDB
// Never uploaded — complete user privacy
// Playback for self-assessment only
```

---

## Pillar 4: The Toy Method

### Toy Categories

| Category | Components | Example Output |
|----------|-----------|----------------|
| **NPC Toys** | personality_trait, motivation, quirk, secret, voice, appearance, mannerism | "Gruff dwarf blacksmith hiding a dark secret" |
| **Location Toys** | atmosphere, notable_feature, hidden_element, inhabitants, history_hook | "Abandoned temple with whispering walls" |
| **Encounter Toys** | objective, complication, twist, environmental_hazard, time_pressure | "Heist interrupted by rival thieves + flooding" |
| **Lore Toys** | historical_event, legend, prophecy, mystery, cultural_practice | "The Night of Broken Crowns prophecy" |

### Core Interfaces

```typescript
interface ToyExtended extends Toy {
  category: ToyCategory
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  components: ToyComponent[]
  combinableWith: string[]
  source: 'builtin' | 'user' | 'ai_generated'
}

interface ToyComponent {
  id: string
  type: ComponentType  // personality_trait, motivation, quirk, etc.
  value: string
  locked: boolean      // Can't be randomized
  weight?: number      // For weighted selection
}

interface ToyCombination {
  inputToys: string[]
  outputType: ToyCategory
  generationRules: CombinationRule[]
}
```

### Components to Build

```
src/components/toys/
├── ToyWorkbench/
│   ├── ToyBuilder.tsx        # Create/edit toys
│   ├── ComponentSelector.tsx # Pick components
│   ├── RandomizeButton.tsx   # Re-roll unlocked components
│   └── ToyPreview.tsx        # See result
├── ToyLibrary/
│   ├── ToyGrid.tsx           # Browse all toys
│   ├── ToyFilters.tsx        # Filter by type/tag
│   └── ToyCard.tsx           # Individual display
└── ToyCombiner/
    ├── CombinationCanvas.tsx # Drag toys to combine
    ├── RecipeBook.tsx        # Saved combinations
    └── OutputPreview.tsx     # Preview result
```

### AI Integration (Budget-Conscious)

**Tier 1 — Zero Cost:**
- Client-side Markov chain name generators (trained on public domain fantasy corpora)
- Pre-bundled suggestion banks (~50KB compressed JSON)
- Template-based descriptions with variable substitution

**Tier 2 — Post-Revenue:**
- Cloudflare Workers edge functions (100K free requests/day)
- Cached responses in IndexedDB (same prompt = cached)

---

## World Anvil Integration

### OAuth Flow

```typescript
// PKCE flow for security
1. Generate code_verifier and code_challenge
2. Redirect to worldanvil.com/oauth/authorize
3. Receive callback with authorization code
4. Exchange code for tokens
5. Store tokens encrypted in IndexedDB
```

### Sync Strategy

**Entity Mappings:**
| Ash & Archive | World Anvil |
|---------------|-------------|
| Campaign | World |
| NPC | Character |
| Location | Location |
| Faction | Organization |
| Lore Entry | Article |

**Sync Logic:**
- Local-first with background sync
- Last-write-wins with conflict detection
- Manual conflict resolution UI
- Sync intervals: Campaigns (5min), NPCs (2min), Locations (5min)

---

## Storage Architecture

### Phase 1: Client-Side ($0)

```
localStorage (< 5KB items)
├── User preferences
├── Session state
└── UI configuration

IndexedDB (large data)
├── Campaigns & maps
├── Training progress
├── Toy collections
├── Voice recordings (Blob)
└── World Anvil sync cache
```

### Phase 2: Cloud Sync (Post-Revenue)

```
Local-first architecture
├── IndexedDB primary store
├── Background sync to cloud
├── Conflict resolution layer
└── Offline-capable
```

---

## State Management

### Strategy

| State Type | Solution | Example |
|------------|----------|---------|
| UI State | React useState | Modal open, selected tab |
| Feature State | React Context | Map editing mode, current tool |
| Domain State | Zustand | Campaigns, NPCs, Toys |
| Persistent State | IndexedDB | User progress, saved worlds |

### Stores to Create

```typescript
// stores/useCampaignStore.ts
// stores/useTrainingStore.ts
// stores/useToyStore.ts
// stores/useWorldAnvilStore.ts
```

---

## Security Architecture

### Authentication
- Magic link email (no password storage)
- OAuth providers: Discord, Google (D&D community loves Discord)
- httpOnly session cookies

### Data Protection
- Client-side encryption for sensitive fields (NPC secrets, plot twists)
- CSP headers configured in Vite
- DOMPurify for all user HTML input
- No inline event handlers

### CSP Headers
```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' fonts.googleapis.com
connect-src 'self' worldanvil.com api.worldanvil.com
media-src 'self' blob:
```

---

## Performance Strategy

### Bundle Splitting

| Route | Target Size | Target LCP |
|-------|-------------|------------|
| /dashboard | <60KB | <1.5s |
| /world/* | <80KB | <1.8s |
| /campaign/* | <70KB | <1.6s |
| /academy/* | <60KB | <1.5s |
| /toys/* | <50KB | <1.4s |

### Optimizations
- Route-based lazy loading (`React.lazy`)
- Virtualization for lists (TanStack Virtual)
- Service Worker for offline support
- Stale-while-revalidate caching

---

## Phased Rollout

### Phase 1: MVP (Weeks 1-8) — $0/month

**World Building:**
- Simple grid-based map canvas
- Basic faction card system
- City district editor

**Campaign:**
- Story spine editor (3-act)
- Basic timeline (list view)
- Session planner (checklist)

**Training:**
- 5 core modules (text + exercises)
- Basic progress tracking
- Streak system
- 10 achievements

**Toys:**
- NPC generator (5 component types)
- Location generator (4 component types)
- Basic combination system

### Phase 2: Enhancement (Weeks 9-16) — <$5/month

**World Building:**
- Multi-layer maps
- Faction relationship graph (D3)
- Dungeon designer
- Climate/weather system

**Campaign:**
- Visual timeline editor
- NPC relationship web
- Cross-reference system
- Plot thread dependencies

**Training:**
- Voice recording (local)
- 50+ modules
- Skill radar
- Daily challenges

**Toys:**
- All 6 categories
- Advanced combinations
- AI suggestions (Tier 1)

**World Anvil:**
- OAuth connection
- Two-way sync
- Conflict resolution

### Phase 3: Scale (Weeks 17-24) — <$15/month

- Procedural terrain generation
- AI session summaries
- Improv scenario library (100+)
- Toy sharing/export

---

## Cost Analysis

### Phase 1-2: $0/month
- Vercel (hosting): Free tier
- Cloudflare (CDN): Free tier
- IndexedDB: Client-side
- Resend (email): Free tier (100/day)

### Phase 3: <$15/month
- Cloudflare Workers: Free tier (100K/day)
- Potentially Vercel Pro if exceeded: $20/month

**Mitigation:** Stay on Cloudflare Pages (more generous free tier) instead of Vercel Pro.

---

## Verification Plan

### Manual Testing
1. `npm run dev` — Start development server
2. Navigate to `/dashboard` — Verify existing components
3. Test new routes as implemented
4. Check responsive design (360px to 1440px)
5. Verify accessibility with keyboard navigation
6. Test `prefers-reduced-motion` disables animations

### Automated Testing
- Vitest for unit tests (data layer, hooks)
- Playwright for E2E (critical user flows)
- Lighthouse CI for performance budgets

### Quality Gates
- TypeScript strict mode passing
- ESLint clean
- Bundle size under budget
- WCAG 2.2 AA compliance

---

## Implementation Priority Order

1. **Storage abstraction layer** — Foundation for all data
2. **Extend TypeScript interfaces** — Define all new types in mockDashboardData.ts
3. **Toy system expansion** — Immediate value, validates modular concept
4. **Training modules** — Differentiator, justifies premium
5. **Campaign tools** — Story spine, timeline
6. **World building** — Maps, dungeons, factions
7. **World Anvil sync** — After core features work
8. **AI enhancements** — After revenue

---

## Files to Modify/Create

**Extend:**
- `src/data/mockDashboardData.ts` — Add all new interfaces
- `src/App.tsx` — Add new routes
- `tailwind.config.js` — Any new animation tokens

**Create:**
- `src/stores/` — Zustand stores
- `src/components/worldbuilding/` — World building components
- `src/components/campaign/` — Campaign components
- `src/components/academy/` — Training components
- `src/components/toys/` — Extended toy system
- `src/lib/storage.ts` — Storage abstraction
- `src/lib/worldanvil/` — World Anvil integration
- `src/lib/ai/` — AI generation utilities

---

## How to Resume

**Next Session Prompt:**
> "Let's continue building Ash & Archive. Read FEATURE_ARCHITECTURE_V1.md and SESSION_MEMORY.md to understand where we are. I want to start implementing [specific feature]."

**Quick Reference:**
- Landing: `http://localhost:5173/`
- Dashboard: `http://localhost:5173/dashboard`
- Run: `npm run dev`
