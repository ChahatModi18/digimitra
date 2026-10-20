# Project Implementation Guide — DigiMitra (डिजीमित्र)

> **Document Version:** 1.0.0  
> **Repository:** `ChahatModi18/digimitra`  
> **Scope:** Pagewise Codebase Technical Report, Domain Engine Implementation, Service Interactions  

---

## 1. Frontend Implementation & Pagewise Walkthrough

The frontend is a single-page application built in React 18 and TypeScript with modular pages located in `frontend/src/pages/`:

```
frontend/src/
├── pages/
│   ├── Dashboard.tsx                # Master enterprise overview & quick analytics
│   ├── BusinessRegistration.tsx     # Enterprise onboarding form with Sector/Turnover picks
│   ├── AssessmentFlow.tsx           # Multi-step 9-dimension diagnostic questionnaire
│   ├── RoadmapView.tsx              # Interactive 3-phase milestone action tracker
│   ├── MSMEInitiatives.tsx          # Central & State scheme directory with filtering
│   ├── A11ResearchInstrument.tsx    # Academic validation & psychometric evaluation bench
│   ├── HistoryView.tsx              # Historical assessment comparisons & timeline
│   └── ContactView.tsx              # Support & expert digital consultant contact
├── components/
│   ├── layout/                      # AppShell, Topbar, Sidebar
│   ├── domain/                      # DimensionCard, FeatureGuideModal, TaskCard, Flashcards
│   └── common/                      # StatusBadge, Button, ErrorBoundary, LanguageSelector
└── api/                             # Typed Axios service endpoints
```

### 1.1 `Dashboard.tsx`
- **Data Hook:** Uses `useQuery(['business', businessId])` to pull current profile and latest assessment.
- **Visuals:** Renders the assigned RBDL level badge, average digitalization score gauge, and top immediate 30-day priorities.

### 1.2 `AssessmentFlow.tsx`
- **Step Controller:** Steps through the 9 dimensions sequentially:
  1. *Finance & Accounting*
  2. *Operations & Inventory*
  3. *Sales & Marketing*
  4. *Customer Experience & CRM*
  5. *Supply Chain & Vendor Management*
  6. *Human Resources & Digital Skills*
  7. *Cybersecurity & Compliance*
  8. *Online Presence & E-Commerce*
  9. *Strategic Digital Mindset*
- **Draft Persistence:** Stores incomplete responses in browser `localStorage` to safeguard against accidental reloads.

### 1.3 `RoadmapView.tsx`
- **Task Toggling:** Implements optimistic UI updates via TanStack Query `onMutate` when a milestone task checkbox is toggled.
- **Resource Integration:** Each task provides external links to vetted open-source or Indian SaaS tools (e.g., Vyapar, Tally Prime, Khatabook, Zoho, ONDC Seller apps).

---

## 2. Backend Implementation & Domain Services

### 2.1 Scoring Engine (`backend/app/domain/scoring_engine.py`)
- Calculates dimension-wise scores:
  $$\text{Dimension Score} = \left( \frac{\sum \text{Earned Question Points}}{\sum \text{Max Possible Question Points}} \right) \times 100$$
- Normalizes weights across all answered questions to ensure fair scoring even if optional sub-questions are skipped.

### 2.2 Classification Strategy Pattern (`backend/app/domain/classification/`)
- `classifier_strategy.py`: Declares abstract interface:
  ```python
  class ClassifierStrategy(ABC):
      @abstractmethod
      async def classify(self, dimension_scores: dict, business_profile: dict) -> ClassificationResult:
          pass
  ```
- `rule_based_strategy.py`: Evaluates declarative rule predicates stored in `data/rules/` using AST safe evaluation.
- `ml_strategy.py`: Uses pre-trained Random Forest model for research validation.

### 2.3 Recommendation Fusion Service (`backend/app/services/recommendation_fusion_service.py`)
- Blends three distinct recommendation streams:
  1. **Dimension Deficit Actions:** Automatically triggers targeted remediation for dimensions scoring below 50%.
  2. **Sector-Specific Best Practices:** Specialized actions for Retail vs Manufacturing vs Hospitality.
  3. **Government Scheme Subsidies:** Surfaces schemes that alleviate financial constraints for prioritized tools.
