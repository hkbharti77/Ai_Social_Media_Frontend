import React, { useState } from 'react';
import { Target, Loader2, Sparkles, Brain, Lightbulb, ChevronRight, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateGapAnalysisApi, generateContentStrategyApi, type GapIdea, type GeneratedPost } from '../../../api/ai';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface StrategyTabProps {
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  selectedAspectRatio: string;
  setSelectedAspectRatio: (ratio: string) => void;
  selectedPlatforms: ('FB' | 'IG' | 'LI' | 'X')[];
  setSelectedPlatforms: (platforms: ('FB' | 'IG' | 'LI' | 'X')[]) => void;
  subscription: ProfileResponse['subscription'] | null;
  onSuccess: () => void;
  onUpgradeRequired: (message: string) => void;
  onGenerated: (posts: GeneratedPost[]) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
  AI_MODELS: ModelOption[];
}

const StrategyTab: React.FC<StrategyTabProps> = ({ 
  selectedModel, 
  setSelectedModel,
  selectedAspectRatio,
  setSelectedAspectRatio,
  selectedPlatforms,
  setSelectedPlatforms,
  subscription,
  onSuccess,
  onUpgradeRequired,
  onGenerated,
  isGenerating,
  setIsGenerating,
  AI_MODELS
}) => {
  const [gapIdeas, setGapIdeas] = useState<GapIdea[]>([]);
  const [strategyTab, setStrategyTab] = useState<'b2b' | 'personal'>('personal');
  const [gapForm, setGapForm] = useState({
    businessType: '',
    city: '',
    targetAudience: ''
  });

  const handleGapAnalysis = async () => {
    if (!gapForm.businessType || !gapForm.city) {
      toast.error("Please fill in business details.");
      return;
    }
    setIsGenerating(true);
    setGapIdeas([]);
    toast.info("AI is surveying the landscape for strategic gaps...", {
        icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });
    try {
      const response = await generateGapAnalysisApi(gapForm);
      setGapIdeas(response.ideas);
      toast.success("Strategic insights discovered!");
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    } catch (error) {
      handleApiError(error, "Failed to analyze content gaps.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentStrategy = async () => {
    setIsGenerating(true);
    setGapIdeas([]);
    toast.info("AI is architecting your personalized roadmap...", {
        icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });
    try {
      const response = await generateContentStrategyApi();
      setGapIdeas(response.ideas);
      toast.success("Strategic insights generated from your profile!");
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    } catch (error) {
      handleApiError(error, "Failed to analyze content strategy.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Strategy Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Target size={120} className="text-primary" />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Engine Mode</label>
             <div className="flex bg-secondary/30 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
                <button 
                    onClick={() => setStrategyTab('personal')}
                    className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", strategyTab === 'personal' ? "bg-background shadow-lg text-primary scale-105 border border-white/5" : "text-muted-foreground hover:bg-white/5")}
                >
                    Profile AI
                </button>
                <button 
                    onClick={() => setStrategyTab('b2b')}
                    className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", strategyTab === 'b2b' ? "bg-background shadow-lg text-primary scale-105 border border-white/5" : "text-muted-foreground hover:bg-white/5")}
                >
                    Niche Research
                </button>
             </div>
          </div>

          <div className="space-y-6">
            {strategyTab === 'personal' ? (
              <div className="space-y-8">
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-[1.5rem] space-y-4 shadow-inner relative overflow-hidden">
                  <div className="bg-primary/20 p-3 rounded-full inline-block relative z-10">
                    <Brain className="text-primary" size={24} />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tighter italic leading-tight text-foreground relative z-10">Custom Growth Strategy</h4>
                  <p className="text-xs font-semibold text-muted-foreground/80 leading-relaxed relative z-10">AI will analyze your brand profile and competitor data to create a custom content roadmap.</p>
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <Target size={80} />
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Logic</label>
                    <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
                </div>

                {/* Credit Summary & Action */}
                <div className="space-y-6 pt-4">
                  {subscription && (
                    <div className={cn("flex flex-col items-stretch p-5 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 15 ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                      <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Available</p>
                            <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 15 ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(1)}</p>
                         </div>
                         <div className="text-right space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Fixed Cost</p>
                            <p className="text-xl font-black tracking-tighter text-amber-500">-15.0</p>
                         </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleContentStrategy} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-3 w-full">
                      {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                      <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'ARCHITECTING...' : 'Build Roadmap'}</span>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Business Niche</label>
                      <div className="relative group/input">
                         <input type="text" value={gapForm.businessType} onChange={e => setGapForm({...gapForm, businessType: e.target.value})} placeholder="e.g. Specialty Coffee..." className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-4 text-xs font-bold focus:border-primary/50 outline-none transition-all pl-12 shadow-inner" />
                         <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" size={18} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Target Location</label>
                      <input type="text" value={gapForm.city} onChange={e => setGapForm({...gapForm, city: e.target.value})} placeholder="e.g. New York, London..." className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-4 text-xs font-bold focus:border-primary/50 outline-none transition-all px-6 shadow-inner" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Ideal Audience</label>
                      <input type="text" value={gapForm.targetAudience} onChange={e => setGapForm({...gapForm, targetAudience: e.target.value})} placeholder="e.g. Tech Founders..." className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-4 text-xs font-bold focus:border-primary/50 outline-none transition-all px-6 shadow-inner" />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Strategic AI</label>
                    <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
                </div>

                {/* Credit Summary & Action */}
                <div className="space-y-6 pt-4">
                  {subscription && (
                    <div className={cn("flex flex-col items-stretch p-5 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 10 ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                      <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Available</p>
                            <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 10 ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(1)}</p>
                         </div>
                         <div className="text-right space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Fixed Cost</p>
                            <p className="text-xl font-black tracking-tighter text-amber-500">-10.0</p>
                         </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleGapAnalysis} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                     <div className="relative flex items-center justify-center gap-3 w-full">
                       {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Target size={28} />}
                       <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'ANALYZING...' : 'Find Market Gaps'}</span>
                     </div>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Target size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Gap Intelligence</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {gapIdeas.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-20">
              {gapIdeas.map((idea, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-8 lg:p-10 bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] hover:border-primary/30 transition-all flex flex-col md:flex-row gap-10 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                     <Lightbulb size={240} />
                  </div>
                  
                  <div className="w-full md:w-4/5 space-y-6 relative z-10">
                     <div className="space-y-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary p-2 bg-primary/10 rounded-lg border border-primary/20">Strategic Insight #{idx+1}</span>
                       <h4 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none italic tabular-nums">{idea.topic}</h4>
                     </div>
                     <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed max-w-2xl">{idea.whyItWorks}</p>
                     
                     <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Sample Narrative</span>
                        <div className="p-6 bg-background/60 backdrop-blur-md rounded-[1.5rem] border-2 border-white/5 italic text-sm font-semibold leading-relaxed text-foreground/90 shadow-inner group-hover:border-primary/10 transition-colors">
                           "{idea.sampleCaption}"
                        </div>
                     </div>
                  </div>

                  <div className="w-full md:w-1/5 flex items-end justify-end relative z-10">
                     <Button variant="ghost" className="rounded-2xl w-16 h-16 p-0 bg-primary/10 hover:bg-primary hover:text-white transition-all shadow-xl group-hover:scale-110">
                        <ChevronRight size={32} strokeWidth={3} />
                     </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic leading-none">Strategic Deadzone</h4>
                 <p className="text-muted-foreground font-medium opacity-60">Architect a high-intent roadmap by discovering exactly where your competitors are missing the mark.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyTab;
