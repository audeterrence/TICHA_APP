import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, Sparkles, Plus, X, Brain, Target, BookOpen, GraduationCap, Atom, Calculator, Globe, Feather, Zap, Menu, Trash2, Download } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { Button } from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Subject {
  id: string;
  name: string;
  code: string;
  mastery: number;
  stream: 'science' | 'arts';
}

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessions, activeSession, setActiveSession, messages, loading, sending, startSession, sendMessage, deleteSession } = useChat();
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [userSubjects, setUserSubjects] = useState<Subject[]>([]);
  const [userStream, setUserStream] = useState<string>('');
  const [userMode, setUserMode] = useState<string>('exam');
  const [showSavePlan, setShowSavePlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userId = user?.id;
  const userLevel = user?.level || 'GCE A-Level';
  const userName = user?.name || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      setUserStream(user.stream || 'science');
      setUserMode(user.mode || 'exam');
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Detect <!--PLAN--> marker in last AI message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.content.includes('<!--PLAN-->')) {
        setShowSavePlan(true);
      } else {
        setShowSavePlan(false);
      }
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    if (!activeSession) {
      const firstSubject = userSubjects.length > 0 ? userSubjects[0].name : undefined;
      startSession(firstSubject || "General", input.trim().slice(0, 40));
      setTimeout(() => {
        sendMessage(input.trim());
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 300);
      return;
    }
    
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSavePlan = async () => {
    if (!activeSession) return;
    setSavingPlan(true);
    try {
      const { data } = await api.post(`/chat/sessions/${activeSession.id}/extract-plan`);
      setShowSavePlan(false);
      alert(`${data.tasks_created} tasks created! Check your Dashboard.`);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not save plan. Try asking Ticha to summarize the plan first.');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleNewSession = () => {
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleSelectSession = (session: any) => {
    setActiveSession(session);
    setShowSavePlan(false);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      await deleteSession(sessionId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const getPersonalizedPrompts = () => {
    if (userMode === 'casual') {
      return [
        "Teach me something interesting about space",
        "How do computers work?",
        "Fun facts about the human body",
        "What's the history of Cameroon?",
      ];
    }
    
    const prompts: string[] = [];
    
    if (userSubjects.length > 0) {
      const firstSubject = userSubjects[0];
      if (firstSubject.name.includes('Mathematics') || firstSubject.code === 'MATH' || firstSubject.code === 'PMATH') {
        prompts.push("Explain the chain rule step by step");
        prompts.push("Solve a quadratic equation with me");
      } else if (firstSubject.name.includes('Physics') || firstSubject.code === 'PHY') {
        prompts.push("Explain Newton's three laws");
        prompts.push("How do I solve projectile motion problems?");
      } else if (firstSubject.name.includes('Chemistry') || firstSubject.code === 'CHEM') {
        prompts.push("Explain periodic table trends");
        prompts.push("Help me balance chemical equations");
      } else if (firstSubject.name.includes('Biology') || firstSubject.code === 'BIO') {
        prompts.push("Explain photosynthesis step by step");
        prompts.push("How does the human digestive system work?");
      } else {
        prompts.push(`Key concepts in ${firstSubject.name}`);
        prompts.push(`${userLevel} exam preparation tips`);
      }
    }
    
    prompts.push("Create a study plan for me");
    prompts.push("Give me a practice question");
    
    return prompts.slice(0, 4);
  };

  const personalizedPrompts = getPersonalizedPrompts();

  const streamName = userStream === 'science' ? 'Science' : 'Arts';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const activeSubject = activeSession?.subject && activeSession.subject !== "General Study" 
    ? activeSession.subject 
    : userSubjects.length > 0 
      ? userSubjects[0].name 
      : userMode === 'casual' ? 'Casual Learning' : 'General';

  // Filter out <!--PLAN--> marker from displayed messages
  const cleanMessage = (content: string) => content.replace('<!--PLAN-->', '').trim();

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm relative">
      
      {showSidebar && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:w-72
        fixed md:static top-0 left-0 z-30
        w-72 h-full
        border-r border-slate-100 flex flex-col bg-white
        transition-transform duration-300 ease-in-out
        shadow-xl md:shadow-none
      `}>
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {userMode === 'casual' ? 'Sessions' : 'Study Sessions'}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={handleNewSession} 
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer transition-all"
                title="New session"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowSidebar(false)} 
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400">
                  {userMode === 'casual' ? 'Casual' : `${userLevel} · ${streamName}`}
                </p>
              </div>
            </div>
            {userSubjects.length > 0 && userMode !== 'casual' && (
              <div className="flex flex-wrap gap-1">
                {userSubjects.slice(0, 2).map(subject => (
                  <span key={subject.id} className="text-[10px] bg-white px-2 py-0.5 rounded-full text-slate-500 border border-slate-100">
                    {subject.code || subject.name.slice(0, 4)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              Start a conversation
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = activeSession?.id === sess.id;
              return (
                <div 
                  key={sess.id} 
                  onClick={() => handleSelectSession(sess)}
                  className={`group p-2.5 rounded-lg text-left cursor-pointer transition-all text-xs relative ${
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-medium truncate pr-6 text-[11px]">
                    {sess.title?.replace("Tutor Session: ", "") || "New conversation"}
                  </p>
                  <span className="text-[10px] text-slate-400">{sess.date}</span>
                  <button
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                    className="absolute right-2 top-2.5 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat */}
      <section className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => setShowSidebar(true)} 
              className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-50 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-800 truncate">Ticha</h3>
              <p className="text-[10px] text-slate-400 truncate">
                {activeSession?.title?.replace("Tutor Session: ", "") || activeSubject || "New conversation"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-slate-50/50">
          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white mb-4 shadow-lg">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg mb-1">
                {userMode === 'casual' ? `Hi ${userName}` : `Ready, ${userName}?`}
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                {userMode === 'casual' 
                  ? "What are you curious about today?"
                  : `Ask me anything about ${userLevel} (${streamName}).`
                }
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {personalizedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleNewSession();
                      setInput(prompt);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }, 400);
                    }}
                    className="px-3 py-2 text-xs bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-center pb-4 pt-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-xs font-medium mb-4">
                    <Sparkles className="w-3 h-3" />
                    Ask anything
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {personalizedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(prompt)}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const displayContent = isUser ? msg.content : cleanMessage(msg.content);
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5 ${isUser ? "bg-slate-200 text-slate-600" : "bg-gradient-to-br from-blue-500 to-violet-500 text-white"}`}>
                      {isUser ? userInitial : "T"}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-blue-500 text-white rounded-tr-md" : "bg-white border border-slate-200 rounded-tl-md shadow-sm"}`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{displayContent}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-800 prose-code:text-violet-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded overflow-x-auto">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {displayContent}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {sending && (
                <div className="flex gap-3 max-w-[75%] mr-auto">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                    T
                  </div>
                  <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-md shadow-sm">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}

              {/* Save Plan Button */}
              {showSavePlan && (
                <div className="flex justify-center py-2">
                  <button
                    onClick={handleSavePlan}
                    disabled={savingPlan}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {savingPlan ? 'Saving...' : 'Save Study Plan'}
                  </button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 shrink-0 bg-white">
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={userMode === 'casual' ? "What are you curious about?" : "Ask about your subjects..."}
              disabled={sending}
              rows={1}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder-slate-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-4 py-2.5 shrink-0 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            Shift + Enter for new line
          </p>
        </div>
      </section>
    </div>
  );
};