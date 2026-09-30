# 08. Recommendation Engine (C4 Specification)

## 1. Eligibility & Prerequisite DAG
The C4 recommendation engine evaluates recommendations as a Directed Acyclic Graph (DAG). An advanced action cannot be recommended until its foundational dependencies are satisfied.

```mermaid
graph TD
    R_PHONE[REC-INFRA-01: Dedicated Phone] --> R_UPI[REC-PAY-01: QR Soundbox]
    R_PHONE --> R_WA[REC-COMM-01: WhatsApp Business]
    R_UPI --> R_POS[REC-REC-01: Computerized POS]
    R_POS --> R_BARCODE[REC-INV-01: Barcode Inventory]
    R_BARCODE --> R_DASH[REC-DATA-02: Analytics Dashboard]
    R_BARCODE --> R_ONDC[REC-GROW-03: ONDC Integration]
```

## 2. Priority Scoring Formula
Eligible recommendations are ranked according to the formula:
$$\text{Priority} = w_g \cdot \text{GoalAlignment} + w_p \cdot \text{PainPointImpact} + w_u \cdot \text{UrgencyMultiplier} - w_c \cdot \text{CostEffort}$$
Feasible-now items always precede budget-deferred actions.\n