# Product Requirements: Dashboard Home Purpose & CTA Hierarchy

## Home Purpose
The Dashboard Home exists to route a DM into their highest-value creation workflows in one decision:

1. **Build the world foundation first** (lore, locations, factions, continuity).
2. **Then operationalize the campaign plan** (sessions, hooks, encounter execution).

The Home hero must act as a clear handoff surface between world design and campaign execution, while reducing visual noise from secondary actions.

## Above-the-Fold CTA Hierarchy

### Primary CTA
- **Label:** `Open World Builder`
- **Intent:** Start/continue world authoring as the default first action.
- **Visual treatment:** Primary button styling only.

### Secondary CTA
- **Label:** `Open Campaign Builder`
- **Intent:** Move from lore scaffolding into playable campaign planning.
- **Visual treatment:** Secondary/ghost button styling.

### State-aware handoff cue
- Present a dynamic cue between primary and secondary CTAs that signals readiness debt between systems.
- Example copy: `3 unresolved lore-to-campaign conflicts`.
- Must derive from runtime campaign state (`unresolvedLoreConflicts`).

### Tertiary actions (all other above-fold actions)
- Includes: `New Session`, `View`, and world map icon action.
- Must remain available but visually de-emphasized compared to primary/secondary CTAs.

## Analytics Requirements
Track the following for each Home CTA (`open_world_builder`, `open_campaign_builder`):

1. **Impression** (`home_cta_impression`) when CTA becomes visible.
2. **Click-through** (`home_cta_click`) on user activation.
3. **Completion** (`home_cta_completion`) after action handler completes.

All events must include:
- `ctaId`
- `placement` (`dashboard_home`)
- Optional state context where available (for campaign CTA): `unresolvedConflicts`
