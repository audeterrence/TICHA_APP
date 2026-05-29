import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Award,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { getQuestionsByTopic } from '../services/questions';
import type { QuizQuestion } from '../services/questions';

export const Quiz: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load contextual subject/topic if passed from navigation
  const state = location.state as { topic?: string; topicId?: string; subject?: string; challengeTitle?: string } | null;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real questions from the backend!
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getQuestionsByTopic(state?.topicId);
        setQuestions(data);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [state?.topicId]);

  const handleOptionClick = (key: string) => {
    if (answered) return;
    setSelectedKey(key);
    setAnswered(true);

    const currentQuestion = questions[currentIdx];
    if (key === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedKey(null);
    setAnswered(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const activeQuestion = questions[currentIdx];

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto text-slate-800 relative">
      
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Practice Session</span>
          <p className="text-xs font-black text-tichaBlue leading-none mt-0.5">
            {state?.topic || 'General Pop-Quiz'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-tichaBlue border-t-transparent rounded-full" /></div>
      ) : questions.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <h3 className="font-bold text-xl">No Questions Found</h3>
          <p className="text-slate-500 text-sm">We don't have any questions for this topic yet. Check back later!</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      ) : quizFinished ? (
        /* FINAL SCOREBOARD OVERLAY */
        <Card variant="glass" className="p-8 text-center space-y-6 animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500 border border-yellow-100 shadow-md mx-auto animate-bounce">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-2xl text-slate-850">Quiz Practice Complete!</h3>
            <p className="text-xs text-slate-400">
              Your accuracy results have been recorded in the Supabase curriculum syllabus logs.
            </p>
          </div>

          {/* Points/XP rewards card */}
          <div className="grid grid-cols-2 gap-4.5 bg-slate-50 border border-slate-150 p-5 rounded-2xl max-w-sm mx-auto">
            <div className="text-left space-y-0.5 border-r border-slate-200 pr-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Accuracy Score</span>
              <h4 className="text-xl font-black text-slate-850">
                {Math.round((score / questions.length) * 100)}% ({score}/{questions.length})
              </h4>
            </div>
            <div className="text-left space-y-0.5 pl-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">XP Earned</span>
              <h4 className="text-xl font-black text-tichaBlue">+{score * 50} XP</h4>
            </div>
          </div>

          <div className="flex justify-center gap-4.5 pt-4">
            <Button 
              onClick={() => {
                setCurrentIdx(0);
                setScore(0);
                setSelectedKey(null);
                setAnswered(false);
                setQuizFinished(false);
              }}
              variant="outline"
            >
              <span>Practice Again</span>
            </Button>
            <Button onClick={() => navigate('/')}>
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      ) : (
        /* ACTIVE PRACTICE VIEWER */
        <div className="space-y-6">
          
          {/* Progress gauge */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold">Question {currentIdx + 1} of {questions.length}</span>
            <span className="font-bold">Accuracy: {score} Correct</span>
          </div>

          {/* Question stem */}
          <Card className="p-6 bg-slate-50/50 border-slate-150 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-tichaBlue/5 border border-tichaBlue/10 flex items-center justify-center text-tichaBlue shrink-0 mt-0.5">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-relaxed">
                {activeQuestion.question}
              </h3>
            </div>
          </Card>

          {/* Multiple choice options */}
          <div className="grid grid-cols-1 gap-3.5">
            {activeQuestion.options.map((opt) => {
              const isSelected = selectedKey === opt.key;
              const isCorrect = opt.key === activeQuestion.correctAnswer;
              
              let styleClasses = 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30';
              if (answered) {
                if (isCorrect) {
                  styleClasses = 'bg-emerald-50 border-emerald-350 text-emerald-800 font-semibold';
                } else if (isSelected) {
                  styleClasses = 'bg-rose-50 border-rose-350 text-rose-800 font-semibold';
                } else {
                  styleClasses = 'bg-white border-slate-100 opacity-55';
                }
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => handleOptionClick(opt.key)}
                  disabled={answered}
                  className={`p-4 border rounded-2xl flex items-center gap-4 text-left transition-all text-sm font-medium ${styleClasses} ${!answered ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                    answered && isCorrect
                      ? 'bg-emerald-500 border-emerald-300 text-white'
                      : answered && isSelected
                        ? 'bg-rose-500 border-rose-300 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {opt.key}
                  </div>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  
                  {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Interactive AI Explanation drawer */}
          {answered && (
            <Card className="p-5 bg-gradient-to-tr from-slate-50 to-slate-100/50 border border-slate-200/80 rounded-2xl text-left space-y-3.5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tichaPurple" />
                <h4 className="font-extrabold text-tichaPurple text-xs uppercase tracking-wider">Ticha AI Solution Walkthrough</h4>
              </div>
              <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                {activeQuestion.explanation || "Correct answer selected. Great job!"}
              </p>
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleNext}
                  className="shadow-md shadow-tichaBlue/10 bg-slate-900 border-slate-850 hover:bg-slate-800 text-xs font-bold"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

        </div>
      )}

    </div>
  );
};