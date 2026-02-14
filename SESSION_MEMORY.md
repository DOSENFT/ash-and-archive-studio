# Ash & Archive: The Studio — Session Memory

**Session Date:** February 14, 2026
**Project:** React Forge (Ash & Archive: The Studio)
**Phase:** Dashboard Implementation (Phase 2)

---

## Vision & Ambition

**Core Concept:** "The Director's Sanctum" — A dashboard that treats the DM as a director of an epic production, not just a user of software.

**Metaphor:** A theatrical director's booth meets a fantasy cartographer's study meets a master craftsman's workbench.

**Target User:** Dungeon Masters who want to elevate their craft, prepare sessions efficiently, and track their growth as storytellers.

---

## What Was Built This Session

### Dashboard Architecture (Complete)

```
src/
├── pages/
│   ├── LandingPage.tsx          # Original landing page (preserved)
│   └── Dashboard.tsx            # NEW: Main dashboard orchestrator
├── components/
│   ├── landing/                 # All 11 landing components (preserved)
│   └── dashboard/
│       ├── CommandBar.tsx       # Top nav with search, modes, user
│       ├── CommandPalette.tsx   # Full-screen command modal (Cmd+K)
│       ├── CampaignHub.tsx      # Hero card for active campaign
│       ├── TheForge.tsx         # Training progress panel
│       ├── WorldPulse.tsx       # Activity feed with timeline
│       ├── ToyDock.tsx          # Bottom toolbar with tools
│       ├── SessionNexus/
│       │   ├── index.tsx        # Container
│       │   ├── SessionCountdown.tsx
│       │   ├── PrepChecklist.tsx
│       │   └── SessionHistory.tsx
│       ├── shared/
│       │   ├── DashboardCard.tsx
│       │   ├── ProgressRing.tsx
│       │   ├── ForgeProgressBar.tsx
│       │   └── AchievementBadge.tsx
│       └── index.ts
├── hooks/
│   ├── useCommandPalette.ts     # Keyboard shortcuts, search
│   ├── useDashboardMode.ts      # Studio/Prep/Training/World modes
│   ├── useSessionProximity.ts   # Countdown calculations
│   └── index.ts
├── data/
│   ├── mockDashboardData.ts     # TypeScript interfaces + mock data
│   └── index.ts
└── styles/
    └── globals.css              # Extended with dashboard utilities
```

### Routes Established
- `/` → Landing Page
- `/dashboard` → Director's Dashboard

---

## Design Philosophy & Decisions

### 1. Psychological Design Principles
- **Flow State Architecture:** Reduce decision fatigue with smart defaults
- **Mastery Visualization:** Progress is celebrated, not hidden
- **Creative Studio Energy:** Warm, inviting workspace with ambient life
- **Contextual Intelligence:** Dashboard morphs based on session proximity

### 2. Visual Language
- **Card Depths:** 3-tier system (depth-1 hero, depth-2 standard, depth-3 nested)
- **Color Semantic:**
  - `arcane` (cyan) → Primary actions, navigation
  - `ember` (amber) → Training, urgency, fire themes
  - `verdant` (green) → Success, world-building
  - `eldritch` (purple) → Secondary, mystical
- **Glassmorphism:** Cards use backdrop blur with subtle borders
- **Forge Fire:** Vertical gradient animations for training elements

### 3. Interaction Patterns
- **Keyboard-First:** Command palette (Cmd+K), full keyboard navigation
- **Mode Switching:** Studio → Prep → Training → World (persists to localStorage)
- **Contextual Morphing:** Layout shifts based on session proximity
- **Drag & Drop:** Toys can be dragged (foundation laid)

### 4. Accessibility Commitments
- WCAG 2.2 AA compliance target
- `prefers-reduced-motion` respected globally
- ARIA labels on all interactive elements
- Focus indicators with arcane color
- 44x44px minimum touch targets

---

## Key Patterns Established

### Component Pattern
```tsx
// Dashboard components follow this structure:
export default function ComponentName({
  data,
  onAction,
  // ...props
}: ComponentProps) {
  return (
    <DashboardCard depth={2} padding="md">
      {/* Header */}
      {/* Content */}
      {/* Actions */}
    </DashboardCard>
  )
}
```

### Color Classes (Static for Tailwind)
```tsx
// Use object maps instead of template literals
const colorClasses = {
  arcane: 'bg-arcane/10 text-arcane',
  ember: 'bg-ember/10 text-ember',
  // ...
}
```

### Animation Tokens
```css
--duration-fast: 120ms;    /* Micro-interactions */
--duration-base: 180ms;    /* Standard transitions */
--duration-enter: 240ms;   /* Element entry */
--duration-complex: 320ms; /* Multi-step animations */
--ease-forge: cubic-bezier(0.22, 1, 0.36, 1);
```

---

## Mock Data Structure

```typescript
interface DashboardData {
  user: { name, avatar, tier, trainingStreak }
  nextSession: { id, campaignId, campaignName, date, players, prepProgress }
  activeCampaign: { id, name, artUrl, currentArc, stats, plotThreads }
  training: { currentStreak, skills[], nextModule, recentAchievements[] }
  worldActivity: Array<{ id, type, name, action, timestamp }>
  recentToys: Array<{ id, name, type, icon }>
  prepTasks: Array<{ id, text, completed }>
  recentSessions: Array<{ id, name, date, campaign, rating }>
}
```

---

## Future Roadmap

### Immediate Next Steps
1. **Polish:** Animations, micro-interactions, hover states
2. **Responsive:** Tablet and mobile adaptations
3. **Achievement Celebrations:** Full-screen particle bursts
4. **Real Data Integration:** Replace mock data with API calls

### Phase 2 Expansion
- Authentication system
- World Anvil integration
- Training Academy modules
- Campaign management CRUD
- Session notes editor
- NPC/Location/Item generators ("Toys")

### Phase 3 Vision
- AI-powered session prep suggestions
- Voice training with audio recording
- Collaborative campaign sharing
- Mobile companion app

---

## Technical Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "tailwindcss": "^3.4.3",
  "typescript": "^5.2.2",
  "vite": "^5.2.0"
}
```

---

## Brand Voice & Tone

- **Empowering:** "You are the director of this epic"
- **Craftsman Energy:** Tools feel tactile and premium
- **Fantasy-Grounded:** Metaphors from forging, archives, storytelling
- **Professional but Warm:** Not corporate, not childish

---

## Session Proximity States

| Days Until | State       | Color  | Message             |
|------------|-------------|--------|---------------------|
| 7+         | distant     | arcane | "Time to Build"     |
| 2-6        | approaching | ember  | "Preparation Phase" |
| 1          | imminent    | ember  | "Final Preparations"|
| 0          | today       | ember  | "SHOWTIME"          |

---

## Files Modified This Session

1. `package.json` — Added react-router-dom
2. `src/App.tsx` — Added BrowserRouter and routes
3. `src/styles/globals.css` — Added dashboard utility classes
4. `tailwind.config.js` — Added new animations and keyframes

## Files Created This Session

- All dashboard components (15 files)
- All hooks (3 files)
- Mock data (1 file)
- Index files (4 files)

---

## How to Resume

1. Run `npm run dev`
2. Landing page: `http://localhost:5173/`
3. Dashboard: `http://localhost:5173/dashboard`
4. Continue from "Immediate Next Steps" above

---

## Closing Notes

The foundation is solid. The dashboard implements the full "Director's Sanctum" vision with:
- All major panels (Session Nexus, Campaign Hub, The Forge, World Pulse, Toy Dock)
- Command palette with keyboard shortcuts
- Mode switching with persistence
- Session proximity awareness
- Accessibility foundations
- Responsive foundations (needs mobile polish)

The landing page remains untouched and beautiful.

**Next session:** Focus on polish, responsive design, and connecting to real data.
