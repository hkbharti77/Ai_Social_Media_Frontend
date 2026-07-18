import React, { useState, useEffect } from 'react';
import { getActiveJobs } from '../../api/jobs';
import type { AiJob } from '../../api/jobs';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const TaskTracker: React.FC = () => {
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await getActiveJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const activeCount = jobs.filter(j => j.status === 'RUNNING' || j.status === 'PENDING').length;

  return (
    <div className="fixed top-6 right-20 lg:top-8 lg:right-12 z-[200]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-2xl"
      >
        <Clock className={`w-6 h-6 ${activeCount > 0 ? 'animate-pulse text-indigo-400' : ''}`} />
        {activeCount > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-gray-900 animate-ping" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            className="absolute right-0 mt-6 w-96 bg-card/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden z-[200]"
          >
            <div className="p-8 border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">AI Core Orchestrator</h3>
                {activeCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black animate-pulse">
                    {activeCount} RUNNING
                  </span>
                )}
              </div>
            </div>
            
            <div className="max-h-[28rem] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {jobs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                    <Sparkles size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest">No Active Tasks</p>
                    <p className="text-[10px] text-white/20 italic">The engine is currently idle.</p>
                  </div>
                </div>
              ) : (
                jobs.slice(0, 10).map(job => (
                  <motion.div 
                    layout
                    key={job.id} 
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                           <StatusIcon status={job.status} />
                        </div>
                        <span className="text-[11px] font-black text-white uppercase tracking-tight italic">
                          {job.taskType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full",
                        job.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" :
                        job.status === 'RUNNING' ? "bg-indigo-500/10 text-indigo-500" :
                        "bg-rose-500/10 text-rose-500"
                      )}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Trace ID</span>
                        <span className="text-[10px] font-mono text-white/50">{job.correlationId.substring(0, 12)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Start Time</span>
                        <p className="text-[10px] text-white/50 font-bold">
                          {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {jobs.length > 0 && (
              <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">
                  View All Processed Tasks
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusIcon: React.FC<{ status: AiJob['status'] }> = ({ status }) => {
  switch (status) {
    case 'RUNNING':
      return <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />;
    case 'COMPLETED':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case 'FAILED':
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    case 'DEAD_LETTER':
      return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-gray-500" />;
  }
};
