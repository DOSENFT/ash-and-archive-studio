# Ash & Archive: The Studio — Authoritative Feature Roadmap + Build Plan

## 1) Executive Thesis (Wedge, Positioning, Why Pros Pay $49+)

**Wedge:** Ash & Archive is the first serious **DM Operating System** that combines elite world/campaign tooling with **provable skill progression**. Competing tools help you store notes; Ash & Archive helps you **perform better at the table** and prove it.

**Positioning statement:**
> For ambitious Dungeon Masters and tabletop organizations, Ash & Archive is the secure, performance-first, accessibility-compliant platform that turns campaign prep and DM craft into measurable mastery through canon governance + rigorous assessment.

### Why a pro DM pays $49+/month

1. **Time ROI:** Save 4–8 prep hours/month via reusable Toy graph + continuity-safe campaign planning.
2. **Quality ROI:** Fewer lore contradictions and dead story threads through Canon Governance.
3. **Skill ROI:** Measurable training outcomes (rubrics, exams, transcript), not vibes.
4. **Credibility ROI:** Shareable credentials and artifacts for paid GMs, creators, and educators.
5. **Reliability ROI:** Works smoothly on average hardware with predictable performance budgets.

### Product moat

- **Kernel 1: Canon Governance Engine** (graph + consistency + lineage)
- **Kernel 2: Assessment Engine** (evidence + rubric + grading + remediation)

These two kernels are expensive to replicate and power every pillar.

---

## 2) Kernels-First Architecture (Shared Substrate)

## 2.1 Canon Governance Engine

**Purpose:** Keep all world/campaign data coherent, versioned, and conflict-resolvable.

### Core entities (logical model)

| Entity | Key fields | Notes |
|---|---|---|
| `Workspace` | id, name, plan, ownerId | Tenant boundary |
| `Campaign` | id, workspaceId, title, settingId, status | Primary execution unit |
| `CanonNode` | id, workspaceId, type, title, body, tags, status | NPC, location, faction, event, item, rule, etc. |
| `CanonEdge` | id, fromNodeId, toNodeId, relationType, strength | Graph relationship |
| `CanonRevision` | id, nodeId, diff, actorId, createdAt | Version history |
| `CanonConflict` | id, nodeId, conflictType, severity, state | Detected contradiction |
| `Toy` | id, workspaceId, schemaType, payload, qualityScore | Reusable modular asset |
| `ToyComposition` | id, campaignId, toyIds[], outputNodeIds[] | “Toy Method” composition record |

### Canon algorithms

- **Continuity check pass:** rule-based contradiction detection (date mismatch, incompatible state, duplicate identities).
- **Graph integrity score:** weighted measure of orphan nodes, unresolved conflicts, stale edges.
- **Canon merge:** branch-style merge with deterministic precedence + manual override queue.

## 2.2 Assessment Engine

**Purpose:** Convert DM practice into objective progression.

### Core entities

| Entity | Key fields | Notes |
|---|---|---|
| `Course` | id, track, level, objectives[] | Training program container |
| `Assignment` | id, courseId, rubricId, duePolicy, attemptPolicy | Task definition |
| `Evidence` | id, assignmentId, learnerId, type, uri, metadata | Audio, transcript, plan, logs |
| `Rubric` | id, dimensions[], anchors, passThreshold | Calibrated grading schema |
| `ScoreReport` | id, evidenceId, autoScore, humanScore, finalScore, confidence | Score artifact |
| `ErrorTag` | id, taxonomy, severity, remediationMap | Reusable weakness taxonomy |
| `RemediationPlan` | id, learnerId, tags[], drills[], reevaluationDate | Improvement loop |
| `Exam` | id, credentialId, proctorMode, passingRules | High-stakes check |
| `TranscriptRecord` | id, learnerId, credentialId, scoreBand, verifierHash | Credential evidence |

### Why all features depend on kernels

- World Building and Campaign Building consume Canon nodes/edges and revisions.
- Toy Method is graph composition over Canon schema.
- DM Training Academy produces and grades evidence, writes transcript records.
- Monetization strength comes from continuity + measurable skill outcomes.

---

## 3) Feature Roadmap (Phased Delivery)

## Phase 0 — Foundation (Weeks 0–4)

**Outcome:** Secure, observable, accessible foundation + kernel skeletons.

### Prioritized feature set

| Priority | Feature | Pillar alignment | Effort | Risk |
|---|---|---|---|---|
| P0 | Auth + workspace tenancy | All pillars | M | M |
| P0 | Canon schema + CRUD API | World, Campaign, Toy | M | M |
| P0 | Assignment/evidence schema + ingest API | Training | M | M |
| P0 | Security baseline (CSP, cookies, audit log) | All | M | H |
| P1 | UI shell + accessibility baseline | All | S | L |
| P1 | Event telemetry + perf dashboard | All | S | M |

### Definition of Done (measurable)

- 100% API routes behind auth and workspace scoping.
- CSP blocks inline scripts/styles in production build (no `unsafe-inline`).
- p95 API latency < 300ms for CRUD under 50 concurrent users.
- Lighthouse accessibility score >= 95 on core routes.
- Audit logs generated for create/update/delete and grading actions.

### User value

- Users can safely create workspaces and start building canon/training artifacts.
- Foundation is stable, fast, and recoverable.

### Implementation blueprint

- **UI routes:**
  - `/app` dashboard shell
  - `/app/canon`
  - `/app/training`
  - `/app/settings/security`
- **Services:**
  - `AuthService` (session management)
  - `CanonService` (CRUD + revisions)
  - `AssessmentService` (assignments/evidence)
  - `AuditService` (append-only log)
- **Dependencies (free tier):**
  - Frontend: React + TS + Vite + Tailwind
  - Backend/API: Cloudflare Workers or Supabase edge functions (free)
  - DB: Supabase Postgres free tier
  - Storage: Supabase Storage free tier for evidence
  - Analytics: PostHog free tier (self-host optional later)

### Risks + mitigations

- **Risk:** CSP breaks third-party scripts.
  - **Mitigation:** nonce/hash allowlist + self-host fonts/assets.
- **Risk:** Cross-tenant data leakage.
  - **Mitigation:** row-level security + workspaceId enforced in all queries.
- **Risk:** Evidence upload abuse.
  - **Mitigation:** signed upload URLs, MIME allowlist, size caps, virus scan queue.

### Performance budgets + guardrails

- Initial JS per route <= 100KB gzipped.
- LCP < 1.8s, INP < 200ms, CLS < 0.1 on mid-tier mobile.
- DB query budget: <= 3 primary queries per screen render.

### Security controls (explicit contradictions fixed)

- **CSP:** `default-src 'self'; script-src 'self' 'nonce-<dynamic>'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`.
- **No token in localStorage.** Use HTTP-only, Secure, SameSite=Lax cookies for session.
- **CSRF:** same-site cookie + CSRF token header for state-changing requests.
- **Audit logs:** immutable append-only table; log actor, action, entity, before/after hash.

### Cost estimate (monthly)

| Item | Cost |
|---|---:|
| Supabase free tier | $0 |
| Cloudflare free tier | $0 |
| PostHog free tier | $0 |
| Domain amortized | ~$1–2 |
| **Total** | **$0–2** |

Scaling note: keep below $20 by limiting evidence retention (e.g., compress audio, 90-day raw retention, archive summaries).

---

## Phase 1 — v1 Monetizable (Weeks 5–12)

**Outcome:** Solo Pro plan-worthy product: core world/campaign workflow + foundational training track.

### Prioritized feature set

| Priority | Feature | Pillar | Effort | Risk |
|---|---|---|---|---|
| P0 | Canon Board (graph + timeline + revision view) | World, Campaign | L | M |
| P0 | Campaign Runbook (session planner + continuity warnings) | Campaign | M | M |
| P0 | Toy Builder + composition templates | Toy | M | M |
| P0 | Training Track v1 (assignments, rubric, score, remediation) | Training | L | H |
| P1 | Session Director mode (live checklists + cues) | Campaign | M | M |
| P1 | Export pack (PDF/JSON/session brief) | Campaign, Toy | S | L |

### Definition of Done

- Create campaign in < 5 min from template.
- Canon conflict detector catches top 5 contradiction classes.
- Toy composition can generate at least 3 reusable artifact types.
- Training assignment flow complete: assign -> submit evidence -> score -> remediation.
- First paid users can complete a full prep+run+review cycle in product.

### User value

- High-leverage prep system with continuity confidence.
- Tangible skill progression loop starts immediately.

### Implementation blueprint

- **UI routes:**
  - `/app/campaigns/:id/runbook`
  - `/app/campaigns/:id/canon-board`
  - `/app/toys`
  - `/app/training/assignments/:id`
  - `/app/training/transcript`
- **Key components:**
  - `CanonGraphView`, `ConflictPanel`, `RevisionDiffDrawer`
  - `RunbookChecklist`, `SessionCuePanel`, `ThreadHealthMeter`
  - `ToySchemaEditor`, `CompositionWorkbench`
  - `AssignmentWorkbench`, `EvidenceUploader`, `RubricScoreCard`, `RemediationQueue`
- **Algorithms:**
  - contradiction classifier (rules + embeddings optional)
  - thread decay detection by last-referenced timestamp
  - rubric aggregation (weighted dimensions + confidence blending)

### Risks + mitigations

- **Risk:** Training scores feel arbitrary.
  - **Mitigation:** published rubric anchors + calibration set + confidence bands.
- **Risk:** Graph UI lags on mobile.
  - **Mitigation:** progressive rendering, node virtualization, simplified mode.

### Performance budgets + guardrails

- Graph interactions INP < 200ms on 1k-node graph in desktop; fallback simplified mode on mobile >300 nodes.
- Background sync chunk size <= 50 records.
- Audio evidence upload <= 25MB per item (client-side compression).

### Security controls

- Signed expiring URLs for evidence upload/download.
- Server-side MIME validation and extension mismatch rejection.
- Prompt injection resilience for AI-assisted feedback: no direct tool execution from model output.

### Cost estimate (monthly)

| Item | Cost |
|---|---:|
| Infra baseline (phase 0) | $0–2 |
| Additional storage/egress buffer | $5–10 |
| Optional transactional email (free tier) | $0 |
| **Total** | **$5–12** |

Scaling note: enforce per-tier evidence quotas to protect margin.

---

## Phase 2 — Pro (Months 4–6)

**Outcome:** Differentiated pro-grade platform that can command $49+ confidently.

### Prioritized feature set

| Priority | Feature | Pillar | Effort | Risk |
|---|---|---|---|---|
| P0 | Canon branch/merge + scenario sandbox | World, Campaign | L | H |
| P0 | Advanced Assessment (peer/TA calibration + exam mode) | Training | L | H |
| P0 | Toy Market (private packs + quality scoring) | Toy | M | M |
| P1 | AI Prep Copilot with strict citations | Campaign, Training | M | H |
| P1 | Mobile performance mode + offline session kit | Campaign | M | M |

### Definition of Done

- Canon merge conflict resolution success rate > 90% without support intervention.
- Exam mode supports blinded second-rater workflow.
- Remediation completion improves next-score median by >= 15%.
- Offline session kit can run a 4-hour session with no network.

### User value

- Professional reliability and measurable outcomes become obvious.
- Product transitions from “tool” to “career asset.”

### Implementation blueprint

- **UI routes:**
  - `/app/canon/branches`
  - `/app/training/exams`
  - `/app/market`
  - `/app/offline-kit`
- **Services:**
  - `MergeService` (branch diff + conflict resolver)
  - `CalibrationService` (rater drift checks)
  - `CredentialService` (signed transcript artifacts)
- **Key algorithms:**
  - inter-rater reliability (weighted Cohen’s kappa)
  - remediation recommender (error-tag to drill mapping)
  - trust-weighted scoring for peer/TA graders

### Risks + mitigations

- **Risk:** AI copilot hallucinations.
  - **Mitigation:** mandatory citation cards; uncertain output flagged and non-authoritative.
- **Risk:** Credential trust concerns.
  - **Mitigation:** signed transcript hash + verifier endpoint.

### Performance budgets + guardrails

- Offline bundle for session kit <= 1.5MB gzipped + cached data pack.
- Exam scoring pipeline p95 completion < 10s for auto-score and < 24h SLA for human-reviewed.

### Security controls

- End-to-end integrity hashes for transcript records.
- Role-based grading permissions (learner cannot grade own work).
- Data retention policy by evidence type; right-to-delete workflow with audit trail.

### Cost estimate (monthly)

| Item | Cost |
|---|---:|
| Infra + storage growth | $10–18 |
| Optional queue worker add-on (if needed) | $0–10 |
| **Total** | **$10–28** |

Scaling note: if spend exceeds $20 early, prioritize monetized Pro seats before enabling high-cost AI features by default.

---

## Phase 3 — Org/Enterprise (Months 7–12)

**Outcome:** Team/academy-ready product with governance, reporting, and procurement-grade controls.

### Prioritized feature set

| Priority | Feature | Pillar | Effort | Risk |
|---|---|---|---|---|
| P0 | Org workspaces + RBAC/ABAC policies | All | L | H |
| P0 | Cohort management + instructor console | Training | L | M |
| P0 | Compliance exports + audit dashboards | All | M | M |
| P1 | SSO (OIDC/SAML via broker) | All | M | H |
| P1 | SLA observability + incident playbooks | All | M | M |

### Definition of Done

- Org admins can manage users, roles, cohorts, and policy templates.
- Audit exports cover grading, canon edits, and security events.
- SSO successful login rate >= 99.9% in staging + pilot org.

### User value

- Enables schools, training groups, and studios to standardize DM development.

### Implementation blueprint

- **UI routes:**
  - `/org/admin/users`
  - `/org/admin/cohorts`
  - `/org/admin/audit`
  - `/org/admin/policies`
- **Services:**
  - `OrgPolicyService`
  - `CohortService`
  - `ComplianceExportService`

### Risks + mitigations

- **Risk:** complexity bloat hurts solo users.
  - **Mitigation:** strict plan-gated UI and isolated org modules.

### Performance budgets + guardrails

- Admin tables virtualized for 10k rows.
- Report generation async with progress and resumable downloads.

### Security controls

- Fine-grained policy checks at API layer.
- Signed, time-limited export links.
- Alerting on anomalous admin actions.

### Cost estimate (monthly)

| Item | Cost |
|---|---:|
| Baseline + org load | $20–60 |
| Optional SSO/auth broker costs | variable |
| **Total** | **$20–60+** |

Scaling note: Phase 3 is funded by Team/Org revenue, not bootstrap budget.

---

## 4) “Prestigious College” Training Track Design

## 4.1 Credentials (stackable)

| Credential | Level | Requirement |
|---|---|---|
| `Certified Session Architect (CSA-1)` | Foundation | 6 assignments + practical exam |
| `Narrative Systems Director (NSD-2)` | Intermediate | 12 assignments + canon merge capstone |
| `Master of Living Worlds (MLW-3)` | Advanced | panel-reviewed performance + org practicum |
| `Instructor/Assessor Endorsement (IAE)` | Professional | grader calibration + reliability threshold |

## 4.2 Rubrics + grading pipeline

### Rubric dimensions (example)
- Narrative coherence
- Player agency facilitation
- Pacing and spotlight balance
- Encounter design quality
- Improvisation resilience
- Canon continuity discipline

### Pipeline
1. **Assignment issued** with explicit rubric anchors.
2. **Evidence submitted** (audio/video/transcript/session plan/logs).
3. **Auto-pass scoring** (heuristics + NLP support) produces provisional score.
4. **Calibrated human scoring** (peer/TA/instructor) applies weighted adjustments.
5. **Final score + confidence** generated; low-confidence triggers second rater.
6. **Error tags** mapped to remediation micro-drills.
7. **Exam gates** require no open critical error tags.
8. **Transcript issuance** with signed verification hash.

### Non-self grading options

| Mode | Who grades | Control |
|---|---|---|
| Peer calibrated | selected peers | trust weight + drift detection |
| TA reviewed | approved assistants | mandatory calibration set |
| Pro panel | paid assessors | blinded rubric + adjudication |

## 4.3 Evidence types

- Session audio clips (compressed)
- Transcript text
- Prep artifacts (runbook, canon deltas)
- Interaction logs (decision points, cue timings)
- Reflection memo (structured self-assessment)

## 4.4 Remediation system

- `ErrorTag -> DrillLibrary` mapping (e.g., pacing-lag -> 7-minute tempo drill).
- Daily micro-drills (3–10 min), auto-scheduled by severity.
- Reassessment assignment auto-generated when remediation streak completes.

---

## 5) Pricing + Packaging

| Tier | Price | Who it is for | Feature gates |
|---|---:|---|---|
| Solo Pro | **$49/mo** | paid GMs, serious hobbyists | full Canon Board, Runbook, Toy Builder, Training v1, 1 credential path |
| Studio Team | $149/mo (up to 5) | co-DM teams, creator studios | shared workspaces, role permissions, advanced analytics, private toy packs |
| Academy/Org | $399+/mo | schools, guilds, org programs | cohorts, instructor console, compliance export, SSO options, credential governance |

### Why gates are fair

- Solo gets full professional workflow.
- Team/Org gates align with collaboration/compliance costs.
- Credential governance and reliability infrastructure reserved for org plans where value capture is highest.

---

## 6) Success Metrics

## 6.1 Product + learning outcomes

| Metric | Target | Why it matters |
|---|---:|---|
| Skill delta (rubric level gain) | +1.0 band in 8 weeks median | proves training effectiveness |
| Exam validity (inter-rater reliability) | kappa >= 0.70 | credibility of credential |
| Remediation efficacy | >= 15% score lift after drill cycle | quality of coaching loop |
| 90-day retention (Solo Pro) | >= 65% | monetization durability |
| Session prep time reduction | >= 30% | direct ROI for DMs |
| Canon conflict escape rate | < 5% to live sessions | continuity quality |

## 6.2 Org ROI metrics

- Instructor grading time saved per cohort.
- Cohort completion and credential issuance rates.
- Learner progression velocity and pass rates.

---

## 7) Kill Criteria (Stop/Pivot Triggers)

1. **Learning outcomes fail:** < 8% improvement after two remediation cycles.
2. **Credibility fails:** inter-rater reliability stays < 0.55 for 2 quarters.
3. **Retention fails:** < 40% 90-day retention for paid Solo users after pricing/UX iteration.
4. **Unit economics fail:** gross margin < 70% at 500 paid seats.
5. **Security trust fails:** repeated medium+ incidents tied to architecture flaws.

If 2+ triggers persist for two consecutive release cycles: freeze feature expansion, run root-cause sprint, pivot offer or audience.

---

## 8) Next 3 Work Sessions Plan (in VS Code)

## Session 1 (4–6 hours): Foundation hardening + kernel scaffolds

- Create DB migrations for `Workspace`, `Campaign`, `CanonNode`, `CanonEdge`, `CanonRevision`, `Assignment`, `Evidence`, `Rubric`, `ScoreReport`, `AuditLog`.
- Add auth/session cookie strategy and middleware guards.
- Implement strict CSP headers and security response headers.
- Ship `/app`, `/app/canon`, `/app/training` shell routes.

**Deliverable:** deployable foundation branch with passing typecheck/lint and security headers verified.

## Session 2 (4–6 hours): Canon Board v1 + conflict engine v1

- Build `CanonGraphView` + `ConflictPanel`.
- Implement contradiction rules (date mismatch, duplicate identity, impossible state transitions).
- Add revision timeline + diff drawer.

**Deliverable:** user can create/edit nodes, see conflicts, and inspect revision history.

## Session 3 (4–6 hours): Training assignment loop v1

- Build assignment page, evidence uploader, rubric score card.
- Implement score pipeline stub (auto + manual override path).
- Create remediation queue generated from error tags.
- Add transcript table view.

**Deliverable:** end-to-end assignment to score to remediation to transcript record.

---

## Assumptions + Alternatives

| Assumption | Alternative |
|---|---|
| Supabase is acceptable as starter backend | Cloudflare D1 + R2 + Workers |
| No paid AI API in v1 default flow | bring-your-own-key model for advanced AI features |
| Solo developer with AI agents | add part-time QA contractor for exam workflow validation |

---

## NEXT MOVE:

**Implement Session 1 and exit with a measurable gate: all state-changing API endpoints require auth + workspace scope, with CSP enforced and verified by automated header tests.**
