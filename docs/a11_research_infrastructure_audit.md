# DigiMitra: A11 Research Evaluation Infrastructure Audit

**Document ID:** DIGIMITRA-AUDIT-A11-V1.0  
**Phase:** Phase 1 — Repository & Research Architecture Audit  
**Status:** Complete & Verified Baseline  
**Governing Methodology:** `docs/c8_research_validation_and_empirical_evaluation_design.md`  

---

## 1. Executive Summary

This architecture audit inventories the existing backend and frontend components in DigiMitra to guide the implementation of **A11: Research Evaluation Infrastructure**. The goal is to build technical capabilities for the 12 planned validation experiments (E-01 to E-12) without altering frozen research instruments, changing production recommendation behavior, or creating redundant endpoints.

---

## 2. Existing Research Infrastructure Inventory

### 2.1 ORM Models (`backend/app/models/`)
* **`research.py` (`ResearchEvaluationRecord`):** Entity pairing rule-based and ML classifications for research comparison; includes `levels_agree`, `consultant_corrected_level`, and `notes`.
* **`consultant_label.py` (`ConsultantBlindLabel`):** Dedicated table for independent consultant ratings (`labeled_rbdl_level`, `labeled_business_goal`, `labeled_primary_pain_point`, `labeled_budget_tier`, `labeled_urgency`, `recommendation_ratings_json`, `rationales`, and `labeling_protocol_version`).
* **`audit_log.py` (`AuditLog`):** Polymorphic audit logging recording `actor_user_id`, `action`, `entity_type`, `entity_id`, `old_value_json`, `new_value_json`, and timestamps.
* **`assessment.py` (`Assessment`, `AssessmentScore`, `AssessmentAnswer`):** Core evaluation records with hardening fields `administration_mode`, `respondent_role`, and `reassessment_reason`.
* **`classification_result.py` (`ClassificationResult`):** Output record containing `na_sensitive` and `na_hypothetical_level` diagnostic indicators.
* **`requirement_profile.py` (`RequirementProfile`):** Contextual requirements entity storing `business_goal`, `primary_pain_point`, `urgency`, and provisional `budget_tier`.

### 2.2 Domain Services (`backend/app/domain/research/`)
* **`reproducibility.py` (`ReproducibilityService`):** Generates immutable SHA-256 digests of rules, question bank, taxonomies, and catalog; captures Python, OS platform, and git commit hash.
* **`k_anonymity.py` (`KAnonymityEvaluator`):** Evaluates tuple frequencies across quasi-identifiers (`state`, `district`, `category_id`, `business_size`) against a researcher-specified threshold $k$.
* **`sensitivity_analysis.py` (`ThresholdSensitivityAnalyzer`):** Simulates gate perturbations ($\pm 0.5$, $\pm 1.0$) across submitted assessment score vectors without mutating production data.
* **`na_diagnostics.py` (`NADiagnosticsService`):** Computes $N/A$ response frequencies across dimensions and questions.

### 2.3 Existing Endpoints (`backend/app/api/v1/endpoints/`)
* **`research_diagnostics.py`:**
  * `GET /research/diagnostics/drift` (Rule and question drift check)
  * `GET /research/diagnostics/sensitivity` (Threshold perturbation simulator)
  * `GET /research/diagnostics/k-anonymity` (Quasi-identifier bin analyzer)
  * `GET /research/diagnostics/na-rates` (N/A frequency analyzer)
  * `GET /research/diagnostics/reproducibility` (Runtime environment manifest)
  * `GET /research/diagnostics/consultant/blind-assessments` (Redacted assessment review list)
  * `POST /research/diagnostics/consultant/labels` (Submit blind consultant label)
  * `GET /research/diagnostics/consultant/comparison` (Rule vs. consultant comparison)
* **`research_ml.py`:**
  * Non-authoritative candidate ML training, evaluation, and empirical comparison endpoints.

---

## 3. Reusable Components & Synergies

1. **`ReproducibilityService`:** Provides the mathematical hashing foundation for the Reproducibility Manifest Generator required in Phase 15.
2. **`KAnonymityEvaluator`:** Directly supplies the privacy analysis algorithm for the Anonymized Research Exporter in Phase 16.
3. **`ThresholdSensitivityAnalyzer`:** Powers the diagnostic experiment runner for E-04 (Threshold Sensitivity) in Phase 13.
4. **`ConsultantBlindLabel` & Existing Blind Endpoint:** Forms the core data entity for Phase 4–6 consultant rating workflows.
5. **`AuditLog`:** Polymorphic schema is already built and ready to capture research study events (study creation, protocol lock, consent updates, data export).

---

## 4. Identified Gaps & Missing Infrastructure

Prior to A11, the following elements specified in C8 are missing:
1. **Research Study Registry:** No entity tracks formal study protocols, version locks, or approval states (`research_studies`).
2. **Participant Decoupling & Consent Records:** No explicit entity links a business assessment to a cryptographically pseudonymized participant record with versioned consent (`research_participants`).
3. **Blinded Evaluation Packets:** Current blind assessment endpoint queries live tables dynamically rather than creating immutable, randomized case packets (`blinded_evaluation_packets`).
4. **Test-Retest Tracking:** No table formalizes short-interval baseline/retest pairings with validity/exclusion flags (`test_retest_linkages`).
5. **Recommendation Ablation Harness:** No table records paired evaluations of Model A (capability-only) versus Model B (context-enriched) (`recommendation_ablation_evaluations`).
6. **Cognitive & Language Validation Logs:** No structured entity captures Tourangeau error codes or English/Hindi translation drift observations (`cognitive_interview_records`).
7. **Traceability Comprehension Records:** No schema stores objective user quiz responses on explanation comprehension (`comprehension_study_records`).
8. **Research Dataset Snapshots & Manifest Registry:** No persistence layer archives point-in-time dataset snapshots or manifest records.

---

## 5. Duplication Risks & Mitigation

| Area | Duplication Risk | Mitigation Strategy |
| :--- | :--- | :--- |
| **Consultant Labeling** | Re-creating a new consultant label table alongside `consultant_blind_labels`. | Reuse and link existing `consultant_blind_labels` or associate them with `blinded_evaluation_packets` via a lightweight extension. |
| **Reproducibility** | Writing duplicate hash logic in a new manifest module. | Extend and import `ReproducibilityService` from `app.domain.research.reproducibility`. |
| **Sensitivity Analysis** | Creating duplicate perturbation algorithms. | Call `ThresholdSensitivityAnalyzer.analyze_dataset()` directly in the experiment runner. |
| **API Endpoints** | Mounting duplicate `/consultant/blind-assessments` routes. | Consolidate or cleanly namespace research study endpoints under `/api/v1/research/`. |

---

## 6. Proposed A11 Changes

### 6.1 Database Migration (Additive Schema)
Create revision `h8b9c0d1e2f3_research_evaluation_infrastructure.py` adding:
* `research_studies`
* `research_participants`
* `consultant_profiles`
* `blinded_evaluation_packets`
* `consultant_evaluations`
* `test_retest_linkages`
* `recommendation_ablation_evaluations`
* `cognitive_interview_records`
* `comprehension_study_records`
* `research_experiments`
* `research_dataset_snapshots`
* `reproducibility_manifests`

### 6.2 Backend Schemas & Domain Services
* Define strict Pydantic schemas in `backend/app/schemas/research.py`.
* Implement case packet sanitizer ensuring that computed levels, scores, certainty, recommendations, and roadmaps are strictly stripped before delivery to consultants.
* Implement paired recommendation ablation generator (Model A vs. Model B) as a read-only research utility.
* Implement research export service with $k$-anonymity diagnostic reporting and suppression.

### 6.3 REST API Endpoints (`/api/v1/research/`)
* Grouped under `app/api/v1/endpoints/research_core.py` and connected to `router.py`.
* Protected by RBAC requiring `RESEARCHER`, `ADMIN`, or `CONSULTANT` as appropriate.

---

## 7. Frozen Components (Strict Safeguards)

The following components remain completely unaltered:
* **RBDL_V1** (Levels 0–3, 9 dimensions)
* **C3 Question Bank** (14 questions)
* **RBDL Scoring Formula & Cutoffs**
* **C4 Recommendation Rules & Priority Formula**
* **Requirement Profile V1**
* **Recommendation Feasibility States**
* **ML Non-Authoritative Boundary**

---

## 8. Unresolved Academic Decisions (Preserved as Configurable)

In compliance with C8 Section 23, the following parameters are NOT hard-coded:
1. Target sample size ($N = 60$ vs $N = 150$).
2. Specific geographic clusters (Jaipur vs other districts).
3. Target statistical thresholds ($QWK \ge 0.60$, $ICC \ge 0.75$).
4. Primary research endpoints.
5. Final budget categories ($B0\text{--}B3$).

All are modeled as versioned study configuration fields or configurable parameters.
