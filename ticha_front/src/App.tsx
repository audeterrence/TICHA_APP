import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Onboarding Route - NO Layout (full screen, no sidebar)
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Return without Layout wrapper
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Entry */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          
          {/* Public Home Page */}
          <Route path="/" element={<Home />} />
          
          {/* Onboarding - NO SIDEBAR */}
          <Route path="/onboarding" element={<OnboardingRoute><OnboardingWizard /></OnboardingRoute>} />
          
          {/* Protected Main App Views - WITH SIDEBAR */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mastery" element={<ProtectedRoute><SubjectMastery /></ProtectedRoute>} />
          <Route path="/exam" element={<ProtectedRoute><ExamPrep /></ProtectedRoute>} />
          <Route path="/casual" element={<ProtectedRoute><CasualLearner /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><StudyPlans /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          
          {/* Redirection Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;