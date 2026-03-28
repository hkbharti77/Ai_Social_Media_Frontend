import React from 'react';
import Sidebar from './Sidebar';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="flex bg-[#020617] min-h-screen text-foreground overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full lg:pl-72 transition-all duration-300">
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageWrapper;
