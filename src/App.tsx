import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Admin pages (existing — do not modify)
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardLayout } from './pages/admin/DashboardLayout';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { ProjectsPage as AdminProjectsPage } from './pages/admin/ProjectsPage';
import { TransformationsPage } from './pages/admin/TransformationsPage';
import { ConsultationsPage } from './pages/admin/ConsultationsPage';
import { TestimonialsPage as AdminTestimonialsPage } from './pages/admin/TestimonialsPage';
import { JournalPage as AdminJournalPage } from './pages/admin/JournalPage';
import { ServicesPage as AdminServicesPage } from './pages/admin/ServicesPage';
import { HomepagePage } from './pages/admin/HomepagePage';
import { SubscribersPage } from './pages/admin/SubscribersPage';
import { MediaPage } from './pages/admin/MediaPage';
import { ProfilePage } from './pages/admin/ProfilePage';
import { QuoteRequestsPage } from './pages/admin/QuoteRequestsPage';

// Public website pages
import { PublicLayout } from './pages/public/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { PortfolioPage } from './pages/public/PortfolioPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { JournalPage } from './pages/public/JournalPage';

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
        <Route path="testimonials" element={<AdminTestimonialsPage />} />
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
