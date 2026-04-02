import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  isFullHeight?: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, isFullHeight = false }) => {
  return (
    <div className={cn(
      "flex bg-[#020617] text-foreground overflow-x-hidden",
      isFullHeight ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      <Sidebar />
      <main className="flex-1 w-full lg:pl-72 transition-all duration-300">
        <div className={cn(
          "w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700",
          isFullHeight ? "h-full p-4 lg:p-6" : "p-4 md:p-8 lg:p-12"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageWrapper;
