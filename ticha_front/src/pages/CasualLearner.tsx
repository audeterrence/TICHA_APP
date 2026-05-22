import React from 'react';
import { 
  Sparkles, 
  Trophy, 
  Play, 
  CheckCircle2, 
  Lock, 
  Award,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChallengeStep {
  id: string;
  title: string;
  topic: string;
  xpReward: number;
  status: 'completed' | 'active' | 'locked';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const CasualLearner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Gamified step progress mockup based on active level
  const challengePath: ChallengeStep[] = [
    { id: 'cs1', title: 'Quadratic Equations Pop-Quiz', topic: 'Mathematics', xpReward: 150, status: 'completed', difficulty: 'Easy' },
    { id: 'cs2', title: 'Newtonian Force Calculations', topic: 'Physics', xpReward: 200, status: 'active', difficulty: 'Medium' },
    { id: 'cs3', title: 'Organic Nomenclature Basics', topic: 'Chemistry', xpReward: 250, status: 'locked', difficulty: 'Medium' },
    { id: 'cs4', title: 'Grammar & Essay Mechanics', topic: 'English Language', xpReward: 300, status: 'locked', difficulty: 'Easy' },
    { id: 'cs5', title: 'Advanced Trigonometric Identity', topic: 'Mathematics', xpReward: 400, status: 'locked', difficulty: 'Hard' },
  ];

  const handleStartChallenge = (challenge: ChallengeStep) => {
    navigate('/quiz', { state: { topic: challenge.topic, challengeTitle: challenge.title } });
  };

  const getStatusBadge = (status: ChallengeStep['status']) => {
    switch (status) {
      case 'completed':
        return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'active':
        return <span className="text-[10px] font-bold text-tichaBlue bg-tichaBlue/5 px-2.5 py-0.5 rounded-full animate-pulse">Active Challenge</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-450 bg-slate-100 px-2.5 py-0.5 rounded-full">Locked</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-850">Casual Skill Quest</h2>
          <p className="text-sm text-slate-400">
            Learn at your own pace! Climb the step-by-step Cameroonian revision board to unlock virtual diplomas.
          </p>
        </div>
        
        {/* Virtual certification milestone */}
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-tichaBlue/5 to-tichaPurple/5 px-4.5 py-2 border border-tichaBlue/10 rounded-2xl shrink-0">
          <Award className="w-5 h-5 text-tichaPurple" />
          <div className="text-left leading-tight">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Next Certification</span>
            <p className="text-xs font-black text-slate-700">{user?.level} Syllabus Champ</p>
          </div>
        </div>
      </div>

      {/* Gamified Roadmap Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step Path Card */}
        <Card className="lg:col-span-2 p-6 space-y-8 relative overflow-hidden">
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-tichaBlue" />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Quest Roadmap</h3>
          </div>

          <div className="relative pl-6 md:pl-10 space-y-10">
            {/* Vertically animated pathway connector line */}
            <div className="absolute left-[37px] md:left-[53px] top-6 bottom-6 w-1 bg-slate-100 rounded-full" />

            {challengePath.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              const isLocked = step.status === 'locked';

              return (
                <div key={step.id} className="relative flex items-start gap-4 md:gap-6">
                  
                  {/* Step status node */}
                  <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center border-4 z-10 shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-100 text-white shadow-md shadow-emerald-500/10'
                      : isActive 
                        ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple border-tichaBlue/20 text-white shadow-lg shadow-tichaBlue/10 animate-bounce' 
                        : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 md:w-5.5 md:h-5.5 fill-current text-white" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 fill-current ml-0.5 text-white" />
                    )}
                  </div>

                  {/* Step Info Content Box */}
                  <div className={`flex-1 p-4 md:p-5 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isCompleted 
                      ? 'bg-slate-50/50 border-slate-100 opacity-80' 
                      : isActive 
                        ? 'bg-white border-tichaBlue/30 shadow-md shadow-tichaBlue/5' 
                        : 'bg-white border-slate-100 opacity-50'
                  }`}>
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(step.status)}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{step.topic}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">{step.title}</h4>
                      <p className="text-[10px] font-semibold text-slate-400">Difficulty: {step.difficulty} • Reward: <strong className="text-tichaBlue">{step.xpReward} XP</strong></p>
                    </div>

                    <div className="shrink-0 flex md:justify-end">
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-600">Quest Passed ✓</span>
                      ) : isLocked ? (
                        <Button size="sm" variant="ghost" disabled className="text-xs font-bold bg-slate-50 border border-slate-100 text-slate-400">
                          Locked
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleStartChallenge(step)}
                          size="sm" 
                          className="shadow-md shadow-tichaBlue/10 text-xs font-bold"
                        >
                          Start Quiz
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </Card>

        {/* Gamified Achievements Sidebar */}
        <div className="space-y-6">
          
          {/* Certificate milestone status card */}
          <Card className="p-6 text-left space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Trophy className="w-4.5 h-4.5 text-yellow-500" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Honor Badges</h3>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Algebra Scholar', desc: 'Solve 15 Mathematics quiz questions', pct: 80, unlocked: false },
                { title: 'Newton Apprentice', desc: 'Maintain a 5-day active revision streak', pct: 100, unlocked: true },
                { title: 'Syllabus Master', desc: 'Reach 80% mastery in any subject', pct: 40, unlocked: false },
              ].map((badge, idx) => (
                <div key={idx} className="flex gap-3 items-start border border-slate-100/50 p-3 rounded-2xl bg-slate-50/20">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    badge.unlocked 
                      ? 'bg-yellow-50 border-yellow-100 text-yellow-500 shadow-sm' 
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{badge.title}</span>
                      {badge.unlocked && <span className="text-[10px] font-bold text-emerald-600">Unlocked</span>}
                    </div>
                    <p className="text-[10px] text-slate-450 leading-snug">{badge.desc}</p>
                    <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${badge.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
