import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className='flex h-screen w-screen overflow-hidden bg-slate-50 font-sans'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className='flex-1 flex flex-col lg:ml-60 h-screen overflow-hidden'>
        {/* Navbar - FIXED at top */}
        <Navbar />
        
        {/* Scrollable content below navbar */}
        <main className='flex-1 overflow-y-auto p-4 md:p-6 lg:p-8'>
          <div className='max-w-6xl mx-auto space-y-4 md:space-y-6'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};