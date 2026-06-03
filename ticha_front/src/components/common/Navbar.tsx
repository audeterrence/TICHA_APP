import React, { useState, useRef, useEffect } from 'react';
import { Flame, Bell, MessageSquare, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className='h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 shadow-md'>
      
      {/* Left */}
      <div className='flex items-center gap-3'>
        {user?.stream && (
          <span className='text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700'>
            {user.stream === 'science' ? 'Science' : 'Arts'}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-2 md:gap-3'>
        {/* Ask Ticha - GRADIENT BLUE/PURPLE */}
        <button
          onClick={() => navigate('/chat')}
          className='flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-lg text-xs md:text-sm hover:from-blue-500 hover:to-violet-500 transition-all shadow-md shadow-violet-500/25 cursor-pointer'
        >
          <MessageSquare className='w-3.5 h-3.5' />
          <span className='hidden sm:inline'>Ask Ticha</span>
        </button>

        {/* Streak - ORANGE */}
        {user && (
          <div className='hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg'>
            <Flame className='w-4 h-4 text-orange-400 fill-orange-400' />
            <span className='text-sm font-bold text-orange-300'>{user.streak}</span>
          </div>
        )}

        {/* Notifications - VISIBLE */}
        <button className='p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative cursor-pointer'>
          <Bell className='w-4 h-4' />
          <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-slate-900'></span>
        </button>

        {/* User Menu */}
        {user && (
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-700 hover:bg-slate-800 rounded-lg py-1 pr-1 transition-colors cursor-pointer'
            >
              <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs'>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className='hidden lg:block text-left'>
                <p className='text-xs font-bold text-white leading-tight max-w-[100px] truncate'>{user.name}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className='absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50'>
                <div className='px-3 py-2 border-b border-slate-700'>
                  <p className='text-sm font-bold text-white truncate'>{user.name}</p>
                  <p className='text-xs text-slate-400'>{user.level}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors'
                >
                  <Settings className='w-4 h-4' />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors'
                >
                  <LogOut className='w-4 h-4' />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};