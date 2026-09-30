# DigiMitra: C8 Research Validation & Empirical Evaluation Design

**Document ID:** DIGIMITRA-DOC-C8-V1.0  
**Phase:** C8 — Research Methodology & Empirical Evaluation Design  
**Status:** Approved Research Protocol Architecture  
**Scope:** Rigorous Empirical Validation Protocol for DigiMitra Digitalization Assessment and Recommendation Platform  
**Authorship / Role:** Senior Research Methodology Advisor, Empirical HCI Researcher, Digital Transformation Researcher, Thesis/IEEE Systems Architect  

---

## 1. Executive Summary

DigiMitra is an open, deterministic, rule-based digitalization assessment and decision-support platform designed for Micro, Small, and Medium Enterprises (MSMEs) in India. While software verification (unit, integration, and end-to-end testing) confirms that the implementation behaves according to its programmatic specification, software correctness must not be conflated with empirical research validation. 

The purpose of this document (C8) is to establish an academically defensible, rigorous empirical evaluation protocol to evaluate whether:
1. The **Requirement-Based Digitalization Level (RBDL_V1)** 4-level, 9-dimension cumulative maturity construct accurately and reliably measures enterprise digital capability readiness.
2. The **Requirement Profile V1** (capturing contextual goals, pain points, urgency, and provisional budget tiers) meaningfully contextualizes capability gaps.
3. The deterministic **Recommendation Engine** generates interventions that domain experts judge as appropriate, feasible, and actionable without generating unnecessary burden.
4. The system preserves strict ethical, linguistic, and privacy safeguards across English and Hindi linguistic contexts.

### Tripartite Epistemic Boundary
Throughout this protocol, three distinct concepts are strictly demarcated:
1. **Software Verification:** "The implementation behaves according to specification" (e.g., automated test suite passes with 156 backend tests and 27 frontend tests).
2. **Research Validation:** "Empirical evidence collected from human experts, business owners, and controlled experiments supports the theoretical constructs, measurement properties, and utility of the model."
3. **Research Outcome:** "The empirical study produced a specific numerical or qualitative finding following rigorous execution of pre-registered protocols."

ML models in DigiMitra are explicitly designated as exploratory, non-authoritative comparative artifacts and are barred from setting production ground truth or overruling deterministic classification.

---

## 2. Primary Research Question (PRQ)

```
PRQ: To what extent does a dual-construct digitalization evaluation framework—combining a transparent, gating-based capability assessment (RBDL) with an explicit contextual constraint profile (Requirement Profile)—provide an empirically valid, reliable, and expert-concordant basis for classifying MSME digital maturity and generating actionable, feasible digital-adoption recommendations compared to independent expert consultant benchmarks?
```

---

## 3. Secondary Research Questions (SRQs)

* **SRQ-1 (Measurement Validity & Structural Ordering):** Does the 14-item, 9-dimension RBDL_V1 instrument demonstrate acceptable content validity (I-CVI, S-CVI/Ave) and exhibit a cumulative, hierarchical Guttman-style ordering across its four maturity levels (Level 0 through Level 3) when evaluated against real-world Indian MSME operational capabilities?
* **SRQ-2 (Expert & Inter-Rater Concordance):** What is the degree of agreement (weighted Cohen’s/Fleiss’s kappa, quadratic weighted kappa) between DigiMitra's deterministic RBDL classifications and blinded independent MSME consultant judgments, and does DigiMitra-consultant agreement fall within the bound of inter-consultant agreement?
* **SRQ-3 (Contextual Recommendation Utility & Feasibility):** To what extent does the inclusion of contextual constraints (Requirement Profile V1: goals, pain points, urgency, and budget) improve expert-rated recommendation appropriateness, actionability, and feasibility over a baseline capability-gap model that relies solely on RBDL maturity levels?
* **SRQ-4 (Cross-Linguistic & Comprehension Equivalence):** Does the bilingual (English and Hindi) implementation maintain cognitive equivalence, measurement invariance, and human-traceable explanation comprehension across MSME owner-operators of diverse digital literacy levels?

---

## 4. Conceptual Model

The conceptual model decouples the objective *what can the business do* from the subjective/situational *what does the business need, prioritize, and afford*.

```
+-----------------------------------------------------------------------------------+
|                               BUSINESS ENTERPRISE                                 |
|  (Micro/Small/Medium, Sector, Geographic Locale, Existing Digital Artifacts)     |
+----------------------------------------+------------------------------------------+
                                         |
            +----------------------------+----------------------------+
            |                                                         |
            v                                                         v
+-------------------------------+                         +-------------------------------+
|    CAPABILITY REQUIREMENTS    |                         |    CONTEXTUAL REQUIREMENTS    |
|   (Observed Functional State) |                         |  (Stated Intent & Boundaries) |
+---------------+---------------+                         +---------------+---------------+
                |                                                         |
                v                                                         v
+-------------------------------+                         +-------------------------------+
|      RBDL_V1 ASSESSMENT       |                         |     REQUIREMENT PROFILE       |
|  14 C3 Indicators / 9 Dims    |                         |  Goal, Pain Point, Urgency,   |
|   (Infra, Literacy, Comms,    |                         |  Provisional Budget, Existing |
|   Records, Payments, Ops,     |                         |  Tools, Solution Preferences  |
|   Inventory, Data, Growth)    |                         +---------------+---------------+
+---------------+---------------+                                         |
                |                                                         |
                v                                                         |
+-------------------------------+                                         |
|        DIMENSION SCORES       |                                         |
|      (0.0 to 10.0 Scale)      |                                         |
+---------------+---------------+                                         |
                |                                                         |
                +----------------------------+                            |
                |                            |                            |
                v                            v                            |
+-------------------------------+  +-------------------+                  |
|      RBDL CLASSIFICATION      |  |  CAPABILITY GAPS  |                  |
|    (Deterministic Gating:     |  | (Target Level + 1 |                  |
|     Level 0, 1, 2, or 3)      |  |  Prerequisites)   |                  |
+---------------+---------------+  +---------+---------+                  |
                |                            |                            |
                +----------------------------)----------------------------+
                                             |
                                             v
                          +-------------------------------------+
                          |        RECOMMENDATION ENGINE        |
                          |   - Eligibility Filtering (C4 Rules)|
                          |   - Context Alignment (Goal/Pain)   |
                          |   - Priority Scoring Formula        |
                          |   - Feasibility Resolution          |
                          +------------------+------------------+
                                             |
                                             v
                          +-------------------------------------+
                          |       PERSONALIZED ROADMAP          |
                          |  - Phased Action Plan (P1, P2, P3)  |
                          |  - Feasibility States (e.g. Defer,  |
                          |    Lower-Cost Alternative)          |
                          |  - Traceability & Explanations      |
                          +------------------+------------------+
                                             |
                                             v
                          +-------------------------------------+
                          |      PROGRESS & REASSESSMENT        |
                          |    (Longitudinal Capability Shift)  |
                          +-------------------------------------+
```

---

## 5. Constructs and Variables

| Construct | Type | Operational Indicator / Observed Variable | Scale / Measurement Level | Role in Model |
| :--- | :--- | :--- | :--- | :--- |
| **Digital Capability** | Latent Construct | Responses to 14 C3 Question Bank items (Q01–Q14) | Ordinal (0 to max points per question) | Exogenous input |
| **Dimension Competence** | Composite Variable | 9 Dimension Scores ($D_1$ to $D_9$) normalized to $[0, 10]$ | Continuous ratio $[0.0, 10.0]$ | Intermediate metric |
| **Composite Score** | Index Variable | Weighted sum of 9 dimensions ($\sum w_i D_i$) | Continuous ratio $[0.0, 10.0]$ | Tracking indicator (non-gating) |
| **RBDL Maturity Level** | Ordered Categorical | Deterministic Gating Output (Levels 0, 1, 2, 3) | Ordinal (4 ranks) | Primary classification output |
| **Strategic Goal** | Categorical Variable | Stated goal code (G1 to G10) | Nominal | Contextual modifier |
| **Operational Pain Point**| Categorical Variable | Stated bottleneck code (P1 to P10) | Nominal | Contextual modifier |
| **Implementation Urgency**| Ordered Categorical | Stated timeline code (U1: >12m, U2: 6m, U3: 1-3m, U4: immediate) | Ordinal (4 ranks) | Priority weight factor |
| **Budgetary Capacity** | Ordered Categorical | Stated monthly willingness/capacity tier (B0 to B3) | Ordinal (4 provisional tiers) | Feasibility filter |
| **Recommendation Merit** | Evaluative Construct | Expert rating of Relevance, Actionability, Fit | Ordinal Likert (1–5) | Validation criterion |
| **Recommendation Feasibility**| Nominal State | FEASIBLE_NOW, LOWER_COST_ALTERNATIVE, DEFER_DUE_TO_BUDGET, ALREADY_HAVE | Nominal (6 exhaustive states) | Operational feasibility output |
| **Traceability Comprehension**| Cognitive Construct | Objective quiz score on why level/action was assigned | Ratio (0%–100% correct) | Usability outcome |

### Confounders and Moderators
* **Enterprise Sector / Sub-category:** Moderates capability expectations (e.g., retail grocery vs. micro-manufacturing).
* **Owner-Operator Education & English Proficiency:** Confounder in self-report reliability and survey interpretation.
* **Firm Size (Turnover & Staff Headcount):** Natural covariate of both capability score and budgetary tier.
* **Geographic Tier (Tier 2/3 town vs. Metropolitan area):** Moderates digital infrastructure availability.

---

## 6. Research Hypotheses & Propositions

* **Proposition 1 (Content Validity):** The 14 C3 assessment items and Requirement Profile parameters will demonstrate an Item-Content Validity Index ($I\text{-CVI}$) $\ge 0.78$ and a Scale-Content Validity Index average ($S\text{-CVI/Ave}$) $\ge 0.90$ across a panel of $\ge 6$ MSME digitalization specialists.
* **Hypothesis 1 (Inter-Rater & Rule Agreement):** 
  * $H_{1a}$: Blinded independent consultant-consultant agreement on 4-level RBDL classification will yield a Quadratic Weighted Kappa ($QWK$) $\ge 0.60$ (moderate-to-substantial agreement).
  * $H_{1b}$: DigiMitra deterministic classification agreement with consensus consultant judgment will achieve $QWK \ge 0.60$ and will not significantly differ from inter-consultant agreement (evaluated via bootstrap difference confidence intervals).
* **Hypothesis 2 (Test-Retest Stability):** In the absence of digital interventions over a 7-to-14 day window, RBDL dimension scores will exhibit an Intraclass Correlation Coefficient ($ICC(3,1)$) $\ge 0.75$, and RBDL level classification will achieve $QWK \ge 0.80$.
* **Proposition 2 (Hierarchical Scalability):** The 9 capability dimensions will conform to a cumulative Guttman scale with a Coefficient of Reproducibility ($CR$) $\ge 0.90$ and a Coefficient of Scalability ($CS$) $\ge 0.60$.
* **Hypothesis 3 (Contextual Ablation Utility):** 
  * $H_0$: Recommendations generated with the Requirement Profile ($M_B$) do not achieve higher consultant-evaluated appropriateness scores than recommendations generated from RBDL gaps alone ($M_A$).
  * $H_1$: $M_B$ achieves statistically significant higher composite appropriateness ($p < 0.05$, Wilcoxon signed-rank test, Cliff's $\delta \ge 0.30$).
* **Hypothesis 4 (Cross-Linguistic Invariance):** Responses collected via the Hindi and English instruments in a balanced bilingual split-half or matched cohort will show no significant differential item functioning (DIF Mantel-Haenszel $p > 0.05$).

---

## 7. Experimental Protocols (E-01 to E-12)

```
+------------------------------------------------------------------------------------+
|                         EXPERIMENTAL PROTOCOL SUITE                                |
|                                                                                    |
|  [E-01 Content Validity]  -->  [E-06 EN/HI Cognitive]  -->  [E-11 Language Eq.]    |
|            |                                                        |              |
|            v                                                        v              |
|  [E-03 Test-Retest]       -->  [E-04 Sensitivity]      -->  [E-08 Level Ordering]  |
|            |                                                        |              |
|            v                                                        v              |
|  [E-02 Consultant Agree]  -->  [E-09 Gating vs Band]   -->  [E-05 Rec Appropriat.] |
|            |                                                        |              |
|            v                                                        v              |
|  [E-07 Traceability Usab] -->  [E-10 Longitudinal]     -->  [E-12 Privacy Export]  |
+------------------------------------------------------------------------------------+
```

### E-01: Content Validity Protocol
* **Objective:** Quantify relevance, clarity, and domain coverage of questions, dimensions, requirement profiles, and recommendation catalogs.
* **Panel:** $N = 7$ to $9$ independent experts (minimum 3 academic researchers in MSME ICT adoption, 3 senior MSME digital consultants, 1 rural enterprise development officer).
* **Rating System:** 4-point ordinal scale for Relevance (1=Not relevant, 2=Somewhat relevant, 3=Quite relevant, 4=Highly relevant) and Clarity (1=Unclear, 2=Needs major revision, 3=Needs minor revision, 4=Completely clear).
* **Metrics:** 
  $$I\text{-CVI} = \frac{n_{\text{rating } 3 \text{ or } 4}}{N}$$
  $$S\text{-CVI/Ave} = \frac{\sum I\text{-CVI}}{\text{Total Items}}$$
  Modified Kappa $k^*$ calculated to adjust for chance agreement: $k^* = (I\text{-CVI} - P_c) / (1 - P_c)$ where $P_c = \binom{N}{A} 0.5^N$.
* **Decision Thresholds:** Retain item if $I\text{-CVI} \ge 0.78$ and $k^* \ge 0.74$. Items with $I\text{-CVI}$ between $0.60$ and $0.77$ enter formal revision; items with $I\text{-CVI} < 0.60$ are flagged for removal.

### E-02: Rule vs. Consultant Agreement Protocol
* **Objective:** Compare deterministic classifications with independent human expert judgments under strictly blinded conditions.
* **Design:** 2-consultant blinded evaluation across a representative sample of $N = 50$ enterprise profiles.
* **Procedure:** Consultants receive a standardized Case Packet containing enterprise profile data, raw questionnaire responses, and stated operational pain points. All DigiMitra software outputs (dimension scores, levels, recommendations) are strictly stripped.
* **Measurements:** Consultants independently assign RBDL Level (0, 1, 2, 3), validate primary capability gap, and rate top-3 recommended actions.
* **Metrics:** Inter-consultant agreement ($QWK_{C1-C2}$) and System-Consultant agreement ($QWK_{S-C1}$, $QWK_{S-C2}$, $QWK_{S-\text{Consensus}}$). 95% bootstrap confidence intervals (1,000 resamples).

### E-03: Test-Retest Reliability Protocol
* **Objective:** Establish temporal stability of dimension scores and classification gates in a zero-intervention baseline.
* **Sample:** $N = 30$ stable MSMEs re-assessed between 7 and 14 days after initial assessment.
* **Control Conditions:** Mandatory screening confirmation that no hardware, software, connectivity, or accounting change occurred between tests. Reassessment administered by same respondent role using identical instrument version.
* **Metrics:** Two-way mixed-effects, absolute agreement, single-measurement $ICC(3,1)$ for dimension scores. Quadratic Weighted Kappa ($QWK$) and percentage agreement for discrete RBDL levels.

### E-04: Threshold Sensitivity Protocol
* **Objective:** Measure the robustness of deterministic classification gates against boundary perturbations.
* **Execution:** Diagnostic simulation running the full corpus of empirical/synthetic assessment profiles through perturbed parameter spaces:
  * Dimension thresholds shifted by $\pm 0.5$ and $\pm 1.0$ points.
  * Systematic permutation of single-question $N/A$ inputs across all applicable dimensions.
  * Toggling the category-specific inventory exemption rule.
* **Outputs:** Reclassification rate ($\% \Delta$), transition matrix of fragile boundaries (e.g., Level 1 $\rightarrow$ Level 0 flip rate), and identifying dimensions with high elasticity.

### E-05: Recommendation Appropriateness Protocol
* **Objective:** Blinded comparative evaluation of personalized recommendations against a baseline.
* **Comparison Conditions:**
  * **Arm A (DigiMitra Personalized):** Filtered by capability gap + Requirement Profile + Budget tier.
  * **Arm B (Generic Baseline):** Top-ranked catalog recommendations based purely on sector averages without capability gap or budget filtering.
* **Blinding:** Independent evaluators receive pairs of anonymized recommendation sets in randomized order (labeled Option X vs Option Y).
* **Evaluation Criteria:** 5-point Likert ratings across: Relevance to Business, Feasibility given Budget, Correctness of Sequence, and Actionability. Evaluators also flag any "Unnecessary / Harmful Recommendation."
* **Analysis:** Wilcoxon signed-rank test for paired ordinal scores, Mann-Whitney U test, and Cliff's delta effect size.

### E-06: English/Hindi Cognitive Validation Protocol
* **Objective:** Identify comprehension drift, ambiguous terminology, and cultural misalignment in the localized question bank.
* **Methodology:** Think-aloud cognitive interviews with $N = 12$ Hindi-primary MSME operators (4 retail, 4 repair/service, 4 micro-manufacturing).
* **Probing Framework:** Tourangeau’s 4-stage cognitive model: (1) Comprehension of question/terms (e.g., *“Cloud backup”*, *“Digital register”*, *“Online presence”*), (2) Retrieval of relevant business records, (3) Judgment/estimation, and (4) Response formatting.
* **Outputs:** Structured Cognitive Error Matrix categorizing lexical ambiguity, conceptual misfit, and translation artifacts.

### E-07: Traceability & Comprehension Usability Protocol
* **Objective:** Evaluate whether owner-operators correctly comprehend *why* a specific level and roadmap were assigned.
* **Design:** Within-subject usability session ($N = 20$ business owners).
* **Instruments:**
  * 5 objective factual comprehension questions (e.g., *"According to DigiMitra, what is the main reason your business is at Level 1 rather than Level 2?"*).
  * System Usability Scale (SUS) standard 10-item instrument.
  * Qualitative post-task debrief on explanation trust.
* **Thresholds:** Target benchmark $\ge 75\%$ objective comprehension accuracy and mean SUS score $\ge 70$ (acceptable/good usability).

### E-08: Level Ordering & Scalability Protocol
* **Objective:** Test the empirical validity of the cumulative 4-level maturity assumption.
* **Technique:** Non-parametric item response theory (Mokken Scale Analysis) and Guttman scalogram analysis on capability milestone acquisition across $N \ge 100$ enterprises.
* **Metrics:** 
  * Green's Index of Consistency ($I$).
  * Loevinger’s scalability coefficient $H$ for individual dimensions and overall scale ($H \ge 0.50$ indicates strong scalability; $0.40 \le H < 0.50$ moderate; $0.30 \le H < 0.40$ weak).
* **Interpretation:** If $H < 0.30$ or Guttman reproducibility $CR < 0.90$, the strict cumulative staging model is refuted, pointing toward an independent multi-dimensional capability profile.

### E-09: Gating vs. Score-Band Methodological Comparison
* **Objective:** Compare deterministic prerequisite gating with a continuous weighted score-band classification model.
* **Evaluation Dimensions:**
  * Empirical concurrence with expert consultant consensus ($QWK$).
  * Sensitivity to single-item omissions.
  * Compensatory error rate (cases where extreme strength in payments masks total lack of basic security/backup).
* **Deliverable:** Methodological comparison matrix demonstrating trade-offs between interpretability/prerequisite enforcement and classification fragility.

### E-10: Longitudinal Progress & Descriptive Reassessment Protocol
* **Objective:** Characterize capability trajectory over time among active platform users.
* **Design:** Observational longitudinal cohort tracking $N \ge 25$ MSMEs over 3 to 6 months.
* **Metrics:** $\Delta$ dimension scores, rate of roadmap milestone completion, re-classification transitions, and user-reported reason for reassessment.
* **Epistemic Constraint:** Strictly descriptive analysis. Explicitly prohibits asserting that DigiMitra *caused* the digital growth unless a randomized waiting-list control design is established.

### E-11: Language Equivalence Protocol
* **Objective:** Ensure measurement invariance between English and Hindi versions.
* **Methodology:** Split-half administration or matched-pair comparative cohort ($N = 30$ bilingual respondents answering counterbalanced forms, or $N = 60$ propensity-matched owners).
* **Statistical Analysis:** Differential Item Functioning (DIF) via Mantel-Haenszel odds-ratio test; Spearman rank correlation of dimension scores between language administrations.

### E-12: Privacy & k-Anonymity Research Export Protocol
* **Objective:** Ensure that research exports prevent re-identification of participating small businesses.
* **Quasi-Identifiers:** Pincode/locality, business sector sub-type, staff count bracket, turnover bracket, years in operation.
* **Protection Standards:** Enforce $k \ge 5$ anonymity and $l \ge 2$ diversity on sensitive business metrics (turnover, debt, specific pain point).
* **Transformations:** Geographic generalization (e.g., truncation of 6-digit Pincode to 3-digit district code), category coarsening (collapsing niche sectors into broader NIC 2-digit groups), and cell suppression when group count $< 5$.

---

## 8. Consultant Validation Protocol

```
+------------------------------------------------------------------------------------+
|                         CONSULTANT VALIDATION PIPELINE                             |
|                                                                                    |
|  [Enterprise Assessment Data]                                                      |
|              |                                                                     |
|              v                                                                     |
|  [Blinding & Redaction Engine] ---> Strips Level, Scores, and System Roadmap       |
|              |                                                                     |
|              v                                                                     |
|  [Standardized Case Packet]                                                        |
|              |                                                                     |
|      +-------+-------+                                                             |
|      |               |                                                             |
|      v               v                                                             |
| [Consultant 1]  [Consultant 2]  --> Independent Review (Max 5 cases/session)       |
|      |               |                                                             |
|      +-------+-------+                                                             |
|              |                                                                     |
|              v                                                                     |
| [Concordance Engine] ----------> Inter-Rater Reliability (QWK, Fleiss' Kappa)      |
|              |                   System vs Consensus Benchmark                     |
|              v                                                                     |
| [Discrepancy Resolution] ------> Third Expert Adjudication (if delta >= 2 levels)  |
+------------------------------------------------------------------------------------+
```

### Consultant Selection & Criteria
* **Qualifications:** Minimum 3 years of demonstrated professional consulting experience advising Indian MSMEs on technology adoption, accounting software, ERP/CRM deployment, or digital marketing; OR academic/extension specialists from MSME-DI / KVIC / State Enterprise Boards.
* **Independence:** Consultants must have zero prior involvement in designing DigiMitra rules, algorithms, or code.
* **Conflict of Interest:** No consultant may evaluate a business with which they have commercial or familial relationships.

### Blinding Procedure
1. The case packet presents raw survey inputs: firm size, sector, physical infrastructure, current accounting method, payment collection channels, customer contact methods, and stated pain points.
2. All DigiMitra calculated fields—dimension scores, composite scores, assigned RBDL level, and system-generated recommendations—are strictly removed.
3. Case packets are distributed via an isolated evaluation interface that records timestamp, duration per review, and rating rationales.

### Case Load & Fatigue Prevention
* Maximum review volume: No more than 5 cases per sitting, with a mandatory 30-minute rest period. Maximum 10 cases per consultant per week to avoid cognitive fatigue and rote grading.

### Consensus & Adjudication Framework
* If Consultant 1 and Consultant 2 agree on RBDL level: Assigned as *Consensus Expert Ground Truth*.
* If Consultant 1 and Consultant 2 differ by 1 level (e.g., Level 1 vs Level 2): The arithmetic average or discussion consensus is recorded.
* If Consultant 1 and Consultant 2 differ by $\ge 2$ levels (e.g., Level 0 vs Level 2): Case is routed to an independent Third Senior Arbitrator to perform a blind adjudication.

---

## 9. Sampling Plan

```
Target Population: Indian MSMEs (Enterprises with annual turnover < 50 Crore INR and 
                   plant/machinery investment < 10 Crore INR under MSMED Act 2020)
                   Operating in Urban, Peri-Urban, and Tier-2/3 Industrial Hubs.
```

### Eligibility Criteria
* **Inclusion:** Registered or unregistered enterprise operating continuously for $\ge 6$ months; has a fixed commercial premise or stall; primary respondent is the sole proprietor, active partner, or designated managing operator.
* **Exclusion:** Purely digital-native tech startups; subsidiaries of large corporations; enterprises undergoing liquidation; respondents younger than 18.

### Strata and Sector Allocation
Sampling must ensure balanced representation across three major commercial categories:
1. **Retail & Wholesale Trade (40%):** Kirana, apparel, book stores, hardware/paint, electronics shops.
2. **Personal & Commercial Services (35%):** Automobile repair, beauty/salon, tailoring, printing/xerox, logistics agents.
3. **Micro-Manufacturing & Fabrication (25%):** Light fabrication, food processing/bakery, plastics molding, packaging.

### Tiered Sample Size Targets

| Stratum / Target | Minimum Feasible ($N_{\min}$) | Preferred Study ($N_{\text{pref}}$) | Ideal Thesis ($N_{\text{ideal}}$) | Primary Analytical Justification |
| :--- | :--- | :--- | :--- | :--- |
| **Full Cross-Sectional Corpus** | $N = 60$ | $N = 150$ | $N = 300$ | Sufficient power for factor stability and subgroup stratification |
| **E-01 (Content Validity Panel)** | $N = 6$ experts | $N = 8$ experts | $N = 10$ experts | Meets Lynn (1986) standards for CVI calculation without chance distortion |
| **E-02 (Blinded Consultant Audit)**| $N = 30$ cases | $N = 50$ cases | $N = 100$ cases | Provides stable estimation of quadratic weighted kappa with confidence bounds |
| **E-03 (Test-Retest Cohort)** | $N = 20$ firms | $N = 35$ firms | $N = 50$ firms | Detects ICC $\ge 0.75$ with power $1-\beta = 0.80$, $\alpha = 0.05$ |
| **E-05 (Recommendation Evaluation)**| $N = 25$ case pairs | $N = 50$ case pairs | $N = 100$ case pairs | Paired non-parametric comparison (Wilcoxon, Cliff's delta) |
| **E-06 (Cognitive Interviews)** | $N = 8$ owners | $N = 12$ owners | $N = 20$ owners | Reaches thematic saturation across Hindi dialectical idioms |

---

## 10. Ethics and Consent Plan

Human-subject empirical investigation with micro-enterprise owners requires rigorous protections regarding financial confidentiality, commercial privacy, and voluntary consent.

### Software Testing vs. Human-Subject Research Boundary
* Unit, integration, synthetic data runs, and automated system tests do not involve human subjects and require no Institutional Ethics Review.
* Gathering assessment answers, operational financials, business goals, and owner cognitive reactions constitutes human-subject research requiring formal protocol compliance.

### Core Ethical Safeguards
1. **Informed Consent Procedure:** Administered in the respondent's preferred language (Hindi or English). Clear explanation that participation is voluntary, results do not impact tax status, government benefits, or bank credit, and withdrawal is permissible at any stage without consequence.
2. **Data Minimization:** No personal Aadhaar numbers, PAN cards, bank account numbers, or GSTIN passwords are collected. Enterprise phone numbers and email addresses are separated from assessment responses via cryptographically hashed pseudonym keys ($PID$).
3. **Financial Confidentiality:** Budget capacities are captured exclusively via broad categorical brackets (B0–B3) rather than exact ledger balance disclosure.
4. **Institutional Review Governance:** Research protocols, consent sheets, and consultant agreements must be submitted to the Institutional Ethics Committee (IEC) / Research Review Board at JECRC University before commencing field data collection.

---

## 11. Validity Framework

| Validity Dimension | Target Construct / Aspect | Current Evidence Base | Evidence Still Required | Empirical Protocol / Method | Legitimate Supported Claim | Unsupported Claim Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Content Validity** | Representation of MSME digital maturity across 9 dimensions | Expert-derived question definitions and C3 design review | Formal quantification of expert consensus on relevance/clarity | E-01 (I-CVI, S-CVI, Modified Kappa) | "Instrument items are recognized by experts as relevant and clear." | Cannot claim items are mathematically optimal or exhaustively complete. |
| **Construct Validity** | Cumulative 4-level maturity progression (RBDL) | Conceptual framework rooted in ICT4D staged growth theory | Empirical verification of cumulative item acquisition | E-08 (Guttman scalability, Mokken analysis) | "Maturity levels exhibit an empirical hierarchy in this population." | Cannot claim maturity is strictly linear across all atypical sectors. |
| **Criterion / Concurrent** | Agreement with professional digital consultants | Single-case diagnostic alignment checks | Blinded multi-rater agreement across broad cohort | E-02 (Quadratic Weighted Kappa, ICC) | "DigiMitra classifications concur with blinded human consultant judgments." | Cannot claim the system replaces human expert consultation. |
| **Reliability** | Stability of score measurements over time | Deterministic code execution (software verification) | Human respondent test-retest consistency over 7–14 days | E-03 (Test-Retest, ICC(3,1)) | "The questionnaire yields stable responses under unchanged business state." | Cannot claim resistance to deliberate owner reporting bias. |
| **Ecological Validity** | Usability and actionability in authentic Indian MSME contexts | Laboratory testing and developer browser simulations | Field evaluation with Hindi/English owner-operators | E-06, E-07 (Cognitive interviews, SUS) | "Small business operators can understand and navigate recommendations." | Cannot claim recommendations guarantee commercial revenue growth. |

---

## 12. "Requirement-Based" Operational Definition

### Critical Conceptual Demarcation
To avoid academic inflation and semantic confusion, the term **"Requirement-Based Digitalization Level" (RBDL)** must be explicitly defended. In software and systems engineering, "requirements" typically imply formal engineering specifications. In DigiMitra, we operationally define:

```
"Business Digitalization Requirements = Capability Requirements + Contextual Constraints/Preferences"
```

1. **Capability Requirements (The "What"):**
   * Functional operational requisites demanded by the business environment to achieve digital viability (e.g., maintaining digital accounting logs, accepting UPI payments, ensuring data redundancy).
   * Captured objectively via the 14-item RBDL questionnaire and mapped into the 9 capability dimension scores.
2. **Contextual Constraints & Preferences (The "How" and "When"):**
   * The subjective, financial, and strategic realities governing the enterprise's current operational bandwidth.
   * Captured via the Requirement Profile: Business Goal ($G$), Pain Point ($P$), Implementation Urgency ($U$), Budget Capacity ($B$), and Existing Tools ($T$).

### Defensible Academic Interpretation
DigiMitra legitimately uses **Interpretation A & B**:
* *Interpretation A (Level-Entry Requisite Gates):* Each RBDL maturity level establishes non-negotiable functional prerequisites (gates) that must be satisfied before ascending to higher operational classifications.
* *Interpretation B (Constraint-Driven Filtering):* Digitalization interventions are not delivered as a generic monolithic curriculum, but are explicitly filtered and prioritized by stated contextual constraints (urgency, budget, pain point).

*Excluded Claim (Interpretation C):* DigiMitra does **not** implement a dynamic formal Requirements-Engineering specification language (such as SysML, KAOS, or IEEE 830 software requirement documents).

---

## 13. Budget Construct Validation

### Status of Budget Tiers
The provisional monthly budget tiers ($B0 = \text{₹}0$, $B1 < \text{₹}1,000$, $B2 = \text{₹}1,000–\text{₹}5,000$, $B3 > \text{₹}5,000$) represent an illustrative operational categorization that has **not** yet been validated against empirical willingness-to-pay (WTP) data.

### Tripartite Construct Separation
Field protocols must systematically isolate three distinct economic concepts that are frequently conflated in self-report surveys:
1. **Solvency / Affordability:** What the enterprise's cash flow can mathematically bear without risking insolvency.
2. **Willingness to Pay (WTP):** What the owner-operator is psychologically and strategically prepared to risk on digital software or services.
3. **Solution Market Cost:** The actual total cost of ownership (TCO) of software licenses, hardware, and ongoing data subscriptions.

### Diagnostic Protocol
* During cognitive interviews (E-06) and survey administration, evaluate:
  * Frequency of floor effects (disproportionate clustering in $B0$).
  * Misunderstanding between **one-time capital expenditures** (e.g., purchasing a smartphone or thermal printer) versus **recurring operational expenses** (e.g., monthly SaaS subscriptions).
  * Impact of offering sub-tiers within $B1$ (e.g., ₹0–₹499 vs ₹500–₹999).

---

## 14. Recommendation Validation Model

### Ablation Design
To isolate the specific empirical contribution of the Requirement Profile, the evaluation compares two distinct recommendation models:

```
=====================================================================================
MODEL A: Pure Capability-Gap Model (Baseline)
Input: RBDL Level + Capability Dimension Gaps
Logic: Selects all catalogue recommendations matching Target Level = Current Level + 1
Ranking: Sort by raw impact score only
Output: Unfiltered capability recommendations
=====================================================================================

=====================================================================================
MODEL B: Context-Enriched Model (DigiMitra Full System)
Input: RBDL Level + Dimension Gaps + Requirement Profile (Goal, Pain, Budget, Urgency)
Logic: Applies eligibility gates + budget feasibility state resolution + goal alignment
Ranking: Full Priority Formula: P = 0.4(Impact) + 0.2(Feasibility) - 0.1(Cost) + 0.3(Readiness)
Output: Phased, feasibility-resolved personalized roadmap
=====================================================================================
```

### Measurement Battery (Evaluator Ratings)
Expert consultants rate individual recommendations and overall roadmaps on a 5-point Likert scale:
1. **Relevance:** Is the recommendation directly aligned with the firm's real operational bottlenecks?
2. **Feasibility:** Can the business execute this given its current literacy and budget state?
3. **Actionability:** Are the concrete steps unambiguous and executable by non-technical staff?
4. **Sequence Correctness:** Does the sequence avoid missing architectural prerequisites?
5. **Burden / Wastage:** Does the roadmap suggest superfluous, distracting, or overly complex tools?

---

## 15. Statistical Analysis Plan

```
+----------------------------------------------------------------------------------------------------+
|                                    STATISTICAL ANALYSIS MATRIX                                     |
+--------+----------------------------+-----------------------+---------------------+----------------+
| Exp ID | Construct / Variable       | Measurement Level     | Primary Test        | Effect Size    |
+--------+----------------------------+-----------------------+---------------------+----------------+
| E-01   | Content Validity (Relevance)| Ordinal (1-4)         | I-CVI, S-CVI/Ave    | Modified Kappa |
| E-02   | Inter-Consultant Agreement | Ordinal (Levels 0-3)  | Quadratic Wtd Kappa | 95% Bootstrap  |
| E-02   | System-Consultant Agreem.  | Ordinal (Levels 0-3)  | Quadratic Wtd Kappa | 95% Bootstrap  |
| E-03   | Test-Retest Score Stability| Continuous [0.0-10.0] | ICC(3,1) Agreement  | 95% Conf Bounds|
| E-03   | Test-Retest Level Stability| Ordinal (Levels 0-3)  | Weighted Kappa      | % Agreement    |
| E-05   | Rec Appropriateness (A vs B| Ordinal Likert (1-5)  | Wilcoxon Signed-Rank| Cliff's Delta  |
| E-07   | Usability & Comprehension  | Continuous / Ratio    | Mean SUS, % Correct | Cohen's d      |
| E-08   | Cumulative Scalability     | Binary Milestone Pass | Mokken H, Guttman CR| Scalability H  |
| E-11   | Language Invariance (EN/HI)| Ordinal Responses     | Mantel-Haenszel DIF | Odds Ratio     |
+--------+----------------------------+-----------------------+---------------------+----------------+
```

### Methodological Justifications
* **Quadratic Weighted Kappa ($QWK$):** Selected because classification error across maturity levels is inherently ordinal; a misclassification between Level 0 and Level 3 is penalised much more severely than between Level 0 and Level 1.
* **Wilcoxon Signed-Rank Test & Cliff's Delta:** Non-parametric methods mandated due to the bounded ordinal nature of Likert recommendation evaluations and absence of assumed normality.
* **$ICC(3,1)$ (Two-Way Mixed, Absolute Agreement):** Appropriate for test-retest reliability where rater/instrument effect is fixed and absolute measurement stability is required.

---

## 16. Threats to Validity

```
+---------------------------------------------------------------------------------------------+
|                                  THREATS TO VALIDITY MATRIX                                 |
+--------------------------+-----------------------------------+------------------------------+
| Identified Risk          | Methodological Threat             | Concrete Mitigation Protocol |
+--------------------------+-----------------------------------+------------------------------+
| Selection Bias           | Early adopters skew digitally     | Quota-based field sampling   |
|                          | progressive; tech-averse excluded | across traditional wholesale |
|                          |                                   | and peri-urban markets       |
+--------------------------+-----------------------------------+------------------------------+
| Self-Report / Acquiescence| Business owners over-report tools | Anchor questions to concrete |
| Bias                     | or claim aspirational usage       | verifiable operational checks|
|                          |                                   | (e.g. "show QR standee")     |
+--------------------------+-----------------------------------+------------------------------+
| Consultant Anchoring &   | Consultants disagree or anchor    | Full blinding of system tags;|
| Inter-Rater Variance     | on personal technological biases  | multi-rater consensus audits |
+--------------------------+-----------------------------------+------------------------------+
| Translation & Semantic   | Hindi translations drift from     | Systematic back-translation  |
| Drift                    | intended construct meanings       | and cognitive think-aloud    |
+--------------------------+-----------------------------------+------------------------------+
| Circular ML Validation   | Using rule-derived labels to      | Strict isolation: ML tested  |
| Trap                     | claim high machine learning "true | against independent external |
|                          | accuracy"                         | consultant consensus only    |
+--------------------------+-----------------------------------+------------------------------+
| Budget Classification    | Owners state ₹0 out of caution,   | Decouple stated budget from  |
| Distortion               | distorting feasibility scoring    | capability assessment logic  |
+--------------------------+-----------------------------------+------------------------------+
```

---

## 17. Research Dataset Specification

To ensure auditability, data minimization, and privacy, three tiers of data storage are maintained:

```
+------------------------------------------------------------------------------------+
|                              DATA SEPARATION ARCHITECTURE                          |
|                                                                                    |
| [TIER 1: PRODUCTION DB]                                                            |
|  Contains live operational tables: users, enterprises, assessments, roadmaps.      |
|  Encrypted at rest; tenant-isolated; contains PII and direct enterprise links.      |
|                                                                                    |
|                         | (Controlled Sanitization & Pseudonymization)             |
|                         v                                                          |
| [TIER 2: RESEARCH SNAPSHOT DATASET]                                                |
|  Immutable point-in-time study snapshot.                                           |
|  Replaces PII with cryptographic research participant IDs (e.g. PID-IND-042).      |
|  Stores raw answers, dimension scores, levels, profiles, and consultant labels.    |
|                                                                                    |
|                         | (Aggregation, Coarsening & k-Anonymity Filtering)        |
|                         v                                                          |
| [TIER 3: ANONYMIZED RESEARCH EXPORT]                                               |
|  Publicly shareable replication file (CSV/Parquet).                                |
|  Pincodes truncated to 3 digits; sector tags coarsened; k >= 5 anonymity enforced. |
|  Accompanies thesis artifacts and scholarly publications.                          |
+------------------------------------------------------------------------------------+
```

### Research Dataset Schema Fields (Tier 2 Snapshot)
* `study_id`, `participant_id` (Pseudonymous key)
* `business_sector_code` (NIC 2-digit classification)
* `firm_age_bracket`, `employee_count_bracket`
* `language_administered` (`EN` / `HI`)
* `instrument_version_hash`, `assessment_timestamp`
* Raw item response vectors (`Q01` through `Q14`)
* Dimension score vectors ($D_1$ through $D_9$)
* Deterministic RBDL classification result (`0`, `1`, `2`, `3`)
* Stated contextual profile items ($G$, $P$, $U$, $B$, $T$)
* Generated recommendation IDs, calculated priority scores, and feasibility states
* Paired consultant ratings and blinded consensus classifications (where assigned)

---

## 18. Research Data Model (Entity-Relationship Design)

To support empirical evaluation without altering production business entities, the following research entities are specified:

```
+------------------------------------------------------------------------------------+
|                         RESEARCH SCHEMA SPECIFICATION                              |
+------------------------------------------------------------------------------------+

  1. research_studies
     - id (PK, UUID)
     - study_name (VARCHAR)
     - protocol_version (VARCHAR)
     - status (ENUM: DRAFT, ACTIVE, FROZEN, CONCLUDED)
     - created_at, frozen_at (DATETIME)

  2. research_participants
     - id (PK, UUID)
     - study_id (FK -> research_studies.id)
     - enterprise_id (FK -> enterprises.id, NULLABLE in export)
     - pseudonymous_code (VARCHAR, UNIQUE)
     - consent_granted (BOOLEAN)
     - consent_timestamp (DATETIME)
     - language_selected (VARCHAR(2))

  3. consultant_profiles
     - id (PK, UUID)
     - user_id (FK -> users.id)
     - professional_years_experience (INTEGER)
     - sector_specialization (VARCHAR)
     - active_status (BOOLEAN)

  4. blinded_evaluation_packets
     - id (PK, UUID)
     - study_id (FK -> research_studies.id)
     - assessment_id (FK -> assessments.id)
     - packet_token (VARCHAR, UNIQUE)
     - randomized_order (INTEGER)
     - system_outputs_redacted (BOOLEAN, DEFAULT TRUE)

  5. consultant_evaluations
     - id (PK, UUID)
     - packet_id (FK -> blinded_evaluation_packets.id)
     - consultant_id (FK -> consultant_profiles.id)
     - assigned_rbdl_level (SMALLINT)
     - primary_gap_dimension (VARCHAR)
     - confidence_score (SMALLINT, 1-5)
     - recommendation_evaluation_json (JSON)
     - qualitative_notes (TEXT)
     - review_duration_seconds (INTEGER)
     - submitted_at (DATETIME)

  6. test_retest_linkages
     - id (PK, UUID)
     - participant_id (FK -> research_participants.id)
     - baseline_assessment_id (FK -> assessments.id)
     - retest_assessment_id (FK -> assessments.id)
     - elapsed_hours (FLOAT)
     - stability_verified (BOOLEAN)

  7. recommendation_ablation_evaluations
     - id (PK, UUID)
     - assessment_id (FK -> assessments.id)
     - evaluator_id (FK -> consultant_profiles.id)
     - arm_evaluated (ENUM: MODEL_A_CAPABILITY_ONLY, MODEL_B_CONTEXT_ENRICHED)
     - relevance_score (SMALLINT, 1-5)
     - feasibility_score (SMALLINT, 1-5)
     - actionability_score (SMALLINT, 1-5)
     - sequencing_score (SMALLINT, 1-5)
     - unnecessary_burden_flag (BOOLEAN)
```

---

## 19. Reproducibility Protocol

Any scholarly publication or thesis submission derived from DigiMitra must lock and reference an immutable **Reproducibility Manifest**.

### Manifest Parameters
* **Study Identifier:** `DIGIMITRA-STUDY-2026-VAL1`
* **Git Commit Hash:** Clean SHA-1 tracking exact engine code (e.g., `f063aa282a59ef597952e830f70ad9cecfe7bd0c`).
* **Frozen Instrument Versions:** 
  * `RBDL_V1.0` (Scoring rules, cutoffs, and dimension weights).
  * `QUESTION_BANK_C3_V1.0` (14 questions).
  * `REQUIREMENT_PROFILE_V1.0` (Controlled category taxonomy).
  * `RECOMMENDATION_CATALOG_C4_V1.0` (Action items, eligibility rules, priority formula).
* **Execution Environment:** Python runtime version, dependency lockfile (`requirements.txt`), and random seed specification for any statistical permutations (Seed: `20260929`).
* **Analysis Artifacts:** Self-contained Jupyter/R computational scripts reading frozen data snapshots and generating reported figures/tables with cryptographic hash verification (`SHA-256`).

---

## 20. Research Claims Audit

```
+---------------------------------------------------------------------------------------+
|                                 CLAIMS AUDIT MATRIX                                   |
+---------------------------------------------------------------------------------------+
| A. PERMISSIBLE CLAIMS (Subject to empirical validation support from E-01 to E-12)      |
|    1. "DigiMitra provides a deterministic, transparent, and auditable classification   |
|       of enterprise digital readiness across four defined maturity stages."           |
|    2. "The system's classifications exhibit substantial concordance with independent   |
|       human consultant judgments."                                                    |
|    3. "The contextual Requirement Profile improves the expert-rated feasibility and   |
|       actionability of generated roadmaps compared to pure capability-gap baselines." |
|    4. "The bilingual (English/Hindi) instrument demonstrates cognitive clarity and     |
|       functional equivalence across diverse small business owner-operators."          |
+---------------------------------------------------------------------------------------+
| B. STRICTLY PROHIBITED CLAIMS (Methodologically ungrounded and academically invalid)  |
|    1. Prohibited: "DigiMitra is an autonomous AI consultant."                         |
|    2. Prohibited: "The system automatically guarantees MSME revenue/profit growth."   |
|    3. Prohibited: "Machine learning algorithms have validated the RBDL thresholds."   |
|    4. Prohibited: "The 14 questions represent an exhaustive diagnostic of all ICT."   |
|    5. Prohibited: "The four levels represent a universal, mandatory law of growth."    |
+---------------------------------------------------------------------------------------+
| C. CLAIMS REQUIRING LARGER / LONGITUDINAL FUTURE RESEARCH                             |
|    1. Causal claims regarding long-term business survival or employment generation.   |
|    2. Generalizability to African, Latin American, or non-Indian informal economies.   |
|    3. Automated replacement of on-site professional enterprise auditors.              |
+---------------------------------------------------------------------------------------+
```

---

## 21. Research Roadmap (Phases R1 to R11)

```
+------------------------------------------------------------------------------------+
|                             RESEARCH EXECUTION ROADMAP                             |
+------------------------------------------------------------------------------------+

  [R1: Methodology Freeze] ---------> Finalize C8 protocol and lock parameters
             |
             v
  [R2: Ethics & Consent Prep] ------> File IEC documentation and participant sheets
             |
             v
  [R3: Pilot Study (N=10)] ---------> Dry-run interface, verify pipeline execution
             |
             v
  [R4: E-01 Content Validity] ------> Expert panel ratings (I-CVI, S-CVI)
             |
             v
  [R5: E-06/11 Language Validation]-> Cognitive think-aloud & Hindi back-translation
             |
             v
  [R6: E-02 Blinded Consultant Study] Independent consultant ratings on case packets
             |
             v
  [R7: E-05 Rec Appropriateness] ---> Blinded ablation audit (Model A vs Model B)
             |
             v
  [R8: E-03/04 Reliability & Sens] -> Test-retest stability & boundary perturbation
             |
             v
  [R9: E-08 Scalability Analysis] --> Mokken & Guttman level ordering analysis
             |
             v
  [R10: Exploratory ML Benchmark] --> Compare non-authoritative models against labels
             |
             v
  [R11: Thesis & IEEE Publication] -> Compile final manuscripts with locked manifest
```

| Phase | Milestone Name | Prerequisites | Data / Participants | Primary Activity | Human Subjects? | Ethics Req? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | Methodology Freeze | Complete C8 Design | None | Lock instrument parameters and manifests | No | No |
| **R2** | Ethics Preparation | R1 | Documentation | Prepare IEC application, consent forms, PIS | No | Yes (Approval) |
| **R3** | Technical Pilot | R2 | $N = 10$ MSMEs | Dry-run end-to-end data ingestion pipeline | Yes | Yes |
| **R4** | Content Validity | R1 | $N = 7$ Experts | Calculate I-CVI, S-CVI on questions & rules | Yes | Yes |
| **R5** | Cognitive / Language | R4 | $N = 12$ Owners | Hindi/English think-aloud cognitive interviews | Yes | Yes |
| **R6** | Consultant Audit | R3, R4 | $N = 50$ Packets | Blinded independent multi-consultant review | Yes | Yes |
| **R7** | Recommendation Eval | R6 | $N = 50$ Case Pairs | Blinded comparison of Model A vs Model B | Yes | Yes |
| **R8** | Reliability & Sensitivity| R3 | $N = 35$ Re-tests | Test-retest ICC and simulated perturbations | Yes | Yes |
| **R9** | Scalability Analysis | R6, R8 | $N \ge 150$ Corpus | Mokken scaling and Guttman ordering evaluation | Yes | Yes |
| **R10**| Exploratory ML Bench | R6 | Empirical Dataset | Benchmarking ML against consensus labels | No | No |
| **R11**| Manuscript Integration | R1–R10 | Complete Results | IEEE conference / thesis chapter drafting | No | No |

---

## 22. A11 Implementation Specification

To support the empirical research roadmap without polluting production business logic, the technical requirements for the upcoming implementation phase (A11) are categorized strictly by necessity:

### MUST IMPLEMENT (Core Research Infrastructure)
1. **Research Evaluation Module Data Models:**
   * Create schema migrations for `research_studies`, `research_participants`, `consultant_profiles`, `blinded_evaluation_packets`, and `consultant_evaluations` (as outlined in Section 18).
2. **Blinded Case Packet Generation Service:**
   * Backend endpoint and service to export an assessment record into a sanitized JSON/PDF case packet with all computed scores, levels, and recommendations redacted.
3. **Consultant Blind Evaluation Interface / API:**
   * Secure, authenticated endpoints allowing authorized consultants to fetch assigned blinded case packets and submit independent level ratings, primary gap tags, and recommendation scores.
4. **Reproducibility Manifest Generator:**
   * Script to snapshot the active git commit hash, instrument versions, database schema version, and configuration parameters into a timestamped JSON manifest.
5. **Research Dataset Sanitizer & Anonymized Exporter:**
   * Data export CLI/service applying $k$-anonymity suppression and generating research-ready CSV/Parquet snapshots.

### SHOULD IMPLEMENT (Secondary Study Tools)
1. **Test-Retest Linkage Tracker:**
   * Service tracking short-interval reassessments, validating stability criteria, and calculating baseline $ICC(3,1)$ and Kappa scores.
2. **Ablation Comparison Presentation Tool:**
   * Evaluation harness displaying paired Model A and Model B recommendation sets in randomized order for expert scoring.
3. **Cognitive Interview Coding Logger:**
   * Structured form to log Tourangeau cognitive interview error types across English and Hindi questions.

### DO NOT IMPLEMENT YET (Deferred Scope)
1. Autonomous ML re-training or live label injection pipelines.
2. Direct integration with live credit-bureau or tax-filing APIs.
3. Real-time dynamic question weight calibration inside the live production engine.

---

## 23. Open Academic Decisions

The following theoretical and methodological questions cannot be resolved purely by software design; they require formal academic pre-registration by the primary investigator and thesis advisory committee:

1. **Compensatory vs. Conjunctive Maturity Philosophy:**
   * Does the project adhere strictly to non-compensatory gating (where a failure in basic digital records permanently restricts a business to Level 1, regardless of advanced social media marketing), or should limited compensatory scoring be permitted in edge cases?
2. **Consultant Disagreement Tolerance:**
   * What constitutes the acceptable lower bound for inter-consultant agreement ($QWK$)? If human experts only achieve $QWK \approx 0.55$, does a system agreement of $0.55$ indicate adequate human parity or flawed instrument clarity?
3. **Empirical Definition of Budget Tiers:**
   * Whether monthly recurring expenditure capacity should remain the sole budget construct, or whether one-time capital investment capacity must be introduced as an independent orthogonal axis.

---

## 24. Final Recommendation & Decisions Requiring Researcher Approval

### Final Recommendation
The DigiMitra project possesses a logically cohesive, auditable deterministic architecture. The platform is now prepared to transition from software development to academic research validation. 

To maintain scientific integrity, the research team must firmly resist premature claims of "AI optimization" and focus on establishing the content validity, inter-rater reliability, and contextual utility of the core RBDL and Requirement Profile frameworks.

---

### Decisions Requiring Primary Researcher / Supervisor Approval

Before beginning data collection under Phase R3/R4, the primary researcher and thesis supervisor must formally approve and sign off on:
1. **Final Operational Definition of "Requirement-Based":** Approval to adopt the dual *Level-Entry Gating (Interpretation A)* and *Contextual Constraint Filtering (Interpretation B)* definition.
2. **Target Geographic Sampling Boundary:** Exact specification of the field survey locations (e.g., Jaipur industrial clusters, Sitapura, Mansarovar markets, or broader Rajasthan MSME zones).
3. **Fieldwork Sample Size Commitment:** Formal sign-off on the target sample tier ($N = 60$ minimum feasible vs. $N = 150$ preferred).
4. **Institutional Ethics Approval Pathway:** Formal submission of the Participant Information Sheet and Informed Consent Protocol to the JECRC University Research Ethics Committee.
5. **Consultant Panel Recruitment:** Identification and formal appointment of the $\ge 6$ independent MSME digitalization practitioners and academic experts.
6. **Pre-Registration of Primary Endpoints:** Formal recording of target thresholds ($QWK \ge 0.60$, $I\text{-CVI} \ge 0.78$, $ICC \ge 0.75$) prior to unblinding field data.
