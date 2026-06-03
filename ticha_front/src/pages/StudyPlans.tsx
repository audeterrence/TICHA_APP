import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Sparkles, CheckCircle2, Plus, AlertCircle,
  X, Clock, BookOpen, Target, Loader2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

interface UserSubject {
  id: string;
  subject_id: string;
  name: string;
  code: string;
  mastery: number;
  stream: string;
}

export const StudyPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, tasks, loading, toggleTask, generatePlan } = useStudy();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hours, setHours] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [userSubjects, setUserSubjects] = useState<UserSubject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.id) return;
      setLoadingSubjects(true);
      try {
        const { data } = await supabase
          .from('user_subjects')
          .select('id, subject_id, mastery, subjects!inner(name, code, stream)')
          .eq('user_id', user.id);

        if (data) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            subject_id: item.subject_id,
            name: item.subjects?.name || '',
            code: item.subjects?.code || '',
            mastery: item.mastery || 0,
            stream: item.subjects?.stream || '',
          }));
          setUserSubjects(mapped);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [user]);

  const handleSubjectToggle = (subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName) ? prev.filter((s) => s !== subjectName) : [...prev, subjectName]
    );
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) return;

    setGenerating(true);
    const success = await generatePlan(selectedSubjects, hours);
    setGenerating(false);

    if (success) {
      setModalOpen(false);
      setSelectedSubjects([]);
    }
  };

  const todayTasks = tasks.filter((t) => t.date === 'Today');
  const tomorrowTasks = tasks.filter((t) => t.date === 'Tomorrow');
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const hasPlan = plans.length > 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-tichaBlue animate-spin" />
        <p className="text-slate-500 text-sm">Loading your study plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Study Plans</h2>
          <p className="text-sm text-slate-500 mt-1">
            {hasPlan 
              ? 'Your daily revision schedule — stay on track.'
              : 'Create a plan to get daily tasks tailored to your subjects.'}
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="shadow-md shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-blue-600 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {tasks.length === 0 ? (
            <Card className="py-16 text-center space-y-4 bg-gradient-to-b from-white to-violet-50/30 border-violet-100">
              <div className="w-16 h-16 mx-auto bg-violet-50 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-violet-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">No study plan yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Generate a plan and Ticha will create daily revision tasks spread across your subjects.
                </p>
              </div>
              <Button onClick={() => setModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
                Create Your First Plan
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today */}
              <Card className="space-y-4 bg-gradient-to-b from-white to-emerald-50/20 border-emerald-100">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-extrabold text-slate-800">Today</h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {completedToday}/{todayTasks.length} done
                  </span>
                </div>

                <div className="space-y-3">
                  {todayTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No tasks scheduled for today.</p>
                  ) : (
                    todayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 border rounded-2xl flex items-start gap-3 transition-all ${
                          task.completed
                            ? 'bg-slate-50 border-slate-100 opacity-60'
                            : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          onChange={() => toggleTask(task.id, !!task.completed, (task as any).xp_reward || 10)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <p className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                            <span className="text-emerald-600">{task.subject}</span>
                            <span>·</span>
                            <span>{task.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Tomorrow */}
              <Card className="space-y-4 bg-gradient-to-b from-white to-violet-50/20 border-violet-100">
                <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-violet-600" />
                    </div>
                    <h4 className="font-extrabold text-slate-800">Tomorrow</h4>
                  </div>
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">
                    {tomorrowTasks.length} tasks
                  </span>
                </div>

                <div className="space-y-3">
                  {tomorrowTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No tasks scheduled yet.</p>
                  ) : (
                    tomorrowTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 border rounded-2xl flex items-start gap-3 transition-all bg-white border-slate-100 hover:border-violet-200 hover:shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          onChange={() => toggleTask(task.id, !!task.completed, (task as any).xp_reward || 10)}
                          className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold leading-tight text-slate-700">{task.title}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                            <span className="text-violet-600">{task.subject}</span>
                            <span>·</span>
                            <span>{task.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-gradient-to-b from-white to-blue-50/30 border-blue-100">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Active Plan</h3>
            </div>

            {!hasPlan ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-400">No active study plan.</p>
                <Button size="sm" onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Create One
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="p-3.5 border border-blue-100 rounded-2xl bg-white/60">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Current Plan</h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="font-semibold text-slate-700">{plan.target_date || '30 days'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tasks:</span>
                        <span className="font-semibold text-slate-700">{plan.tasks?.length || 0} total</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Your Subjects</h3>
            </div>

            {loadingSubjects ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
              </div>
            ) : userSubjects.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No subjects enrolled.</p>
            ) : (
              <div className="space-y-2">
                {userSubjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{subject.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{subject.code}</p>
                    </div>
                    <span className="text-xs font-bold text-violet-600">{subject.mastery}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Generate Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Generate Study Plan</h3>
                <p className="text-xs text-slate-500">Select subjects to include in your plan.</p>
              </div>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Subjects ({selectedSubjects.length} selected)
                </label>
                {loadingSubjects ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {userSubjects.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub.name);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubjectToggle(sub.name)}
                          className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Daily Study Time</label>
                  <span className="font-black text-violet-600">{hours} {hours === 1 ? 'Hour' : 'Hours'} / Day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1h</span><span>3h</span><span>6h</span>
                </div>
              </div>

              <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl flex gap-3 text-xs text-slate-600">
                <AlertCircle className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                <p>Ticha will spread your subjects across daily sessions, alternating between reading and quiz tasks.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" onClick={() => setModalOpen(false)} variant="secondary" className="border-slate-200 text-slate-600">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={generating}
                  disabled={selectedSubjects.length === 0}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20"
                >
                  {generating ? 'Generating...' : 'Generate Plan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};