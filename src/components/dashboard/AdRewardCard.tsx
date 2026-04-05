import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, CheckCircle2, Tv } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { claimAdRewardApi, startAdSessionApi } from '../../api/credits';

interface AdRewardCardProps {
  dailyAdsViewed: number;
  onRewardClaimed: () => void;
  isSuperPro: boolean;
}

const AdRewardCard: React.FC<AdRewardCardProps> = ({ dailyAdsViewed, onRewardClaimed, isSuperPro }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isWatching && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isWatching && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [isWatching, timeLeft]);

  const handleStartWatching = async () => {
    if (dailyAdsViewed >= 10) {
      toast.error("Daily limit reached! Come back tomorrow.");
      return;
    }
    
    try {
      await startAdSessionApi();
      setIsWatching(true);
      setTimeLeft(30);
    } catch (err) {
      toast.error("Failed to sync ad session. Please try again.");
    }
  };

  const handleComplete = async () => {
    setIsWatching(false);
    setIsClaiming(true);
    try {
      const response = await claimAdRewardApi();
      toast.success(response.message, {
        icon: <CheckCircle2 size={16} className="text-emerald-500" />
      });
      onRewardClaimed();
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse.response?.data?.message || 'Failed to claim reward.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isSuperPro) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-2 border-amber-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute right-[-10px] top-[-10px] p-8 opacity-5 group-hover:opacity-10 transition-all pointer-events-none">
        <Tv size={180} className="text-amber-400 group-hover:scale-110" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/30">
                <Play size={32} fill="currentColor" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter uppercase text-amber-500">Reward Ads</h3>
                <p className="text-sm font-bold text-muted-foreground">Watch a 30s ad for 0.5 credits!</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-2">Daily Progress</p>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1.5 h-6 rounded-full transition-all duration-500",
                      i < dailyAdsViewed ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-amber-500/10"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs font-black text-amber-500 mt-2 tracking-tighter">{dailyAdsViewed} / 10</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isWatching ? (
            <motion.div 
              key="watching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="bg-black/60 backdrop-blur-xl h-24 rounded-[1.5rem] border-2 border-amber-500/30 flex flex-col items-center justify-center relative overflow-hidden">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-amber-500/20"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(30 - timeLeft) / 30 * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-4xl font-black text-amber-500 tracking-tighter">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Watching Transmission...</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <Button 
                onClick={handleStartWatching}
                disabled={isClaiming || dailyAdsViewed >= 10}
                className="w-full h-16 rounded-[1.5rem] bg-amber-500 hover:bg-amber-600 text-black font-black text-xl group active:scale-95 transition-all shadow-xl shadow-amber-500/20"
              >
                {isClaiming ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Play size={24} className="mr-3" fill="currentColor" />
                )}
                {dailyAdsViewed >= 10 ? "Limit Reached" : "Watch & Earn 0.5"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default AdRewardCard;
