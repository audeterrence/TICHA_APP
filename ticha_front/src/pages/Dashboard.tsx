import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, Trophy, Calendar, BookOpen, ArrowRight,
  FileSearch, CheckCircle2, AlertCircle, Clock,
  Lock, Target, MessageCircle,
  ChevronRight, Loader2, GraduationCap, Beaker, Palette, Zap, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { supabase } from '../services/supabase';
import { Card } from '../components/common/Card';
import { ProgressRing } from '../components/common/ProgressRing';
import { Button } from '../components/common/Button';

interface Subject {
  id: string;
  name: string;
  code: string;
  mastery: number;
  topic_count: number;
  stream: 'science' | 'arts';
  user_id: string;
  created_at: string;
}

interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  average_mastery: number;
  updated_at: string;
}

const subjectColors: Record<string, { bg: string; bar: string; icon: string }> = {
  PMATH: { bg: 'bg-blue-50 border-blue-200', bar: 'from-blue-500 to-cyan-500', icon: 'text-blue-600' },
  PHY: { bg: 'bg-indigo-50 border-indigo-200', bar: 'from-indigo-500 to-blue-500', icon: 'text-indigo-600' },
  CHEM: { bg: 'bg-emerald-50 border-emerald-200', bar: 'from-emerald-500 to-teal-500', icon: 'text-emerald-600' },
  BIO: { bg: 'bg-green-50 border-green-200', bar: 'from-green-500 to-emerald-500', icon: 'text-green-600' },
  GEOL: { bg: 'bg-stone-50 border-stone-200', bar: 'from-stone-500 to-neutral-500', icon: 'text-stone-600' },
  FMATH: { bg: 'bg-violet-50 border-violet-200', bar: 'from-violet-500 to-purple-500', icon: 'text-violet-600' },
  CS: { bg: 'bg-slate-50 border-slate-200', bar: 'from-slate-500 to-gray-500', icon: 'text-slate-600' },
  FSCI: { bg: 'bg-orange-50 border-orange-200', bar: 'from-orange-500 to-red-500', icon: 'text-orange-600' },
  LIT: { bg: 'bg-amber-50 border-amber-200', bar: 'from-amber-500 to-orange-500', icon: 'text-amber-600' },
  HIST: { bg: 'bg-yellow-50 border-yellow-200', bar: 'from-yellow-600 to-amber-600', icon: 'text-yellow-600' },
  FR: { bg: 'bg-rose-50 border-rose-200', bar: 'from-rose-500 to-pink-500', icon: 'text-rose-600' },
  GEOG: { bg: 'bg-teal-50 border-teal-200', bar: 'from-teal-500 to-cyan-500', icon: 'text-teal-600' },
  ECO: { bg: 'bg-cyan-50 border-cyan-200', bar: 'from-cyan-500 to-blue-500', icon: 'text-cyan-600' },
  MATH: { bg: 'bg-sky-50 border-sky-200', bar: 'from-sky-500 to-blue-500', icon: 'text-sky-600' },
  PHIL: { bg: 'bg-fuchsia-50 border-fuchsia-200', bar: 'from-fuchsia-500 to-purple-500', icon: 'text-fuchsia-600' },
  ENG: { bg: 'bg-red-50 border-red-200', bar: 'from-red-500 to-rose-500', icon: 'text-red-600' },
  COM: { bg: 'bg-lime-50 border-lime-200', bar: 'from-lime-500 to-green-500', icon: 'text-lime-600' },
  RS: { bg: 'bg-purple-50 border-purple-200', bar: 'from-purple-500 to-violet-500', icon: 'text-purple-600' },
  AMATH: { bg: 'bg-sky-50 border-sky-200', bar: 'from-sky-500 to-indigo-500', icon: 'text-sky-600' },
  HBIO: { bg: 'bg-emerald-50 border-emerald-200', bar: 'from-emerald-500 to-green-500', icon: 'text-emerald-600' },
  FN: { bg: 'bg-pink-50 border-pink-200', bar: 'from-pink-500 to-rose-500', icon: 'text-pink-600' },
};

const defaultColor = { bg: 'bg-slate-50 border-slate-200', bar: 'from-slate-400 to-slate-500', icon: 'text-slate-500' };

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use shared study context for tasks (syncs with StudyPlans page)
  const { tasks, toggleTask, loading: tasksLoading } = useStudy();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;
  const userLevel = user?.level || 'GCE A-Level';
  const userStream = user?.stream || 'science';
  const userName = user?.name || 'Student';
  const hasFullAccess = user?.access === 'full';
  const isLimitedAccess = user?.access === 'limited';
  const isExamMode = user?.mode === 'exam';

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('user_subjects')
          .select('*, subjects!inner(name, code, stream, topic_count)')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (subjectsError) throw subjectsError;
        if (!subjectsData || subjectsData.length === 0) {
          if (!user?.onboarding_completed) { navigate('/onboarding'); return; }
        }

        const mappedSubjects = (subjectsData || []).map((item: any) => ({
          id: item.subject_id,
          name: item.subjects?.name || '',
          code: item.subjects?.code || '',
          mastery: item.mastery || 0,
          topic_count: item.subjects?.topic_count || 0,
          stream: item.subjects?.stream || 'science',
          user_id: item.user_id,
          created_at: item.created_at,
        }));
        setSubjects(mappedSubjects);

        // Fetch progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress').select('*').eq('user_id', userId).maybeSingle();
        if (progressError && progressError.code !== 'PGRST116') throw progressError;

        if (progressData) {
          setProgress(progressData);
        } else {
          const { data: newProgress, error: createError } = await supabase
            .from('user_progress').insert([{ 
              user_id: userId, total_xp: 0, current_streak: 0, longest_streak: 0, 
              last_active_date: new Date().toISOString().split('T')[0], average_mastery: 0 
            }]).select().single();
          if (createError) throw createError;
          setProgress(newProgress);
        }
      } catch (error) { 
        console.error('Error fetching user data:', error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchUserData();
  }, [userId, navigate, user?.onboarding_completed]);

  if (user?.mode === 'casual') { navigate('/casual'); return null; }

  if (isLimitedAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-amber-50 rounded-full flex items-center justify-center"><Clock className="w-12 h-12 text-amber-500" /></div>
          <h1 className="text-3xl font-black text-slate-900">Coming Soon</h1>
          <p className="text-slate-500">Full support for <strong>{userLevel}</strong> is in development.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  if (!hasFullAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center"><Lock className="w-12 h-12 text-red-500" /></div>
          <h1 className="text-3xl font-black text-slate-900">Access Restricted</h1>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-tichaBlue animate-spin" />
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const averageMastery = subjects.length > 0 ? Math.round(subjects.reduce((acc, s) => acc + s.mastery, 0) / subjects.length) : 0;
  const todayTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalXP = progress?.total_xp || 0;
  const currentStreak = progress?.current_streak || 0;
  const streamDisplay = userStream === 'science' ? 'Science' : 'Arts';
  const StreamIcon = userStream === 'science' ? Beaker : Palette;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-violet-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30%] h-full bg-gradient-to-r from-blue-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {isExamMode && (
                <span className="text-xs font-bold uppercase tracking-wider bg-white/10 text-white/70 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-white/5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {userLevel}
                </span>
              )}
              <span className="text-xs font-bold uppercase tracking-wider bg-white/10 text-white/70 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-white/5">
                <StreamIcon className="w-3.5 h-3.5" />
                {streamDisplay}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {greeting}, {userName} ! :)
            </h2>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              {subjects.length > 0 
                ? `${subjects.length} subject${subjects.length > 1 ? 's' : ''} enrolled` 
                : 'No subjects enrolled yet'}
              {averageMastery > 0 && <span className="text-violet-300 font-semibold"> · {averageMastery}% mastery</span>}
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/chat')}
            className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white group shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 rounded-lg ring-2 ring-violet-400/50 animate-ping" style={{ animationDuration: '3s' }} />
            <span className="relative z-10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold tracking-tight">Ask Ticha</span>
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="flex items-center gap-6 p-6 bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
          <ProgressRing progress={averageMastery} size={110} strokeWidth={9}>
            <div className="text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">{averageMastery}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Mastery</p>
            </div>
          </ProgressRing>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Overall Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Across {subjects.length} subject{subjects.length !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{averageMastery > 0 ? 'Keep going!' : 'Start learning'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-yellow-50/30 border-yellow-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/5 rounded-full blur-2xl" />
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total XP</span>
              <h3 className="text-2xl font-black text-slate-900">{totalXP.toLocaleString()}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-200">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 border-t border-yellow-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Earn XP by completing tasks</span>
            <span className="text-yellow-600 font-bold">+10/task</span>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-orange-50/30 border-orange-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/5 rounded-full blur-2xl" />
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Streak</span>
              <h3 className="text-2xl font-black text-slate-900">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-400/20 flex items-center justify-center text-orange-500 shadow-sm border border-orange-200">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-4 border-t border-orange-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Longest: {progress?.longest_streak || 0} days</span>
            <span className="text-orange-500 font-bold">{currentStreak}d</span>
          </div>
        </Card>
      </div>

      {/* Subjects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-800 text-lg">Your Subjects</h3>
            </div>
            <Button onClick={() => navigate('/mastery')} variant="ghost" size="sm" className="text-blue-600 font-bold">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">No subjects yet</p>
              <p className="text-xs text-slate-400">Complete onboarding to select your subjects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((subject) => {
                const colors = subjectColors[subject.code] || defaultColor;
                const isMastered = subject.mastery >= 85;
                return (
                <div
                  key={subject.id}
                  onClick={isMastered ? undefined : () => navigate(`/quiz?subject=${subject.id}`)}
                  className={`p-4 border rounded-2xl flex flex-col justify-between gap-3.5 transition-all group cursor-pointer hover:shadow-md ${colors.bg} ${isMastered ? 'opacity-60 cursor-default' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/60 ${colors.icon}`}>
                      {subject.code}
                    </span>
                    <span className={`text-xs font-bold ${isMastered ? 'text-emerald-600' : colors.icon}`}>
                      {subject.mastery}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight mb-1.5 text-slate-800">{subject.name}</h4>
                    <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${colors.bar}`}
                        style={{ width: `${subject.mastery}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium border-t border-white/40 pt-2.5">
                    <span className="text-slate-500">{subject.topic_count} topics</span>
                    <span className={`font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 ${isMastered ? 'text-emerald-600' : colors.icon}`}>
                      {isMastered ? 'Mastered' : 'Practice'} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Today - uses shared tasks from StudyContext */}
        <Card className="space-y-5 flex flex-col justify-between bg-gradient-to-b from-white to-violet-50/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600" />
                <h3 className="font-extrabold text-slate-800 text-lg">Today</h3>
              </div>
              {tasksLoading && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-medium text-slate-700">Nothing scheduled</p>
                <p className="text-xs text-slate-400">Create a study plan to get daily tasks.</p>
                <Button size="sm" onClick={() => navigate('/plans')} className="mt-2 bg-violet-600 hover:bg-violet-700 text-white">
                  Create Study Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.id} className="p-3.5 border border-slate-200 rounded-2xl flex items-start gap-3.5 transition-all bg-white hover:border-violet-200 hover:shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleTask(task.id, !!task.completed)}
                      disabled={tasksLoading}
                      className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer mt-0.5 disabled:opacity-50" 
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold leading-tight text-slate-700">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                          <span className="text-violet-600">{task.subject}</span>
                          <span>·</span>
                          <span>{task.duration}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{task.xp_reward || 10} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Progress</span>
                <span>{completedTasks} of {tasks.length} done</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          <Button onClick={() => navigate('/plans')} variant="secondary" className="w-full mt-2 border-violet-200 text-violet-700 hover:bg-violet-50">
            Study Plans <Calendar className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => navigate('/chat')}
          className="group p-5 bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-200 hover:border-violet-400 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-violet-600" /></div>
            <div><p className="font-bold text-slate-800 text-sm">Ask Ticha</p><p className="text-xs text-slate-500">Get help with any topic</p></div>
            <ArrowRight className="w-4 h-4 text-violet-400 ml-auto group-hover:translate-x-1 transition" />
          </div>
        </button>
        <button onClick={() => navigate('/quiz')}
          className="group p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Target className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="font-bold text-slate-800 text-sm">Practice Quiz</p><p className="text-xs text-slate-500">Test your knowledge</p></div>
            <ArrowRight className="w-4 h-4 text-emerald-400 ml-auto group-hover:translate-x-1 transition" />
          </div>
        </button>
        <button onClick={() => navigate('/exam')}
          className="group p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center"><FileSearch className="w-5 h-5 text-amber-600" /></div>
            <div><p className="font-bold text-slate-800 text-sm">Exam Papers</p><p className="text-xs text-slate-500">Practice past questions</p></div>
            <ArrowRight className="w-4 h-4 text-amber-400 ml-auto group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>
    </div>
  );
};