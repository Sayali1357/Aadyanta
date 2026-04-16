import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundGrid from "@/components/layout/BackgroundGrid";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import Topic from "./pages/Topic";
import Login from "./pages/Login";
import Interview from "./pages/Interview";
import GapAnalysis from "./pages/GapAnalysis";
import NotFound from "./pages/NotFound";
import LifeSimulation from "./pages/LifeSimulation";
import EscapeRoom from "./pages/EscapeRoom";
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";
import MetadataDashboard from "./pages/MetadataDashboard";
import LearningSessionTimer from "@/components/session/LearningSessionTimer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col relative">
            <BackgroundGrid />
            
            <Header />
            <main className="flex-1 relative z-10 w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login isSignup />} />
                <Route
                  path="/assessment"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roadmap/:id"
                  element={
                    <ProtectedRoute>
                      <Roadmap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/topic/:id"
                  element={
                    <ProtectedRoute>
                      <Topic />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <ProtectedRoute>
                      <Interview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gap-analysis"
                  element={
                    <ProtectedRoute>
                      <GapAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/life-simulation"
                  element={
                    <ProtectedRoute>
                      <LifeSimulation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/escape-room"
                  element={
                    <ProtectedRoute>
                      <EscapeRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:roadmapId/:moduleId"
                  element={
                    <ProtectedRoute>
                      <Quiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz-result/:quizId"
                  element={
                    <ProtectedRoute>
                      <QuizResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/metadata-dashboard"
                  element={
                    <ProtectedRoute>
                      <MetadataDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <LearningSessionTimer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
