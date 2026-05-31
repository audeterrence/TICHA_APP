import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Calculator,
  Zap,
  FlaskConical,
  BookOpen as BookIcon,
  Globe,
} from 'lucide-react';
import { useMastery } from '../hooks/useMastery';
import { Card } from '../components/common/Card';
import { ProgressRing } from '../components/common/ProgressRing';
import { Button } from '../components/common/Button';

// Icon mapper for subject codes
const iconMap: Record<string, any> = {
  Calculator: Calculator,
  Zap: Zap,
  FlaskConical: FlaskConical,
  BookOpen: BookIcon,
  Globe: Globe,
};

const getIcon = (iconName?: string) => {
  if (!iconName) return BookOpen;
  return iconMap[iconName] || BookOpen;
};

export const SubjectMastery: React.FC = () => {
  const { subjects, loading, activeSubject, setActiveSubject, topics, topicsLoading } = useMastery();
  const navigate = useNavigate();

  const handleStartPractice = (topicName: string) => {
    if (!activeSubject) return;
    navigate('/quiz', { state: { topic: topicName, subject: activeSubject.name } });
  };

  const getMasteryColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getMasteryTextClass = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-850">Curriculum Mastery</h2>
          <p className="text-sm text-slate-400">
            Track your mastery levels per subject and dive deep into specific syllabus topics.
          </p>
        </div>
        <Button onClick={() => navigate('/quiz')}>
          <span>Take Random Quiz</span>
          <HelpCircle className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subject Horizontal Selector Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {subjects.map((sub) => {
              const IconComp = getIcon(sub.icon);
              const isActive = activeSubject?.id === sub.id;

              return (
                <div
                  key={sub.id}
                  onClick={() => setActiveSubject(sub)}
                  className={`p-4 border rounded-2xl flex flex-col items-center text-center justify-between gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'border-tichaBlue bg-gradient-to-tr from-tichaBlue/5 to-tichaPurple/5 shadow-md shadow-tichaBlue/5 font-bold scale-[1.02]'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple text-white shadow-md'
                        : 'bg-slate-55 text-slate-500'
                    }`}
                  >
                    <IconComp className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {sub.name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {sub.code}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-tichaBlue to-tichaPurple' : 'bg-slate-350'
                      }`}
                      style={{ width: `${sub.mastery}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-black mt-0.5 ${
                      isActive ? 'text-tichaBlue' : 'text-slate-500'
                    }`}
                  >
                    {sub.mastery}% Done
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed Syllabus Topics for selected subject */}
          {activeSubject && (
            <Card className="p-6 space-y-6">
              {/* Subject Title Overview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-tichaBlue to-tichaPurple flex items-center justify-center text-white shadow-md">
                    {React.createElement(getIcon(activeSubject.icon), {
                      className: 'w-5.5 h-5.5 shrink-0',
                    })}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{activeSubject.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Syllabus breakdown for your prep dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-slate-50/50 px-4 py-2 border border-slate-100 rounded-2xl">
                  <ProgressRing progress={activeSubject.mastery} size={50} strokeWidth={4.5}>
                    <span className="text-xs font-black text-slate-850">
                      {activeSubject.mastery}%
                    </span>
                  </ProgressRing>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Overall Subject
                    </span>
                    <h4 className="text-sm font-black text-slate-800">Mastery Level</h4>
                  </div>
                </div>
              </div>

              {/* Topics Mastery Table List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-tichaBlue" />
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                    Syllabus Core Topics
                  </h4>
                </div>

                {topicsLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-tichaBlue border-t-transparent rounded-full" />
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400 font-medium">
                      No topics registered. Create subjects or take pop quizzes to populate stats!
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-100/60 rounded-2xl overflow-hidden shadow-sm bg-white divide-y divide-slate-100">
                    {topics.map((top) => (
                      <div
                        key={top.id}
                        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/40 transition-colors"
                      >
                        {/* Title & Stats */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${getMasteryTextClass(
                                top.mastery
                              )}`}
                            >
                              {top.mastery}% Mastered
                            </span>
                            <h5 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                              {top.name}
                            </h5>
                          </div>

                          {/* Progress Line */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-slate-200/60 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${getMasteryColor(
                                  top.mastery
                                )}`}
                                style={{ width: `${top.mastery}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-450 shrink-0 w-8">
                              {top.mastery}%
                            </span>
                          </div>
                        </div>

                        {/* Attempt ratio stats & Practice trigger */}
                        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t border-slate-100/50 md:border-0 pt-3 md:pt-0">
                          <div className="text-left md:text-right space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Accuracy Metrics
                            </span>
                            <p className="text-xs font-bold text-slate-650">
                              <strong className="text-slate-800 font-extrabold">{top.correct}</strong> /{' '}
                              {top.attempted} MCQs Correct
                            </p>
                          </div>
                          <Button
                            onClick={() => handleStartPractice(top.name)}
                            size="sm"
                            variant="secondary"
                            className="border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 text-xs font-bold shrink-0"
                          >
                            Practice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};