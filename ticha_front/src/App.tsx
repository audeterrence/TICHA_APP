import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { Layout } from './components/common/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { SubjectMastery } from './pages/SubjectMastery';
import { ExamPrep } from './pages/ExamPrep';
import { CasualLearner } from './pages/CasualLearner';
import { Chat } from './pages/Chat';
import { StudyPlans } from './pages/StudyPlans';
import { Quiz } from './pages/Quiz';
import { Settings } from './pages/Settings';
import { Leaderboard } from './pages/Leaderboard';

// Protected Route Guard - wraps with Layout
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading, session, user } = useAuth();
  
  if (loading || (session && !user)) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (session && user) {
    return <Layout>{children}</Layout>;
  }

  return <Navigate to="/login" replace />;
};

// Onboarding Route - NO Layout (full screen, no sidebar)
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading, user } = useAuth();

  if (loading || (session && !user)) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  if (session && user) {
    return <>{children}</>;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<OnboardingRoute><OnboardingWizard /></OnboardingRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mastery" element={<ProtectedRoute><SubjectMastery /></ProtectedRoute>} />
            <Route path="/exam" element={<ProtectedRoute><ExamPrep /></ProtectedRoute>} />
            <Route path="/casual" element={<ProtectedRoute><CasualLearner /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><StudyPlans /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StudyProvider>
    </AuthProvider>
  );
}

export default App;