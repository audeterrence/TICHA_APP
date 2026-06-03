import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, GraduationCap, ArrowRight, BrainCircuit, Atom,
  BookOpen, Calculator, Sparkles, Heart, Coffee, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import tichaLogo from '../assets/ticha-logo.jpg';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isCasualMode, setIsCasualMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('GCE A-Level');
  const [casualInterest, setCasualInterest] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [authInProgress, setAuthInProgress] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const {
    login,
    signup,
    user,
    loading: authLoading,
    profileLoaded
  } = useAuth();

  const navigate = useNavigate();
  const redirectHandled = useRef(false);

  // Wait for AuthContext to be fully loaded and profileLoaded true
  useEffect(() => {
    if (redirectHandled.current) return;
    if (authLoading) return;
    if (!profileLoaded) return; // wait for DB profile fetch

    if (!user) {
      // No user → show login form
      setPageReady(true);
      return;
    }

    console.log('[Login] Profile loaded – onboarding_completed:', user.onboarding_completed, 'stream:', user.stream);
    redirectHandled.current = true;

    if (!user.onboarding_completed) {
      console.log('[Login] Incomplete onboarding – redirecting');
      navigate('/onboarding', { replace: true });
      return;
    }

    // Valid session, redirect
    if (user.mode === 'casual') {
      navigate('/casual', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, profileLoaded, user, navigate]);

  const isLevelAvailable = (levelValue: string) => {
    return ['GCE O-Level', 'GCE A-Level'].includes(levelValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || authInProgress) return;
    setAuthInProgress(true);
    setError('');

    if (!email.trim()) { setError('Please fill in your email address.'); setAuthInProgress(false); return; }
    if (!password.trim()) { setError('Please fill in your password.'); setAuthInProgress(false); return; }
    if (!isLogin && !name.trim()) { setError('Please fill in your name.'); setAuthInProgress(false); return; }
    if (!isLogin && isCasualMode && !casualInterest.trim()) { setError('Please tell us what you want to learn.'); setAuthInProgress(false); return; }
    if (!isLogin && !isCasualMode && !isLevelAvailable(level)) {
      setError(`${level} is currently in development. Please select GCE O-Level or GCE A-Level, or try Casual Learner mode.`);
      setAuthInProgress(false);
      return;
    }

    setFormLoading(true);
    try {
      localStorage.setItem('ticha_user_level', isCasualMode ? 'casual' : level);
      localStorage.setItem('ticha_user_name', name.trim() || 'Student');
      localStorage.setItem('ticha_user_mode', isCasualMode ? 'casual' : 'exam');
      if (isCasualMode) localStorage.setItem('ticha_casual_interest', casualInterest);

      if (isLogin) {
        // Use the simplified login function
        const success = await login(email, password);
        if (success) {
          // Reset redirect flag so the useEffect above can handle navigation
          redirectHandled.current = false;
          // The useEffect will detect the new user state and redirect appropriately
        } else {
          setError('Login failed. Please check your email and password and try again.');
          setFormLoading(false);
          setAuthInProgress(false);
        }
      } else {
        const success = await signup(email, password, name, isCasualMode ? 'Casual Learner' : level, casualInterest);
        if (success) {
          if (isCasualMode) navigate('/casual', { replace: true });
          else navigate('/onboarding', { replace: true });
        } else {
          setError('Authentication failed. Please check your credentials and try again.');
          setFormLoading(false);
          setAuthInProgress(false);
        }
      }
    } catch (err: any) {
      console.error('[Login] Form submit error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setFormLoading(false);
      setAuthInProgress(false);
    }
  };

  const casualInterests = [
    { value: 'languages', label: 'Languages', icon: '🌍' },
    { value: 'coding', label: 'Coding & Tech', icon: '⚡' },
    { value: 'arts', label: 'Arts & Creativity', icon: '✨' },
    { value: 'business', label: 'Business Skills', icon: '📈' },
    { value: 'science', label: 'Science (Casual)', icon: '🧪' },
    { value: 'general', label: 'General Knowledge', icon: '🎯' },
  ];

  const examLevels = [
    { value: 'GCE O-Level', label: 'GCE O-Level (Anglophone)', status: 'available' },
    { value: 'GCE A-Level', label: 'GCE A-Level (Anglophone)', status: 'available' },
    { value: 'BEPC', label: 'BEPC (Francophone) - In Development', status: 'coming-soon' },
    { value: 'Probatoire', label: 'Probatoire (Francophone) - In Development', status: 'coming-soon' },
    { value: 'BAC', label: 'BAC (Francophone) - In Development', status: 'coming-soon' },
  ];

  if (!pageReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; background-size: 200% 200%; }
          50% { background-position: 100% 50%; background-size: 200% 200%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float-reverse 8s ease-in-out infinite 1.5s; }
        .animate-float-slow { animation: float 10s ease-in-out infinite 3s; }
        .animate-aura { animation: gradient-shift 4s ease infinite; }
      `}</style>

      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
        {/* LEFT SIDE - BRAND, VECTORS & ANIMATION */}
        <div className="relative w-full lg:w-[45%] xl:w-[50%] bg-[#0B1121] overflow-hidden flex flex-col p-8 lg:p-16 min-h-[35vh] lg:min-h-screen border-r border-slate-800">
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }}
          ></div>

          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#2563EB]/30 rounded-full blur-[130px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#7C3AED]/30 rounded-full blur-[130px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
          
          <div className="absolute top-[20%] right-[15%] text-[#2563EB]/20 animate-float pointer-events-none">
            <Atom className="w-32 h-32" />
          </div>
          <div className="absolute bottom-[25%] left-[10%] text-[#7C3AED]/20 animate-float-delayed pointer-events-none">
            <BookOpen className="w-24 h-24" />
          </div>
          <div className="absolute top-[45%] left-[20%] text-emerald-500/10 animate-float-slow pointer-events-none">
            <BrainCircuit className="w-40 h-40" />
          </div>
          <div className="absolute bottom-[10%] right-[25%] text-cyan-500/15 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
            <Calculator className="w-20 h-20" />
          </div>

          <div className="relative z-10 flex flex-col h-full mt-4 lg:mt-8">
            <div className="flex items-center space-x-6 mt-12 lg:mt-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                <img 
                  src={tichaLogo} 
                  alt="Ticha Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                  TICHA
                </span>
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-widest uppercase mt-1">
                  AI Tutor
                </span>
              </div>
            </div>

            <div className="hidden lg:block mb-24 mt-12">
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Learn smarter, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  score higher.
                </span>
              </h1>
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-md border-l-4 border-[#2563EB] pl-6 bg-slate-900/40 p-4 rounded-r-2xl backdrop-blur-sm shadow-xl">
                Your personal AI tutor for exam prep or casual learning. Master any subject at your own pace.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - THE FORM */}
        <div className="w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#F8FAFC] rounded-t-[2.5rem] lg:rounded-none -mt-8 lg:mt-0 relative z-20 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] lg:shadow-none">
          
          <div className="w-full max-w-md space-y-8">
            
            {/* Home Link */}
            <div className="flex justify-start">
              <button 
                onClick={() => navigate('/')} 
                className="group flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none"
              >
                <span className="text-base">←</span>
                <span>Home</span>
              </button>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden text-center space-y-2 mb-8 mt-2">
              <h2 className="text-3xl font-extrabold text-slate-900">Welcome to Ticha</h2>
              <p className="text-slate-500 font-medium">Learn smarter, score higher.</p>
              <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                <p className="text-amber-700 text-xs">More coming soon.</p>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block space-y-2 mb-8">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 text-lg">
                {isLogin ? 'Enter your details to access your study center.' : 'Start your learning journey today.'}
              </p>
            </div>

            {/* Auth Toggle */}
            <div className="flex p-1.5 bg-slate-200/70 rounded-2xl">
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setIsCasualMode(false); }}
                className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-white text-slate-900 shadow-sm scale-100' 
                    : 'text-slate-500 hover:text-slate-700 scale-95 hover:bg-slate-200/50'
                }`}
              >
                Join Us
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  isLogin 
                    ? 'bg-white text-slate-900 shadow-sm scale-100' 
                    : 'text-slate-500 hover:text-slate-700 scale-95 hover:bg-slate-200/50'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Learning Mode Toggle (only show on Sign Up) */}
            {!isLogin && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold text-slate-700 block text-center">How do you want to learn?</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCasualMode(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      !isCasualMode 
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Exam Prep
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCasualMode(true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isCasualMode 
                        ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    Casual Learner
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                      <input
                        id="name"
                        name="name"
                        autoComplete="name"
                        type="text" 
                        required 
                        placeholder={isCasualMode ? "Sarah Johnson" : "Alex Mbah"}
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Casual Learner Interest Selection */}
                  {isCasualMode && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                      <label htmlFor="casualInterest" className="text-sm font-bold text-slate-700">What interests you?</label>
                      <div className="relative group">
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#10B981] transition-colors z-10" />
                        <select
                          id="casualInterest"
                          name="casualInterest"
                          value={casualInterest} 
                          onChange={(e) => setCasualInterest(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-10 text-[15px] focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all cursor-pointer appearance-none font-medium relative z-20"
                          required={isCasualMode}
                        >
                          <option value="">Select your interest</option>
                          {casualInterests.map(interest => (
                            <option key={interest.value} value={interest.value}>{interest.icon} {interest.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-30">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 pl-4">No pressure, just curiosity.</p>
                    </div>
                  )}

                  {/* Exam Level Selection (only for exam prep mode) */}
                  {!isCasualMode && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                      <label htmlFor="level" className="text-sm font-bold text-slate-700">Examination Level</label>
                      <div className="relative group">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                        <select
                          id="level"
                          name="level"
                          value={level} 
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-10 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all cursor-pointer appearance-none font-medium relative z-20"
                          required={!isCasualMode}
                        >
                          {examLevels.map((exam) => (
                            <option 
                              key={exam.value} 
                              value={exam.value}
                              className={exam.status === 'coming-soon' ? 'text-slate-400' : ''}
                            >
                              {exam.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-30">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Warning message for coming soon levels */}
                      {!isLevelAvailable(level) && (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{level} is in development. You can still sign up and get early access when ready.</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                  <input
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email" 
                    required 
                    placeholder="hello@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                  <input
                    id="password"
                    name="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    type="password" 
                    required 
                    placeholder="••••••••"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit" 
                  fullWidth 
                  loading={formLoading}
                  className={`group relative overflow-hidden rounded-2xl py-4 font-bold text-[16px] text-white border-0 shadow-xl transition-all hover:-translate-y-0.5 ${
                    isCasualMode && !isLogin
                      ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[#10B981]/30'
                      : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] shadow-[#2563EB]/30'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center tracking-wide">
                    {isLogin 
                      ? 'Sign In to Dashboard' 
                      : isCasualMode 
                        ? 'Start Casual Learning'
                        : !isLevelAvailable(level)
                          ? 'Sign Up for Early Access'
                          : 'Create Account'}
                    <ArrowRight className="w-5 h-5 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </Button>
              </div>
            </form>

            {/* Info Banner for Sign In */}
            {isLogin && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#10B981]/10 to-[#34D399]/10 rounded-xl border border-[#10B981]/20">
                <div className="flex items-start gap-3">
                  <Coffee className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Not preparing for an exam?</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try our <button onClick={() => { setIsLogin(false); setIsCasualMode(true); }} className="text-[#10B981] font-semibold hover:underline">Casual Learner mode</button> – learn for fun, no pressure.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Coming Soon Notice for Exam Prep */}
            {!isLogin && !isCasualMode && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 text-center">
                  GCE O-Level and A-Level are fully ready. BEPC, BAC, Probatoire are in development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const Signup = Login;