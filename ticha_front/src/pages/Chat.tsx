import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Sparkles, Plus, X, Brain, Target, BookOpen, GraduationCap, Atom, Calculator, Globe, Feather, Zap } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { Button } from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

interface Subject {
  id: string;
  name: string;
  code: string;
  mastery: number;
  stream: 'science' | 'arts';
}

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { sessions, activeSession, setActiveSession, messages, loading, sending, startSession, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [userSubjects, setUserSubjects] = useState<Subject[]>([]);
  const [userStream, setUserStream] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;
  const userLevel = user?.level || 'GCE A-Level';

  // Load user's subjects and stream from localStorage
  useEffect(() => {
    if (userId) {
      const subjectsKey = `ticha_user_subjects_${userId}`;
      const streamKey = `ticha_user_stream_${userId}`;
      const storedSubjects = localStorage.getItem(subjectsKey);
      const storedStream = localStorage.getItem(streamKey);
      
      if (storedSubjects) {
        setUserSubjects(JSON.parse(storedSubjects));
      }
      if (storedStream) {
        setUserStream(storedStream);
      }
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Generate contextual system prompt based on user's level, stream, and subjects
  const getContextualSystemPrompt = () => {
    const streamName = userStream === 'science' ? 'Science' : 'Arts';
    const subjectsList = userSubjects.map(s => s.name).join(', ');
    const weakSubjects = userSubjects.filter(s => s.mastery < 40).map(s => s.name);
    
    let prompt = `You are Ticha AI, a specialized tutor for ${userLevel} ${streamName} students in Cameroon. `;
    prompt += `The student is studying: ${subjectsList || 'various subjects'}. `;
    
    if (weakSubjects.length > 0) {
      prompt += `They need extra help with: ${weakSubjects.join(', ')}. `;
    }
    
    prompt += `Provide clear, step-by-step explanations. Use local Cameroon examples when relevant. `;
    prompt += `Be encouraging and adapt to the ${userLevel} level. Keep responses concise but informative.`;
    
    return prompt;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    // Add contextual info to the message if needed
    let messageToSend = input.trim();
    
    // If first message in session, add context about the user
    if (messages.length === 0) {
      const contextPrompt = getContextualSystemPrompt();
      // Store the system prompt in sessionStorage for the chat hook to use
      sessionStorage.setItem('ticha_chat_context', contextPrompt);
    }
    
    sendMessage(messageToSend);
    setInput("");
  };

  const handleNewSession = () => {
    const streamName = userStream === 'science' ? 'Science' : 'Arts';
    startSession(userSubjects[0]?.name || "General", `${userLevel} ${streamName} Tutor`);
  };

  // Generate personalized suggested prompts based on user's subjects and level
  const getPersonalizedPrompts = () => {
    const prompts = [];
    
    if (userSubjects.length > 0) {
      const firstSubject = userSubjects[0];
      if (firstSubject.name === 'Mathematics') {
        prompts.push("Explain the chain rule with examples");
        prompts.push("How to solve quadratic equations step by step");
      } else if (firstSubject.name === 'Physics') {
        prompts.push("Explain Newton's laws of motion");
        prompts.push("How does electricity work?");
      } else if (firstSubject.name === 'Chemistry') {
        prompts.push("Explain the periodic table trends");
        prompts.push("How to balance chemical equations");
      } else if (firstSubject.name === 'Biology') {
        prompts.push("Explain the process of photosynthesis");
        prompts.push("How does the human digestive system work?");
      } else if (firstSubject.name === 'Literature') {
        prompts.push("How to analyze a poem effectively");
        prompts.push("What are the key literary devices?");
      } else if (firstSubject.name === 'History') {
        prompts.push("Summarize Cameroon's independence history");
        prompts.push("What caused World War I?");
      } else if (firstSubject.name === 'Geography') {
        prompts.push("Explain plate tectonics");
        prompts.push("What are the types of climate zones?");
      } else {
        prompts.push(`Explain key concepts in ${firstSubject.name}`);
        prompts.push(`How to prepare for ${userLevel} ${firstSubject.name} exam`);
      }
    }
    
    prompts.push("Give me study tips for exams");
    prompts.push("How can I improve my concentration?");
    
    return prompts.slice(0, 4);
  };

  const personalizedPrompts = getPersonalizedPrompts();

  // Get subject icon
  const getSubjectIcon = (subjectName: string) => {
    const icons: Record<string, JSX.Element> = {
      'Mathematics': <Calculator className="w-3.5 h-3.5" />,
      'Physics': <Atom className="w-3.5 h-3.5" />,
      'Chemistry': <Zap className="w-3.5 h-3.5" />,
      'Biology': <Brain className="w-3.5 h-3.5" />,
      'Geography': <Globe className="w-3.5 h-3.5" />,
      'Literature': <Feather className="w-3.5 h-3.5" />,
      'History': <BookOpen className="w-3.5 h-3.5" />,
    };
    return icons[subjectName] || <Target className="w-3.5 h-3.5" />;
  };

  const streamName = userStream === 'science' ? 'Science' : 'Arts';

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Sidebar */}
      <aside className={`${showSidebar ? "w-full sm:w-80" : "w-0"} border-r border-slate-100 flex flex-col h-full bg-slate-50 shrink-0 transition-all duration-300 overflow-hidden ${showSidebar ? "min-w-[200px]" : "min-w-0"}`}>
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ticha-gray uppercase tracking-wider">AI Sessions</span>
            <button onClick={handleNewSession} className="p-1.5 rounded-lg hover:bg-slate-200 border border-slate-200 bg-white text-ticha-blue cursor-pointer transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* User Context Card */}
          <div className="bg-gradient-to-r from-tichaBlue/10 to-tichaPurple/10 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-tichaBlue" />
              <span className="text-xs font-bold text-slate-700">{userLevel}</span>
              <span className="text-xs text-slate-500">{streamName} Stream</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {userSubjects.slice(0, 3).map(subject => (
                <span key={subject.id} className="inline-flex items-center gap-1 text-[9px] bg-white/80 px-1.5 py-0.5 rounded-full text-slate-600">
                  {getSubjectIcon(subject.name)}
                  {subject.name}
                </span>
              ))}
              {userSubjects.length > 3 && (
                <span className="text-[9px] text-slate-400">+{userSubjects.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-ticha-blue border-t-transparent rounded-full animate-spin" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              <Brain className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No sessions yet
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = activeSession?.id === sess.id;
              return (
                <div key={sess.id} onClick={() => setActiveSession(sess)}
                  className={`p-3 rounded-xl text-left cursor-pointer transition-all border text-xs ${isActive ? "bg-ticha-blue/5 border-ticha-blue/30 text-ticha-blue font-bold" : "border-transparent text-slate-500 hover:bg-slate-100/50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{sess.subject}</span>
                  </div>
                  <h4 className="font-medium truncate">{sess.title}</h4>
                  <span className="text-[9px] text-slate-400">{sess.date}</span>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
              {showSidebar ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </button>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ticha-blue to-ticha-purple flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ticha-dark">Ticha AI Tutor</h3>
              <p className="text-[10px] text-ticha-gray">
                {activeSession?.subject || userSubjects[0]?.name || "General"} • {userLevel} {streamName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-ticha-green/10 rounded-full">
            <span className="w-2 h-2 bg-ticha-green rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-ticha-green">AI Online</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ticha-blue to-ticha-purple flex items-center justify-center text-white mb-4 shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-ticha-dark text-lg mb-2">Ready to learn, {user?.name?.split(' ')[0]}?</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-xs">
                I'm your personal AI tutor for {userLevel} {streamName}. Ask me anything about {userSubjects[0]?.name || 'your subjects'}!
              </p>
              <button onClick={handleNewSession} className="px-5 py-2.5 bg-gradient-to-r from-ticha-blue to-ticha-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md cursor-pointer">
                Start New Session
              </button>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-center pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-tichaBlue/10 rounded-full text-tichaBlue text-xs font-bold mb-4">
                    <Sparkles className="w-3 h-3" />
                    Personalized for you
                  </div>
                  <h4 className="font-bold text-ticha-dark text-sm mb-3">Based on your {userLevel} {streamName} curriculum:</h4>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {personalizedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(prompt)}
                        className="px-3 py-2 text-sm bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-tichaBlue hover:bg-tichaBlue/5 transition-all cursor-pointer shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[90%] sm:max-w-[80%] ${isUser ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${isUser ? "bg-slate-800 text-white" : "bg-gradient-to-br from-ticha-blue to-ticha-purple text-white"}`}>
                      {isUser ? "Y" : <Brain className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3 rounded-xl text-sm leading-relaxed ${isUser ? "bg-slate-800 text-white rounded-tr-none" : "bg-slate-50 border border-slate-200 rounded-tl-none"}`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              
              {sending && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ticha-blue to-ticha-purple text-white flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-ticha-blue rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-ticha-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-ticha-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-slate-400 ml-1">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-slate-200 shrink-0 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask me about ${userSubjects[0]?.name || 'your subjects'}...`}
              disabled={sending}
              className="flex-1 bg-slate-50 border border-slate-200 text-ticha-dark rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ticha-blue/30 focus:border-ticha-blue placeholder-slate-400 disabled:opacity-60"
            />
            <Button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-4 py-2.5 shrink-0 bg-gradient-to-r from-ticha-blue to-ticha-purple hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Ticha AI is trained on {userLevel} {streamName} curriculum
          </p>
        </div>
      </section>
    </div>
  );
};