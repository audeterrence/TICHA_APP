import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, ArrowLeft, Star } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/leaderboard';
import type { LeaderboardEntry } from '../services/leaderboard';
import { useAuth } from '../context/AuthContext';

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        // Fallback to empty array on error so the page doesn't crash
        setLeaders([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-black text-slate-800">Global Rankings</h2>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-tichaBlue border-t-transparent rounded-full" />
        </div>
      ) : leaders.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <Star className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold">The leaderboard is currently empty.</p>
          <p className="text-sm">Complete tasks and quizzes to be the first one here!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaders.map((student, index) => {
            const isCurrentUser = user?.id === student.id;
            
            return (
              <Card 
                key={student.id} 
                className={`p-4 flex items-center justify-between transition-all ${
                  isCurrentUser ? 'bg-tichaBlue/5 border-tichaBlue/30 shadow-sm' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-slate-200 text-slate-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {index < 3 ? <Medal className="w-4 h-4" /> : `#${index + 1}`}
                  </div>
                  
                  {/* Student Info */}
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {student.full_name}
                      {isCurrentUser && <span className="text-[10px] bg-tichaBlue text-white px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{student.level}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-sm font-black text-slate-700">
                      {student.points} <span className="text-[10px] text-slate-400 font-bold uppercase">XP</span>
                    </span>
                  </div>
                  <div className="flex flex-col items-end w-12">
                    <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                      <Flame className="w-4 h-4" /> {student.streak}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};