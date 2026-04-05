import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  isFullHeight?: boolean;
  showSidebar?: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, isFullHeight = false, showSidebar = true }) => {
  return (
    <div className={cn(
      "flex bg-[#020617] text-foreground overflow-x-hidden",
      isFullHeight ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      {showSidebar && <Sidebar />}
      <main className={cn(
        "flex-1 w-full transition-all duration-300",
        showSidebar && "lg:pl-72"
      )}>
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
