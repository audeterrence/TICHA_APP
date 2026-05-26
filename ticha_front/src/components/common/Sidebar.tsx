import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { TichaLogo } from "./TichaLogo";
import { LayoutDashboard, BookOpen, FileText, GraduationCap, MessageSquare, Calendar, Settings, Trophy, Flame, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Subject Mastery", path: "/mastery", icon: BookOpen },
    { name: "Exam Prep", path: "/exam", icon: FileText },
    { name: "Casual Learner", path: "/casual", icon: GraduationCap },
    { name: "AI Chat Tutor", path: "/chat", icon: MessageSquare },
    { name: "Study Plans", path: "/plans", icon: Calendar },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Settings", path: "/settings", icon: Settings },
  ];
  const handleLogout = () => { logout(); navigate("/login"); };
  const closeMobile = () => setMobileOpen(false);
  
  return (
    <>
      {/* Mobile menu button - LIGHT background so it's visible */}
      <button 
        onClick={() => setMobileOpen(true)} 
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-lg text-slate-700 border border-slate-200"
      >
        <Menu className="w-5 h-5" />
      </button>
      
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={closeMobile} />} 
      
      <aside className="hidden lg:flex w-60 bg-slate-900 text-white flex-col border-r border-slate-700 shrink-0 fixed left-0 top-0 h-full z-30">
        <SidebarContent user={user} menuItems={menuItems} handleLogout={handleLogout} />
      </aside>
      
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col border-r border-slate-700 z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-slate-700 flex justify-end">
          <button onClick={closeMobile} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent user={user} menuItems={menuItems} handleLogout={handleLogout} mobileClose={closeMobile} />
      </aside>
    </>
  );
};

interface SidebarContentProps {
  user: any;
  menuItems: Array<{ name: string; path: string; icon: any }>;
  handleLogout: () => void;
  mobileClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ user, menuItems, handleLogout, mobileClose }) => (
  <>
    <div className="p-5 border-b border-slate-700">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <TichaLogo size={32} />
        </div>
        <span className="font-bold text-lg tracking-tight">TICHA</span>
      </div>
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-2">Learn Smarter, Score Higher</p>
    </div>
    
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {menuItems.map((item) => { 
        const Icon = item.icon; 
        return (
          <NavLink 
            key={item.path} 
            to={item.path} 
            onClick={mobileClose} 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-gradient-to-r from-blue-600/20 to-violet-600/10 text-blue-500" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
    
    {user && (
      <div className="p-4 border-t border-slate-700 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 uppercase truncate">{user.level}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 justify-center py-1.5 bg-slate-900/60 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold text-slate-300">{user.streak || 0}d</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center py-1.5 bg-slate-900/60 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-bold text-slate-300">{user.points || 0} XP</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-slate-700 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    )}
  </>
);