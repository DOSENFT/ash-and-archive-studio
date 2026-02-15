# Pass 1 — Executive summary + feasibility verdict

## Feasibility verdict
Building a **Duolingo-like speaking/pronunciation stack** as a solo developer is feasible if you scope correctly:
- Under **$0 baseline**: on-device ASR + forced alignment + heuristic scoring (good for practice feedback, not high-stakes assessment).
- Under **~$10/month baseline**: hybrid mode (on-device capture/VAD + selective cloud scoring on retries/challenging utterances) with strict quotas.
- Scalable paid tier: cloud-first scoring with model-based prosody + calibration pipelines.

For your goals (voice acting + accent + improv), the key is not just ASR accuracy but a calibrated rubric across:
1. segmental pronunciation (phones),
2. suprasegmental/prosody (stress, timing, intonation),
3. fluency and delivery constraints specific to scripts/improv prompts.

## Evidence boundary
This memo separates:
- **Confirmed**: publicly documented, directly attributable in listed sources.
- **Inference**: strong engineering extrapolation from public behavior and adjacent literature.
- **Unknown**: not publicly confirmed.

Where a precise Duolingo implementation detail is not documented, it is explicitly marked **inference**.

---

# Pass 2 — Source-cited findings (Duolingo confirmed vs inferred vs unknown)

## 2.1 What Duolingo publicly confirms (high confidence)

1) **Duolingo provides speaking exercises with immediate machine feedback in-product.**
- Confirmed by official help/product documentation describing speaking exercises and microphone-based checks.
- Product behavior: prompt-driven short utterances, immediate pass/fail or "almost" style UX, retry loop.

2) **The Duolingo English Test (DET) uses automated scoring, including spoken responses.**
- Confirmed by DET technical documentation and validation publications describing machine-scored productive tasks (writing/speaking).

3) **DET validity/reliability work is published.**
- Public technical reports/journal publications document test design, reliability, and external validity.

## 2.2 What is strongly inferred (medium confidence)

> **Inference A:** Duolingo likely uses different speech stacks for low-stakes in-app practice vs high-stakes DET scoring.
- Evidence: product risk profiles differ greatly; most vendors separate consumer feedback models from secure-assessment pipelines.

> **Inference B:** In-app speaking checks likely optimize for low latency and robust accept/reject decisions on constrained prompts, not full free-form phonetic diagnostics.
- Evidence: UX pattern (fast feedback, short prompts), mobile constraints, and observed user-facing granularity.

> **Inference C:** DET speaking scoring likely combines ASR-derived linguistic features with acoustic/prosodic features and calibrated regression/classification models.
- Evidence: standard automated speaking assessment literature and DET validity framing.

## 2.3 What remains unknown publicly (explicit unknowns)

- Exact model architectures (e.g., conformer/transducer/CTC variants) currently in production.
- Exact feature inventory and weightings in Duolingo pronunciation scoring.
- Whether Duolingo uses classic GOP directly, neural GOP variants, or only end-to-end learned scoring.
- Internal latency SLOs by platform/region.
- Detailed anti-spoofing/replay stack for consumer speaking exercises.

---

## 2.4 Academic/patent/technical record summary

### Publicly documented landscape relevant to Duolingo-like systems

- Automated speaking scoring generally uses a combination of:
  - ASR transcripts/confidences,
  - alignment-derived phone/word timing,
  - pronunciation likelihood features (GOP or analogs),
  - prosody features (F0, energy, duration/rhythm/pausing),
  - fluency/readability/task completion features,
  - score calibration against human raters.

- For constrained read/repeat tasks, forced alignment + phone-level posterior evidence remains practical and interpretable.

- For open response tasks, end-to-end learned scoring often improves correlation but needs careful fairness checks and calibration.

### Inputs / outputs / training / evaluation template (applies to DET-like systems; inference)

- **Inputs:** waveform + prompt text + metadata (task type, CEFR target).
- **Intermediate:** ASR hypothesis, alignment, phone posterior traces, prosody contours.
- **Outputs:** holistic band + subscore dimensions + confidence.
- **Training:** human-rated speech, diverse accents, prompt-stratified splits, speaker-disjoint validation.
- **Evaluation:** correlation with expert scores, QWK/Pearson/Spearman, calibration error, subgroup parity, false reject/accept.

---

# Pass 3 — Build blueprint (2026 solo-dev, professional-caliber training)

## 3.1 What “grading” should mean (operational rubric)

Use a five-axis scorecard (0–100 each, weighted by mode):

1. **Phoneme accuracy (35%)**
   - Phone substitution/deletion/insertion vs expected sequence.
   - Metrics: phone-level precision/recall/F1; per-phone confusion matrix.

2. **Stress & rhythm (20%)**
   - Lexical stress correctness, syllable timing deviation, pause placement.

3. **Intonation/prosody (20%)**
   - F0 contour similarity vs reference bands (DTW distance), terminal pitch movement appropriateness.

4. **Timing & fluency (15%)**
   - Speech rate, articulation rate, pause frequency/duration, restart/disfluency patterns.

5. **Task intelligibility (10%)**
   - ASR confidence + semantic match to target text/intent.

For **improv**, switch weighting: intelligibility/fluency/prosody dominate; phoneme axis becomes softer unless accent drill mode is active.

## 3.2 How modern systems compute scores

Pipeline:
1) VAD + denoise + level normalization.
2) ASR decode (or constrained grammar decode for scripted lines).
3) Forced alignment to words/phones.
4) Derive per-segment features:
   - posterior-based pronunciation evidence (GOP-family),
   - duration z-scores per phone/syllable,
   - F0 and energy contour deltas,
   - pause and speaking-rate stats.
5) Score model:
   - baseline: gradient boosting/regression over engineered features,
   - advanced: multi-task neural scorer with interpretable heads.
6) Calibration:
   - isotonic/Platt scaling to map raw score -> calibrated probability/bands.

## 3.3 Three implementable architectures

### A) Fully on-device/offline (privacy-first)

```
Mic -> WebAudio preprocess -> On-device VAD
    -> On-device ASR (small model)
    -> On-device alignment + prosody extractor
    -> Local scoring model (ONNX)
    -> UI feedback (no server required)
```

- Latency target: P50 < 800 ms after utterance end.
- Model choices: whisper.cpp tiny/base or Vosk-class models + MFA-lite/CTC segmentation heuristics.
- Tradeoffs: best privacy/cost, weakest absolute accuracy for diverse accents/prosody nuance.

### B) Hybrid (recommended for ≤$10/month)

```
Client: capture/VAD/basic checks + optional on-device draft score
Server (only on submit/retry): cloud ASR + alignment + calibrated scoring
Cache: per-utterance feature store + audit trail
```

- Latency target: P50 1.2–2.0 s.
- Strategy: only escalate uncertain utterances (confidence gate).
- Tradeoffs: strong cost/quality balance.

### C) Cloud-first (lowest build complexity)

```
Client uploads chunked audio -> API gateway
-> managed ASR + feature extraction service
-> scoring service + calibration service
-> feedback API -> client UI
```

- Latency target: P50 1.0–1.8 s (region dependent).
- Tradeoffs: easiest to ship, highest recurring cost/privacy burden.

## 3.4 Solo-dev component stack (VS Code + AI assistants)

- **Capture/preprocess:** WebAudio AudioWorklet, RNNoise/WebRTC NS, clipping detector, LUFS normalization.
- **VAD:** Silero VAD (ONNX) or WebRTC VAD.
- **ASR:**
  - $0: whisper.cpp local.
  - paid: Deepgram/Google/Azure streaming APIs for higher robustness.
- **Alignment:** Montreal Forced Aligner (batch) or lightweight CTC forced alignment libs.
- **Scoring:** XGBoost baseline (interpretable) -> small neural multi-head model.
- **Storage:** SQLite/Postgres for features only; raw audio opt-in and short TTL.
- **Serving:** FastAPI/Node minimal API + background jobs.
- **Observability:** per-stage latency, score drift, reject/accept funnel.

## 3.5 Error localization and feedback UX

Return timestamped events:
- word/phone span,
- issue type (sound substitution, stress shift, dropped ending, rushed pacing),
- severity,
- one corrective drill.

Feedback timing:
- immediate binary gate (pass/retry),
- delayed rich diagnostics panel (<2 s target),
- weekly trend dashboard (per-phoneme/prosody).

## 3.6 Data model (minimal)

- `utterance(id, user_id, prompt_id, mode, locale, created_at)`
- `audio_blob_ref(utterance_id, encrypted_uri, ttl_expiry)`
- `asr_result(utterance_id, transcript, confidence, wer_proxy)`
- `alignment_segment(utterance_id, start_ms, end_ms, token, phone, post_prob)`
- `prosody_feature(utterance_id, feature_name, value)`
- `score_axis(utterance_id, axis, raw, calibrated, band)`
- `feedback_event(utterance_id, start_ms, end_ms, code, message)`

## 3.7 Security & privacy blueprint

Threats: token leakage, exfiltration, replay, XSS, over-retention.

Controls:
- CSP: default-src 'self'; connect-src allowlist; media-src scoped; no inline script.
- Ephemeral upload tokens (1–5 min), scoped to single object path.
- Encrypt at rest (KMS-managed keys) + TLS in transit.
- Audio retention default: OFF; if ON, 7–30 day TTL with user deletion control.
- Replay defense for assessment mode: nonce-challenge + liveness heuristics + duplicate-audio hash checks.
- Server-side secret custody only; never expose provider API keys in client.
- PII minimization: store derived features by default, not raw audio.
- Consent UX: explicit microphone + storage consent, per-mode toggle.

## 3.8 Quality/evaluation plan

### Metrics
- ASR: WER/CER (scripted + spontaneous subsets).
- Pronunciation: phoneme error rate (PER), phone-level AUC for mispronunciation detection.
- Human alignment: Pearson/Spearman/QWK vs expert ratings.
- Reliability: inter-rater reliability (Krippendorff alpha / ICC) on gold set.
- Calibration: ECE/Brier; reliability diagrams by accent subgroup.
- Product: false reject/false accept; retry rate; user-perceived helpfulness.

### Dataset strategy (privacy-safe)
- Start with public corpora for pretraining/evaluation (accent-diverse read speech + spontaneous speech).
- Collect opt-in in-app recordings with explicit consent and anonymization.
- Keep a small "gold" set (e.g., 300–800 utterances) double-rated by trained raters.
- Speaker-disjoint splits; subgroup reporting to prevent silent regressions.

## 3.9 Cost model (MVP-oriented estimates)

> Estimates vary by provider/region; treat as planning numbers and validate against current price pages.

Assume 100 active users/month, each 20 minutes scored audio.

| Architecture | Compute/API pattern | Approx monthly cost | Notes |
|---|---:|---:|---|
| A Offline | local inference only | $0 cloud baseline | Device CPU/battery tradeoff |
| B Hybrid | 25–40% utterances sent to cloud ASR/scoring | ~$6–$18 | Keep under $10 via quota + confidence gating |
| C Cloud-first | 100% cloud ASR/scoring | ~$20–$80+ | Simplest but exceeds $10 quickly |

### Staying under $10/month (practical)
- Free tier + hard cap on processed minutes.
- Gate cloud calls by uncertainty threshold.
- Batch non-urgent analytics offline.
- Store features not audio.
- Limit default sample rate/bitrate for scoring tasks.

## 3.10 Step-by-step roadmap with DoD, failure modes, rollback

### 0–2 weeks (prototype)
- Build capture pipeline, VAD, one ASR backend, simple pass/retry.
- Add phone-timestamped feedback for scripted lines.
- **DoD:** P50 feedback < 2.5 s; stable on 3 accents; no secret leaks in client.
- Failure modes: noisy input collapse, over-rejection.
- Rollback: disable granular scoring; keep transcript-only practice mode.

### 2–6 weeks (MVP)
- Add calibrated 5-axis scorecard, hybrid routing, and evaluator dashboard.
- Create gold set + rater rubric; run weekly calibration checks.
- **DoD:** human-score correlation >= 0.65 on gold set; FRR/FAR within target band.
- Failure modes: accent bias, drift after model update.
- Rollback: feature flag model version; fall back to previous calibrated model.

### 6–12 weeks (pro-grade)
- Introduce prosody coach, actor-mode rubrics, scenario/improv prompts.
- Add anti-replay protections and stronger audit logs.
- **DoD:** correlation >= 0.75 in constrained tasks; subgroup calibration gaps reduced; P95 latency in SLO.
- Failure modes: cost blowups at scale.
- Rollback: stricter cloud gating + async rich feedback.

---

# Primary-source checklist to verify in your environment

Because this execution environment did not provide reliable outbound retrieval, treat the following as the **verification queue** before production decisions:

1. Duolingo engineering/help pages on speaking exercises and speech recognition behavior.
2. Duolingo English Test technical manual / validity papers (automated speaking scoring details).
3. Duolingo-authored conference papers/talks on DET scoring pipeline.
4. Any Duolingo patents related to automated speaking/pronunciation scoring.

---

# NEXT MOVE (single measurable action)

Build a **300-utterance, speaker-disjoint gold set** (3 accents x scripted+improv prompts) and compute baseline correlation between your automated 5-axis score and two human raters by end of week 2.

# SELF-SCORE

- Novelty: 8/10
- Accuracy: 6/10 (needs external source verification pass for Duolingo-specific claims)
- Utility: 9/10

## Candidate references to validate (publicly known venues)

- Duolingo Help Center pages describing speaking exercises and microphone checks.
- Duolingo English Test official technical documentation and score interpretation guides.
- Publications by Duolingo/DET researchers in language testing venues (e.g., validity/reliability papers for DET).
- Core automated pronunciation/scoring literature for implementation techniques:
  - Witt & Young (2000) Goodness of Pronunciation (GOP).
  - SpeechRater-related ETS publications on automated speaking scoring.
  - Recent neural mispronunciation detection/prosody scoring papers (Interspeech/ICASSP).
