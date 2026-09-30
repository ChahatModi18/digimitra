# DigiMitra — A11 Research Evaluation Infrastructure Specification & Architecture

**Document Version:** 1.0  
**Status:** Approved & Implemented  
**Date:** 2026-09-29  
**Source of Truth:** [C8 Research Validation & Empirical Evaluation Design](file:///c:/Users/Lenovo/Desktop/MAJOR%20PROJECT%20DOCUMENTATION/docs/c8_research_validation_and_empirical_evaluation_design.md)  
**Audit Document:** [A11 Research Infrastructure Audit](file:///c:/Users/Lenovo/Desktop/MAJOR%20PROJECT%20DOCUMENTATION/docs/a11_research_infrastructure_audit.md)  
**Integrity Verification:** [A11 Research Instrument Integrity Report](file:///c:/Users/Lenovo/Desktop/MAJOR%20PROJECT%20DOCUMENTATION/docs/a11_research_instrument_integrity_report.md)  

---

## 1. Architecture Overview

The DigiMitra A11 Research Evaluation Infrastructure provides the technical foundation for conducting, recording, blinding, and reproducing the 12 validation studies (E-01 through E-12) formulated in C8. 

### Core Architectural Separation

```
+-----------------------------------------------------------------------------------+
|                            PRODUCTION RUNTIME DOMAIN                              |
|  - MSME Enterprise Profiles (`businesses`)                                        |
|  - Digitalization Assessments (`assessments`, `assessment_answers`)              |
|  - Deterministic Rule Engine & Classifier (`classification_results`)              |
|  - Requirement Profiles (`requirement_profiles`)                                  |
|  - Catalog & Personalized Recommendations (`business_recommendations`)            |
|  - Roadmaps (`roadmaps`, `roadmap_tasks`)                                         |
|  - Strictly Non-Authoritative ML Shadow Predictions (`ml_predictions`)            |
+-----------------------------------------------------------------------------------+
                                         │
                   Read-Only / Sanitized Projections (Information Hiding)
                                         ▼
+-----------------------------------------------------------------------------------+
|                        RESEARCH EVALUATION INFRASTRUCTURE                         |
|  - Versioned Study Registry (`research_studies`)                                  |
|  - Pseudonymous Participants & Consent (`research_participants`)                  |
|  - Rater Qualification & Conflict-of-Interest Profiles (`consultant_profiles`)    |
|  - Information-Hiding Blinded Case Packets (`blinded_evaluation_packets`)         |
|  - Multi-Rater Independent Judgments (`consultant_evaluations`)                    |
|  - Test-Retest Linkages with Exclusion Criteria (`test_retest_linkages`)          |
|  - Recommendation Ablation Arms [Model A vs B] (`recommendation_ablation_evals`)   |
|  - Cognitive Interview Diagnostic Records (`cognitive_interview_records`)         |
|  - Traceability & Comprehension Study Records (`comprehension_study_records`)     |
|  - Experiment Execution Registry [E-01 to E-12] (`research_experiments`)          |
|  - Immutable Dataset Snapshots (`research_dataset_snapshots`)                     |
|  - Verifiable Reproducibility Manifests (`reproducibility_manifests`)             |
|  - Sanitized k-Anonymity Export Pipeline (`export_anonymized_dataset`)            |
+-----------------------------------------------------------------------------------+
```

### Guiding Principles
1. **Separation of Production vs Research:** Research tables are physically separate and append-only. No operational business data is modified by research evaluations.
2. **Strict Blinding & Information Hiding:** Consultants evaluating blinded cases cannot inspect system-computed RBDL levels, dimension scores, certainty levels, recommendation rankings, or rule traces.
3. **No Automatic Ground Truth or Claims:** The system records ratings and calculates descriptive statistical metrics, but never declares a test "validated", "statistically significant", or "ground truth" without formal human researcher determination.
4. **Frozen Production Invariants:** RBDL_V1 thresholds, dimension weights, C3 14 questions, C4 recommendation rules, and the priority formula remain untouched.

---

## 2. Research Data Entities

### 2.1 ResearchStudy (`research_studies`)
Tracks an individual research protocol.
- `study_code`: Unique identifier (e.g., `STUDY-2026-VAL-01`).
- `protocol_version`: Semantic protocol version (e.g., `1.0`).
- `status`: Protocol lifecycle (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `LOCKED`, `PILOT`, `ACTIVE`, `CLOSED`, `ARCHIVED`).
- Frozen instrument snapshot references: `instrument_version`, `rbdl_version`, `question_bank_version`, `requirement_profile_version`, `recommendation_rules_version`.

### 2.2 ResearchParticipant (`research_participants`)
Maintains research participant metadata separate from commercial identity.
- `participant_code`: Pseudonymous token (e.g., `PART-8F3A2`).
- `consent_status`: `PENDING`, `CONSENTED`, `WITHDRAWN`, `DECLINED`, `NOT_REQUIRED`.
- `consent_version`, `consent_timestamp`, `withdrawal_timestamp`.
- Strict PII isolation: PAN, Aadhaar, GSTIN, phone, and owner name are never copied into research tables.

### 2.3 ConsultantProfile (`consultant_profiles`)
Tracks qualification and conflict-of-interest declarations for expert raters.
- `rater_code`: Pseudonymous rater token.
- `years_experience`: Verified experience level.
- `specialization`: Domain specialization (e.g., `RETAIL_DIGITALIZATION`, `SUPPLY_CHAIN`).
- `language_capability`: Primary language capability (`EN`, `HI`, `BILINGUAL`).
- `conflict_of_interest_declared`: Explicit boolean declaration.

### 2.4 BlindedEvaluationPacket (`blinded_evaluation_packets`)
Sanitized evaluation packet constructed from an assessment.
- `packet_code`: Unique blinded packet token.
- `sanitized_case_data_json`: Contains ONLY operational business profile facts (coarsened sector, business size, state, district) and raw question answers (item code, question text, selected option text).
- **Prohibited Data:** No computed RBDL levels, no dimension scores, no certainty labels, no recommendation lists, no rule traces.
- `assigned_consultant_id`: Target expert evaluator.
- `status`: `PENDING`, `ASSIGNED`, `IN_REVIEW`, `SUBMITTED`, `EXPIRED`.

### 2.5 ConsultantEvaluation (`consultant_evaluations`)
Stores multi-rater independent evaluations.
- `assigned_rbdl_level`: Consultant's independent RBDL level classification (0, 1, 2, or 3).
- `requirement_profile_rating`: Likert assessment (1 to 5) of whether the operational profile accurately reflects the enterprise's digitalization requirements.
- `recommendation_ratings_json`: Item-level ratings for relevance, feasibility, actionability, contextual fit, and unnecessary burden.
- `free_text_rationale`: Expert explanation of classification rationale.

### 2.6 TestRetestLinkage (`test_retest_linkages`)
Linkage between baseline and retest assessments for reliability studies (E-03).
- `baseline_assessment_id` & `retest_assessment_id`.
- `planned_interval_days` & `actual_interval_days`.
- `intervention_occurred`: Flag indicating whether business interventions occurred between assessments.
- `status`: `PENDING_REVIEW`, `VALID_FOR_RETEST`, `EXCLUDED`.
- `exclusion_reason`: Required rationale if a pair is excluded from statistical reliability calculations.

### 2.7 RecommendationAblationEvaluation (`recommendation_ablation_evaluations`)
Supports E-05 recommendation ablation studies comparing:
- **Model A:** Capability-only baseline (Target Level = Current Level + 1, sorted by default priority).
- **Model B:** Full context-enriched DigiMitra recommendation (Requirement Profile + priority formula).
- `presentation_order`: `MODEL_A_FIRST` or `MODEL_B_FIRST` (randomized alternating presentation).
- `model_a_ratings_json` & `model_b_ratings_json`: Evaluator ordinal ratings across relevance, feasibility, actionability, contextual fit, budget fit, and burden.

### 2.8 CognitiveInterviewRecord (`cognitive_interview_records`)
Records qualitative cognitive validation interviews for E-06 and E-11.
- Identifies specific question code (`Q01` to `Q14`).
- Captures cognitive interview probes: `comprehension_issue`, `retrieval_issue`, `judgment_issue`, `response_issue`.
- `translation_drift_notes` & `interviewer_notes`.
- `resolution_status`: `OBSERVED`, `ANALYZED`, `ACTIONABLE_PROPOSED`, `REJECTED`.

### 2.9 ComprehensionStudyRecord (`comprehension_study_records`)
Records empirical user comprehension and usability testing for E-07.
- Separates technical traceability from human comprehension.
- Records `comprehension_question_code`, `expected_answer`, `participant_answer`, `is_correct`.
- Records `task_completion_time_seconds`, `usability_rating` (1 to 5), and System Usability Scale (`sus_responses_json`).

### 2.10 ResearchExperiment (`research_experiments`)
Experiment execution and reproducibility registry for E-01 through E-12.
- `experiment_code`: One of `E-01` to `E-12`.
- `parameters_json`: Configurable hyperparameters (perturbation step size, k thresholds, sample criteria).
- `status`: `CONFIGURED`, `RUNNING`, `COMPLETED`, `ARCHIVED`.
- `code_commit_hash`, `output_hash`, `result_artifact_uri`.

### 2.11 ResearchDatasetSnapshot (`research_dataset_snapshots`)
Immutable dataset snapshots for cross-experiment consistency.
- `snapshot_code` & `checksum_sha256`.
- `record_count`, `anonymization_status`, `k_anonymity_achieved`.
- Instrument versions frozen at snapshot creation.
- `status`: `DRAFT`, `APPROVED`, `LOCKED`, `SUPERSEDED`.

### 2.12 ReproducibilityManifestRecord (`reproducibility_manifests`)
Complete environment and computational manifest.
- Git commit hash, application version, database migration version.
- Python version, platform architecture, database dialect.
- Frozen dependency versions and frozen instrument versions.
- Random seed (if applicable; null if deterministic).
- `manifest_sha256` checksum.

---

## 3. Blinding & Information-Hiding Model

A core vulnerability of naive expert evaluations is anchoring bias. If consultants observe the system's assigned RBDL level (e.g., Level 2) or its generated roadmap, their ratings are contaminated.

### Blinding Enforcement
1. **Packet Sanitization:** When generating a `BlindedEvaluationPacket`, `ResearchService.create_blinded_packet` queries the raw assessment and business rows, extracting only:
   - Operating State and District
   - Enterprise Size (micro, small, medium)
   - Business Sector / Category Name
   - Raw Assessment Question Prompts and User-Selected Answers
2. **Data Stripping:** The packet explicitly strips:
   - `rbdl_level`, `assigned_rbdl_level`, `primary_cr`
   - `dimension_scores`, `raw_score`, `max_possible_score`
   - `certainty_tier`, `confidence_score`
   - `recommendations`, `roadmaps`, `evidence_traces`
3. **Endpoint Isolation:** When a consultant accesses `/api/v1/research/blinded-cases/{id}`, the endpoint verifies that the consultant is assigned to the case and returns `sanitized_case_data_json`. Even if the consultant queries the database or API directly, production assessment detail endpoints require `BUSINESS_OWNER` tenant access or `ADMIN` roles.

---

## 4. Consent and Privacy Model

1. **Participant Pseudonymization:** Commercial enterprise identities (`Business.name`, `User.email`, `User.phone_number`) are decoupled from `ResearchParticipant`.
2. **Consent State Machine:**
   ```
   [PENDING] ──(Consent Given)──> [CONSENTED]
       │                              │
       ├──(Declined)──> [DECLINED]    ├──(Participant Opt-out)──> [WITHDRAWN]
   ```
   - If a participant enters `WITHDRAWN`, their records are automatically excluded from subsequent snapshot builds and anonymized export pipelines.
3. **k-Anonymity Sanitization:**
   - Evaluates quasi-identifier equivalence classes (`state`, `district`, `category`, `business_size`).
   - Supports configurable location generalization (`district` coarsened) and sector coarsening.
   - Low-frequency equivalence classes below $k$ are suppressed.
   - The diagnostic returns exact $k$ achieved, total equivalence classes, and suppressed record counts.

---

## 5. Role-Based Access Control (RBAC)

Research endpoints are strictly separated using existing system roles:

| Endpoint Group | `BUSINESS_OWNER` | `CONSULTANT` | `RESEARCHER` / `ADMIN` | `SUPER_ADMIN` |
|---|---|---|---|---|
| `/research/studies` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/participants` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/blinded-cases` (list/create) | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/blinded-cases/{id}` (view case) | ❌ 403 Forbidden | ✅ Assigned Case Only | Read | Full Access |
| `/research/evaluations` (submit judgment) | ❌ 403 Forbidden | ✅ Submit Own Judgment | Read | Full Access |
| `/research/test-retest` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/ablation` | ❌ 403 Forbidden | ✅ Rate Assigned Pair | Read/Write | Full Access |
| `/research/cognitive-interviews` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/comprehension` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/experiments` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/snapshots` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/manifests` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |
| `/research/exports` | ❌ 403 Forbidden | ❌ 403 Forbidden | Read/Write | Full Access |

---

## 6. Research Endpoints Reference

All endpoints are registered under `/api/v1/research/` and require valid JWT authentication:

| Method | Path | Summary | Minimum Role |
|---|---|---|---|
| `POST` | `/api/v1/research/studies` | Create a new research study protocol | `ADMIN` / `RESEARCHER` |
| `GET` | `/api/v1/research/studies` | List all research study protocols | `ADMIN` / `RESEARCHER` |
| `GET` | `/api/v1/research/studies/{study_id}` | Get protocol details by ID | `ADMIN` / `RESEARCHER` |
| `PUT` | `/api/v1/research/studies/{study_id}/status` | Update study protocol status | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/participants` | Register research participant consent | `ADMIN` / `RESEARCHER` |
| `GET` | `/api/v1/research/participants/{participant_code}` | Query participant consent status | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/consultants/profiles` | Register consultant qualification profile | `CONSULTANT` / `ADMIN` |
| `POST` | `/api/v1/research/blinded-cases` | Generate sanitized blinded case packet | `ADMIN` / `RESEARCHER` |
| `GET` | `/api/v1/research/blinded-cases/{packet_id}` | Retrieve sanitized packet for evaluation | `CONSULTANT` / `ADMIN` |
| `POST` | `/api/v1/research/evaluations` | Submit independent consultant evaluation | `CONSULTANT` / `ADMIN` |
| `POST` | `/api/v1/research/test-retest` | Create test-retest linkage record | `ADMIN` / `RESEARCHER` |
| `PUT` | `/api/v1/research/test-retest/{linkage_id}/status` | Update retest validity & exclusion reason | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/ablation/generate` | Generate paired Model A / Model B case | `CONSULTANT` / `ADMIN` |
| `POST` | `/api/v1/research/ablation/evaluate` | Submit paired recommendation evaluation | `CONSULTANT` / `ADMIN` |
| `POST` | `/api/v1/research/cognitive-interviews` | Record cognitive validation interview item | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/comprehension` | Record traceability comprehension trial | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/experiments` | Register experiment configuration (E-01 to E-12) | `ADMIN` / `RESEARCHER` |
| `GET` | `/api/v1/research/experiments` | List experiments for a study | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/snapshots` | Capture immutable research dataset snapshot | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/manifests` | Generate environmental reproducibility manifest | `ADMIN` / `RESEARCHER` |
| `POST` | `/api/v1/research/exports` | Generate anonymized research export ($k$-anonymity) | `ADMIN` / `RESEARCHER` |

---

## 7. Deferred Academic Decisions

In accordance with strict academic governance, the following parameters are NOT hard-coded and remain researcher-configurable:
1. **Final Geographic Sampling Boundaries:** Districts and states eligible for empirical study recruitment.
2. **Target Sample Sizes:** $N$ counts for baseline, test-retest, and cognitive interview cohorts.
3. **Consultant Panel Composition:** Minimum qualification criteria and recruitment targets.
4. **Institutional Ethics Approval (IRB/IEC):** Routing and formal protocol approval numbers.
5. **Statistical Acceptance Thresholds:** Pre-registered target values for Cohen's/Fleiss's Kappa, Intraclass Correlation Coefficients (ICC), and Cronbach's Alpha.
6. **Primary vs Secondary Endpoints:** Formal hypothesis prioritization for dissertation/publication submission.
