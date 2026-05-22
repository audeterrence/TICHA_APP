import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Trophy, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  ArrowRight,
  Plus,
  FileSearch,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Target,
  TrendingUp,
  MessageCircle,
  Brain,
  Zap,
  ChevronRight,
  Star,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { ProgressRing } from '../components/common/ProgressRing';
import { Button } from '../components/common/Button';

// Types
interface Subject {
  id: string;
  name: string;
  code: string;
  mastery: number;
  topicCount: number;
  stream: 'science' | 'arts';
  icon?: string;
  color?: string;
}

interface Task {
  id: string;
  title: string;
  subject: string;
  duration: string;
  completed: boolean;
  xpReward: number;
}

interface AITip {
  title: string;
  message: string;
  icon: JSX.Element;
}

export const Dashboard: React.FC = () => {
  const { user, updateStreak, addPoints } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [aiTip, setAiTip] = useState<AITip | null>(null);
  const [lastActiveDate, setLastActiveDate] = useState<string>('');

  const userId = user?.id;
  const userLevel = user?.level || 'GCE A-Level';
  const userStream = localStorage.getItem(`ticha_user_stream_${userId}`) || 'science';
  const hasFullAccess = user?.access === 'full';
  const isLimitedAccess = user?.access === 'limited';

  // Generate AI tip based on user's level, stream, and progress
  const generateAITip = (subjectsList: Subject[], currentPoints: number, currentStreak: number): AITip => {
    const weakestSubject = subjectsList.reduce((prev, curr) => 
      (curr.mastery < prev.mastery) ? curr : prev, subjectsList[0]);
    
    const averageMastery = subjectsList.length > 0 
      ? Math.round(subjectsList.reduce((acc, s) => acc + s.mastery, 0) / subjectsList.length)
      : 0;

    const tips: AITip[] = [
      {
        title: `${weakestSubject?.name || 'Your subjects'} needs attention`,
        message: `Based on your performance, I recommend spending 20 minutes on ${weakestSubject?.name || 'your weakest subject'} today. Want me to create a quick quiz?`,
        icon: <Brain className="w-5 h-5 text-tichaBlue" />
      },
      {
        title: `${currentStreak} day streak! 🔥`,
        message: `You're on fire! Keep studying daily to maintain your streak. Complete today's tasks to earn bonus XP.`,
        icon: <Flame className="w-5 h-5 text-orange-500" />
      },
      {
        title: `${userLevel} ${userStream === 'science' ? 'Science' : 'Arts'} strategy`,
        message: `For ${userLevel} ${userStream === 'science' ? 'Science' : 'Arts'} students, focus on past paper practice. I can generate questions from recent exams.`,
        icon: <Target className="w-5 h-5 text-emerald-500" />
      },
      {
        title: `${100 - averageMastery}% left to master`,
        message: `You've mastered ${averageMastery}% of your syllabus. Let's work on the remaining topics together!`,
        icon: <TrendingUp className="w-5 h-5 text-purple-500" />
      }
    ];
    
    // Return tip based on user's situation
    if (weakestSubject && weakestSubject.mastery < 30) return tips[0];
    if (currentStreak > 5) return tips[1];
    if (averageMastery < 50) return tips[3];
    return tips[2];
  };

  // Load user data from localStorage (per user)
  useEffect(() => {
    const loadUserData = () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Load subjects
      const subjectsKey = `ticha_user_subjects_${userId}`;
      const storedSubjects = localStorage.getItem(subjectsKey);
      
      if (storedSubjects) {
        const parsedSubjects = JSON.parse(storedSubjects);
        setSubjects(parsedSubjects);
      } else {
        // No subjects - redirect to onboarding
        navigate('/onboarding');
        return;
      }

      // Load streak
      const streakKey = `ticha_user_streak_${userId}`;
      const lastActiveKey = `ticha_last_active_${userId}`;
      const today = new Date().toDateString();
      const storedLastActive = localStorage.getItem(lastActiveKey);
      let currentStreak = parseInt(localStorage.getItem(streakKey) || '0');
      
      if (storedLastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (storedLastActive === yesterday.toDateString()) {
          currentStreak++;
        } else if (storedLastActive !== today) {
          currentStreak = 1;
        }
        
        localStorage.setItem(lastActiveKey, today);
        localStorage.setItem(streakKey, currentStreak.toString());
        if (updateStreak) updateStreak();
      }
      setStreak(currentStreak);
      setLastActiveDate(storedLastActive || '');

      // Load points
      const pointsKey = `ticha_user_points_${userId}`;
      const savedPoints = localStorage.getItem(pointsKey);
      if (savedPoints) {
        setPoints(parseInt(savedPoints));
      } else {
        const initialPoints = 100;
        localStorage.setItem(pointsKey, initialPoints.toString());
        setPoints(initialPoints);
      }

      // Load or generate tasks
      const tasksKey = `ticha_user_tasks_${userId}`;
      const storedTasks = localStorage.getItem(tasksKey);
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        // Generate intelligent tasks based on subjects
        const generatedTasks: Task[] = subjects.map((subject, index) => ({
          id: `task-${Date.now()}-${index}`,
          title: subject.mastery === 0 
            ? `Start learning ${subject.name} fundamentals`
            : subject.mastery < 50
              ? `Review ${subject.name} - ${subject.mastery}% mastered`
              : `Advanced practice: ${subject.name}`,
          subject: subject.name,
          duration: subject.mastery < 30 ? '25 min' : '15 min',
          completed: false,
          xpReward: subject.mastery < 30 ? 20 : 10
        }));
        setTasks(generatedTasks.slice(0, 4));
        localStorage.setItem(tasksKey, JSON.stringify(generatedTasks.slice(0, 4)));
      }

      // Generate AI tip
      const tip = generateAITip(subjects, points, currentStreak);
      setAiTip(tip);

      setLoading(false);
    };

    loadUserData();
  }, [userId, navigate, updateStreak]);

  // Toggle task completion
  const toggleTask = async (taskId: string, currentStatus: boolean, xpReward: number) => {
    if (currentStatus) return; // Can't uncomplete tasks
    
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    
    const tasksKey = `ticha_user_tasks_${userId}`;
    localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));
    
    // Add points
    const pointsKey = `ticha_user_points_${userId}`;
    const newPoints = points + xpReward;
    setPoints(newPoints);
    localStorage.setItem(pointsKey, newPoints.toString());
    if (addPoints) addPoints(xpReward);
    
    // Update subject mastery slightly (simulate progress)
    const updatedSubjects = subjects.map(subject => {
      if (updatedTasks.find(t => t.subject === subject.name && t.completed)) {
        const newMastery = Math.min(subject.mastery + 5, 100);
        return { ...subject, mastery: newMastery };
      }
      return subject;
    });
    setSubjects(updatedSubjects);
    const subjectsKey = `ticha_user_subjects_${userId}`;
    localStorage.setItem(subjectsKey, JSON.stringify(updatedSubjects));
  };

  // Generate new AI tip
  const refreshAITip = () => {
    if (subjects.length > 0) {
      const newTip = generateAITip(subjects, points, streak);
      setAiTip(newTip);
    }
  };

  // Redirect casual learners
  if (user?.mode === 'casual') {
    navigate('/casual');
    return null;
  }

  // Show coming soon for limited access
  if (isLimitedAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Coming Soon</h1>
          <p className="text-slate-500">
            Full support for <strong className="text-slate-700">{userLevel}</strong> is currently in development.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">What you can do now:</p>
                <p className="text-xs text-amber-700 mt-1">
                  • Explore sample content<br />
                  • Get notified when your level is ready<br />
                  • Try Casual Learning mode
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={() => navigate('/casual')} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              Try Casual Learning
            </Button>
            <Button onClick={() => navigate('/')} variant="primary">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasFullAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Access Restricted</h1>
          <p className="text-slate-500">Please contact support if you believe this is an error.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
      </div>
    );
  }

  const averageMastery = subjects.length > 0 
    ? Math.round(subjects.reduce((acc, s) => acc + s.mastery, 0) / subjects.length)
    : 0;
  
  const todayTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const completedTasks = tasks.filter(t => t.completed).length;
  const streamDisplay = userStream === 'science' ? 'Science' : 'Arts';

  return (
    <div className="space-y-6 font-sans pb-8">
      
      {/* Welcome Banner with AI Integration */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl border border-slate-700">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-tichaBlue/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="w-4 h-4 text-tichaBlue" />
              <span className="text-xs font-bold uppercase tracking-wider">AI-Powered Learning</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                {userLevel}
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                {streamDisplay} Stream
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}! 👋
            </h2>
            <p className="text-sm text-slate-400 max-w-lg">
              You're enrolled in {subjects.length} subjects for {userLevel} ({streamDisplay} stream).
              {averageMastery === 0 ? " Let's start your first lesson!" : ` You've mastered ${averageMastery}% of your syllabus.`}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-r from-tichaBlue to-tichaPurple text-white group"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>Chat with Ticha AI</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Smart Tip Card */}
      {aiTip && (
        <div className="bg-gradient-to-r from-tichaBlue/5 to-tichaPurple/5 rounded-2xl p-5 border border-tichaBlue/20 cursor-pointer hover:shadow-lg transition-all" onClick={refreshAITip}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                {aiTip.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  {aiTip.title}
                  <span className="text-xs font-normal text-slate-400 bg-white px-2 py-0.5 rounded-full">AI Tip</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">{aiTip.message}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              New tip
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Mastery Ring */}
        <Card className="flex items-center gap-6 p-6">
          <ProgressRing progress={averageMastery} size={110} strokeWidth={9}>
            <div className="text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">{averageMastery}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Mastery</p>
            </div>
          </ProgressRing>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Overall Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Across your {subjects.length} {userLevel} subjects
            </p>
            {averageMastery === 0 && (
              <button 
                onClick={() => navigate('/quiz')}
                className="text-xs text-tichaBlue font-semibold mt-2 flex items-center gap-1 hover:underline"
              >
                Start first quiz <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </Card>

        {/* XP Points Card */}
        <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total XP</span>
              <h3 className="text-2xl font-black text-slate-900">{points} XP</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 shadow-sm border border-yellow-100">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Complete tasks to earn more XP</span>
            <span className="text-tichaBlue font-semibold">+10 XP per task</span>
          </div>
        </Card>

        {/* Streak Card */}
        <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Streak</span>
              <h3 className="text-2xl font-black text-slate-900">{streak} {streak === 1 ? 'Day' : 'Days'}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Study daily to grow your streak!</span>
            <span className="text-orange-600 font-bold">🔥 {streak} Day{streak !== 1 ? 's' : ''}</span>
          </div>
        </Card>
      </div>

      {/* Subjects & Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Your Subjects Section */}
        <Card className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-tichaBlue" />
              <h3 className="font-extrabold text-slate-800 text-lg">Your Subjects</h3>
            </div>
            <Button 
              onClick={() => navigate('/mastery')}
              variant="ghost" 
              size="sm" 
              className="text-tichaBlue font-bold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                onClick={() => navigate(`/quiz?subject=${subject.id}`)}
                className="p-4 bg-slate-50/50 border border-slate-100 hover:border-slate-200 rounded-2xl flex flex-col justify-between gap-3.5 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{subject.icon || '📚'}</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                      {subject.code}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-tichaBlue group-hover:underline">
                    {subject.mastery}% Mastery
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1.5">{subject.name}</h4>
                  <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-tichaBlue to-tichaPurple h-full rounded-full transition-all duration-500" 
                      style={{ width: `${subject.mastery}%` }} 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 border-t border-slate-100/50 pt-2.5">
                  <span>{subject.topicCount} topics</span>
                  <span className="text-tichaPurple font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Start Quiz <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's AI Tasks */}
        <Card className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-tichaPurple" />
                <h3 className="font-extrabold text-slate-800 text-lg">Today's AI Tasks</h3>
              </div>
              <button 
                onClick={() => navigate('/plans')}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 border border-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-slate-700">All caught up! 🎉</p>
                <p className="text-xs text-slate-400">Great work today. Check back tomorrow for new AI-generated tasks.</p>
                <Button size="sm" onClick={() => navigate('/quiz')} className="mt-2">
                  Take a Practice Quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="p-3.5 border rounded-2xl flex items-start gap-3.5 transition-all bg-white border-slate-100 hover:border-slate-200/80"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed, task.xpReward)}
                      className="w-4.5 h-4.5 text-tichaPurple border-slate-300 rounded focus:ring-tichaPurple cursor-pointer mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold leading-tight text-slate-700">
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide uppercase text-slate-400">
                          <span className="text-tichaBlue">{task.subject}</span>
                          <span>•</span>
                          <span>{task.duration}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          +{task.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress summary */}
          {tasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Today's Progress</span>
                <span>{completedTasks} / {tasks.length} tasks</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-tichaBlue to-tichaPurple h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(completedTasks / tasks.length) * 100}%` }} 
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {tasks.length - completedTasks} task{tasks.length - completedTasks !== 1 ? 's' : ''} remaining • +{(tasks.length - completedTasks) * 10} XP available
              </p>
            </div>
          )}

          <Button 
            onClick={() => navigate('/plans')}
            variant="secondary" 
            className="w-full mt-2"
          >
            <span>View Full Study Plan</span>
            <Calendar className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>

      {/* Quick Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => navigate('/chat')}
          className="group p-4 bg-gradient-to-r from-tichaBlue/10 to-blue-500/10 rounded-2xl border border-tichaBlue/20 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tichaBlue/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-tichaBlue" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Ask Ticha AI</p>
              <p className="text-xs text-slate-500">Get instant help with any topic</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition" />
          </div>
        </button>

        <button 
          onClick={() => navigate('/quiz')}
          className="group p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Practice Quiz</p>
              <p className="text-xs text-slate-500">Test your knowledge</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition" />
          </div>
        </button>

        <button 
          onClick={() => navigate('/exam')}
          className="group p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Exam Papers</p>
              <p className="text-xs text-slate-500">Practice past questions</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      {/* Motivational Banner for new users */}
      {averageMastery === 0 && subjects.length > 0 && (
        <div className="bg-gradient-to-r from-tichaBlue/15 to-tichaPurple/15 rounded-2xl p-5 border border-tichaBlue/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                <Star className="w-6 h-6 text-tichaBlue" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Ready to start your journey?</h4>
                <p className="text-xs text-slate-500">Complete your first quiz to unlock personalized recommendations</p>
              </div>
            </div>
            <Button onClick={() => navigate('/quiz')} className="whitespace-nowrap">
              Start First Quiz
              <Award className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};