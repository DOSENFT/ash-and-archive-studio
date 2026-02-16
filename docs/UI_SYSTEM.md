# Ash & Archive — UI Design System

> **Single source of truth** for all design tokens, components, and patterns.
> Updated: 2026-02-15

---

## 1. Design Tokens

### Colors

```
Backgrounds (void scale):
├── void-0: #070b10  — Deepest black, hero backgrounds, page base
├── void-1: #0d141d  — Card backgrounds, sections, elevated surfaces
└── void-2: #141d28  — Interactive surfaces, hovers, inputs

Text (forge scale):
├── forge-0: #f5f7fb  — Headlines, primary text, high contrast
├── forge-1: #c4ceda  — Body text, descriptions, paragraphs
└── forge-2: #8d98a7  — Muted text, labels, secondary info

Accents (pillar-mapped):
├── arcane:   #3dd2ff  — Cyan  — Primary actions, World Building, links
├── ember:    #f4b545  — Amber — Campaign, urgency, fire themes, warnings
├── verdant:  #39d98a  — Green — Training, success, completion
└── eldritch: #8b5cf6  — Purple — Toys, mystical, secondary actions

Semantic:
├── success: #39d98a  (verdant)
├── warning: #f4b545  (ember)
├── error:   #ff6b6b
└── info:    #3dd2ff  (arcane)
```

### Typography

```
Font Families:
├── Display:  'Space Grotesk', sans-serif  — Headlines, titles, CTAs
├── Body:     'IBM Plex Sans', sans-serif  — Body text, descriptions
└── Mono:     'JetBrains Mono', monospace  — Labels, tags, code, metrics

Font Weights:
├── Regular: 400  — Body text
├── Medium:  500  — Emphasis, subheadings
├── Semibold: 600 — Section titles
└── Bold:    700  — Display headlines

Type Scale:
├── 7xl: 72px  — Hero headlines
├── 6xl: 60px  — Hero (tablet)
├── 5xl: 48px  — Section headlines
├── 4xl: 36px  — Section (tablet)
├── 3xl: 30px  — Subheadings
├── 2xl: 24px  — Card titles
├── xl:  20px  — Large body
├── lg:  18px  — Enhanced body
├── base: 16px — Body text
├── sm:  14px  — Labels, mono text
└── xs:  12px  — Micro text, badges
```

### Spacing

```
8px rhythm system:
├── 0:  0px
├── 1:  4px   — Micro gaps
├── 2:  8px   — Inline spacing
├── 3:  12px  — Tight padding
├── 4:  16px  — Standard padding
├── 5:  20px  — Component gaps
├── 6:  24px  — Section spacing
├── 8:  32px  — Card padding
├── 10: 40px  — Large gaps
├── 12: 48px  — Card padding (desktop)
├── 16: 64px  — Section padding
├── 20: 80px  — Section padding (mobile)
├── 24: 96px  — Section padding (tablet)
└── 32: 128px — Section padding (desktop)

Container:
├── max-width: 1280px (max-w-7xl)
├── padding-x: 16px (mobile), 24px (tablet), 32px (desktop)
```

### Border Radius

```
├── sm:   6px   — Inputs, small elements
├── md:   8px   — Buttons, tags
├── lg:   12px  — Cards, badges
├── xl:   16px  — Large cards
├── 2xl:  24px  — Feature cards
└── full: 9999px — Pills, avatars
```

### Shadows & Elevation

```
Glass morphism:
├── Glass card: bg-void-1/80 backdrop-blur-md border border-white/10
├── Elevated:   bg-void-2/90 backdrop-blur-lg border border-white/5

Glows:
├── Arcane glow:  shadow-[0_0_30px_rgba(61,210,255,0.3)]
├── Ember glow:   shadow-[0_0_30px_rgba(244,181,69,0.3)]
├── Verdant glow: shadow-[0_0_30px_rgba(57,217,138,0.3)]
├── Eldritch glow: shadow-[0_0_30px_rgba(139,92,246,0.3)]

Hover intensity: 0.4 opacity
Active intensity: 0.5 opacity
```

### Motion

```
Durations:
├── fast:    120ms  — Hover, focus, micro-interactions
├── base:    180ms  — Buttons, toggles, state changes
├── enter:   240ms  — Panels, cards, modals appearing
└── complex: 320ms  — Page transitions, complex sequences

Easing:
├── forge:  cubic-bezier(0.22, 1, 0.36, 1)   — Default, smooth decel
├── bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55) — Playful elements
└── linear: linear — Progress bars, continuous

Keyframes:
├── fade-in-up:   translateY(20px) → 0, opacity 0 → 1
├── ember-rise:   translateY(0) → -100vh, scale, rotate (particle)
├── breathing:    scale(1) → 1.03 → 1 (subtle pulse)
├── slide-up:     translateY(10px) → 0 (accordion)
└── slide-down:   height 0 → auto (accordion)

Reduced motion:
└── All animations reduce to opacity-only or instant
```

---

## 2. Component Primitives

### Button

```
Variants:
├── primary   — bg-arcane text-void-0, glow on hover
├── secondary — bg-void-2 text-forge-0, border-white/10
├── ghost     — transparent, text-arcane, bg on hover
├── danger    — bg-error text-void-0
└── ember     — bg-ember text-void-0 (campaign actions)

Sizes:
├── sm: px-4 py-2 text-sm
├── md: px-6 py-3 text-base (default)
└── lg: px-8 py-4 text-lg

States:
├── default, hover, active, focus, disabled, loading

Specs:
├── Border radius: rounded-xl (12px)
├── Font: font-semibold
├── Transition: all 180ms forge ease
├── Focus ring: ring-2 ring-arcane ring-offset-2 ring-offset-void-0
├── Disabled: opacity-50 cursor-not-allowed
└── Loading: spinner + "Loading..." text
```

### Card

```
Variants:
├── glass    — bg-void-1/80 backdrop-blur-md border-white/10
├── solid    — bg-void-1 border-void-2
├── outline  — bg-transparent border-white/10
└── elevated — bg-void-2/90 backdrop-blur-lg shadow-lg

States:
├── default, hover (lift + glow), selected (accent border)

Specs:
├── Border radius: rounded-2xl (16px)
├── Padding: p-6 (mobile), p-8 (desktop)
├── Hover: translateY(-2px) + accent glow
└── Border: border border-white/10
```

### Badge

```
Variants:
├── default  — bg-void-2 text-forge-1
├── info     — bg-arcane/20 text-arcane
├── success  — bg-verdant/20 text-verdant
├── warning  — bg-ember/20 text-ember
├── error    — bg-error/20 text-error
├── arcane   — bg-arcane/20 text-arcane (world building)
├── ember    — bg-ember/20 text-ember (campaign)
├── verdant  — bg-verdant/20 text-verdant (training)
└── eldritch — bg-eldritch/20 text-eldritch (toys)

Specs:
├── Border radius: rounded-full
├── Padding: px-3 py-1
├── Font: text-xs font-medium uppercase tracking-wide
└── Font family: font-mono (JetBrains Mono)
```

### Input

```
Variants:
├── text     — Standard text input
├── search   — With search icon prefix
├── textarea — Multi-line
└── select   — Dropdown (custom styled)

States:
├── default, focus, error, disabled

Specs:
├── Background: bg-void-2
├── Border: border border-white/10
├── Border radius: rounded-lg (8px)
├── Padding: px-4 py-3
├── Focus: border-arcane ring-1 ring-arcane/50
├── Error: border-error ring-1 ring-error/50
├── Placeholder: text-forge-2
└── Text: text-forge-0
```

### Skeleton

```
Variants:
├── line   — h-4 rounded, animated shimmer
├── circle — rounded-full, animated shimmer
├── card   — Full card skeleton with internal lines

Specs:
├── Background: bg-void-2
├── Animation: shimmer (bg gradient slide)
├── Duration: 1.5s infinite
└── Easing: linear
```

### EmptyState

```
Structure:
├── Icon (optional, 48px, text-forge-2)
├── Title (text-xl font-semibold text-forge-0)
├── Description (text-forge-1)
└── Action button (optional, primary or ghost)

Specs:
├── Container: flex flex-col items-center text-center py-12 px-6
├── Max width: max-w-sm mx-auto
└── Spacing: gap-4
```

### ErrorState

```
Structure:
├── Icon (error icon, text-error)
├── Title (text-xl font-semibold text-forge-0)
├── Message (text-forge-1)
├── Technical details (collapsible, mono text)
└── Retry button (primary)

Specs:
├── Container: flex flex-col items-center text-center py-12 px-6
├── Icon: w-12 h-12 text-error
└── Retry: btn-primary mt-4
```

### Tabs

```
Variants:
├── pill      — bg-void-2 rounded-full, active has accent bg
└── underline — border-b, active has accent underline

Specs:
├── Gap: gap-2 (pill), gap-6 (underline)
├── Padding: px-4 py-2 (pill), pb-2 (underline)
├── Active: bg-arcane text-void-0 (pill), border-b-2 border-arcane (underline)
└── Transition: all 180ms forge ease
```

### Dialog (Modal/Drawer/Sheet)

```
Variants:
├── modal  — Centered, max-w-lg, rounded-2xl
├── drawer — Slide from right, w-96, full height
└── sheet  — Slide from bottom, full width, rounded-t-2xl

Specs:
├── Overlay: bg-void-0/80 backdrop-blur-sm
├── Background: bg-void-1 border border-white/10
├── Animation: fade-in (overlay) + scale/slide (content)
├── Close: X button top-right, ESC key, overlay click
└── Focus trap: Yes
```

### Toast

```
Variants:
├── info    — border-l-4 border-arcane
├── success — border-l-4 border-verdant
├── warning — border-l-4 border-ember
└── error   — border-l-4 border-error

Specs:
├── Position: bottom-right, stacked
├── Background: bg-void-1 backdrop-blur-md
├── Border radius: rounded-lg
├── Padding: p-4
├── Animation: slide-in-right + fade
├── Duration: 5s auto-dismiss (configurable)
└── Close: X button or click
```

### Tooltip

```
Specs:
├── Background: bg-void-2
├── Border: border border-white/10
├── Border radius: rounded-md
├── Padding: px-2 py-1
├── Font: text-sm text-forge-1
├── Arrow: 6px triangle
├── Position: auto (top/bottom/left/right)
├── Delay: 300ms show, 0ms hide
└── Animation: fade-in 120ms
```

---

## 3. Layout Patterns

### AppShell

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TopBar [h-16]                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Logo │ Breadcrumbs      │ [Search]  │ Notifications │ User Avatar │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────┬───────────────────────────────────────────────────────────────┤
│ SideNav │ Main Content                                                  │
│ [w-64]  │                                                               │
│         │ ┌───────────────────────────────────────────────────────────┐ │
│ [Home]  │ │ Page Header                                               │ │
│ [Acad]  │ ├───────────────────────────────────────────────────────────┤ │
│ [World] │ │                                                           │ │
│ [Camp]  │ │ Page Content (scrollable)                                 │ │
│ [Toys]  │ │                                                           │ │
│ [Lib]   │ │                                                           │ │
│ ─────── │ │                                                           │ │
│ [Set]   │ │                                                           │ │
│         │ └───────────────────────────────────────────────────────────┘ │
└─────────┴───────────────────────────────────────────────────────────────┘

Mobile (< 768px):
├── TopBar collapses to hamburger menu
├── SideNav becomes slide-out drawer
└── Main content full width
```

### SplitPane (Editor + Inspector)

```
Desktop (≥ 1024px):
┌────────────────────────────────┬───────────────────────┐
│ Workspace (60-70%)             │ Inspector (30-40%)    │
│                                │                       │
│ Primary editing area           │ Context/help panel    │
│                                │                       │
└────────────────────────────────┴───────────────────────┘

Tablet (768-1023px):
├── Inspector becomes bottom sheet (toggleable)
└── Workspace takes full width

Mobile (< 768px):
├── Single pane only
└── Inspector accessed via button → sheet
```

### CommandPalette

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Type a command or search...                                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Recent                                                               │ │
│ │ ├── Go to Dashboard                                    ⌘D           │ │
│ │ └── New Training Session                               ⌘T           │ │
│ │ Navigation                                                           │ │
│ │ ├── Academy                                            ⌘1           │ │
│ │ ├── World Building                                     ⌘2           │ │
│ │ ├── Campaign                                           ⌘3           │ │
│ │ └── Toybox                                             ⌘4           │ │
│ │ Actions                                                              │ │
│ │ ├── Create New Campaign                                              │ │
│ │ ├── Start Training Drill                                             │ │
│ │ └── Export World Data                                                │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

Specs:
├── Trigger: Cmd/Ctrl + K
├── Width: max-w-2xl
├── Position: top-1/4 centered
├── Overlay: bg-void-0/80 backdrop-blur-md
├── Animation: scale-in + fade
├── Keyboard: ↑↓ navigate, Enter select, Esc close
└── Search: fuzzy match on title + keywords
```

### PageHeader

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Badge: PILLAR]                                                         │
│ Page Title                                              [Action Button] │
│ Page description or context text                                        │
└─────────────────────────────────────────────────────────────────────────┘

Specs:
├── Container: py-6 border-b border-white/5
├── Badge: pillar-colored badge (arcane/ember/verdant/eldritch)
├── Title: text-3xl font-bold text-forge-0 font-display
├── Description: text-forge-1 mt-2
└── Actions: flex gap-2 items-center
```

---

## 4. Route Map

```
/ (Landing Page — marketing, unauthenticated)
│
└── /app (Authenticated AppShell)
    │
    ├── /app (redirects to /app/home)
    │
    ├── /app/home (Dashboard — Mission Control)
    │   └── Widgets: Next Session, Campaign Health, Training Progress, Recent Toys
    │
    ├── /app/academy (Training Academy)
    │   ├── /app/academy (Training Hub — path selection)
    │   ├── /app/academy/paths/:pathId (Path detail)
    │   ├── /app/academy/modules/:moduleId (Module viewer)
    │   ├── /app/academy/exercises/:exerciseId (Exercise player)
    │   ├── /app/academy/drills/:drillId (Remediation drills)
    │   └── /app/academy/transcript (Progress & credentials)
    │
    ├── /app/world (World Building)
    │   ├── /app/world (World Hub — overview)
    │   ├── /app/world/atlas (Map editor)
    │   ├── /app/world/factions (Faction graph)
    │   ├── /app/world/timeline (Historical events)
    │   ├── /app/world/canon (Canon board)
    │   └── /app/world/locations/:locationId (Location detail)
    │
    ├── /app/campaign (Campaign Building)
    │   ├── /app/campaign (Campaign Hub — overview)
    │   ├── /app/campaign/runbook (Session planner)
    │   ├── /app/campaign/spine (Story spine / 3-act)
    │   ├── /app/campaign/threads (Plot thread manager)
    │   └── /app/campaign/sessions/:sessionId (Session detail)
    │
    ├── /app/toybox (The Toy Method)
    │   ├── /app/toybox (Toybox Hub — overview)
    │   ├── /app/toybox/library (Browse toys)
    │   ├── /app/toybox/composer (Build/edit toys)
    │   └── /app/toybox/packs (Toy collections)
    │
    ├── /app/library (Assets & Templates)
    │   ├── /app/library (Library Hub)
    │   ├── /app/library/templates (Campaign templates)
    │   └── /app/library/assets (Images, maps, handouts)
    │
    └── /app/settings (Settings)
        ├── /app/settings (Settings Hub)
        ├── /app/settings/profile (Profile)
        ├── /app/settings/privacy (Privacy controls)
        ├── /app/settings/export (Data export)
        └── /app/settings/billing (Subscription)
```

---

## 5. Accessibility Standards

### Requirements (WCAG 2.2 AA)

```
Color Contrast:
├── Normal text: 4.5:1 minimum
├── Large text (18px+ bold or 24px+): 3:1 minimum
├── UI components: 3:1 minimum
└── Verified: all token pairs pass

Keyboard:
├── All interactive elements focusable
├── Logical tab order (DOM order)
├── Focus visible (arcane ring)
├── Skip links on page load
└── No keyboard traps

Screen Readers:
├── Semantic HTML (nav, main, section, article)
├── ARIA labels on icons and interactive elements
├── ARIA live regions for dynamic content
├── Heading hierarchy (h1 → h2 → h3)
└── Form labels associated with inputs

Motion:
├── Respect prefers-reduced-motion
├── Pause/stop controls for auto-playing content
├── No flashing content (3 flashes/sec limit)
└── Reduced motion = opacity transitions only
```

### Focus Ring Standard

```css
/* All interactive elements */
focus-visible:ring-2
focus-visible:ring-arcane
focus-visible:ring-offset-2
focus-visible:ring-offset-void-0
```

### Touch Targets

```
├── Minimum: 44x44px
├── Recommended: 48x48px
└── Spacing: 8px minimum between targets
```

---

## 6. Performance Budgets

```
Route Chunk Size:
├── Target: < 100KB per route (gzipped)
├── Critical: < 200KB

Core Web Vitals:
├── LCP: < 1.8s (good), < 2.5s (needs improvement)
├── INP: < 200ms (good), < 500ms (needs improvement)
├── CLS: < 0.1 (good), < 0.25 (needs improvement)

Assets:
├── Images: WebP/AVIF preferred, lazy load below fold
├── Fonts: preload critical (Space Grotesk 600, IBM Plex Sans 400)
├── Icons: inline SVG or sprite (no icon fonts)
└── Animations: GPU-accelerated (transform, opacity)
```

---

## 7. Security Patterns

```
CSP-Compatible:
├── No inline scripts (use event handlers in React)
├── No inline styles (use Tailwind classes)
├── No eval() or Function()
└── Dynamic styles via CSS variables only

Content:
├── Sanitize all user-generated HTML (DOMPurify)
├── Escape all rendered text
├── Validate URLs before rendering
└── No dangerouslySetInnerHTML without sanitization

Forms:
├── CSRF tokens on all mutations
├── Rate limiting on submissions
└── Input validation (client + server)
```

---

## 8. File Structure

```
src/
├── design/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── motion.ts
│   │   └── index.ts
│   ├── primitives/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── Tabs.tsx
│   │   ├── Dialog.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts
│   └── patterns/
│       ├── AppShell.tsx
│       ├── SideNav.tsx
│       ├── TopBar.tsx
│       ├── Breadcrumbs.tsx
│       ├── PageHeader.tsx
│       ├── SplitPane.tsx
│       ├── CommandPalette.tsx
│       └── index.ts
├── layouts/
│   └── AppLayout.tsx
├── pages/
│   ├── LandingPage.tsx (existing)
│   └── app/
│       ├── HomePage.tsx
│       ├── AcademyPage.tsx
│       ├── WorldPage.tsx
│       ├── CampaignPage.tsx
│       ├── ToyboxPage.tsx
│       ├── LibraryPage.tsx
│       └── SettingsPage.tsx
└── router/
    └── routes.tsx
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-15 | Initial design system documentation |
