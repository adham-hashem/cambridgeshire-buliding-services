import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect, lazy, Suspense } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Admin pages (lazy loaded)
const LoginPage = lazy(() => import('./pages/admin/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardLayout = lazy(() => import('./pages/admin/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const AdminProjectsPage = lazy(() => import('./pages/admin/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const TransformationsPage = lazy(() => import('./pages/admin/TransformationsPage').then(m => ({ default: m.TransformationsPage })));
const ConsultationsPage = lazy(() => import('./pages/admin/ConsultationsPage').then(m => ({ default: m.ConsultationsPage })));
const AdminJournalPage = lazy(() => import('./pages/admin/JournalPage').then(m => ({ default: m.JournalPage })));
const AdminServicesPage = lazy(() => import('./pages/admin/ServicesPage').then(m => ({ default: m.ServicesPage })));
const HomepagePage = lazy(() => import('./pages/admin/HomepagePage').then(m => ({ default: m.HomepagePage })));
const SubscribersPage = lazy(() => import('./pages/admin/SubscribersPage').then(m => ({ default: m.SubscribersPage })));
const MediaPage = lazy(() => import('./pages/admin/MediaPage').then(m => ({ default: m.MediaPage })));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage').then(m => ({ default: m.ProfilePage })));
const QuoteRequestsPage = lazy(() => import('./pages/admin/QuoteRequestsPage').then(m => ({ default: m.QuoteRequestsPage })));
const QuoteSettingsPage = lazy(() => import('./pages/admin/QuoteSettingsPage').then(m => ({ default: m.QuoteSettingsPage })));

// Public website pages
import { PublicLayout } from './pages/public/PublicLayout';
import { HomePage } from './pages/public/HomePage';
const ServicesPage = lazy(() => import('./pages/public/ServicesPage').then(m => ({ default: m.ServicesPage })));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const JournalPage = lazy(() => import('./pages/public/JournalPage').then(m => ({ default: m.JournalPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/public/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Website */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsOfServicePage />} />
      </Route>

      {/* Admin (unchanged) */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AnalyticsDashboard />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="transformations" element={<TransformationsPage />} />
        <Route path="consultations" element={<ConsultationsPage />} />
        <Route path="quotes" element={<QuoteRequestsPage />} />
        <Route path="quotes/settings" element={<QuoteSettingsPage />} />

        <Route path="journal" element={<AdminJournalPage />} />
        <Route path="homepage" element={<HomepagePage />} />
        <Route path="subscribers" element={<SubscribersPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
              <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin" />
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
