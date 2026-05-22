import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Beaker, 
  Palette, 
  CheckCircle2, 
  Sparkles,
  Star,
  GraduationCap,
  Brain,
  TrendingUp,
  Award,
  ChevronRight,
  Zap,
  Library,
  Rocket,
  AlertCircle,
  Calculator,
  Atom,
  Globe,
  Feather,
  Heart,
  Landmark,
  Languages,
  Microscope,
  Dna,
  Cpu,
  DollarSign,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

// Cameroon GCE Curriculum Subjects
const subjectOptions = {
  'GCE O-Level': {
    science: [
      { id: 'math-o', name: 'Mathematics', code: 'MATH', icon: 'Calculator', color: 'from-blue-500 to-cyan-500', topics: 24 },
      { id: 'english-o', name: 'English Language', code: 'ENG', icon: 'BookOpen', color: 'from-rose-500 to-pink-500', topics: 15 },
      { id: 'physics-o', name: 'Physics', code: 'PHY', icon: 'Atom', color: 'from-indigo-500 to-blue-500', topics: 18 },
      { id: 'chemistry-o', name: 'Chemistry', code: 'CHEM', icon: 'Microscope', color: 'from-emerald-500 to-teal-500', topics: 20 },
      { id: 'biology-o', name: 'Biology', code: 'BIO', icon: 'Dna', color: 'from-green-500 to-emerald-500', topics: 22 },
      { id: 'additional-math', name: 'Additional Mathematics', code: 'ADD MATH', icon: 'Calculator', color: 'from-cyan-500 to-blue-500', topics: 20 },
      { id: 'food-nutrition', name: 'Food & Nutrition', code: 'FN', icon: 'Heart', color: 'from-orange-500 to-red-500', topics: 16 },
    ],
    arts: [
      { id: 'english-o', name: 'English Language', code: 'ENG', icon: 'BookOpen', color: 'from-rose-500 to-pink-500', topics: 15 },
      { id: 'lit-o', name: 'Literature in English', code: 'LIT', icon: 'Feather', color: 'from-amber-500 to-orange-500', topics: 20 },
      { id: 'history-o', name: 'History', code: 'HIST', icon: 'Landmark', color: 'from-slate-500 to-gray-500', topics: 18 },
      { id: 'geography-o', name: 'Geography', code: 'GEOG', icon: 'Globe', color: 'from-teal-500 to-emerald-500', topics: 19 },
      { id: 'economics-o', name: 'Economics', code: 'ECO', icon: 'DollarSign', color: 'from-cyan-500 to-blue-500', topics: 17 },
      { id: 'french-o', name: 'French', code: 'FR', icon: 'Languages', color: 'from-purple-500 to-violet-500', topics: 16 },
      { id: 'religious-studies', name: 'Religious Studies', code: 'RS', icon: 'BookOpen', color: 'from-yellow-500 to-amber-500', topics: 14 },
    ]
  },
  'GCE A-Level': {
    science: [
      { id: 'pure-math', name: 'Pure Mathematics', code: 'PMATH', icon: 'Calculator', color: 'from-blue-500 to-cyan-500', topics: 32 },
      { id: 'physics-a', name: 'Physics', code: 'PHY', icon: 'Atom', color: 'from-indigo-500 to-blue-500', topics: 28 },
      { id: 'chemistry-a', name: 'Chemistry', code: 'CHEM', icon: 'Microscope', color: 'from-emerald-500 to-teal-500', topics: 26 },
      { id: 'biology-a', name: 'Biology', code: 'BIO', icon: 'Dna', color: 'from-green-500 to-emerald-500', topics: 30 },
      { id: 'comp-sci', name: 'Computer Science', code: 'CS', icon: 'Cpu', color: 'from-slate-500 to-gray-500', topics: 24 },
      { id: 'further-math', name: 'Further Mathematics', code: 'FMATH', icon: 'Calculator', color: 'from-blue-600 to-cyan-600', topics: 28 },
    ],
    arts: [
      { id: 'lit-a', name: 'Literature in English', code: 'LIT', icon: 'Feather', color: 'from-amber-500 to-orange-500', topics: 28 },
      { id: 'history-a', name: 'History', code: 'HIST', icon: 'Landmark', color: 'from-slate-500 to-gray-500', topics: 26 },
      { id: 'geography-a', name: 'Geography', code: 'GEOG', icon: 'Globe', color: 'from-teal-500 to-emerald-500', topics: 24 },
      { id: 'economics-a', name: 'Economics', code: 'ECO', icon: 'DollarSign', color: 'from-cyan-500 to-blue-500', topics: 26 },
      { id: 'french-a', name: 'French', code: 'FR', icon: 'Languages', color: 'from-purple-500 to-violet-500', topics: 22 },
      { id: 'sociology', name: 'Sociology', code: 'SOC', icon: 'Users', color: 'from-violet-500 to-purple-500', topics: 22 },
      { id: 'philosophy', name: 'Philosophy', code: 'PHIL', icon: 'Brain', color: 'from-indigo-500 to-purple-500', topics: 20 },
    ]
  }
};

const iconMap: Record<string, any> = {
  Calculator: Calculator,
  BookOpen: BookOpen,
  Atom: Atom,
  Microscope: Microscope,
  Dna: Dna,
  Feather: Feather,
  Landmark: Landmark,
  Globe: Globe,
  DollarSign: DollarSign,
  Languages: Languages,
  Cpu: Cpu,
  Users: Users,
  Brain: Brain,
  Heart: Heart
};

export const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome');
  const [stream, setStream] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const userLevel = user?.level || 'GCE A-Level';
  const userId = user?.id;
  
  const currentSubjects = stream ? subjectOptions[userLevel]?.[stream] || [] : [];
  const minSubjects = userLevel === 'GCE A-Level' ? 3 : 6;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const completionKey = `ticha_onboarding_complete_${userId}`;
    const hasCompleted = localStorage.getItem(completionKey) === 'true';
    if (hasCompleted) {
      navigate('/dashboard');
    } else {
      setLoading(false);
    }
  }, [userId, navigate]);

  const handleStreamSelect = (selectedStream) => {
    setStream(selectedStream);
    setSelectedSubjects([]);
    setStep('subjects');
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
    setError('');
  };

  const handleFinish = () => {
    if (selectedSubjects.length < minSubjects) {
      setError(`Please select at least ${minSubjects} subjects to continue`);
      return;
    }

    const fullSubjects = currentSubjects.filter(s => selectedSubjects.includes(s.id));
    const subjectsWithProgress = fullSubjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      mastery: 0,
      topicCount: subject.topics,
      stream: stream,
      icon: subject.icon,
      color: subject.color
    }));

    localStorage.setItem(`ticha_user_subjects_${userId}`, JSON.stringify(subjectsWithProgress));
    localStorage.setItem(`ticha_user_stream_${userId}`, stream);
    localStorage.setItem(`ticha_onboarding_complete_${userId}`, 'true');
    
    navigate('/dashboard');
  };

  const renderSubjectCard = (subject) => {
    const IconComponent = iconMap[subject.icon] || BookOpen;
    const isSelected = selectedSubjects.includes(subject.id);
    
    return (
      <button
        key={subject.id}
        onClick={() => handleSubjectToggle(subject.id)}
        className={`p-4 rounded-xl transition-all text-left ${
          isSelected 
            ? 'bg-gradient-to-r from-tichaBlue/20 to-tichaPurple/20 border-2 border-tichaBlue'
            : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-white/90'}`}>
              {subject.name}
            </h4>
            <p className="text-xs text-white/40">{subject.code}</p>
          </div>
          {isSelected && <CheckCircle2 className="w-5 h-5 text-tichaBlue" />}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  // Welcome Step
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-r from-tichaBlue to-tichaPurple rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm mb-4">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Welcome to Ticha AI
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              Let's personalise your learning journey
            </h1>
            
            <p className="text-white/60 mb-8">
              Tell us about your academic path so we can create a custom study plan for your success.
            </p>
            
            <button
              onClick={() => setStep('stream')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tichaBlue to-tichaPurple rounded-xl font-bold text-white"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stream Selection Step
  if (step === 'stream') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-tichaBlue/20 rounded-full text-tichaBlue text-sm mb-4">
              <Zap className="w-4 h-4" />
              Step 1 of 2
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Choose your stream</h2>
            <p className="text-white/60">{userLevel} • Select your academic path</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleStreamSelect('science')}
              className="group p-8 bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-white/20 hover:border-tichaBlue transition-all text-left"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Beaker className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Science</h3>
              <p className="text-white/60 text-sm">Mathematics, Physics, Chemistry, Biology, Computer Science</p>
            </button>

            <button
              onClick={() => handleStreamSelect('arts')}
              className="group p-8 bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-white/20 hover:border-tichaPurple transition-all text-left"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Arts</h3>
              <p className="text-white/60 text-sm">Literature, History, Geography, Economics, French</p>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => setStep('welcome')} className="text-white/40 hover:text-white/80 text-sm">
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Subject Selection Step
  if (step === 'subjects' && stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-sm mb-3">
              <Star className="w-4 h-4" />
              Step 2 of 2
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">Select your subjects</h2>
            <p className="text-white/60 text-sm">
              {userLevel} • {stream === 'science' ? 'Science' : 'Arts'} Stream
            </p>
            <p className="text-white/40 text-xs mt-1">
              Choose at least {minSubjects} subjects
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm text-white/60 mb-1">
              <span>Selected: {selectedSubjects.length}</span>
              <span>Required: {minSubjects}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-tichaBlue to-tichaPurple h-1.5 rounded-full transition-all"
                style={{ width: `${(selectedSubjects.length / minSubjects) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {currentSubjects.map(renderSubjectCard)}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => setStep('stream')}
              className="px-5 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10"
            >
              ← Back
            </button>
            <button
              onClick={handleFinish}
              disabled={selectedSubjects.length < minSubjects}
              className={`px-6 py-2 rounded-xl font-bold text-white transition-all ${
                selectedSubjects.length >= minSubjects
                  ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple hover:shadow-lg'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              Complete Setup
              <Rocket className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};