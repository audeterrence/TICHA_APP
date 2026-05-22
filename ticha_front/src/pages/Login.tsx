import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // cosmetic for mock auth
  const [name, setName] = useState('');
  const [level, setLevel] = useState('BAC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please fill in your email address.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please fill in your name.');
      return;
    }

    setError('');
    setLoading(true);
    
    let success = false;
    if (isLogin) {
      success = await login(email, 'Student');
    } else {
      success = await signup(email, name, level);
    }

    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('An error occurred during authentication. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-tichaBlue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-tichaPurple/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tichaBlue to-tichaPurple flex items-center justify-center shadow-xl shadow-tichaBlue/20 animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">TICHA</h1>
          <p className="text-xs text-tichaBlue font-bold uppercase tracking-wider">
            Learn Smarter, Score Higher
          </p>
        </div>

        {/* Auth Box Container */}
        <Card variant="glass" className="border border-slate-800 bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          
          {/* Header Tab Toggler */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/60 mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isLogin 
                  ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                !isLogin 
                  ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-tichaBlue/30 focus:border-tichaBlue placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-tichaBlue/30 focus:border-tichaBlue placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-tichaBlue/30 focus:border-tichaBlue placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Cameroonian Exam</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-tichaBlue/30 focus:border-tichaBlue transition-all cursor-pointer"
                  >
                    <option value="BEPC">BEPC (O-Level Francophone)</option>
                    <option value="Probatoire">Probatoire</option>
                    <option value="BAC">BAC (A-Level Francophone)</option>
                    <option value="GCE O-Level">GCE O-Level (Anglophone)</option>
                    <option value="GCE A-Level">GCE A-Level (Anglophone)</option>
                  </select>
                </div>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="py-3.5 font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-tichaBlue to-tichaPurple text-white border-0 mt-2"
            >
              <span>{isLogin ? 'Sign In Now' : 'Create Account'}</span>
              <ArrowRight className="w-4.5 h-4.5 ml-2 shrink-0" />
            </Button>
          </form>

          {/* Prompt footer */}
          <div className="text-center mt-6">
            <span className="text-[11px] text-slate-500">
              By accessing TICHA, you agree to our terms & syllabus criteria.
            </span>
          </div>

        </Card>

      </div>
    </div>
  );
};
export const Signup = Login; // Alias as proposed
