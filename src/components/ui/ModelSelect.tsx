import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModelOption {
  id: string;
  name: string;
  cost: number;
  tier: number;
  icon: any;
  desc: string;
}

interface ModelSelectProps {
  options: ModelOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  userTierOrdinal: number;
  purchasedModelIds?: string[];
  className?: string;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({
  options,
  selectedId,
  onSelect,
  userTierOrdinal,
  purchasedModelIds = [],
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedModel = options.find(m => m.id === selectedId) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative z-30", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-secondary/30 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-secondary/50 transition-all group",
          isOpen && "ring-2 ring-primary/50 border-primary/20"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
            <selectedModel.icon size={20} />
          </div>
          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-xs font-black text-foreground truncate w-full tracking-tight italic uppercase">{selectedModel.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold text-primary tracking-tighter uppercase">{selectedModel.cost} Credits</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[9px] font-medium text-muted-foreground truncate opacity-60 italic">{selectedModel.desc}</span>
            </div>
          </div>
        </div>
        <ChevronDown size={16} className={cn("text-muted-foreground group-hover:text-primary transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-full left-0 right-0 mt-3 bg-card/95 backdrop-blur-2xl border-2 border-white/5 p-2 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 space-y-1 overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {options.map((model) => {
                const isLocked = userTierOrdinal < model.tier && !purchasedModelIds.includes(model.id);
                const isSelected = selectedId === model.id;

                return (
                  <button
                    key={model.id}
                    disabled={isLocked}
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3.5 rounded-xl flex items-center justify-between group/item transition-all relative overflow-hidden",
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-muted-foreground",
                      isLocked && "opacity-40 grayscale cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        isSelected ? "bg-primary text-white shadow-lg" : "bg-secondary/50"
                      )}>
                        <model.icon size={18} />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <div className="flex items-center gap-2">
                           <span className="text-[11px] font-black uppercase italic tracking-tight">{model.name}</span>
                           {isLocked && <Lock size={10} className="text-rose-500" />}
                        </div>
                        <span className="text-[9px] font-medium opacity-60">{model.desc}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-black tracking-tighter">{model.cost}</span>
                      <span className="text-[7px] font-bold uppercase opacity-60">Credits</span>
                    </div>

                    {isLocked && (
                      <div className="absolute inset-x-0 bottom-0 py-0.5 bg-rose-500 text-white text-[7px] font-black uppercase text-center tracking-[0.2em] transform translate-y-full group-hover/item:translate-y-0 transition-transform">
                        Upgrade Tier
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
