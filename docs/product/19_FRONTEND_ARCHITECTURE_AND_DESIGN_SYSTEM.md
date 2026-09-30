# 19. Frontend Architecture & Design System

## 1. Frontend Technology Stack
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite 5 with Rollup tree-shaking production bundling.
- **State & Data Fetching**: TanStack React Query v5 for asynchronous server-state caching and invalidation.
- **Routing**: React Router DOM v6.
- **Icons**: Lucide React.
- **Design System**: Vanilla CSS tokens tailored for Indian enterprise aesthetics (Warm terracotta `#F0592A`, dark espresso `#241C15`, cream `#FFF9F5`, border `#EDE2D8`).

```mermaid
graph TD
    App[App.tsx / AppShell] --> AuthCtx[AuthContext Provider]
    AuthCtx --> QueryCtx[QueryClientProvider]
    QueryCtx --> Router[React Router Routes]
    Router --> Dash[Dashboard]
    Router --> Reg[BusinessRegistration]
    Router --> Assess[AssessmentFlow]
    Router --> Recs[RecommendationsView]
    Router --> Road[RoadmapView]
    Router --> Explore[ExploreView]
    Router --> Hist[HistoryView]
    Road --> Cards[TaskCard & ProgressRing]
    Road --> Flash[Learning Flashcard Modal]
    Road --> Govt[Government Schemes Section]
```

## 2. Component Hierarchy & Atomic Design
- Primitives: `Button`, `Badge`, `Card`, `StatCard`, `Tabs`, `Input`, `Select`, `Alert`, `LoadingState`, `EmptyState`.
- Domain Components: `LevelBadge`, `LevelCard`, `ProgressRing`, `DimensionCard`, `TaskCard`, `ResearchDisclosureBanner`.\n