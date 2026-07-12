# SPEC-B1 — THE THIN SERVICE LAYER (BACKEND)
### Engineering specification DRAFT for the Ash & Archive Studio production backend — auth, licensing, billing, sync relay, Press portal hosting, metered-AI proxy
*Draft v0.1 · Status: **SEALED DRAFT — zero-invention, awaiting founder ratification of open ADRs** · Substrate: SPEC-001-FOUNDATION v1.0*

> **Scope of this document.** This is the implementation-ready specification of the **optional** server tier described in STUDIO-GENESIS `03-ARCHITECTURE-UX-ROADMAP.md` PART ONE ("Backend (minimal by design): a thin service layer — auth/licensing, encrypted sync relay, portal hosting/CDN, metered AI proxy. No world logic server-side, ever."). It is subordinate to SPEC-001; where SPEC-001 speaks, it is law and this document may not contradict it. Where the ecosystem canon (`canon/ASH-AND-ARCHIVE-CANON.md`) speaks, it arbitrates over both. Every non-derivable decision is an **ADR** (§ADR), never a silent choice.
>
> **The prime constraint, restated so no reader can miss it (03-ARCH PART ONE; 02-MODULES §9):** *Canon never lives on a server.* The backend stores authentication material, license state, billing state, **opaque encrypted blobs it cannot read**, usage counters, and **read-only rendered projections of already-LOCKED entries the user chose to publish**. It computes no world logic, resolves no canon, and holds no plaintext canon at rest, ever.

---

## 0. THE BACKEND'S CONSTITUTION (invariants — violations are defects, not choices)

These extend SPEC-001's I-1..I-8 into the server tier. They are numbered **BI-*** (Backend Invariant).

| # | Invariant | Derivation |
|---|---|---|
| BI-1 | **The Studio works fully offline forever.** Every backend service is optional infrastructure. Loss of the entire backend degrades sync, hosted portals, and metered-AI ONLY; it never blocks authoring, play, Binding, export, or local licensing within grace. | 03-ARCH PART ONE ("the instrument works offline forever"); SPEC-001 §1.2 (no network in core), §11 global failure law. |
| BI-2 | **The backend can never lock a user out of their own local data.** No license state, billing state, auth state, or account-deletion action may render the local Vault unreadable or un-exportable. Export (SPEC-001 §9) is always available regardless of server state. | Canon §"ownership covenant"; SPEC-001 I-6; constraint (2). |
| BI-3 | **No world logic server-side, ever.** The server runs no fold, no Binding, no contradiction detection, no query builder, no rite legality. It cannot, because it never holds plaintext canon (BI-4). | 03-ARCH PART ONE (verbatim); 02-MODULES §9. |
| BI-4 | **Server compromise reveals nothing.** All canon-derived payloads (sync blobs, AI staging) are end-to-end encrypted or redacted before egress. A full database + key-store exfiltration of the *sync* subsystem yields ciphertext and routing metadata only. | Codex GENESIS 08 §IX ("end-to-end encrypted or it doesn't ship"); SPEC-001 §17; constraint (4). |
| BI-5 | **Sync is single-USER multi-DEVICE only.** No multi-user, no Rooms, no shared authoring, no server-side merge. Canon conflicts route to the client's Contradiction Bench as docket cases — human arbitration, never automatic merge. | SPEC-001 §13; constraint (3),(4). |
| BI-6 | **Only LOCKED entries can be projected out; PROVISIONAL/UNKNOWN structurally cannot leak** — enforced client-side at publish AND re-verified server-side as defense-in-depth. | 02-MODULES §9 ("only LOCKED publishes; PROVISIONAL/UNKNOWN structurally cannot leak"); SPEC-001 §18. |
| BI-7 | **No engagement loops, no behavioral analytics, no telemetry** beyond operational metrics needed to run the service and bill metered usage. The Ledger is the only analytics and it belongs to the user (local, SPEC-001 §12). | Canon §"THE ONE LAW" spirit; SPEC-001 §12; constraint (5); CLAUDE.md NEVER-DO. |
| BI-8 | **The AI proxy forwards the redacted staged subgraph ONLY** (SPEC-001 §8, ≤8,000 token hard cap, perspective-redacted, veiled scenes excluded), never the raw event stream. It meters and forwards; it does not persist prompt bodies beyond the metering window. | SPEC-001 §8, §17; Codex GENESIS 08 §IX; constraint on AI proxy. |
| BI-9 | **The backend is versioned against SPEC-001 contracts, not against itself alone.** It declares the `vocabVersion`/`ddlVersion`/`bodySchemaVersion` ranges it is compatible with and refuses (soft, non-blocking) to relay for clients outside them. | SPEC-001 §14, §18; §9 of this doc. |

**Confidence (this section): High.** Every invariant is a direct restatement of cited canon.

---

## 1. DEPLOYMENT TOPOLOGY

### 1.1 Services (bounded contexts — each independently deployable, no shared mutable state except via published contracts)

```
                          ┌──────────────────────────────────────────┐
   Studio client(s)  ───▶ │  EDGE (TLS 1.3, HSTS, WAF, rate-limit)    │
   (Tauri / Capacitor)    └──────────────────────────────────────────┘
                                   │            │            │            │
                    ┌──────────────┘   ┌────────┘   ┌────────┘   ┌────────┘
                    ▼                  ▼            ▼            ▼
             ┌────────────┐     ┌────────────┐ ┌──────────┐ ┌──────────────┐
             │  IDENTITY  │     │  ENTITLE-  │ │  SYNC     │ │  AI PROXY    │
             │  (auth,    │     │  MENT      │ │  RELAY    │ │  (meter +    │
             │  devices)  │     │  (license) │ │  (E2E     │ │  forward)    │
             └─────┬──────┘     └─────┬──────┘ │  blobs)   │ └──────┬───────┘
                   │                  │        └────┬─────┘        │
                   │            ┌─────┴──────┐      │         ┌────┴─────┐
                   │            │  BILLING   │      │         │ upstream │
                   │            │  ADAPTER   │◀─────┼── webhooks   LLM     │
                   │            └─────┬──────┘  provider        providers │
                   │                  │                        └──────────┘
                   ▼                  ▼               ▼
             ┌─────────────────────────────────────────────┐   ┌──────────────┐
             │  CONTROL-PLANE STORE (Postgres)              │   │ BLOB STORE   │
             │  accounts, devices, tokens(hashed),          │   │ (object/CDN) │
             │  entitlements, billing mirror, usage meters, │   │ - sync blobs │
             │  portal manifests (metadata only)            │   │ - portals    │
             └─────────────────────────────────────────────┘   └──────────────┘
```

- **IDENTITY** — accounts, device pairing, token issuance/rotation, account deletion. §2.
- **ENTITLEMENT** — tier entitlements as data, signed license tokens, grace policy. §3.
- **BILLING ADAPTER** — provider-agnostic boundary; webhooks → entitlement sync. §4.
- **SYNC RELAY** — encrypted event-log replication for one user's devices; stores opaque blobs + routing metadata. §5.
- **PRESS PORTAL HOSTING** — publish pipeline, static/rendered read-only portals + CDN. §6.
- **AI PROXY** — meters usage, forwards the redacted subgraph to LLM providers. §7.

### 1.2 Data ownership per store

| Store | Holds | Never holds |
|---|---|---|
| Control-plane Postgres | account rows, device rows, **hashed** refresh tokens, entitlement snapshots, billing-mirror rows, usage meters, portal *metadata* (slug, domain, publish manifest hashes, drip schedule) | plaintext canon, plaintext passwords, provider card data, sync blob plaintext, private keys |
| Blob store (sync) | AEAD ciphertext blobs keyed by `(accountId, deviceId, blobId)`; envelope headers (see §5.4) | any plaintext; any key material |
| Blob store / CDN (portals) | rendered static HTML/JSON/asset bundles of LOCKED-only projections | PROVISIONAL/UNKNOWN entries; veiled content; raw event log; body fields marked `hidden` |
| KMS (see ADR-004) | server-side infra keys (TLS, token-signing, at-rest wrap keys) | **user E2E content keys** — those never leave the client (§5.5) |

### 1.3 Regionality & residency

Single logical region for v1 with the blob store CDN-fronted globally (read-only portals are static). **ADR-003** (cloud host) fixes the concrete provider; residency guarantees for EU users are deferred to a GAP (privacy law review is out of scope for this draft).

**Confidence (this section): Medium** — topology is derivable from 03-ARCH; concrete host/region is ADR-003.

---

## 2. AUTH

### 2.1 Account model

An **account** is the billing/sync/publish identity. It is NOT required to use the Studio (BI-1). It maps to SPEC-001's single-owner model: one account = one **owner** principal across that owner's devices. SPEC-001 §10 "principals" (players at the table) are **local rows, not accounts, and never gain server identity in v1** (SPEC-001 §10; BI-5).

```ts
interface Account {
  accountId: Ulid;                 // server-minted; distinct from any local ActorId
  email: string;                   // unique, case-folded, verified
  emailVerifiedAt: IsoInstant | null;
  status: 'active' | 'suspended' | 'pending_deletion' | 'deleted';
  createdAt: IsoInstant;
  // Binding to the local world model is DEFERRED and INDIRECT:
  // the account owns devices; devices carry the local DeviceId (SPEC-001 §2.1);
  // the local ActorId 'owner' is never uploaded (it stays local).
}

interface Device {
  deviceId: DeviceId;              // SPEC-001 §2.1 stable per-install UUID (client-generated)
  accountId: Ulid;
  displayName: string;             // user-set ("Marcus's Desktop")
  platform: 'tauri-desktop' | 'capacitor-mobile';
  pairedAt: IsoInstant;
  lastSeenAt: IsoInstant;
  status: 'active' | 'revoked';
  pubSigKey: string;               // device Ed25519 public key (for blob authenticity, §5.5)
  // NO private keys, NO content keys server-side (BI-4).
}
```

**Identity provider choice is ADR-001.** The schema above is provider-neutral (works with a hosted IdP or self-run). Password/credential storage rules (Argon2id, no plaintext) apply only if ADR-001 selects self-run credentials.

### 2.2 Sign-in & session model

Two token classes:

- **Access token** — short-lived JWT (TTL **15 min**, ADR-worthy tuning noted), signed by the token-signing key (KMS, ADR-004). Claims: `sub=accountId`, `dev=deviceId`, `ent=<entitlement digest>` (§3.4), `exp`, `iat`, `jti`. Stateless verification at the edge.
- **Refresh token** — opaque 256-bit random, **stored hashed** (SHA-256) in Postgres, rotating on every use (one-time-use; reuse detection → revoke device, §2.6). TTL **60 days** sliding.

Flow:
```
POST /v1/auth/signin { email, credentialProof }      → 200 { accessToken, refreshToken, account } | B-2001
POST /v1/auth/refresh { refreshToken }               → 200 { accessToken, refreshToken(new) } | B-2002 | B-2003(reuse)
POST /v1/auth/signout { refreshToken }               → 204 (revokes this refresh token only)
```

### 2.3 Device pairing

New device must be authorized by an already-trusted device OR by email-verification challenge (defense against a stolen password auto-inheriting E2E history). Pairing establishes device trust **and** triggers the client-side **key handoff** (§5.5) — the server never sees the content key.

```
POST /v1/devices/pair/initiate { newDevicePubSigKey, platform, displayName }
      → 200 { pairingCode, expiresAt }        // 8-digit, TTL 10 min, single-use
// On a trusted device:
POST /v1/devices/pair/confirm { pairingCode }
      → 200 { newDeviceId }                    // server marks device active; emits pairing.completed
// The trusted device then wraps the content key to newDevicePubSigKey CLIENT-SIDE and
// uploads only an OPAQUE wrapped-key blob (§5.5). Server stores/relays it without reading it.
```

Errors: `B-2101 PairingCodeInvalid`, `B-2102 PairingCodeExpired`, `B-2103 DeviceLimitReached` (see §3.2 tier `deviceLimit`).

### 2.4 Token lifecycle (state machine)

```
        signin/pair            refresh (rotate)
  ()  ─────────────▶ ACTIVE ───────────────────▶ ACTIVE
                        │  │                         │
              signout   │  │ refresh reuse detected  │ account suspended/deleted
                        ▼  ▼                         ▼
                     REVOKED  ◀──────────────────  REVOKED  (all device tokens killed)
```

Access tokens are never revoked mid-life (stateless, ≤15 min blast radius); revocation acts on refresh tokens + a per-device `tokenEpoch` bumped on revoke (access tokens carry `epoch`; edge rejects stale epoch for security-sensitive routes — publish, delete, billing).

### 2.5 Offline-grace behavior (AUTH)

Auth is only needed to *reach* backend services. Because BI-1, the client caches the **last valid entitlement token** (§3.3) and operates on it offline. When access+refresh both expire offline, the client:
1. keeps working locally on the cached entitlement within its grace window (§3.3);
2. queues sync deltas locally (SPEC-001's gapless `deviceSeq` guarantees no loss);
3. re-authenticates transparently on reconnect.

There is **no auth-required path that can block local authoring** (BI-1, BI-2).

### 2.6 Compromise handling

Refresh-token reuse (`B-2003`) ⇒ revoke the offending device, bump `tokenEpoch`, email the account. Stolen access token damage is bounded to ≤15 min and cannot touch E2E content (server has no content key). Sync blobs remain confidential even to an attacker holding valid tokens, because decryption needs the client content key (BI-4).

### 2.7 Account deletion (covenant-honoring)

The single most covenant-sensitive server action. State machine:

```
active ──request──▶ pending_deletion ──(grace 30d, cancelable)──▶ purge ──▶ deleted (tombstone)
                          │
                    cancel│ (any signin)
                          ▼
                        active
```

Guarantees (BI-2, canon covenant, SPEC-001 §9):
- Deletion deletes **server-side** artifacts only: account row (→ tombstone with `email_hash` for reuse-block), devices, hashed tokens, **all sync blobs**, portal projections, usage meters, billing mirror.
- **It cannot and does not touch any local Vault.** The client explicitly warns: "Your worlds live on your devices and are untouched. Export first if this is your only copy." Deletion flow *offers* a one-click local export (SPEC-001 §9.4) before proceeding.
- Portals are unpublished/taken down (§6.6) as part of purge.
- Billing: cancels subscription at provider (§4.6) — no further charge; no refund is automatic (refund is §4.6 policy).
- Purge is **irreversible** after the 30-day grace; a `DeletionReceipt{accountId, purgedAt, artifactCounts}` is emailed.

```
POST /v1/account/delete/request   → 202 { pendingUntil }   (sends export nudge)
POST /v1/account/delete/cancel    → 200 (within grace)
// purge runs by scheduled job at pendingUntil; emits account.purged
```

Errors: `B-2201 DeletionAlreadyPending`, `B-2202 NothingToDelete`.

**Confidence (this section): Medium.** Account/device/token machinery is standard and derivable; **the IdP choice (ADR-001) and credential specifics are open**, and the E2E key-handoff (§5.5) depends on ADR-004.

---

## 3. LICENSING

### 3.1 Entitlements as data (not code)

Tiers from 01-VISION-AND-MARKET §IV are expressed as a **signed, versioned entitlement document**. Prices are illustrative per 01-VISION ("final numbers set at beta"); the *capability rows* are the contract. Module names map to 02-MODULES.

```ts
type Tier = 'ember' | 'forge' | 'archive' | 'atelier';

interface EntitlementDoc {
  schema: 'aa.entitlement.v1';
  tier: Tier;
  accountId: Ulid;
  features: Record<FeatureKey, FeatureGrant>;   // see table
  issuedAt: IsoInstant;
  notAfter: IsoInstant;             // token expiry (short; refreshed online) — NOT the grace horizon
  graceDays: number;               // offline grace beyond notAfter (§3.3)
  sig: string;                     // Ed25519 over canonical JSON, verifiable OFFLINE by the client
  keyId: string;                   // which signing key (rotation)
}
```

Feature matrix (derived from 01-VISION §IV "Contains" column + 02-MODULES priorities). `FeatureGrant = { enabled: boolean, limit?: number, meta?: object }`.

| FeatureKey | Ember (~$12) | Forge (~$29) | Archive (~$79) | Atelier (~$199) | Canon source |
|---|---|---|---|---|---|
| `module.codex` | ✅ full | ✅ | ✅ | ✅ | 01-VISION §IV; 02-MODULES §1 |
| `worlds.max` | 1 | ∞ (fair-use) | ∞ | ∞ | 01-VISION §IV (Ember "one world") |
| `academy.onramp` | ✅ | ✅ full | ✅ | ✅ | 01-VISION §IV |
| `module.worldForge` | ❌ | ✅ | ✅ | ✅ | 01-VISION §IV (Forge = "Full Studio") |
| `module.campaignStudio` | ❌ | ✅ | ✅ | ✅ | 01-VISION §IV |
| `module.charterRoom` | ❌ | ✅ | ✅ | ✅ | 01-VISION §IV |
| `module.chronicle` | ❌ | ✅ | ✅ | ✅ | 01-VISION §IV |
| `academy.full` | ❌ | ✅ | ✅ | ✅ | 01-VISION §IV |
| `dramaturg.byo` | ❌ | ✅ | ✅ | ✅ | 01-VISION §IV ("BYO or metered AI") |
| `dramaturg.metered` | ❌ | ✅ (standard) | ✅ priority | ✅ priority | 01-VISION §IV ("priority AI") |
| `sync.enabled` | ADR-002 | ✅ | ✅ | ✅ | 03-ARCH (sync in v1.0) — Ember inclusion is **ADR-002** |
| `deviceLimit` | 2 (desktop+mobile) | 2 | 3 | team (ADR-005) | derived; team seats = 01-VISION Atelier |
| `module.press` | ❌ | ❌ | ✅ | ✅ | 01-VISION §IV (Archive = "+ the Press") |
| `press.portals.max` | 0 | 0 | N (ADR) | ∞ | 02-MODULES §9; 01-VISION §IV |
| `press.customDomain` | ❌ | ❌ | ADR | ✅ white-label | 01-VISION §IV (Atelier "white-label portals") |
| `module.stagePerformance` | ❌ | ❌ | ❌ | ✅ | 01-VISION §IV (Atelier headline) |
| `revenue.integrations` | ❌ | ❌ | ❌ | ✅ | 01-VISION §IV |
| `team.seats` | 1 | 1 | 1 | N (ADR-005) | 01-VISION §IV (Atelier "team seats") |
| `api.access` | ❌ | ❌ | ❌ | ✅ | 01-VISION §IV (Atelier "API") |

Open cells (`ADR`/`N`) are itemized in the GAP REGISTER. **The matrix is data**: shipped as a signed document the client reads; changing a limit is a config+signature change, not a client build (mirrors SPEC-001 §7.5 "thresholds are data").

### 3.2 The licensing invariant (constitutional)

> **LI-1 (never lock the user out of their own local data):** No tier, no lapse, no downgrade, no deletion may make a local Vault unreadable, un-editable *for entries the user already authored*, or un-exportable. Licensing gates **new use of premium MODULES and backend SERVICES**, never access to data already in the Vault. (BI-2; canon covenant; SPEC-001 I-6, §9.)

Concretely: if a Forge user lapses to Ember, the World Forge module becomes **read-only** for existing worlds (you can open, read, export, and — GAP: define whether you can still Bind existing pending ash), but you can never be denied *opening and exporting* worlds you built. Export is always full and lossless (SPEC-001 §9.2).

### 3.3 Offline license validation + grace

The entitlement doc is **Ed25519-signed and verified entirely offline** by the client against a pinned public key (rotation via `keyId` + a client-bundled keyring; new keys delivered in app updates). No network call is needed to validate a license the client already holds.

Grace model:
```
online refresh succeeds ──▶ freshToken (notAfter = now + 24h typical)
                                     │
             (offline / server down) │
                                     ▼
   within notAfter ............... FULL entitlement
   notAfter < now ≤ notAfter+graceDays ... GRACE: full features, client shows "reconnect to keep <tier>"
   now > notAfter + graceDays ..... LAPSED: degrade per §3.5 (NEVER lock local data — LI-1)
```

Default `graceDays = 14` (derivation: generous, covenant-favoring; concrete value is tuning — noted GAP). Clock-tampering resistance: the client uses monotonic + last-seen-server-time high-water mark; it never *extends* grace by clock rollback, and it never *shortens* below the signed window by clock skew (fails toward the user, BI-2).

### 3.4 Entitlement digest in access tokens

The access-token `ent` claim carries a short digest (tier + feature-version hash) so the edge can gate *server* routes (e.g., a portal publish requires `module.press`) without a DB round-trip. The authoritative grant is always the signed EntitlementDoc; the digest is an optimization.

### 3.5 Lapse behavior — degrade vs. hard-stop (exhaustive)

| Capability | On lapse | Rationale |
|---|---|---|
| Open/read/**export** any existing world | **Always available** (never gated) | LI-1, BI-2 |
| Local authoring/Binding in Ember-included modules (Codex) | Continues at Ember level | tier floor |
| Premium module *authoring* (Forge/Campaign/Charter/Press) | **Read-only** for existing data; new premium authoring blocked | gate new use, not data |
| Sync relay | **Pauses**; local deltas queue (no loss, SPEC-001 §13); resumes on re-entitlement | service, not data |
| Hosted portals | Enter **grace-then-suspend** (§6.6): served for `graceDays`, then return 402-holding page; content NOT deleted during grace | service; covenant-favoring |
| Metered AI | Hard-stops at 0 remaining or lapse; BYO-model path (local/user-key) unaffected | metered = paid service |
| Account/device management, re-subscribe | Always available | recovery path |

**No capability in this table can render local canon inaccessible.** That is the whole point of LI-1.

### 3.6 Tier-change behavior (state machine)

```
        upgrade (immediate, prorated by provider)
  TIER_A ─────────────────────────────────────▶ TIER_B(higher)   features unlock instantly on webhook (§4.3)
        ◀─────────────────────────────────────
        downgrade (effective at period end; grace to migrate)
```

- **Upgrade:** entitlement reissued immediately on `subscription.updated` webhook (§4.3); client picks it up on next refresh or via push (ADR-006 push channel).
- **Downgrade:** takes effect at billing-period end (no mid-period feature yank; covenant-favoring). If the downgrade drops a module with hosted assets (e.g., Archive→Forge drops Press), portals enter grace-then-suspend (§6.6) and the user is warned at downgrade time with an export offer.
- **Over-limit after downgrade** (e.g., 5 worlds, new limit is fair-use ∞ → n/a; or 3 devices → 2): existing over-limit artifacts are **never destroyed**; the client blocks *creating new* ones until back under limit, and lets the user pick which device to unpair. (LI-1 — never destroy user data to enforce a limit.)

**Confidence (this section): Medium.** Entitlement-as-signed-data, offline grace, and LI-1 degradation are strongly derivable. Open: Ember sync inclusion (ADR-002), several limits (GAP), and the "can you Bind while lapsed" edge (GAP).

---

## 4. BILLING

### 4.1 Boundary posture (integration boundary only — vendor is ADR-000)

Per METHOD RULES, **no billing vendor is chosen here.** This section specifies the *boundary* the backend presents so any provider (Stripe/Paddle/Lemon-Squeezy/RevenueCat-for-mobile/etc.) plugs in behind one adapter interface. Vendor selection is **ADR-000** (the primary billing ADR). Note the mobile reality: iOS/Android store billing (StoreKit/Play Billing) may be mandatory for the Capacitor app — this is called out in ADR-000 as a multi-provider consequence.

### 4.2 The adapter interface (provider-agnostic)

```ts
interface BillingProvider {
  createCheckout(accountId: Ulid, tier: Tier, opts): Promise<{ checkoutUrl: string }>;
  createPortalSession(accountId: Ulid): Promise<{ url: string }>;   // provider-hosted mgmt
  cancel(accountId: Ulid, when: 'now' | 'period_end'): Promise<void>;
  refund(chargeId: string, amount?: number, reason?: string): Promise<RefundResult>;
  parseWebhook(rawBody: Buffer, sig: string): WebhookEvent;         // signature-verified
}
// The backend NEVER sees card numbers/PANs. PCI scope stays with the provider (SAQ-A posture).
```

**Data ownership:** the backend stores a **billing mirror** only — `{ providerCustomerId, providerSubId, tier, status, currentPeriodEnd, cancelAtPeriodEnd }`. No card data, ever (PCI SAQ-A). The provider is the source of truth; the mirror is a cache reconciled by webhooks + a nightly reconcile job.

### 4.3 Webhooks → entitlement sync (the critical path)

```
provider event ──▶ EDGE (verify signature) ──▶ BILLING ADAPTER (idempotent by providerEventId)
   ──▶ update billing mirror ──▶ ENTITLEMENT service recomputes EntitlementDoc ──▶ signs ──▶
   ──▶ store + push (ADR-006) / serve on next /v1/entitlement/refresh
```

Idempotency: every webhook carries a provider event id; the adapter dedupes on it (unique index). Out-of-order delivery handled by comparing provider object `updatedAt`/version; stale events are dropped (`B-4003 StaleWebhook`). Webhook processing is **at-least-once**; entitlement recompute is **pure over billing-mirror state**, so replays converge.

Mapped events (provider-neutral names): `subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, `customer.deleted`.

### 4.4 Subscription lifecycle (state machine)

```
  none ─checkout.paid─▶ ACTIVE ─payment_failed─▶ PAST_DUE ─(dunning retries)─┐
    ▲                     │  ▲                        │                       │
    │             cancel  │  │ invoice.paid           │ grace exhausted       │
    │           period_end│  └────────────────────────┘                       ▼
    │                     ▼                                              CANCELED/UNPAID
    └──────────── resubscribe ◀──────────────────────────────────────────────┘
```

Entitlement mapping:
- `ACTIVE` → full tier EntitlementDoc.
- `PAST_DUE` → **entitlement unchanged during the dunning window** (covenant-favoring; user keeps features while the provider retries). Client shows a soft "update payment" banner.
- `CANCELED`/`UNPAID` (dunning exhausted) → EntitlementDoc reissued at **Ember floor** (or `graceDays` then floor); local data untouched (LI-1). Portals grace-then-suspend (§6.6).

### 4.5 Dunning / failure states

Dunning schedule is the **provider's** (do not reinvent). Backend consequence: keep entitlement at current tier through `PAST_DUE`; on final failure, downgrade to floor per §4.4. The exact dunning window length is a provider-config value surfaced as `graceDays` alignment (GAP: reconcile provider dunning window with §3.3 offline grace so they don't double-count — noted).

### 4.6 Refund / downgrade / cancellation

- **Cancel** → `cancelAtPeriodEnd=true`; features persist to period end (§3.6 downgrade rules).
- **Refund** → provider action via adapter; refund does **not** retroactively delete authored data (LI-1). If a refund implies immediate service loss (fraud/chargeback), entitlement drops to floor immediately; **local data still untouched**, export still available.
- **Chargeback** → treat as immediate `UNPAID`; suspend hosted services (portals, sync, AI); never touch local Vault.
- Refund *policy* (window, proration) is a business decision → **GAP** (not an engineering fiat).

Errors: `B-4001 CheckoutFailed`, `B-4002 WebhookSignatureInvalid`, `B-4003 StaleWebhook`, `B-4004 ProviderUnavailable` (→ retwith backoff; entitlement unchanged), `B-4005 RefundFailed`.

**Confidence (this section): Medium.** The boundary/adapter/webhook→entitlement pattern is fully derivable and vendor-neutral; **vendor (ADR-000), mobile-store billing, dunning window reconciliation, and refund policy are open.**

---

## 5. SYNC SERVICE (the encrypted relay)

### 5.1 Purpose & shape (SPEC-001 §13, verbatim reservations)

Single-user multi-device replication of the **event log** and the **append-only version chains**, using SPEC-001's existing ordering primitives (`deviceSeq`, `lamport`, `(lamport, deviceId)` cross-device order). The server is a **dumb encrypted relay + ordering-metadata router**. It never merges, never folds, never reads plaintext (BI-3, BI-4). This is the "future sync layer will be a separate package consuming the Foundation's export surfaces" from SPEC-001 §1.2 / §13.

**Explicit non-goals (BI-5):** multi-user, Rooms, shared authoring, server-side conflict resolution, presence. Those are v2.0 and out of scope; named here only as a boundary.

### 5.2 What the server sees vs. never sees

| Server SEES (routing metadata, cleartext) | Server NEVER SEES |
|---|---|
| `accountId`, `deviceId`, `worldId` (as an opaque ULID — no name), `deviceSeq`, `lamport`, `blobId`, byte length, `contentType='ash.event'|'entry.version'|'snapshot'|'attachment'`, wrapped-key blobs (opaque), timestamps of relay | event `type`, payload, entry bodies, names, prose, canon status content, disclosures, veiled content, attachment bytes — **all AEAD ciphertext** |

Even `worldId` is a random ULID (SPEC-001 §2.1) carrying no semantic content; world *names* live only inside encrypted blobs. Routing needs the id to fan out to the right devices; it reveals nothing about the world.

### 5.3 Replication model — event-log push/pull

Because SPEC-001 guarantees **gapless `deviceSeq` per device** and **immutable, append-only** events/versions, sync is a monotone log-shipping problem, not a merge problem:

```
Client A appends events locally (deviceSeq 1..n)  ──encrypt each──▶ PUSH blobs to relay
Client B  ──PULL since its per-device cursors──▶ decrypt ──▶ replay into local Ash ──▶ folds recompute
```

Ordering on replay is SPEC-001's law: total order within a device is `deviceSeq`; cross-device is `(lamport, deviceId)` (SPEC-001 §3.1 "Ordering law"). The relay stores blobs keyed and returned **in per-(device,deviceSeq) order**; the client does the `(lamport, deviceId)` interleave locally (server has no authority over order — it only preserves per-device gaplessness).

### 5.4 The client↔server protocol (exact)

All bodies are the ciphertext envelope; the server validates only the outer header.

```ts
interface SyncEnvelope {
  v: 1;                            // protocol version
  accountId: Ulid;
  worldId: WorldId;                // opaque routing id
  originDeviceId: DeviceId;
  contentType: 'ash.event' | 'entry.version' | 'snapshot' | 'attachment.chunk';
  deviceSeq: number;               // gapless per (worldId, originDeviceId) — server ENFORCES gaplessness
  lamport: number;                 // opaque to server; carried for client interleave
  blobId: Ulid;                    // client-minted, idempotency key
  cipher: 'xchacha20poly1305';     // AEAD (ADR-004 confirms primitive)
  nonce: string;                   // base64, 24-byte
  aad: string;                     // additional-authenticated-data = canonical header (binds metadata to ciphertext)
  ct: string;                      // base64 ciphertext (the ONLY place canon-derived bytes exist, encrypted)
  keyEpoch: number;                // which content-key epoch (§5.5 rotation)
}
```

Endpoints:
```
POST /v1/sync/push      body: SyncEnvelope[]      → 200 { accepted: blobId[], rejected: {blobId, code}[] }
GET  /v1/sync/pull?worldId=&cursors=<deviceId:deviceSeq,...>&limit=
                                                  → 200 { envelopes: SyncEnvelope[], nextCursors }
GET  /v1/sync/state?worldId=                      → 200 { perDeviceHighWater: {deviceId: deviceSeq} }
POST /v1/sync/attachment/init { blobId, totalBytes, chunks } → 200 { uploadId }   // chunked, still E2E
```

Server-side push validation (metadata only, BI-3):
- `deviceSeq` must be exactly `highWater(worldId, originDeviceId) + 1` for a run, else `B-5001 SequenceGap` (mirrors SPEC-001 `E-1202` posture — never guess ordering).
- `blobId` dedupe (idempotent re-push returns `accepted` for already-stored).
- Size caps: single blob ≤ 1 MB (events); attachments chunked at ≤ 4 MB/chunk, total honoring SPEC-001 §2.5 100 MB single-attachment cap → `B-5002 BlobTooLarge`.
- **No payload inspection.** The server cannot validate event `type` or body — that is client-side (SPEC-001 §4.2 write rules) and stays there (BI-3).

### 5.5 Key management (E2E)

**Content key never leaves the client (BI-4).** Model (concrete primitives confirmed in ADR-004):

- On first account setup, the client generates a per-account **root content key** (`RCK`, 256-bit). Optionally derived from a user passphrase via Argon2id for recoverability (ADR-004 decides passphrase vs. device-only).
- Per-world **content key** `WCK = HKDF(RCK, worldId)`. Blobs are AEAD-encrypted under `WCK` (per-epoch, §5.5.1).
- **Device enrollment** (from §2.3): a trusted device wraps `RCK` to the new device's `pubSigKey` (X25519 sealed box) and uploads the **wrapped** key as an opaque blob. The relay stores/relays it; it is ciphertext to the server (BI-4).
- **Server holds:** device public keys, wrapped-key blobs (opaque), key `epoch` numbers. **Server never holds:** `RCK`, `WCK`, any private key, any passphrase.

#### 5.5.1 Key rotation & lost device
- Rotating `keyEpoch` (e.g., after a device revoke) re-wraps `RCK`→new epoch for remaining devices client-side; new blobs use the new epoch. Old blobs remain readable at their epoch (append-only history).
- **Lost device with no passphrase recovery:** if only one device held `RCK` and it is lost, **server-side data is unrecoverable by design** (BI-4 — the server cannot help; it never had the key). The local Vault on any surviving device is unaffected (BI-1/BI-2). This trade-off is stated to the user at setup. Passphrase-based recovery (ADR-004) mitigates this at a stated security cost.

### 5.6 Conflict surfacing (NOT merging)

Per SPEC-001 §13 and constraint (4): the relay merges the **log** (both devices' appends interleave by `(lamport, deviceId)` — that is not a conflict, it is just ordering). A **canon conflict** is only when two devices **bound competing versions** of the same entry (two Bindings of the same entry). The relay does not detect this (BI-3); the **client** does, on replay:

```
Client replays remote log → local Binding transaction produced version V_local for entry E
                            remote log carries version V_remote for entry E, both provenance:'ink'
   ──▶ client files a ContradictionCase (SPEC-001 §7.4 machinery) → Contradiction Bench docket
       → HUMAN arbitration (SPEC-001 §13; constraint 4). NEVER auto-merged. NEVER server-resolved.
```

Two devices *appending* ash (device A and B both appended) → the log simply merges by ordering; no conflict. Two *Bindings* of the same entry → surfaced as a docket case, not merged. This is exactly SPEC-001 §13's reserved behavior; this spec implements the relay half without changing that contract.

### 5.7 Failure modes & edge cases (exhaustive)

| Case | Behavior |
|---|---|
| Offline | Local deltas queue with gapless `deviceSeq`; push on reconnect; zero loss (SPEC-001 §13). |
| Relay down | Client keeps working locally (BI-1); sync resumes; no data affected. |
| Partial push | Per-blob `accepted`/`rejected`; client retries rejected by `blobId` (idempotent). |
| SequenceGap (`B-5001`) | Reject the gapped run; client re-derives from its high-water cursor; mirrors SPEC-001 `E-1202` "never guess." |
| Duplicate blob | Idempotent accept (blobId dedupe). |
| Clock skew | Irrelevant — ordering uses `deviceSeq`/`lamport`, never wallTime (SPEC-001 §3.1). |
| Two Bindings same entry | Docket case → human arbitration (§5.6). |
| Blob store outage | Push returns `B-5003 RelayUnavailable` (retryable); pull degrades to cached local state. |
| Entitlement lapse | Sync pauses (§3.5); queue persists; no loss. |
| Corrupt/undecryptable blob | Client flags `B-5004 DecryptFailed` locally, quarantines that blob, continues; surfaces to user (possible key-epoch mismatch or tamper — tamper caught by AEAD tag). |

### 5.8 Threat model — "server compromise reveals nothing"

Assume full compromise of relay servers + Postgres + blob store + infra KMS. Attacker obtains: ciphertext blobs, device public keys, wrapped-key blobs, routing metadata (accountId, opaque worldId/deviceId, seq/lamport, sizes, timings). Attacker CANNOT: decrypt any canon (no `RCK`/`WCK`; wrapped keys need device private keys the server never held); forge accepted blobs that a client will trust (AEAD + device signature `pubSigKey`); learn world names/content/structure. Residual metadata leakage (blob counts, sizes, timing) is acknowledged as a **GAP** (traffic-analysis mitigation like padding/batching is deferred). This satisfies BI-4 and Codex GENESIS 08 §IX.

### 5.9 Performance budgets (SLO-linked, §8)

| Op | Budget |
|---|---|
| `push` accept (per 100-blob batch) | p95 ≤ 400 ms server-side |
| `pull` (cold, 10k backlog envelopes) | ≤ 5 s to first usable window; streamed |
| End-to-end propagation A→B (both online) | p95 ≤ 10 s |
| Blob durability | 11-nines object store (ADR-003) |

**Confidence (this section): Medium.** The relay design is a direct, faithful implementation of SPEC-001 §13's explicit reservations, so the *shape* is High-confidence; the crypto primitive specifics and recovery model ride on **ADR-004**, and traffic-analysis hardening is a GAP.

---

## 6. PRESS PORTAL HOSTING

### 6.1 Purpose (02-MODULES §9; SPEC-001 §18)

"The one place a server enters the architecture — portals are published *out*, canon never lives *on* the server" (02-MODULES §9). A portal is a **read-only, static/rendered projection of LOCKED-only entries** the user explicitly chose to publish, with reader-knowledge drip scheduling. SPEC-001 §18 confirms these are "read-only projections of LOCKED entries — already expressible as queries."

### 6.2 The publish pipeline (client-side projection → server-side re-verification → static host)

```
CLIENT (authoritative canon computation, SPEC-001 — BI-3):
  1. User selects a Publication (a saved query over LOCKED entries + a portal template).
  2. Client runs EntryQuery.whereStatus('locked') (SPEC-001 §5.5) with perspective redaction (§2.4).
  3. Client renders the projection to a STATIC bundle (HTML/JSON/asset), stripping:
     - any entry not canonStatus:'locked'  (BI-6)
     - any field marked `hidden` in kind schema (SPEC-001 §2.4)
     - any veiled content (SPEC-001 §17)
     - full history/ash (only the projected LOCKED head is published)
  4. Client computes a PublishManifest (per-item {entryId, versionId, canonStatus, sha256}).
  5. Client uploads bundle + manifest to the Press service.

SERVER (defense-in-depth re-verification, BI-6):
  6. Server RE-VALIDATES the manifest: every item MUST assert canonStatus:'locked'.
     ANY item not 'locked' ⇒ REJECT the whole publish (B-6001 NonLockedInProjection). Structural leak-prevention.
  7. Server checks no field flagged `hidden`/`veiled` markers survived (schema-aware validator).
  8. On pass: atomically swap the live portal to the new bundle; CDN-invalidate; record manifest hash.
```

The server re-verification (steps 6–7) is **defense-in-depth**: the client already guarantees LOCKED-only (BI-6), and the server enforces it again because a published server artifact is the one place a client bug could leak. **PROVISIONAL/UNKNOWN structurally cannot reach the CDN** — rejected before swap.

> **Note on encryption:** portals are, by intent, the ONE place canon is *deliberately* projected to a server as **public read-only content** — so portal bundles are NOT E2E encrypted (they are meant to be world-readable). This is not a contradiction of BI-4: BI-4 governs *canon the user did not choose to publish* (sync). The user's explicit publish act is the boundary. Only LOCKED, non-hidden, non-veiled, user-selected entries cross it (BI-6).

### 6.3 Portal data model (server-side metadata only)

```ts
interface Portal {
  portalId: Ulid; accountId: Ulid;
  slug: string;                    // aa.press/<slug>
  customDomain: string | null;     // §6.7 (entitlement-gated)
  status: 'draft' | 'live' | 'suspended' | 'taken_down';
  currentManifestHash: string;     // integrity of the live bundle
  tierGate: 'archive' | 'atelier'; // §3.1
  dripPolicy: DripPolicy | null;   // §6.4
  createdAt: IsoInstant; publishedAt: IsoInstant | null;
}
```
The server stores **metadata + the rendered bundle** only — never the source graph, never the query, never non-published entries.

### 6.4 Reader-knowledge / drip-feed scheduling (02-MODULES §9)

Patreon-style scheduled reveals of LOCKED entries to reader cohorts. Reader-knowledge tracking ("what have my patrons seen") is the read-side analog of SPEC-001 §2.4 Disclosure, but for **reader principals**, not table players (kept separate — readers are not SPEC-001 principals; BI-5).

```ts
interface DripPolicy {
  cohorts: { cohortId: string; label: string }[];        // e.g., 'public', 'patrons-tier1'
  schedule: { entryId: EntryId; versionId: VersionId;    // MUST be a LOCKED version (BI-6)
              revealAt: IsoInstant; toCohort: string }[];
  gating: 'public' | 'link' | 'authenticated_reader';    // reader auth model = ADR-007
}
```
Enforcement: a scheduled item is only in the bundle for cohorts whose `revealAt ≤ now`; the server assembles per-cohort static variants (or gates at the edge). A not-yet-revealed entry is **absent from the delivered bundle**, not merely CSS-hidden (BI-6 — structural, not cosmetic). Reader identity/auth for gated cohorts is **ADR-007** (out of scope to invent).

### 6.5 Custom domains (§6.7 detail)

`press.customDomain` (Archive: ADR; Atelier: white-label). Flow: user adds domain → server issues DNS challenge (TXT) → on verify, provision TLS cert (ACME) → route. Concrete CDN/cert provider is **ADR-003**. White-label (no A&A branding) is Atelier-only (01-VISION §IV).

### 6.6 Takedown / unpublish / suspend

```
draft ─publish─▶ live ─unpublish(user)─▶ draft(bundle purged from CDN)
                  live ─entitlement lapse/downgrade─▶ suspended (grace: served graceDays, then 402 holding page)
                  live ─abuse/legal takedown─▶ taken_down (immediate; §6.8)
                  any  ─account deletion (§2.7)─▶ purged
```
- **Unpublish** is immediate CDN purge; the source canon is untouched in the Vault (covenant).
- **Suspend** (lapse) never deletes the bundle during grace (covenant-favoring); after grace the bundle is purged and the domain returns a holding page.
- **Legal/abuse takedown** is immediate; recorded with reason; ASK-FIRST governance for A&A-initiated takedowns (CLAUDE.md guardrail — messaging/deleting is ask-first).

### 6.7 Abuse / DMCA / content policy

Portals are public egress → they need a content-report + takedown path. Policy specifics (DMCA agent, report SLA) are a **GAP** (legal/business, not engineering). The engineering hook: `POST /v1/press/report {portalId, reason}` → queues for human review → `taken_down` on action.

### 6.8 Errors

`B-6001 NonLockedInProjection` (reject publish — the structural guard), `B-6002 HiddenFieldLeak`, `B-6003 ManifestHashMismatch`, `B-6004 DomainVerifyFailed`, `B-6005 PortalLimitReached`, `B-6006 SuspendedNotEntitled`.

**Confidence (this section): Medium.** The pipeline and the LOCKED-only structural guard are strongly derivable from 02-MODULES §9 + SPEC-001 §18/§5.5. Open: reader-auth model (ADR-007), custom-domain/CDN provider (ADR-003), content-policy (GAP), and `portals.max` limits (GAP).

---

## 7. THE METERED-AI PROXY BOUNDARY

### 7.1 What it is (and is not) — SPEC-001 §8 is law here

The proxy exists so Forge/Archive/Atelier users can use the Dramaturg without their own API key (01-VISION §IV "metered AI"; 02-MODULES §8 "metered-cloud options"). It **forwards** the Dramaturg's request to an upstream LLM provider, **meters** tokens for billing, and forwards the response. It is not intelligent; it is a metered pass-through.

**BI-8 (the hard boundary):** the proxy accepts **only** the SPEC-001 §8 `StagedSubgraph` payload — perspective-redacted, veiled-excluded (SPEC-001 §17), token-capped (default 3,000 / hard max 8,000 tokens). It **never** accepts or forwards the raw event stream, full entries, disclosures, or veiled content. The client builds the staged subgraph via `archive.subgraph()` (SPEC-001 §5.2, §8) — the ONLY sanctioned staging source — and the proxy transports it.

### 7.2 Request contract

```
POST /v1/ai/complete
Headers: Authorization (access token; must carry ent.dramaturg.metered)
Body: {
  voice: 'ideator'|'builder'|'archivist'|'coach'|'codm',   // SPEC-001/02-MODULES §8 five voices (routing class)
  stagedSubgraph: StagedSubgraph,     // SPEC-001 §8 — token-estimated, redacted, capped. VALIDATED at ingress.
  promptTemplateId: string,           // prompt-as-data reference (Charter Room, 02-MODULES §8) — NOT free text
  maxTokens: number,                  // ≤ tier cap
  modelClass: 'standard'|'priority'   // Archive/Atelier get priority (01-VISION §IV)
}
→ 200 { completion, usage: {promptTokens, completionTokens}, meteredUnits }
```

Ingress validation (enforce BI-8):
- Reject if `stagedSubgraph.tokenEstimate > 8000` → `B-7001 SubgraphOverCap`.
- Reject if payload contains raw-event markers or non-staged shapes → `B-7002 RawStreamRejected` (schema guard: the endpoint accepts ONLY the `StagedSubgraph` schema; anything else is refused).
- Reject if entitlement lacks `dramaturg.metered` → `B-7003 NotEntitledMetered` (client falls back to BYO-model path, which never touches the proxy).

### 7.3 Metering & billing linkage

```
usage(promptTokens, completionTokens) ──▶ meteredUnits (tier rate) ──▶ usage meter (Postgres)
   ──▶ periodic roll-up ──▶ BILLING (usage-based line or included-allotment decrement)
```
- Meters are per-account, per-period counters. Included allotments (Forge standard vs. Archive priority) decrement; overage either hard-stops or bills per ADR-000 usage policy (**GAP**: overage policy = business decision).
- **Retention (BI-7, BI-8):** the proxy persists **counts only** for billing. Prompt/completion **bodies are not persisted** beyond the in-flight request + a short abuse-detection window (define retention window = **GAP**, must be minimal and stated in privacy policy). No behavioral profiling (BI-7).

### 7.4 Provider abstraction & privacy

- Upstream provider selection & routing per `modelClass`/`voice` latency class (02-MODULES §8 "model routing per voice latency class") is a runtime config; concrete providers are an **ADR** (co-located with ADR-000 economics — call it ADR-008 model-provider).
- Zero-retention posture with upstream providers (no training on data) is a **procurement requirement** flagged as GAP (contractual, not code).
- The proxy adds no context the client didn't stage (BI-8). It cannot enrich from a server-side graph because **no graph exists server-side** (BI-3).

### 7.5 Errors & degradation

`B-7001 SubgraphOverCap`, `B-7002 RawStreamRejected`, `B-7003 NotEntitledMetered`, `B-7004 UpstreamUnavailable` (retryable; client may fall back to BYO or defer — never blocks local play, BI-1), `B-7005 QuotaExhausted` (allotment spent). All AI failures degrade the Dramaturg only; the silent instruments keep working (SPEC-001 §11 global failure law; 02-MODULES §8 "after the silent instruments are excellent").

**Confidence (this section): Medium-High.** The boundary is a tight, faithful implementation of SPEC-001 §8 + §17; only provider economics (ADR-008) and retention/overage windows (GAP) are open.

---

## 8. OBSERVABILITY & SLOs

### 8.1 What is measured (BI-7 constraint — operational only, never behavioral)

Permitted: request latency/error rates per service, sync propagation lag, blob-store durability/availability, webhook processing lag, AI upstream latency, portal build/publish success. **Forbidden (BI-7):** user behavioral analytics, content inspection, engagement metrics, per-user usage profiling beyond billing counters. No product telemetry crosses the client boundary (SPEC-001 §12 — the Ledger is the analytics, local, user-owned).

### 8.2 SLOs

| Service | Availability SLO | Latency SLO | Notes |
|---|---|---|---|
| Identity/auth | 99.9% | signin p95 ≤ 500 ms | offline-grace absorbs outages (BI-1) |
| Entitlement | 99.9% | refresh p95 ≤ 300 ms | client caches signed doc; outage ≠ lockout |
| Sync relay | 99.9% | §5.9 budgets | outage → local queue, no loss |
| AI proxy | 99.5% | added overhead p95 ≤ 150 ms over upstream | degrades Dramaturg only |
| Portal CDN | 99.95% (read) | edge cache p95 ≤ 100 ms | static content |
| Billing webhook processing | 99.9% | ≤ 30 s event→entitlement | at-least-once, idempotent |

Every SLO's breach behavior is "the client keeps working" (BI-1) — the SLOs protect *convenience*, never *access to the user's own work*.

### 8.3 Alerting & audit

Structured logs (no canon plaintext ever in logs — enforced; sync/AI bodies are ciphertext/ephemeral). Security-relevant events (token reuse, device revoke, account deletion, publish, takedown) are audit-logged with actor + timestamp. Audit logs contain metadata only (BI-4).

**Confidence: High** — derivable from BI-7 + SPEC-001 §12.

---

## 9. VERSIONING AGAINST SPEC-001 CONTRACTS

### 9.1 The compatibility contract

The backend is a **consumer of SPEC-001's export/sync surfaces**, so it versions against them, not independently (BI-9; SPEC-001 §1.2, §14, §18).

```ts
interface BackendCompat {
  syncProtocol: 1;                          // §5.4
  compatibleVocabVersion: { min: number; max: number };   // SPEC-001 §3.2 VOCAB_VERSION
  compatibleDdlVersion:   { min: number; max: number };   // SPEC-001 §4.2 ddlVersion
  entitlementSchema: 'aa.entitlement.v1';
}
```

- Sync blobs are **opaque**, so the relay does NOT need to understand `vocabVersion` to route them — but it records the client's declared `vocabVersion` in envelope-adjacent metadata so a device on an older vocab is **warned** (soft, non-blocking) that a peer device is ahead, prompting an app update before replay (mirrors SPEC-001 §14 additive-only vocabulary evolution; replay of unknown event types is a client concern, handled by SPEC-001 migration, not the server).
- Portal projections carry `vocabVersion`/`ddlVersion` in their manifest so the renderer template versions align.
- Breaking changes to SPEC-001 §2–§9 contracts (a "SPEC-001 v2", expected cadence "years", §18) trigger a coordinated `syncProtocol` bump with dual-version support during migration windows.

### 9.2 Backend's own versioning

Independent of SPEC-001, the backend versions its **API** (`/v1/...` path prefix, additive within v1, breaking changes → `/v2`) and its **entitlement schema**. The two version axes are orthogonal and both declared in `BackendCompat`.

**Confidence: Medium-High.** Derivable from SPEC-001 §14/§18; exact migration-window mechanics are standard but unspecified in canon (minor GAP).

---

## 10. CONSOLIDATED ERROR TAXONOMY (backend `B-*` codes — disjoint from SPEC-001 `E-*`)

`Result<T>` shape matches SPEC-001 §11 (`{ok,value}|{ok,error:{code,message,data?,retryable}}`). Backend codes never collide with core `E-*`.

| Range | Family | Codes |
|---|---|---|
| B-20xx/21xx/22xx | Auth/devices/deletion | `B-2001 SigninFailed` · `B-2002 RefreshInvalid` · `B-2003 RefreshReuseDetected`(→revoke) · `B-2101 PairingCodeInvalid` · `B-2102 PairingCodeExpired` · `B-2103 DeviceLimitReached` · `B-2201 DeletionAlreadyPending` · `B-2202 NothingToDelete` |
| B-3xxx | Licensing | `B-3001 EntitlementSignatureInvalid`(client refuses; fail toward user) · `B-3002 EntitlementExpiredBeyondGrace`(→degrade, never lock, LI-1) · `B-3003 FeatureNotEntitled` · `B-3004 OverLimit`(block new, never destroy) |
| B-4xxx | Billing | `B-4001 CheckoutFailed` · `B-4002 WebhookSignatureInvalid` · `B-4003 StaleWebhook` · `B-4004 ProviderUnavailable`(retryable) · `B-4005 RefundFailed` |
| B-5xxx | Sync | `B-5001 SequenceGap`(never guess) · `B-5002 BlobTooLarge` · `B-5003 RelayUnavailable`(retryable) · `B-5004 DecryptFailed`(client quarantine) |
| B-6xxx | Press | `B-6001 NonLockedInProjection`(structural guard) · `B-6002 HiddenFieldLeak` · `B-6003 ManifestHashMismatch` · `B-6004 DomainVerifyFailed` · `B-6005 PortalLimitReached` · `B-6006 SuspendedNotEntitled` |
| B-7xxx | AI proxy | `B-7001 SubgraphOverCap` · `B-7002 RawStreamRejected` · `B-7003 NotEntitledMetered` · `B-7004 UpstreamUnavailable` · `B-7005 QuotaExhausted` |

**Global backend failure law (extends SPEC-001 §11):** no backend error may block local authoring, play, Binding, export, or reading of the local Vault (BI-1, BI-2). Every `retryable:false` backend error still leaves the Studio fully usable offline.

---

## 11. SECURITY BOUNDARIES (consolidated)

- **Transport:** TLS 1.3 everywhere; HSTS; cert pinning for the native clients (ADR-worthy for pin-rotation ops — minor GAP).
- **The E2E boundary (BI-4):** everything in sync is client-encrypted; keys never server-side; server compromise → ciphertext only (§5.8).
- **The projection boundary (BI-6):** only LOCKED, non-hidden, non-veiled, user-selected entries reach a portal; re-verified server-side.
- **The AI boundary (BI-8):** only the redacted staged subgraph; raw stream structurally rejected.
- **The covenant boundary (BI-2):** no server state can lock local data; export always available.
- **PCI:** SAQ-A (provider-hosted payment; no card data server-side, §4.2).
- **Secrets:** infra keys in KMS (ADR-004); no secrets in logs; CLAUDE.md NEVER-DO (no secrets committed) applies to this repo.
- **Dependencies:** each service's supply chain reviewed (mirrors SPEC-001 §17 posture).

---

## 12. ACCEPTANCE CRITERIA (Definition-of-Done, testable)

1. **Covenant survival (BI-2, LI-1):** with every backend service down AND the account deleted, a client can still open, edit, Bind (per GAP resolution), and export every local world losslessly (SPEC-001 §9.2 round-trip). *Test: kill all services + delete account → full local loop passes.*
2. **Server-compromise-reveals-nothing (BI-4):** an adversarial dump of Postgres + blob store + infra KMS yields zero recoverable canon; automated test attempts decryption with all server-held material and fails on 100% of blobs. (SPEC-001 §16.5-style leak test, extended to the relay.)
3. **LOCKED-only structural guard (BI-6):** a publish containing any non-LOCKED item is rejected server-side (`B-6001`) 100% of the time; fuzz corpus of mixed-status projections never leaks a PROVISIONAL/UNKNOWN/hidden/veiled field to the CDN.
4. **AI raw-stream rejection (BI-8):** any request whose body is not a valid ≤8k-token `StagedSubgraph` is rejected (`B-7001/B-7002`); no raw event ever reaches an upstream provider.
5. **No-lockout degradation (§3.5):** for every lapse/downgrade/deletion path, an automated matrix asserts local read+export remains available (LI-1).
6. **Sync fidelity (SPEC-001 §13):** two devices, offline-then-online, converge to byte-identical folds (reusing SPEC-001 §16.2 golden-log determinism) with zero loss; gapless `deviceSeq` enforced (`B-5001` on any gap).
7. **Two-Binding conflict (constraint 4):** competing Bindings surface as a Contradiction Bench docket case, never auto-merged (§5.6).
8. **Idempotency:** webhook replay, sync re-push, and re-publish are all idempotent.
9. **Offline grace (§3.3):** entitlement validates offline; grace expiry degrades (never locks); clock rollback cannot extend grace.
10. **No behavioral telemetry (BI-7):** static + runtime audit confirms no user-behavior data leaves the client and no canon plaintext appears in any log.

---

## ADRs (Architecture Decision Records — RAISED, not decided)

Each: Context · Options · Recommendation · Consequences · What would change it. **None is chosen by fiat; all await founder ratification.**

**ADR-000 — Billing provider (PRIMARY).**
- *Context:* need subscription + usage billing across desktop and mobile; PCI scope must stay off our servers (§4.2). Mobile app stores may mandate their own billing.
- *Options:* (a) Stripe (rich API, usage billing, but you handle mobile-store rules); (b) Paddle/Lemon Squeezy (Merchant-of-Record, handles global tax, less usage-flexible); (c) RevenueCat + store billing for mobile bridged to a web provider; (d) multi-provider (web=Stripe/Paddle, mobile=StoreKit/Play via RevenueCat).
- *Recommendation:* MoR-style (Paddle/LemonSqueezy) for web to offload tax/VAT + a mobile-store adapter — but this is a business/tax call, so **RAISED for founder**.
- *Consequences:* MoR simplifies compliance, costs more %; multi-provider adds adapter complexity (§4.2 already abstracts it).
- *Changes decision:* projected international mix, mobile revenue share, appetite for tax ops.

**ADR-001 — Identity/auth provider.**
- *Options:* (a) hosted IdP (Auth0/Clerk/Supabase Auth/AWS Cognito) — fast, off-loads credential security; (b) self-run (Argon2id + our JWT). 
- *Recommendation:* hosted IdP for v1 (small team, security surface reduction) — RAISED.
- *Consequences:* vendor lock vs. control; must ensure the IdP never becomes a lockout vector for *local* use (BI-1 holds regardless — auth only gates services).
- *Changes decision:* cost at scale, data-residency needs, desire to self-host.

**ADR-002 — Does Ember include single-user multi-device sync?**
- *Context:* 03-ARCH says sync is a v1.0 feature; 01-VISION lists sync capabilities under Forge+. Ember is "the Codex, one world." Whether a $12 player gets desktop↔mobile sync is unstated.
- *Options:* (a) Ember includes sync (better UX, more infra cost per low-ARPU user); (b) sync is Forge+ (aligns with "Full Studio" language).
- *Recommendation:* RAISED — leans (b) per 01-VISION tier grouping, but it's a pricing call.
- *Changes decision:* infra cost per Ember user, competitive positioning.

**ADR-003 — Cloud host + object store + CDN.**
- *Options:* single hyperscaler (AWS/GCP/Azure) vs. edge-native (Cloudflare Workers/R2/CDN) vs. hybrid. Portals are static (edge-native is a strong fit); relay is blob storage + light compute; residency may force region choices.
- *Recommendation:* RAISED — edge-native (Cloudflare-class: R2 for blobs/portals, Workers for relay/edge, CDN built-in) fits the "lean cost profile" (03-ARCH) and static-portal shape, but is a founder infra decision.
- *Consequences:* edge-native lowers portal cost + latency; hyperscaler eases some compliance/tooling.
- *Changes decision:* residency/compliance requirements, existing infra commitments, team familiarity.

**ADR-004 — KMS + E2E crypto primitives + recovery model.**
- *Context:* BI-4 requires content keys never server-side; §5.5 needs a concrete scheme.
- *Options primitives:* XChaCha20-Poly1305 AEAD + X25519 sealed-box key wrapping + HKDF + Ed25519 device sig (recommended, modern, libsodium-backed) vs. AES-GCM/RSA equivalents. *Recovery:* (a) passphrase-derived root key (Argon2id) → recoverable but adds a passphrase attack surface; (b) device-only keys → unrecoverable if all devices lost (max security, worst UX). Infra KMS (for TLS/token-signing/at-rest wrap) = cloud KMS per ADR-003.
- *Recommendation:* libsodium primitives as above + **offer** passphrase recovery with explicit user-informed trade-off — RAISED (security/UX balance is founder's call).
- *Consequences:* passphrase recovery vs. absolute zero-knowledge; must never weaken BI-4.
- *Changes decision:* threat-model priority vs. support burden of unrecoverable accounts.

**ADR-005 — Atelier team seats / multi-seat model.**
- *Context:* Atelier promises "team seats" (01-VISION §IV) but BI-5 forbids multi-USER sync in v1. Team seats without shared authoring is a licensing/billing construct, not a sync construct.
- *Options:* (a) team = billing grouping only (each seat still single-user sync to their own worlds) for v1; (b) defer team seats to v2.0 with Rooms.
- *Recommendation:* RAISED — (a) keeps BI-5 intact; genuine collaborative authoring is explicitly v2.0 (03-ARCH, SPEC-001 §13).
- *Changes decision:* Atelier go-to-market timing vs. v2.0 Rooms schedule.

**ADR-006 — Entitlement push channel.**
- *Context:* upgrades should unlock "instantly" (§3.6). Options: pull-only (client refreshes periodically) vs. push (WebSocket/SSE/APNs-FCM).
- *Recommendation:* RAISED — pull-with-short-TTL for v1 (simplest, offline-tolerant), push as an enhancement.
- *Changes decision:* acceptable unlock latency.

**ADR-007 — Reader authentication for gated drip cohorts.**
- *Context:* §6.4 gated cohorts ("patrons") need reader identity, distinct from A&A accounts and from SPEC-001 principals (BI-5).
- *Options:* (a) integrate Patreon OAuth (matches 02-MODULES §9 Patreon framing); (b) A&A reader accounts; (c) magic-link per cohort.
- *Recommendation:* RAISED — Patreon OAuth is the canon-implied path (02-MODULES §9), but reader-account architecture is a real design surface.
- *Changes decision:* which subscription platforms creators actually use.

**ADR-008 — Upstream LLM model provider(s) & routing.**
- *Context:* §7.4 metered proxy forwards to provider(s) per voice latency class; must have zero-retention/no-train contracts.
- *Options:* single provider vs. multi-provider routing per `modelClass`/`voice`; BYO always available regardless.
- *Recommendation:* RAISED — requires provider selection + procurement (zero-retention terms). BYO-model path is unaffected and always present (01-VISION §IV).
- *Changes decision:* model quality/latency/cost per voice; contractual data-handling terms.

---

## BUILDER FRICTION INDEX & GAP REGISTER

### Builder Friction Index (BFI): **62 / 100**

*Interpretation:* a Builder agent could mechanically implement the **structural spine** — schemas, API contracts, state machines, the E2E relay shape, the LOCKED-only publish guard, the AI-proxy ingress guard, error taxonomy, degradation matrices — without further design. It **cannot** reach 100 because eight ADRs (vendor/host/crypto-recovery/pricing decisions) and the business-policy gaps below are genuine decisions that must be made by the founder, not invented (per METHOD RULES: ZERO INVENTION). The invariants and the client↔server contracts are High-confidence and implementable today; the vendor-and-policy layer is deliberately left open rather than fabricated.

### GAP REGISTER (everything below 100, what's missing, why)

| # | Gap | What's missing | Why open (not invented) |
|---|---|---|---|
| G-1 | Billing vendor | concrete provider + mobile-store strategy | ADR-000 — business/tax/mobile-revenue call |
| G-2 | Auth provider | hosted vs. self-run | ADR-001 — security/cost/control tradeoff |
| G-3 | Ember sync inclusion | tier boundary for sync | ADR-002 — pricing decision |
| G-4 | Cloud host/CDN/object store | concrete infra | ADR-003 — infra/residency decision |
| G-5 | KMS + crypto recovery model | passphrase vs. device-only recovery | ADR-004 — security/UX tradeoff |
| G-6 | Atelier team seats | seat model under BI-5 | ADR-005 — GTM vs. v2.0 timing |
| G-7 | Entitlement push channel | pull vs. push | ADR-006 — latency tolerance |
| G-8 | Reader auth for gated cohorts | Patreon OAuth vs. reader accounts | ADR-007 — depends on creator platforms |
| G-9 | LLM provider(s) + zero-retention terms | provider + contracts | ADR-008 — procurement |
| G-10 | Numeric limits | `worlds.max` fair-use, `press.portals.max`, `deviceLimit` exacts, `graceDays` value, `maxTokens`/allotments per tier | tuning + "final numbers at beta" (01-VISION §IV) — not fiat-able |
| G-11 | "Bind while lapsed?" edge | whether a lapsed premium user can Bind *existing* pending ash (read/export always allowed) | covenant-adjacent policy decision; LI-1 sets the floor (never lock data) but Binding-as-a-premium-authoring-act is a judgment call |
| G-12 | Overage/dunning reconciliation | AI overage policy; align provider dunning window with §3.3 offline grace | business policy + provider config |
| G-13 | Refund/DMCA/content policy | refund window/proration; DMCA agent + takedown SLA | legal/business, not engineering |
| G-14 | Traffic-analysis hardening | blob padding/batching to blunt size/timing metadata leakage (§5.8 residual) | deferred security hardening; acknowledged residual under BI-4 |
| G-15 | Data residency / EU | region guarantees, GDPR/CCPA specifics | legal review out of scope for this draft |
| G-16 | Cert-pin rotation ops | operational runbook for pin rotation | minor ops detail |

*Draft prepared under the ZERO-INVENTION method. Every decision herein either cites SPEC-001 / STUDIO-GENESIS / the ecosystem canon, or is raised as an ADR/GAP. Nothing is silently chosen. This draft is subordinate to SPEC-001; on any conflict, SPEC-001 and the ecosystem canon govern and this document must be corrected.*
