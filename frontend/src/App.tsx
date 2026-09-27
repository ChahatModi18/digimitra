import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";
import { BusinessRegistration } from "./pages/BusinessRegistration";
import { AssessmentFlow } from "./pages/AssessmentFlow";
import { RecommendationsView } from "./pages/RecommendationsView";
import { RoadmapView } from "./pages/RoadmapView";
import { HistoryView } from "./pages/HistoryView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 10,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* 1. Landing Page */}
                <Route path="/" element={<Dashboard />} />

                {/* 2. User Registration & Login */}
                <Route path="/auth" element={<AuthPage />} />

                {/* 3. Business Profile Setup & Management */}
                <Route path="/businesses" element={<BusinessRegistration />} />
                <Route path="/register" element={<Navigate to="/businesses" replace />} />

                {/* 4-7. Assessment Flow (Intro, Questionnaire, Result, Explanation) */}
                <Route path="/assessment" element={<AssessmentFlow />} />

                {/* 8. Personalized Recommendations */}
                <Route path="/recommendations" element={<RecommendationsView />} />

                {/* 9-10. Phased Roadmap Dashboard & Task Progress */}
                <Route path="/roadmap" element={<RoadmapView />} />

                {/* 11. Assessment & Roadmap Version History */}
                <Route path="/history" element={<HistoryView />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
