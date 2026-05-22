import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Trophy, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  ArrowRight,
  Plus,
  Compass,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMastery } from '../hooks/useMastery';
import { useStudyPlans } from '../hooks/useStudyPlans';
import { Card } from '../components/common/Card';
import { ProgressRing } from '../components/common/ProgressRing';
import { Button } from '../components/common/Button';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { subjects, loading: subjectsLoading } = useMastery();
  const { tasks, toggleTask, loading: tasksLoading } = useStudyPlans();
  const navigate = useNavigate();

  // Compute aggregate mastery
  const averageMastery = subjects.length > 0 
    ? Math.round(subjects.reduce((acc, curr) => acc + curr.mastery, 0) / subjects.length)
    : 72;

  // Filter tasks for today
  const todayTasks = tasks.slice(0, 3);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ticha-dark via-ticha-dark-light to-ticha-dark p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-slate-950/15 border border-slate-800">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-tichaBlue/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-tichaBlue">
              <Sparkles className="w-4 h-4 text-tichaBlue" />
              <span className="text-xs font-bold uppercase tracking-wider">Smart Study Mode</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Bonjour, {user?.name || 'Student'}!</h2>
            <p className="text-sm text-slate-400 max-w-lg">
              Welcome back to your prep center. Your target syllabus is set to **{user?.level || 'BAC'}**. Let\'s hit your goals today and score higher!
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4.5 shrink-0">
            <Button 
              onClick={() => navigate('/exam')}
              variant="outline" 
              className="border-slate-700 text-slate-200 hover:bg-slate-800/80 hover:text-white"
            >
              <FileSearch className="w-4 h-4 mr-2" />
              <span>Analyze Exam Paper</span>
            </Button>
            <Button onClick={() => navigate('/chat')}>
              <span>Chat with Ticha AI</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: Mastery Ring, Today's Goal, Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Aggregate Mastery Ring */}
        <Card variant="glass" className="flex items-center gap-6 p-6">
          <ProgressRing progress={averageMastery} size={110} strokeWidth={9}>
            <div className="text-center">
              <span className="text-2xl font-black text-slate-850 leading-none">{averageMastery}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Mastery</p>
            </div>
          </ProgressRing>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Overall Syllabus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculated across all registered curriculum subjects for {user?.level}.
            </p>
          </div>
        </Card>

        {/* Dynamic XP Tracker Card */}
        <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Score</span>
              <h3 className="text-2xl font-black text-slate-850">{user?.points || 1450} XP</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 shadow-sm border border-yellow-100">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Current Rank: <strong className="text-slate-700">#4</strong></span>
            <span className="text-tichaBlue font-semibold hover:underline cursor-pointer" onClick={() => navigate('/leaderboard')}>View Leaderboard â†’</span>
          </div>
        </Card>

        {/* Daily Streak Card */}
        <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Study Streak</span>
              <h3 className="text-2xl font-black text-slate-850">{user?.streak || 12} Days</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100 animate-pulse">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Keep studying to grow your fire!</span>
            <span className="text-orange-600 font-bold">ðŸ”¥ 12 Days Hot</span>
          </div>
        </Card>

      </div>

      {/* Grid: Subjects Mastery & Today's Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subjects Mastery Overview */}
        <Card className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-tichaBlue" />
              <h3 className="font-extrabold text-slate-800 text-lg">Curriculum Subjects</h3>
            </div>
            <Button 
              onClick={() => navigate('/mastery')}
              variant="ghost" 
              size="sm" 
              className="text-tichaBlue font-bold"
            >
              <span>Manage Subjects</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {subjectsLoading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-tichaBlue border-t-transparent rounded-full" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => navigate('/mastery')}
                  className="p-4 bg-slate-50/50 border border-slate-100 hover:border-slate-200 rounded-2xl flex flex-col justify-between gap-3.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                      {sub.code}
                    </span>
                    <span className="text-xs font-bold text-tichaBlue group-hover:underline">
                      {sub.mastery}% Mastery
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1.5">{sub.name}</h4>
                    <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-tichaBlue to-tichaPurple h-full rounded-full transition-all duration-500" 
                        style={{ width: `${sub.mastery}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 border-t border-slate-100/50 pt-2.5">
                    <span>{sub.topicCount} Core Topics</span>
                    <span className="text-tichaPurple font-bold">Review Topics â†’</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Checklist Tracker */}
        <Card className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-tichaPurple" />
                <h3 className="font-extrabold text-slate-800 text-lg">Today\'s Tasks</h3>
              </div>
              <button 
                onClick={() => navigate('/plans')}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 border border-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {tasksLoading ? (
              <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-tichaPurple border-t-transparent rounded-full" /></div>
            ) : todayTasks.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">All tasks completed! Generate a new study plan to stay sharp.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-3.5 border rounded-2xl flex items-start gap-3.5 transition-all ${
                      task.completed 
                        ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                        : 'bg-white border-slate-100 hover:border-slate-200/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed)}
                      className="w-4.5 h-4.5 text-tichaPurple border-slate-300 rounded focus:ring-tichaPurple cursor-pointer mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <p className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide uppercase text-slate-400">
                        <span className="text-tichaBlue">{task.subject}</span>
                        <span>â€¢</span>
                        <span>{task.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={() => navigate('/plans')}
            variant="secondary" 
            className="w-full mt-4"
          >
            <span>Open Study Planner</span>
            <Calendar className="w-4 h-4 ml-2" />
          </Button>
        </Card>

      </div>

    </div>
  );
};

