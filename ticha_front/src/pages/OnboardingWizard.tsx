import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import {
  ArrowRight, ArrowLeft, BookOpen, Beaker, Palette, CheckCircle2,
  Sparkles, Star, GraduationCap, Brain, Zap, Rocket, AlertCircle,
  Calculator, Atom, Globe, Feather, Heart, Landmark, Languages,
  Microscope, Dna, Cpu, DollarSign, Users, Code, Briefcase,
  Music, Camera, Plane, Scale, Church, BarChart, HelpCircle
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  topics: number;
  description?: string;
  series?: string;
}

// Full GCE subject lists (Cameroon Anglophone system)
const subjectOptions: Record<string, any> = {
  'GCE O-Level': {
    science: [
      { id: 'eng-o', name: 'English Language', code: 'ENG', icon: 'BookOpen', color: 'from-rose-500 to-pink-500', topics: 18, description: 'Compulsory core' },
      { id: 'math-o', name: 'Mathematics', code: 'MATH', icon: 'Calculator', color: 'from-blue-500 to-cyan-500', topics: 24, description: 'Compulsory core' },
      { id: 'french-o', name: 'French', code: 'FR', icon: 'Languages', color: 'from-purple-500 to-pink-500', topics: 16, description: 'Compulsory core' },
      { id: 'physics-o', name: 'Physics (0580)', code: 'PHY', icon: 'Atom', color: 'from-indigo-500 to-blue-500', topics: 22, description: 'Principal science' },
      { id: 'chemistry-o', name: 'Chemistry (0515)', code: 'CHEM', icon: 'Microscope', color: 'from-emerald-500 to-teal-500', topics: 22, description: 'Principal science' },
      { id: 'biology-o', name: 'Biology (0510)', code: 'BIO', icon: 'Dna', color: 'from-green-500 to-emerald-500', topics: 24, description: 'Principal science' },
      { id: 'geology-o', name: 'Geology', code: 'GEOL', icon: 'Globe', color: 'from-stone-500 to-stone-600', topics: 18, description: 'Earth sciences' },
      { id: 'add-math-o', name: 'Additional Mathematics', code: 'AMATH', icon: 'Calculator', color: 'from-cyan-600 to-blue-600', topics: 20, description: 'Enabling subject' },
      { id: 'cs-o', name: 'Computer Science / ICT', code: 'CS', icon: 'Cpu', color: 'from-slate-500 to-gray-500', topics: 16, description: 'Programming' },
      { id: 'food-o', name: 'Food and Nutrition (0540)', code: 'FN', icon: 'Heart', color: 'from-orange-500 to-red-500', topics: 14, description: 'Applied science' },
      { id: 'human-bio-o', name: 'Human Biology', code: 'HBIO', icon: 'Brain', color: 'from-teal-600 to-green-600', topics: 18, description: 'Human anatomy' },
      { id: 'economics-o', name: 'Economics', code: 'ECO', icon: 'DollarSign', color: 'from-cyan-500 to-blue-500', topics: 16, description: 'Elective' }
    ],
    arts: [
      { id: 'eng-o', name: 'English Language', code: 'ENG', icon: 'BookOpen', color: 'from-rose-500 to-pink-500', topics: 18, description: 'Compulsory core' },
      { id: 'french-o', name: 'French Language', code: 'FR', icon: 'Languages', color: 'from-purple-500 to-pink-500', topics: 16, description: 'Compulsory core' },
      { id: 'math-o', name: 'Mathematics', code: 'MATH', icon: 'Calculator', color: 'from-blue-500 to-cyan-500', topics: 20, description: 'Compulsory core' },
      { id: 'lit-o', name: 'Literature in English', code: 'LIT', icon: 'Feather', color: 'from-amber-500 to-orange-500', topics: 22, description: 'Poetry, prose, drama' },
      { id: 'history-o', name: 'History', code: 'HIST', icon: 'Landmark', color: 'from-slate-500 to-gray-500', topics: 20, description: 'African, European, world' },
      { id: 'geography-o', name: 'Geography', code: 'GEOG', icon: 'Globe', color: 'from-teal-500 to-emerald-500', topics: 20, description: 'Physical, human, map work' },
      { id: 'economics-o', name: 'Economics', code: 'ECO', icon: 'DollarSign', color: 'from-cyan-500 to-blue-500', topics: 18, description: 'Micro, macro' },
      { id: 'commerce-o', name: 'Commerce', code: 'COM', icon: 'Briefcase', color: 'from-emerald-600 to-green-600', topics: 16, description: 'Business principles' },
      { id: 'rs-o', name: 'Religious Studies', code: 'RS', icon: 'Church', color: 'from-amber-700 to-yellow-700', topics: 14, description: 'Moral education' },
      { id: 'cs-o', name: 'Computer Science / ICT', code: 'CS', icon: 'Cpu', color: 'from-slate-500 to-gray-500', topics: 16, description: 'Digital skills' }
    ]
  },
  'GCE A-Level': {
    science: [
      { id: 'pure-math', name: 'Pure Mathematics (0775/0765)', code: 'PMATH', icon: 'Calculator', color: 'from-blue-500 to-cyan-500', topics: 32, description: 'S1 series', series: 'S1' },
      { id: 'physics-a', name: 'Physics (0780)', code: 'PHY', icon: 'Atom', color: 'from-indigo-500 to-blue-500', topics: 30, description: 'S1/S2', series: 'S1/S2' },
      { id: 'chemistry-a', name: 'Chemistry (0770)', code: 'CHEM', icon: 'Microscope', color: 'from-emerald-500 to-teal-500', topics: 28, description: 'S1/S2/S3', series: 'S1/S2/S3' },
      { id: 'biology-a', name: 'Biology (0710)', code: 'BIO', icon: 'Dna', color: 'from-green-500 to-emerald-500', topics: 32, description: 'S2/S3', series: 'S2/S3' },
      { id: 'geology-a', name: 'Geology (0755)', code: 'GEOL', icon: 'Globe', color: 'from-stone-500 to-stone-600', topics: 24, description: 'S4 series', series: 'S4' },
      { id: 'further-maths', name: 'Further Mathematics (0740)', code: 'FMATH', icon: 'Calculator', color: 'from-indigo-600 to-purple-600', topics: 28, description: 'Advanced math' },
      { id: 'cs-a', name: 'Computer Science (0795)', code: 'CS', icon: 'Cpu', color: 'from-slate-500 to-gray-500', topics: 24, description: 'Programming' },
      { id: 'food-science', name: 'Food Science', code: 'FSCI', icon: 'Heart', color: 'from-orange-500 to-red-500', topics: 18, description: 'Applied science' }
    ],
    arts: [
      { id: 'lit-a', name: 'Literature in English', code: 'LIT', icon: 'Feather', color: 'from-amber-500 to-orange-500', topics: 28, description: 'A1/A3', series: 'A1/A3' },
      { id: 'history-a', name: 'History', code: 'HIST', icon: 'Landmark', color: 'from-slate-500 to-gray-500', topics: 26, description: 'A1/A2', series: 'A1/A2' },
      { id: 'french-a', name: 'French', code: 'FR', icon: 'Languages', color: 'from-purple-500 to-pink-500', topics: 24, description: 'A1', series: 'A1' },
      { id: 'geography-a', name: 'Geography', code: 'GEOG', icon: 'Globe', color: 'from-teal-500 to-emerald-500', topics: 26, description: 'A2/A4', series: 'A2/A4' },
      { id: 'economics-a', name: 'Economics', code: 'ECO', icon: 'DollarSign', color: 'from-cyan-500 to-blue-500', topics: 26, description: 'A2/A3/A4', series: 'A2/A3/A4' },
      { id: 'math-a', name: 'Mathematics', code: 'MATH', icon: 'Calculator', color: 'from-blue-500 to-cyan-500', topics: 30, description: 'A4', series: 'A4' },
      { id: 'philosophy-a', name: 'Philosophy', code: 'PHIL', icon: 'Brain', color: 'from-indigo-400 to-purple-400', topics: 22, description: 'A5', series: 'A5' }
    ]
  }
};

const iconMap: Record<string, any> = {
  Calculator, BookOpen, Atom, Microscope, Dna, Feather, Landmark, Globe,
  DollarSign, Languages, Cpu, Users, Brain, Heart, Code, Briefcase,
  Music, Camera, Plane, Scale, Church, BarChart, HelpCircle
};

export const OnboardingWizard: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'stream' | 'subjects'>('welcome');
  const [stream, setStream] = useState<'science' | 'arts' | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [wizardReady, setWizardReady] = useState(false);
  const initDone = useRef(false);

  const userLevel = user?.level || 'GCE A-Level';
  const userId = user?.id;
  const currentSubjects: Subject[] = stream ? subjectOptions[userLevel]?.[stream] || [] : [];
  const minSubjects = userLevel === 'GCE A-Level' ? 3 : 5;

  useEffect(() => {
    if (user === null) return;
    if (initDone.current) return;
    initDone.current = true;

    console.log('[OnboardingWizard] Initialising with user:', user.id, '| mode:', user.mode, '| onboarding_completed:', user.onboarding_completed);

    if (user.mode === 'casual') {
      navigate('/casual', { replace: true });
      return;
    }

    if (user.onboarding_completed) {
      navigate('/dashboard', { replace: true });
      return;
    }

    console.log('[OnboardingWizard] Ready to show wizard');
    setWizardReady(true);
  }, [user, navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!initDone.current) {
        console.warn('[OnboardingWizard] Safety timeout: user never resolved, forcing wizard ready');
        initDone.current = true;
        setWizardReady(true);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  const handleStreamSelect = (selectedStream: 'science' | 'arts') => {
    setStream(selectedStream);
    setSelectedSubjects([]);
    setStep('subjects');
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
    setError('');
  };

  const handleFinish = async () => {
    if (!userId || !stream) return;
    if (selectedSubjects.length < minSubjects) {
      setError(`Please select at least ${minSubjects} subjects.`);
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Get the selected subjects' data (name, code) from the hardcoded list
      const selectedData = currentSubjects.filter(s => selectedSubjects.includes(s.id));
      
      // Look up the REAL UUIDs from the database by matching name, level AND stream
      const { data: dbSubjects, error: lookupError } = await supabase
        .from('subjects')
        .select('id, name, code, stream')
        .eq('level', userLevel)
        .eq('stream', stream);
      
      if (lookupError) {
        console.error('[Onboarding] Subject lookup failed:', lookupError);
        setError('Failed to load subjects. Please try again.');
        setSaving(false);
        return;
      }
      
      if (!dbSubjects || dbSubjects.length === 0) {
        console.error('[Onboarding] No subjects found in database for', userLevel, stream);
        setError('No subjects available for your level and stream. Please contact support.');
        setSaving(false);
        return;
      }
      
      // Match selected subjects with database subjects by name AND stream
      const selectedNames = selectedData.map(s => s.name);
      const matchingDbSubjects = dbSubjects.filter(s => 
        selectedNames.includes(s.name) && s.stream === stream
      );
      
      console.log('[Onboarding] Selected:', selectedNames);
      console.log('[Onboarding] Matched in DB:', matchingDbSubjects.length);
      
      if (matchingDbSubjects.length === 0) {
        console.error('[Onboarding] No matches between selected and DB subjects');
        setError('Could not match your subjects. Please try again.');
        setSaving(false);
        return;
      }
      
      // Update profile: set stream and mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ stream, onboarding_completed: true })
        .eq('id', userId);
      
      if (profileError) {
        console.error('[Onboarding] Profile update failed:', profileError);
        setError('Failed to update profile. Please try again.');
        setSaving(false);
        return;
      }
      
      // Save each subject to user_subjects using REAL database UUIDs
      for (const subject of matchingDbSubjects) {
        const { error: enrollError } = await supabase
          .from('user_subjects')
          .upsert(
            { user_id: userId, subject_id: subject.id, mastery: 0 },
            { onConflict: 'user_id,subject_id' }
          );
        
        if (enrollError) {
          console.error('[Onboarding] Failed to enroll in subject:', subject.name, enrollError);
        }
      }
      
      console.log('[Onboarding] All subjects saved successfully!');
      
      // Refresh user context
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      console.error('[OnboardingWizard] handleFinish error:', err);
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const renderSubjectCard = (subject: Subject) => {
    const IconComp = iconMap[subject.icon] || BookOpen;
    const isSelected = selectedSubjects.includes(subject.id);
    return (
      <button key={subject.id} onClick={() => handleSubjectToggle(subject.id)}
        className={`p-4 rounded-xl transition-all text-left ${isSelected ? 'bg-gradient-to-r from-tichaBlue/20 to-tichaPurple/20 border-2 border-tichaBlue' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
            <IconComp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-white/90'}`}>{subject.name}</h4>
            <p className="text-xs text-white/40">{subject.code}</p>
            {subject.description && <p className="text-xs text-white/30 mt-0.5">{subject.description}</p>}
            {subject.series && <p className="text-[10px] text-white/20 mt-0.5">Series: {subject.series}</p>}
          </div>
          {isSelected && <CheckCircle2 className="w-5 h-5 text-tichaBlue" />}
        </div>
      </button>
    );
  };

  // Show spinner until we have determined the user's state.
  if (!wizardReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  // Welcome step
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <button
          onClick={async () => {
            console.log('[OnboardingWizard] Back to Home – logging out');
            try {
              await logout();
            } catch (err) {
              console.error('[OnboardingWizard] Logout error during Back to Home:', err);
              try {
                await supabase.auth.signOut();
              } catch (_) { /* ignore */ }
            }
            window.location.href = '/';
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="max-w-2xl w-full text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-r from-tichaBlue to-tichaPurple rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Welcome to Ticha AI
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Let's personalise your learning journey</h1>
          <p className="text-white/60 mb-8">Tell us about your academic path so we can create a custom study plan.</p>
          <button
            onClick={() => setStep('stream')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tichaBlue to-tichaPurple rounded-xl font-bold text-white"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Stream selection
  if (step === 'stream') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-3xl font-black text-white mb-2">Choose your stream</h2>
          <p className="text-white/60 mb-8">{userLevel} • Select your academic path</p>
          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => handleStreamSelect('science')} className="p-8 bg-white/10 rounded-2xl border-2 border-white/20 hover:border-tichaBlue">
              <Beaker className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">Science</h3>
              <p className="text-white/60 text-sm">Physics, Chemistry, Biology, Mathematics, Computer Science, Geology...</p>
            </button>
            <button onClick={() => handleStreamSelect('arts')} className="p-8 bg-white/10 rounded-2xl border-2 border-white/20 hover:border-tichaPurple">
              <Palette className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">Arts</h3>
              <p className="text-white/60 text-sm">Literature, History, Geography, Economics, French, Philosophy...</p>
            </button>
          </div>
          <button onClick={() => setStep('welcome')} className="mt-6 text-white/40 hover:text-white/80 text-sm">← Back</button>
        </div>
      </div>
    );
  }

  // Subject selection
  if (step === 'subjects' && stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white">Select your subjects</h2>
            <p className="text-white/60 text-sm">{userLevel} • {stream === 'science' ? 'Science' : 'Arts'} Stream</p>
            <p className="text-white/40 text-xs mt-1">Choose at least {minSubjects} subjects</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm text-white/60 mb-1">
              <span>Selected: {selectedSubjects.length}</span>
              <span>Required: {minSubjects}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-tichaBlue to-tichaPurple h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min((selectedSubjects.length / minSubjects) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">{currentSubjects.map(renderSubjectCard)}</div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => setStep('stream')} className="px-5 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10">
              ← Back
            </button>
            <button
              onClick={handleFinish}
              disabled={selectedSubjects.length < minSubjects || saving}
              className={`px-6 py-2 rounded-xl font-bold text-white ${selectedSubjects.length >= minSubjects && !saving ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple hover:shadow-lg' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
            >
              {saving ? 'Saving...' : 'Complete Setup'} <Rocket className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};