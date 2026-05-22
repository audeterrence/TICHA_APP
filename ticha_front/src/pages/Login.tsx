import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, ArrowRight, BrainCircuit, Atom, BookOpen, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

// Import your actual logo
import tichaLogo from '../assets/ticha-logo.jpg';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('GCE A-Level');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please fill in your email address.');
    if (!isLogin && !name.trim()) return setError('Please fill in your name.');

    setError('');
    setLoading(true);
    
    // MVP Dashboard Context
    localStorage.setItem('ticha_user_level', level);
    localStorage.setItem('ticha_user_name', name.trim() || 'Student');

    let success = false;
    if (isLogin) {
      success = await login(email, password || 'Student');
    } else {
      success = await signup(email, password, name, level);
    }

    setLoading(false);
    navigate('/dashboard'); // Direct MVP testing flow
  };

  return (
    <>
      {/* Custom Keyframes for Smooth Animations & the new Logo Aura */}
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
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float-reverse 8s ease-in-out infinite 1.5s; }
        .animate-float-slow { animation: float 10s ease-in-out infinite 3s; }
        .animate-aura { animation: gradient-shift 4s ease infinite; }
      `}</style>

      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
        
        {/* ========================================================= */}
        {/* LEFT SIDE - BRAND, VECTORS & ANIMATION */}
        {/* ========================================================= */}
        <div className="relative w-full lg:w-[45%] xl:w-[50%] bg-[#0B1121] overflow-hidden flex flex-col p-8 lg:p-16 min-h-[35vh] lg:min-h-screen border-r border-slate-800">
          
          {/* 1. Vector Grid Background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }}
          ></div>

          {/* 2. Soft Glowing Orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#2563EB]/30 rounded-full blur-[130px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#7C3AED]/30 rounded-full blur-[130px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
          
          {/* 3. Floating Vector Icons */}
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

          {/* Main Content Area */}
          <div className="relative z-10 flex flex-col h-full mt-4 lg:mt-8">
            
            {/* ========================================= */}
            {/* THE NEW "SPECIAL" LOGO LOCKUP             */}
            {/* ========================================= */}
            <div className="flex items-center space-x-6 mb-auto">
              
              <div className="relative group cursor-pointer">
                {/* The Animated Glowing Aura Behind the Logo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#10B981] rounded-[1.5rem] blur-xl opacity-60 group-hover:opacity-100 animate-aura transition-opacity duration-500"></div>
                
                {/* The Logo Box */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-white p-1 rounded-2xl shadow-2xl ring-1 ring-white/20 transform group-hover:-translate-y-1 transition-all duration-300">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img 
                      src={tichaLogo} 
                      alt="Ticha Logo" 
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Text Next to Logo */}
              <div className="flex flex-col">
                <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                  TICHA
                </span>
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-widest uppercase mt-1">
                  AI Tutor
                </span>
              </div>
            </div>

            {/* Slogan & Broad Copy (Desktop Only) */}
            <div className="hidden lg:block mb-24 mt-12">
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Learn smarter, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  score higher.
                </span>
              </h1>
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-md border-l-4 border-[#2563EB] pl-6 bg-slate-900/40 p-4 rounded-r-2xl backdrop-blur-sm shadow-xl">
                Your personal AI tutor for the Cameroonian curriculum. Master your subjects with interactive study plans, detailed past questions, and instant, step-by-step feedback.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE - THE FORM (No changes here)                   */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#F8FAFC] rounded-t-[2.5rem] lg:rounded-none -mt-8 lg:mt-0 relative z-20 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] lg:shadow-none">
          
          <div className="w-full max-w-md space-y-8">
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden text-center space-y-2 mb-8 mt-4">
              <h2 className="text-3xl font-extrabold text-slate-900">Welcome to Ticha</h2>
              <p className="text-slate-500 font-medium">Learn smarter, score higher.</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block space-y-2 mb-8">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 text-lg">
                {isLogin ? 'Enter your details to access your study center.' : 'Start your journey to academic excellence today.'}
              </p>
            </div>

            {/* Premium Pill Toggle */}
            <div className="flex p-1.5 bg-slate-200/70 rounded-2xl">
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-white text-slate-900 shadow-sm scale-100' 
                    : 'text-slate-500 hover:text-slate-700 scale-95 hover:bg-slate-200/50'
                }`}
              >
                New Student
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

            {error && (
              <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                    <input
                      type="text" required placeholder="John Doe"
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                  <input
                    type="email" required placeholder="student@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                  <input
                    type="password" required placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                  <label className="text-sm font-bold text-slate-700">Examination Level</label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                    <select
                      value={level} onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-12 pr-10 text-[15px] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all cursor-pointer appearance-none font-bold relative z-20"
                    >
                      <option value="GCE O-Level">GCE O-Level (Anglophone)</option>
                      <option value="GCE A-Level">GCE A-Level (Anglophone)</option>
                      <option value="BEPC" disabled className="text-slate-400">BEPC (In Development)</option>
                      <option value="Probatoire" disabled className="text-slate-400">Probatoire (In Development)</option>
                      <option value="BAC" disabled className="text-slate-400">BAC (In Development)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-30">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit" fullWidth loading={loading}
                  className="group relative overflow-hidden rounded-2xl py-4 font-bold text-[16px] bg-[#2563EB] hover:bg-[#1d4ed8] text-white border-0 shadow-xl shadow-[#2563EB]/30 transition-all hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center justify-center tracking-wide">
                    {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </Button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export const Signup = Login;