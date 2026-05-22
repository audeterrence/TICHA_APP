import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Sparkles, Plus, X } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { Button } from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { sessions, activeSession, setActiveSession, messages, loading, sending, startSession, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleNewSession = () => { startSession("Mathematics", "Syllabus Tutor (Mathematics)"); };

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
      <aside className={`${showSidebar ? "w-full sm:w-64" : "w-0"} border-r border-slate-100 flex flex-col h-full bg-slate-50 shrink-0 transition-all duration-300 overflow-hidden ${showSidebar ? "min-w-[200px]" : "min-w-0"}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-ticha-gray uppercase tracking-wider hidden sm:inline">Sessions</span>
          <button onClick={handleNewSession} className="p-1.5 rounded-lg hover:bg-slate-200 border border-slate-200 bg-white text-ticha-blue cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (<div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-ticha-blue border-t-transparent rounded-full animate-spin" /></div>) :
           sessions.length === 0 ? (<div className="text-center py-8 text-xs text-slate-400">No sessions yet</div>) :
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
           })}
        </div>
      </aside>

      <section className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
              {showSidebar ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </button>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ticha-blue to-ticha-purple flex items-center justify-center text-white text-xs font-bold shadow-sm">T</div>
            <div>
              <h3 className="text-sm font-bold text-ticha-dark">Ticha AI Study Assistant</h3>
              <p className="text-[10px] text-ticha-gray">Active: {activeSession?.subject || "General"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-ticha-green/10 rounded-full">
            <span className="w-2 h-2 bg-ticha-green rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-ticha-green">AI Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-ticha-blue/5 flex items-center justify-center text-ticha-blue mb-4 border border-ticha-blue/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-ticha-dark text-lg mb-2">Ready to Learn?</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-xs">Ask me anything about your subjects, study tips, or exam prep!</p>
              <button onClick={handleNewSession} className="px-5 py-2.5 bg-gradient-to-r from-ticha-blue to-ticha-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md cursor-pointer">
                Start New Session
              </button>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-center pb-4">
                  <h4 className="font-bold text-ticha-dark text-sm mb-1">Need help with {user?.level}?</h4>
                  <p className="text-sm text-slate-500 mb-3">Try these prompts:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Explain the chain rule", "Newton laws", "How to study effectively"].map((prompt, idx) => (
                      <button key={idx} onClick={() => setInput(prompt)} className="px-3 py-1.5 text-sm bg-ticha-blue/5 border border-ticha-blue/20 text-ticha-blue rounded-lg hover:bg-ticha-blue/10 cursor-pointer">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${isUser ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${isUser ? "bg-ticha-dark text-white" : "bg-gradient-to-br from-ticha-blue to-ticha-purple text-white"}`}>
                      {isUser ? "U" : "T"}
                    </div>
                    <div className={`p-3 rounded-xl text-sm leading-relaxed ${isUser ? "bg-ticha-dark text-white rounded-tr-none" : "bg-slate-50 border border-slate-200 rounded-tl-none"}`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ticha-blue to-ticha-purple text-white flex items-center justify-center text-xs font-bold shrink-0">T</div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-ticha-blue rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-ticha-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-ticha-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-200 shrink-0 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Ticha anything about your studies..."
              disabled={sending} className="flex-1 bg-slate-50 border border-slate-200 text-ticha-dark rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ticha-blue/30 focus:border-ticha-blue placeholder-slate-400 disabled:opacity-60" />
            <Button type="submit" disabled={!input.trim() || sending} className="px-4 py-2.5 shrink-0 bg-gradient-to-r from-ticha-blue to-ticha-purple hover:opacity-90 cursor-pointer"><Send className="w-4 h-4 text-white" /></Button>
          </form>
        </div>
      </section>
    </div>
  );
};

