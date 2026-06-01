import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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

const AuthRedirectHandler: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (loading) return;
    if (!user) return;

    const publicPaths = ['/login', '/signup', '/'];
    if (!publicPaths.includes(location.pathname)) return;

    if (user.mode === 'casual') {
      navigate('/casual', { replace: true });
    } else if (user.onboarding_completed) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return null;
};

// Protected Route Guard - wraps with Layout
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading, session, user } = useAuth();
  console.log('[ProtectedRoute] Rendering, token:', token ? 'present' : 'MISSING', 'loading:', loading, 'session:', !!session, 'user:', user ? 'present' : 'null');

  // Show a spinner while auth state is still resolving
  if (loading || (session && !user)) {
    console.log('[ProtectedRoute] Loading or state resolving, showing spinner');
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  // Require both a valid session and a loaded user profile before rendering protected content
  if (session && user) {
    console.log('[ProtectedRoute] Session and user present, showing dashboard');
    return <Layout>{children}</Layout>;
  }

  // No session and not loading = not authenticated
  console.log('[ProtectedRoute] No session, redirecting to /login');
  return <Navigate to="/login" replace />;
};

// Onboarding Route - NO Layout (full screen, no sidebar)
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading, user } = useAuth();
  console.log('[OnboardingRoute] Rendering, session:', !!session, 'loading:', loading, 'user:', user ? 'present' : 'null');

  // Only show spinner while auth state is resolving
  if (loading || (session && !user)) {
    console.log('[OnboardingRoute] Loading or state resolving, showing spinner');
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  // If session and user exist, proceed
  if (session && user) {
    console.log('[OnboardingRoute] Session and user present, proceeding');
    return <>{children}</>;
  }

  // No session and not loading = not authenticated
  console.log('[OnboardingRoute] No session, redirecting to /login');
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthRedirectHandler />
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