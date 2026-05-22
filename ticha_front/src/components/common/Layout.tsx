import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className='flex min-h-screen w-screen overflow-hidden bg-ticha-bg font-sans'>
      {/* Sidebar - fixed on desktop, drawer on mobile */}
      <Sidebar />

      {/* Main Container */}
      <div className='flex-1 flex flex-col min-h-screen lg:ml-60'>
        <Navbar />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20'>
          <div className='max-w-6xl mx-auto space-y-4 md:space-y-6'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

