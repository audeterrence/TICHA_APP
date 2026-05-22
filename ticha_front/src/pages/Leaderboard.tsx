import React from 'react';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Award,
  ChevronUp,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { mockData } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const leaderboardList = mockData.leaderboard;

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-850">National Leaderboard</h2>
          <p className="text-sm text-slate-400">
            Compare revision scores with other students preparing for BEPC, Probatoire, BAC, and GCE exams across Cameroon.
          </p>
        </div>
        
        <Button onClick={() => navigate('/quiz')}>
          <span>Earn 50 XP (Take Quiz)</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Scoreboard Rankings Table */}
        <Card className="lg:col-span-2 p-6 space-y-5 text-left relative overflow-hidden">
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Trophy className="w-4.5 h-4.5 text-yellow-500" />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Top revision scores</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3.5 pl-3">Rank</th>
                  <th className="pb-3.5">Student</th>
                  <th className="pb-3.5">Exam Target</th>
                  <th className="pb-3.5">Streak</th>
                  <th className="pb-3.5 text-right pr-3">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {leaderboardList.map((student) => {
                  const isUserSelf = student.isSelf;
                  
                  return (
                    <tr 
                      key={student.rank}
                      className={`transition-colors ${
                        isUserSelf 
                          ? 'bg-gradient-to-r from-tichaBlue/10 to-tichaPurple/5 border-l-4 border-tichaBlue pl-3 font-semibold' 
                          : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Rank indicator */}
                      <td className="py-4 pl-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            student.rank === 1 
                              ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                              : student.rank === 2
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : student.rank === 3
                                  ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                  : 'text-slate-500'
                          }`}>
                            {student.rank}
                          </span>
                          
                          {/* Rank trend pointer */}
                          <ChevronUp className="w-3 h-3 text-emerald-500 shrink-0" />
                        </div>
                      </td>

                      {/* Name with custom avatar placeholder */}
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                            isUserSelf 
                              ? 'bg-gradient-to-tr from-tichaBlue to-tichaPurple text-white' 
                              : 'bg-slate-100 text-slate-550 border border-slate-200/50'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className={`font-bold leading-tight ${isUserSelf ? 'text-tichaBlue' : 'text-slate-800'}`}>
                              {student.name}
                            </span>
                            {isUserSelf && <span className="text-[9px] font-bold text-tichaPurple bg-tichaPurple/5 px-1.5 py-0.5 rounded-md ml-1.5 uppercase">You</span>}
                          </div>
                        </div>
                      </td>

                      {/* Target Level */}
                      <td className="py-4">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {student.level}
                        </span>
                      </td>

                      {/* Streak days */}
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-slate-650">
                          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                          <span className="text-xs font-bold">{student.streak} Days</span>
                        </div>
                      </td>

                      {/* XP Points */}
                      <td className="py-4 text-right pr-3.5">
                        <span className="font-extrabold text-slate-800">
                          {student.points} XP
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </Card>

        {/* Sidebar Achievements highlights */}
        <div className="space-y-6 text-left">
          
          {/* Rewards card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4.5 h-4.5 text-tichaPurple" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Rewards Tier</h3>
            </div>

            <div className="space-y-4 text-slate-650">
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Active rank placement</span>
                <h4 className="text-lg font-black text-slate-800">Cameroon Bronze Tier</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Unlock **Silver Tier** status by scoring 1,500 total XP points. Just 50 XP points left!
                </p>
              </div>

              <div className="p-4 bg-gradient-to-tr from-yellow-50/50 to-amber-50/30 border border-yellow-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-600">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Weekly Champion</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The student with the highest weekly streak on Friday receives a free premium access token!
                </p>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
