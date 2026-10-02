import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Component, useEffect, type ReactNode } from 'react';
import { AppProvider } from './store/AppContext';
import { AppLayout, RequireAuth } from './components/app-shell';
import LandingPage from './pages/marketing/LandingPage';
import FeaturesPage from './pages/marketing/FeaturesPage';
import HowItWorksPage from './pages/marketing/HowItWorksPage';
import AboutPage from './pages/marketing/AboutPage';
import LoginPage from './pages/marketing/LoginPage';
import DashboardPage from './pages/app/DashboardPage';
import JobsPage from './pages/app/JobsPage';
import RecommendedPage from './pages/app/RecommendedPage';
import ApplicationsPage from './pages/app/ApplicationsPage';
import OutreachPage from './pages/app/OutreachPage';
import ResponsesPage from './pages/app/ResponsesPage';
import SavedJobsPage from './pages/app/SavedJobsPage';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';
import AutomationCenterPage from './pages/app/AutomationCenterPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-[420px] rounded-[20px] border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <p className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE2E2] text-[20px] font-bold text-[#DC2626]">!</p>
          <h1 className="mt-4 text-[20px] font-bold text-[#0F172A]">Something didn&apos;t load.</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">JobWizard hit an unexpected snag. Your saved data is safe.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-[9px] bg-[#4F46E5] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#3730A3]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="recommended" element={<RecommendedPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="outreach" element={<OutreachPage />} />
            <Route path="responses" element={<ResponsesPage />} />
            <Route path="saved" element={<SavedJobsPage />} />
            <Route path="automation" element={<AutomationCenterPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </AppProvider>
  );
}
