# AWE-CX-005: World-Class React UI/UX Design Blueprint

Generated: 2026-02-14  
Scope: UI/UX only (design, interaction, experience quality)  
Target: Premium React app with elite polish, high trust, and low-friction execution  
Budget assumption: `>$20/month` operating budget

## Mission
Build a React product experience that feels premium, fast, unmistakably intentional, and safe to trust at first glance. This document is a production guide for design and UX implementation, not generic inspiration.

## UX Success Definition
The app is "world-class" only if all of these are true:
- First meaningful screen appears in under 1.2 seconds on modern mobile.
- Users can complete the core task in 3 steps or fewer.
- Every screen has explicit feedback for loading, success, warning, and failure.
- Security-sensitive actions are obvious, reversible when possible, and never ambiguous.
- Visual language is consistent across all routes and states.
- Accessibility is first-class (`WCAG 2.2 AA` minimum).

---

## 1) Product Experience Doctrine (Non-Negotiable)

### 1.1 Design Principles
- `Clarity before cleverness`: Users always know what happened, what is happening, and what happens next.
- `Power without chaos`: Advanced capability is available, but default paths are simple.
- `Trust by design`: Safety and security signals are visible in the UI, not hidden in docs.
- `Speed as emotion`: Perceived speed is part of brand quality.
- `Consistency at scale`: Same controls, spacing, states, and interaction logic everywhere.

### 1.2 UX Guardrails
- One primary action per viewport section.
- No dead ends: every state must provide a next action.
- No silent failures.
- No destructive action without preview + confirmation + recovery path.
- No new component enters production without all interactive states implemented.

### 1.3 Anti-Patterns (Banned)
- Placeholder lorem in production.
- Centered spinners with no progress context.
- Full-screen modals for minor tasks.
- Mixed icon styles and mixed radius systems.
- Color-only status indicators without text/icon support.

---

## 2) Information Architecture and Navigation

### 2.1 Route Hierarchy
Use a predictable shell with command-center ergonomics:
- `App Shell`
- `Primary Workspace` (core action)
- `Insights` (analytics, summaries, trends)
- `Operations` (queues, jobs, status)
- `Settings` (profile, security, preferences)
- `Help + Safety` (support, privacy, controls)

### 2.2 Navigation Model
- Desktop: left rail (`64-80px`) + contextual top bar.
- Mobile: bottom nav for top-level routes + quick action FAB.
- Keyboard command palette (`Ctrl/Cmd + K`) for power navigation.

### 2.3 Interaction Depth Rule
- Core flow depth: max 2 levels.
- Secondary flow depth: max 3 levels.
- Anything deeper must be re-architected.

---

## 3) Visual System: Silicon Valley Elite Aesthetic

### 3.1 Visual Direction
Style language: `Precision Glass + Tactical Contrast`
- Dark-leaning neutral base with high legibility.
- Controlled luminous accents (cyan/amber/emerald), never neon overload.
- Soft glass surfaces, sharp data typography, disciplined spacing.

### 3.2 Core Tokens (Use CSS Variables + TS tokens)
```css
:root {
  --bg-0: #070b10;
  --bg-1: #0d141d;
  --bg-2: #141d28;
  --surface-0: rgba(255,255,255,0.06);
  --surface-1: rgba(255,255,255,0.10);

  --text-0: #f5f7fb;
  --text-1: #c4ceda;
  --text-2: #8d98a7;

  --accent-primary: #3dd2ff;
  --accent-success: #39d98a;
  --accent-warning: #f4b545;
  --accent-danger: #ff6b6b;

  --focus-ring: #79e2ff;
  --border-0: rgba(255,255,255,0.14);
  --border-1: rgba(255,255,255,0.24);

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;

  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.25);
  --shadow-pop: 0 14px 40px rgba(0, 0, 0, 0.36);
}
```

### 3.3 Typography Stack (Expressive, Not Generic)
- Display/headlines: `Space Grotesk`
- UI/body: `IBM Plex Sans`
- Data/metrics/code: `JetBrains Mono`

Type scale:
- `Display`: 48/56
- `H1`: 36/44
- `H2`: 28/36
- `H3`: 22/30
- `Body`: 16/24
- `Meta`: 13/18

### 3.4 Layout Rhythm
- Base spacing unit: `8px`
- Section vertical rhythm: `48-72px`
- Card internal padding: `20-24px`
- Max content width for readability: `1200px`

### 3.5 Iconography
- Single icon family only (stroke style, 1.75px stroke).
- Status icons always paired with text.
- Minimum icon tap target: `44x44`.

---

## 4) Motion Design and Micro-Interactions

### 4.1 Motion Philosophy
Motion communicates causality and hierarchy. Do not animate for decoration.

### 4.2 Standard Motion Tokens
- `fast`: `120ms` (hover/focus)
- `base`: `180ms` (button/selection)
- `enter`: `240ms` (panels/cards)
- `complex`: `320ms` (page transitions)
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

### 4.3 Required Animations
- Staggered card reveal on route load.
- Context-preserving panel transitions.
- Skeleton-to-content morph for data-heavy views.
- Confirm-success pulse for completed critical actions.

### 4.4 Accessibility Motion Rule
Respect `prefers-reduced-motion: reduce`; provide instant transitions.

### 4.5 Signature Innovation Layer (High-Impact, Controlled)
Ship 3-5 signature moments that create memorable product identity:
- `Intent Lens`: UI prioritizes controls based on current user goal and context.
- `Adaptive Command Strip`: top actions reorder by frequency/time-of-day patterns.
- `Causal Preview`: before major actions, show exactly what will change.
- `Ambient Status Halo`: subtle shell-level glow communicates system health state.
- `Precision Undo`: all reversible actions expose one-click undo for confidence.

Rule: novelty must improve clarity, speed, or trust. If not, remove it.

---

## 5) Component System Contract (Design + Behavior)

Every reusable component must include all states:
- `default`
- `hover`
- `focus-visible`
- `active`
- `disabled`
- `loading`
- `error`
- `success` (when applicable)

### 5.1 Core Component Set
- Button: `primary`, `secondary`, `ghost`, `danger`
- Input: text, select, autocomplete, date/time
- Feedback: toast, inline alert, status banner
- Data: table, virtualized list, metric card, trend chart
- Overlay: modal, drawer, command palette
- Navigation: tab group, segmented control, breadcrumb

### 5.2 State Semantics
- Never disable primary CTA silently; explain why.
- Validation is inline and immediate after first blur.
- Critical errors include:
  - what failed
  - why (if known)
  - safest next action

### 5.3 Empty State Quality Bar
Every empty state must contain:
- one sentence context
- one primary action
- one optional secondary action
- one helpful example when relevant

---

## 6) Trust, Safety, and Security in UX (Mandatory)

This app can look premium and still fail if trust UX is weak. Implement these surfaces visibly.

### 6.1 Auth UX
- Support passkeys first; password fallback available.
- Show active session list by device/location.
- Risk alert banner for suspicious login patterns.

### 6.2 Permission UX
- Request permissions just-in-time, not all at signup.
- Explain data purpose in plain language next to consent toggle.
- Allow revocation inside settings in 2 taps max.

### 6.3 Sensitive Actions
For delete/export/share/billing changes:
- show impact preview
- require explicit confirmation
- provide undo or recovery path
- log action in user-visible history

### 6.4 Data Handling UX
- Explicit data classification badges (`Public`, `Private`, `Sensitive`).
- Auto-redact sensitive fields in shared views by default.
- Copy/export actions show a contextual security warning.

### 6.5 Security Messaging Tone
- Calm and precise.
- Never blame user.
- Always provide a clear next action.

---

## 7) Accessibility Standards (No Exceptions)

### 7.1 Baseline
- Target: `WCAG 2.2 AA`
- Color contrast: normal text >= `4.5:1`, large text >= `3:1`
- Full keyboard support for all interactive controls

### 7.2 Screen Reader Contract
- Semantic landmarks for all pages
- `aria-live="polite"` for non-critical status updates
- `aria-live="assertive"` for critical errors
- Modals trap focus and restore focus on close

### 7.3 Form Accessibility
- Label every input (no placeholder-only labels)
- Inputs with errors use programmatic association to helper text
- Required fields marked both visually and semantically

---

## 8) Perceived Performance UX

### 8.1 Budget Targets
- `LCP < 1.8s` on 4G mid-tier devices
- `INP < 200ms`
- `CLS < 0.1`

### 8.2 UX Performance Patterns
- Skeletons over spinners for content regions >300ms.
- Optimistic updates for reversible actions.
- Progressive rendering for dashboards.
- Route-level code splitting with prefetch on intent.

### 8.3 Loading Hierarchy
- Level 1: instant shell
- Level 2: structural skeleton
- Level 3: content hydration
- Level 4: enriched insights/animations

---

## 9) React Implementation Blueprint (UI/UX Focus)

### 9.1 Stack
- React + TypeScript + Vite
- Tailwind (with token bridge) or CSS Modules with design tokens
- `Framer Motion` for systemized motion
- `React Aria` or `Radix UI` for accessible primitives
- `TanStack Query` for async state UX consistency
- `Zod` for client-side schema validation messaging

### 9.2 UI Folder Structure
```text
src/
  app/
    routes/
    shell/
  design/
    tokens/
      colors.ts
      spacing.ts
      typography.ts
      motion.ts
    components/
      button/
      input/
      feedback/
      data/
      overlays/
    patterns/
      empty-state/
      loading/
      error-recovery/
  features/
    [feature-name]/
      ui/
      hooks/
      model/
```

### 9.3 Design Token Example (TypeScript)
```ts
export const motion = {
  fast: 0.12,
  base: 0.18,
  enter: 0.24,
  complex: 0.32,
  easing: [0.22, 1, 0.36, 1] as const,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
};
```

### 9.4 Component Acceptance Checklist
A component is production-ready only when:
- visual snapshot approved for all states
- keyboard flow verified
- reduced-motion behavior verified
- loading/error states implemented
- usage guidelines documented

---

## 10) Page Blueprint Library (Implement These First)

### 10.1 Dashboard / Command Center
- Headline + context summary
- Priority action rail (top 3 tasks)
- Live status widgets with clear risk colors
- Activity timeline with filters

### 10.2 Workflow Page
- Left: step list with progress + blockers
- Center: primary workspace
- Right: context panel (history, help, validation)

### 10.3 Settings + Security Page
- Account and profile
- Privacy and permissions
- Sessions and device management
- Billing and plan usage
- Audit log

### 10.4 Error Recovery Page
- friendly explanation
- status code / error reference
- one-click retry
- alternate path to continue work

---

## 11) UX QA: Failure-Mode Matrix (Present + Future)

### 11.1 Critical Failure Cases to Test Every Release
- slow network (3G simulation)
- token expiration during active workflow
- permission revoked mid-task
- stale data overwrite conflict
- multi-tab edits on same record
- partial API outage
- failed payment flow
- interrupted file upload
- reduced-motion user preference enabled
- keyboard-only full workflow

### 11.2 Regression Gates
- No new contrast violations.
- No increase in core flow steps.
- No unexplained layout shifts.
- No unresolved error strings.
- No unreachable controls on mobile.

### 11.3 Visual QA
- Snapshot diffs for all core routes.
- Responsive checks at `360`, `768`, `1024`, `1440` widths.
- Dark/light parity if both modes are supported.

---

## 12) Budget-Conscious Tooling Plan (`>$20`)

Goal: Elite UX polish without runaway spend.

### 12.1 Lean Plan (`$20-$60/month`)
- Hosting: Vercel/Netlify free tier (or low paid tier only if needed)
- Analytics: PostHog free tier / self-hosted minimal events
- Session replay: low-sample capture only for UX debugging
- Fonts/icons: free open-source families and icon sets

### 12.2 Pro Plan (`$60-$200/month`)
- Add premium UX monitoring and larger replay quota
- Add design QA tooling with automated visual regression
- Keep monthly spend caps + alerts in app ops dashboard

### 12.3 Cost-Control UX Rules
- heavy animations disabled on low-power devices
- defer non-critical charts until user requests details
- compress media assets aggressively

---

## 13) Launch Sequence (UI/UX Delivery)

### Phase A: Foundation (Week 1)
- Lock tokens, typography, spacing, motion curves
- Build app shell + navigation + command palette
- Ship 10 core reusable components with full states

### Phase B: Core Flow (Week 2)
- Build main workflow page and dashboard
- Implement loading/error/empty-state patterns
- Run first accessibility and keyboard audit

### Phase C: Trust + Polish (Week 3)
- Implement security UX surfaces and settings flows
- Add motion polish and micro-interactions
- Run mobile friction sweep and perf tuning

### Phase D: Harden + Ship (Week 4)
- Execute failure-mode matrix
- Fix all P0/P1 UX defects
- Freeze design tokens for v1 release

---

## 14) Definition of Done (UI/UX)

Release only when all are true:
- Design tokens and components are consistent across routes.
- Core task completed in <=3 steps for primary user path.
- Accessibility checks pass (`WCAG 2.2 AA` target).
- Security-sensitive actions have explicit trust UX.
- Performance budgets met on representative mobile hardware.
- UX QA matrix complete with no unresolved critical findings.

---

## 15) Executive Checklist (Use Before Every Ship)

- Does this screen make the next action obvious in 2 seconds?
- Can users recover from mistakes without support?
- Are safety/security choices visible at decision points?
- Are loading/error states as polished as happy paths?
- Does this still feel premium on low-end mobile?
- Is this screen measurably faster or clearer than last release?

If any answer is `no`, do not ship.

---

## Appendix A: Minimal React UI Standards Snippet

```tsx
// Example: high-trust button behavior contract
<Button
  variant="primary"
  disabled={isInvalid || isSubmitting}
  loading={isSubmitting}
  aria-busy={isSubmitting}
>
  {isSubmitting ? "Saving securely..." : "Save Changes"}
</Button>
```

```css
/* Focus visibility is mandatory for keyboard trust */
*:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

This is the baseline. Premium quality comes from strict consistency and ruthless removal of friction.
