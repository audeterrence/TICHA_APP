import React from 'react';
import { Flame, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, updateLevel } = useAuth();
  const navigate = useNavigate();

  const examLevels = [
    { code: 'BEPC', label: 'BEPC (O-Level Francophone)' },
    { code: 'Probatoire', label: 'Probatoire' },
    { code: 'BAC', label: 'BAC (BAC Francophone)' },
    { code: 'GCE O-Level', label: 'GCE O-Level' },
    { code: 'GCE A-Level', label: 'GCE A-Level' }
  ];

  return (
    <header className='h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 lg:px-8 shadow-sm shrink-0 sticky top-0 z-20'>
      {/* Left: Exam Level Selector */}
      <div className='hidden sm:flex items-center gap-3'>
        <span className='text-xs font-bold text-ticha-gray uppercase tracking-wider'>Exam:</span>
        <select
          value={user?.level || 'BAC'}
          onChange={(e) => updateLevel(e.target.value)}
          className='appearance-none bg-ticha-bg border border-slate-200 text-ticha-text font-semibold px-3 py-1.5 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ticha-blue/30 focus:border-ticha-blue cursor-pointer'
        >
          {examLevels.map((lvl) => (
            <option key={lvl.code} value={lvl.code}>{lvl.label}</option>
          ))}
        </select>
      </div>

      {/* Center: Mobile Title */}
      <div className='sm:hidden flex items-center gap-2'>
        <span className='text-sm font-bold text-ticha-dark'>Ticha</span>
        <span className='text-xs text-slate-400'>|</span>
        <span className='text-xs font-semibold text-ticha-blue'>{user?.level}</span>
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-2 md:gap-4'>
        <button
          onClick={() => navigate('/chat')}
          className='flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-ticha-blue/10 to-ticha-purple/10 text-ticha-blue font-semibold rounded-lg text-xs md:text-sm hover:from-ticha-blue/20 hover:to-ticha-purple/20 transition-all shadow-sm border border-ticha-blue/10 cursor-pointer'
        >
          <MessageSquare className='w-3.5 h-3.5' />
          <span className='hidden sm:inline'>Ask Ticha</span>
        </button>

        {user && (
          <div className='hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg'>
            <Flame className='w-4 h-4 text-orange-500 fill-orange-500' />
            <span className='text-sm font-bold text-slate-700'>{user.streak}</span>
          </div>
        )}

        <button className='p-2 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer'>
          <Bell className='w-4 h-4' />
          <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-ticha-purple rounded-full ring-2 ring-white'></span>
        </button>

        {user && (
          <div className='flex items-center gap-2 border-l border-slate-100 pl-2 md:pl-4'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-ticha-blue to-ticha-purple text-white font-bold flex items-center justify-center text-xs shadow-md'>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className='hidden lg:block'>
              <p className='text-xs font-bold text-slate-800 leading-tight'>{user.name}</p>
              <span className='text-[10px] text-slate-400 font-bold tracking-wider uppercase'>{user.level}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

