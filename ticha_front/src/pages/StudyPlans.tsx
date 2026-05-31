import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  Hourglass,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react';
import { useStudyPlans } from '../hooks/useStudyPlans';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const StudyPlans: React.FC = () => {
  const { user } = useAuth();
  const { plans, tasks, loading, toggleTask, generatePlan } = useStudyPlans();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hours, setHours] = useState(2);
  const [generating, setGenerating] = useState(false);

  // Cameroonian standard curriculum subjects list mockup
  const mockSubjectList = [
    { code: 'MATH', name: 'Mathematics' },
    { code: 'PHYS', name: 'Physics' },
    { code: 'CHEM', name: 'Chemistry' },
    { code: 'ENGL', name: 'English Language' },
    { code: 'HIST', name: 'History' },
  ];

  const handleSubjectToggle = (subjCode: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjCode) ? prev.filter((s) => s !== subjCode) : [...prev, subjCode]
    );
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) return;

    setGenerating(true);
    const success = await generatePlan();
    setGenerating(false);

    if (success) {
      setModalOpen(false);
      setSelectedSubjects([]);
    }
  };

  // Group tasks by date for the calendar view
  const todayTasks = tasks.filter((t) => t.date === 'Today');
  const tomorrowTasks = tasks.filter((t) => t.date === 'Tomorrow');

  return (
    <div className="space-y-6 font-sans text-slate-800 relative">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-850">Study Plans & Calendar</h2>
          <p className="text-sm text-slate-400">
            Structure your schedule and stay on track with adaptive revision targets tailored for
            Cameroonian exams.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="shadow-md shadow-tichaBlue/10 bg-gradient-to-r from-tichaBlue to-tichaPurple text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span>Auto-Generate AI Plan</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tasks Planner Columns */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
            </div>
          ) : tasks.length === 0 ? (
            <Card className="py-16 text-center space-y-4">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-850 text-base">
                  No revision tasks active
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the **Auto-Generate AI Plan** button above to structure your revision
                  timeline instantly!
                </p>
              </div>
              <Button onClick={() => setModalOpen(true)} size="sm">
                Generate Plan
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Schedule column */}
              <Card className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                    Today
                  </h4>
                  <span className="text-[10px] font-bold text-tichaBlue bg-tichaBlue/5 px-2.5 py-0.5 rounded-full">
                    {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} Done
                  </span>
                </div>

                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 border rounded-2xl flex items-start gap-3 transition-all ${
                        task.completed
                          ? 'bg-slate-50 border-slate-100 opacity-60'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        className="w-4.5 h-4.5 text-tichaBlue border-slate-300 rounded focus:ring-tichaBlue cursor-pointer mt-0.5"
                      />
                      <div className="flex-1 space-y-1 text-left">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-bold tracking-wide uppercase text-slate-400">
                          <span className="text-tichaBlue">{task.subject}</span>
                          <span>•</span>
                          <span>{task.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tomorrow's Schedule column */}
              <Card className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                    Tomorrow
                  </h4>
                  <span className="text-[10px] font-bold text-tichaPurple bg-tichaPurple/5 px-2.5 py-0.5 rounded-full">
                    {tomorrowTasks.length} Tasks
                  </span>
                </div>

                <div className="space-y-3">
                  {tomorrowTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 border rounded-2xl flex items-start gap-3 transition-all ${
                        task.completed
                          ? 'bg-slate-50 border-slate-100 opacity-60'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        className="w-4.5 h-4.5 text-tichaPurple border-slate-300 rounded focus:ring-tichaPurple cursor-pointer mt-0.5"
                      />
                      <div className="flex-1 space-y-1 text-left">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-bold tracking-wide uppercase text-slate-400">
                          <span className="text-tichaPurple">{task.subject}</span>
                          <span>•</span>
                          <span>{task.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Side: Active plans summary list */}
        <div className="space-y-6">
          <Card className="p-6 text-left space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Hourglass className="w-4.5 h-4.5 text-tichaBlue" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                Active Study Plans
              </h3>
            </div>

            {plans.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No active study plans. Use the generator to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 border border-slate-100 rounded-2xl bg-slate-50/30"
                  >
                    <h4 className="font-bold text-slate-800 text-sm mb-1">
                      Study Plan #{plan.id.slice(0, 8)}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                      Target date: {plan.target_date || 'Not set'}
                    </p>
                    <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500">
                      <span>{plan.tasks?.length || 0} Total Tasks</span>
                      <span className="text-tichaBlue font-semibold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* AI STUDY PLANNER GENERATOR OVERLAY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-2xl relative border border-slate-150 animate-in fade-in zoom-in duration-200">
            {/* Modal close */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-450 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal header banner */}
            <div className="flex items-center gap-2.5 mb-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-tichaBlue to-tichaPurple text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-850 text-lg">AI Smart Study Planner</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Select subjects to create a weekly adaptive revision plan
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-6 text-left">
              {/* Subject selector chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Select Subjects
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {mockSubjectList.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.name);
                    return (
                      <button
                        key={sub.code}
                        type="button"
                        onClick={() => handleSubjectToggle(sub.name)}
                        className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-tichaBlue text-white border-tichaBlue shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Revision hours slider range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-450 uppercase tracking-wider">
                    Daily Study Hours
                  </label>
                  <span className="font-black text-tichaBlue">{hours} Hours / Day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-tichaBlue focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>1 Hour</span>
                  <span>3 Hours</span>
                  <span>6 Hours (Hardcore)</span>
                </div>
              </div>

              {/* Informative alert box */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex gap-3 text-xs text-slate-500">
                <AlertCircle className="w-5 h-5 text-tichaPurple shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Ticha's AI engine will divide your chosen subjects into bite-sized daily revision
                  milestones, automatically preparing quiz papers for review.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  variant="secondary"
                  className="border-slate-200 shadow-sm text-slate-700 font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={generating}
                  disabled={selectedSubjects.length === 0}
                  className="px-6 py-3 font-bold text-xs"
                >
                  Generate Plan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};