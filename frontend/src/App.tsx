import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ThreatsPage } from './pages/public/ThreatsPage';
import { EducationPage } from './pages/public/EducationPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';

// Authenticated Pages
import { UserDashboard } from './pages/authenticated/UserDashboard';
import { SecurityAssessment } from './pages/authenticated/SecurityAssessment';
import { AssessmentResults } from './pages/authenticated/AssessmentResults';
import { PasswordSecurity } from './pages/authenticated/PasswordSecurity';
import { UrlAnalyzer } from './pages/authenticated/UrlAnalyzer';
import { PrivacyCheck } from './pages/authenticated/PrivacyCheck';
import { MfaChecklist } from './pages/authenticated/MfaChecklist';
import { PhishingLab } from './pages/authenticated/PhishingLab';
import { SecurityTraining } from './pages/authenticated/SecurityTraining';
import { IncidentReporting } from './pages/authenticated/IncidentReporting';
import { SecurityHistory } from './pages/authenticated/SecurityHistory';
import { FeedbackPage } from './pages/authenticated/FeedbackPage';
import { SettingsPage } from './pages/authenticated/SettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserAnalytics } from './pages/admin/UserAnalytics';
import { RiskAnalytics } from './pages/admin/RiskAnalytics';
import { IncidentManagement } from './pages/admin/IncidentManagement';
import { FeedbackAnalytics } from './pages/admin/FeedbackAnalytics';
import { PhishingAnalytics } from './pages/admin/PhishingAnalytics';
import { ContentManagement } from './pages/admin/ContentManagement';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/threats" element={<ThreatsPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Authenticated User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/assessment" element={<SecurityAssessment />} />
          <Route path="/assessment/results/:id" element={<AssessmentResults />} />
          <Route path="/tools/password-security" element={<PasswordSecurity />} />
          <Route path="/tools/url-analyzer" element={<UrlAnalyzer />} />
          <Route path="/tools/privacy-check" element={<PrivacyCheck />} />
          <Route path="/tools/mfa-checklist" element={<MfaChecklist />} />
          <Route path="/awareness/phishing-lab" element={<PhishingLab />} />
          <Route path="/awareness/training" element={<SecurityTraining />} />
          <Route path="/incidents" element={<IncidentReporting />} />
          <Route path="/history" element={<SecurityHistory />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute requireAdminRole={true} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserAnalytics />} />
          <Route path="/admin/risk-analytics" element={<RiskAnalytics />} />
          <Route path="/admin/incidents" element={<IncidentManagement />} />
          <Route path="/admin/feedback" element={<FeedbackAnalytics />} />
          <Route path="/admin/phishing-analytics" element={<PhishingAnalytics />} />
          <Route path="/admin/content" element={<ContentManagement />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
