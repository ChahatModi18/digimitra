# DigiMitra — Research Claims and Evidence Integrity Audit (CLAIMS_AUDIT.md)

**Audit Phase:** Research Hardening & Evidence-Integrity Phase  
**Specification Reference:** DigiMitra Research Supervisor / Architect / Peer Review (Safeguards C-03 to C-07, I-02 to I-07, I-11)  
**Status:** Audit Completed & Remediated  

---

## Executive Summary

As part of the Evidence Integrity and Publication Readiness phase, an exhaustive audit was performed across all user-facing frontend views, backend API response schemas, database seed configurations, and technical documentation.

### Core Safeguards Implemented
1. **Methodology Freeze (C-03 to C-07):** Deterministic gating rules, thresholds, weights, and recommendation priorities remain frozen and verified via a permanent golden test suite (129 unit & integration tests passing).
2. **Research Disclosures (C-04):** Bilingual English/Hindi research notices added to Landing (`Dashboard.tsx`), Assessment (`AssessmentFlow.tsx`), and Roadmap (`RoadmapView.tsx`) stating that RBDL is a proposed exploratory diagnostic instrument and not yet empirically validated.
3. **Internal Phase Removal:** All internal developer phase designations (`Phase A4 Verified`, `Phase A5.3 Production`) removed from business-facing UI.
4. **N/A Sensitivity Safeguard (C-05):** Non-invasive sensitivity indicator (`na_sensitive`, `na_hypothetical_level`) recorded on classification results and exposed via research diagnostics without modifying production classifications.
5. **Re-identification & Privacy Check (I-06):** Research export k-anonymity diagnostic tool implemented with researcher-configurable threshold $k$. No statutory compliance claimed.
6. **Blind Consultant Labeling (I-07):** Technical data boundary created preventing consultants from observing production rule outputs before recording independent expert labels.

---

## Claims Audit Table

| Location | Claimed Text / Phrase | Classification | Remediation / Recommended Action | Status |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/src/components/Footer.tsx` | `"Phase A5.3 Production"` | **Unsupported (Internal Phase Label)** | Replaced with `"Research Instrument"`. Internal development sprints must never appear to MSME users. | **Remediated** |
| `frontend/src/pages/Dashboard.tsx` | `"Free AI Digital Consultant"` | **Needs Researcher Decision / Unsupported** | Replaced with `"Requirement-Based Framework"`. Avoids over-promising autonomous AI capabilities when deterministic rule engine is authoritative. | **Remediated** |
| `frontend/src/components/domain/ServiceDiscoveryCard.tsx` | `"Verified Provider" / "सत्यापित लिस्टिंग"` | **Needs Researcher Decision** | Retained as localized vendor listing descriptor for catalog items; clear disclaimer added distinguishing third-party services from formal accreditation. | **Safe / Clarified** |
| `frontend/src/pages/AuthPage.tsx` | `"Active Verified"` | **Safe (Authentication State)** | Indicates account email/phone verification status, not methodological validity. | **Safe** |
| `backend/app/domain/research/sensitivity_analysis.py` | `"RESEARCH SENSITIVITY ANALYSIS — NOT PRODUCTION CLASSIFICATION"` | **Safe (Explicit Academic Notice)** | Mandatory disclaimer header on read-only threshold perturbation tool. | **Safe** |
| `backend/app/domain/research/k_anonymity.py` | `"threshold supplied/configured by researcher"` | **Safe (Privacy Diagnostic)** | Explicitly records $k$ as researcher-configured parameter; does NOT claim statutory DPDP Act compliance. | **Safe** |
| `backend/app/schemas/assessment.py` | `"disclaimer_en / disclaimer_hi"` | **Safe (Reassessment Disclaimer)** | Explicitly disclaims that score increases reflect self-reported capability improvements rather than guaranteed revenue growth. | **Safe** |
| `backend/app/api/v1/endpoints/health.py` | `"runtime_supported": true` | **Safe (Runtime Check)** | Programmatically verifies supported Python 3.11/3.12 and MySQL 8.0+ runtime without unsupported Python 3.14 hacks. | **Safe** |

---

## Methodology Decisions Required (Flagged for Academic Supervisor)

The following items are purely methodological / research decisions and have been strictly preserved in code without unauthorized modifications:

1. **Title Alignment:** Whether the project paper and thesis title should read *"DigiMitra: A Requirement-Based Digitalization Assessment Framework for Indian MSMEs"* or retain *"AI-Assisted"* in the title.
2. **Empirical Calibration Target:** Determining the sample size $N$ and sampling methodology across Tier 2/3 MSME clusters for validating gate thresholds (Level 1 infra $\ge 4.0$, literacy $\ge 3.0$; Level 2 presence $\ge 4.0$, comms $\ge 3.0$, records $\ge 4.0$, inventory $\ge 3.0$; Level 3 payments $\ge 6.0$, records $\ge 6.0$, data usage $\ge 5.0$, growth $\ge 4.0$).
3. **Institutional Ethics Approval:** Confirming participant consent protocols and DPDP data retention policies before initiating live consultant labeling trials.
