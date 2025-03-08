
import { lazy, Suspense, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Toaster } from "./components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SocketProvider } from './contexts/SocketContext';

// Import core components directly (used on initial load)
import Landing from "./pages/Landing"
import NotFound from "./pages/NotFound"

// Lazy load all other pages for better performance
const Index = lazy(() => import("./pages/Index"))
const Intake = lazy(() => import("./pages/Intake"))
const Settings = lazy(() => import("./pages/Settings"))
const Completion = lazy(() => import("./pages/Completion"))
const SimulateCoS = lazy(() => import("./pages/SimulateCoS"))
const SubmitIdea = lazy(() => import("./pages/SubmitIdea"))
const FeeTracking = lazy(() => import("./pages/FeeTracking"))
const CustomizeCoS = lazy(() => import("./pages/CustomizeCoS"))
const FinalizeCoS = lazy(() => import("./pages/FinalizeCoS"))
const OnboardingDocuments = lazy(() => import("./pages/OnboardingDocuments"))
const AdminIndex = lazy(() => import("./pages/admin/Index"))
const AdminWaiverDashboard = lazy(() => import("./pages/admin/waiver/WaiverDashboard"))
const MeetingsPage = lazy(() => import("./pages/Meetings"))
const TrainingPage = lazy(() => import("./pages/TrainingPage"))
const PerformancePage = lazy(() => import("./pages/PerformancePage"))
const CommunityPage = lazy(() => import("./pages/CommunityPage"))
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"))
const CosAgentPage = lazy(() => import("./pages/CosAgentPage"))
const SupportPage = lazy(() => import("./pages/SupportPage"))

import "./App.css"

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

// Redirect component to handle /index -> / redirection
const IndexRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  return null;
};

function App() {
  useEffect(() => {
    // Handle theme
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/index" element={<IndexRedirect />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/intake" element={<Intake />} />
                  <Route path="/onboarding-documents" element={<OnboardingDocuments />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/completion" element={<Completion />} />
                  <Route path="/submit-idea" element={<SubmitIdea />} />
                  <Route path="/simulate" element={<SimulateCoS />} />
                  <Route path="/fees" element={<FeeTracking />} />
                  <Route path="/customize" element={<CustomizeCoS />} />
                  <Route path="/customize-cos" element={<CustomizeCoS />} />
                  <Route path="/finalize-cos" element={<FinalizeCoS />} />
                  <Route path="/admin" element={<AdminIndex />} />
                  <Route path="/admin/waivers" element={<AdminWaiverDashboard />} />
                  <Route path="/meetings" element={<MeetingsPage />} />
                  
                  {/* New separate pages */}
                  <Route path="/training" element={<TrainingPage />} />
                  <Route path="/performance" element={<PerformancePage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/cos-agent" element={<CosAgentPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
