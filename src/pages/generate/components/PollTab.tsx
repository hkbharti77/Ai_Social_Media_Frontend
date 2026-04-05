import React, { useState } from 'react';
import { List, Loader2, Sparkles, Trash2, Save, Send, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generatePollApi, type PollResponse, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus } from '../../../api/posts';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface PollTabProps {
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

const PollTab: React.FC<PollTabProps> = ({ 
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
  const [pollCommand, setPollCommand] = useState('');
  const [pollResult, setPollResult] = useState<PollResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!pollCommand.trim()) {
      toast.error("Please provide a concept for your poll.");
      return;
    }
    
    setIsGenerating(true);
    setPollResult(null);
    toast.info("AI is formulating your interactive poll...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generatePollApi({
        command: pollCommand,
        count: 1,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio
      });
      setPollResult(response);
      toast.success("AI Poll generated!");
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired("You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate poll.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!pollResult) return;
    setIsProcessing(true);
    try {
      await createPostApi({
        caption: pollResult.caption,
        hashtags: pollResult.hashtags.join(' '),
        imageUrl: pollResult.imageUrl || '',
        platform: selectedPlatforms.includes('LI') ? 'LINKEDIN' : (selectedPlatforms.includes('X') ? 'X' : 'FACEBOOK'),
        status: status,
        isPoll: true,
        pollContent: JSON.stringify(pollResult.options)
      });
      toast.success(status === PostStatus.DRAFT ? "Poll saved to drafts!" : "Poll scheduled!");
      setPollResult(null);
    } catch (error) {
      handleApiError(error, "Failed to save poll.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Poll Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <List size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Engagement Channels</label>
            <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
              {(['LI', 'X', 'FB'] as const).map((p) => (
                <button 
                  key={p} 
                  onClick={() => {
                    setSelectedPlatforms(
                      selectedPlatforms.includes(p) 
                        ? (selectedPlatforms.filter(x => x !== p) as any)
                        : ([...selectedPlatforms, p] as any)
                    );
                  }} 
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest", 
                    selectedPlatforms.includes(p) 
                      ? "bg-background shadow-lg text-primary scale-[1.02] border border-white/5" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Poll Concept Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Poll Topic</label>
             <textarea 
               value={pollCommand}
               onChange={(e) => setPollCommand(e.target.value)}
               placeholder="e.g. Which AI feature is most useful for startups?"
               className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all resize-none h-40 shadow-inner custom-scrollbar"
             />
             <p className="text-[10px] text-muted-foreground italic px-1 opacity-60">Describe the interactive concept.</p>
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Logic</label>
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Est. Poll Cost</p>
                      <p className="text-xl font-black tracking-tighter text-amber-500">
                        -{(() => {
                           const modelCost = AI_MODELS.find(m => m.id === selectedModel)?.cost || 4.0;
                           return modelCost.toFixed(1);
                        })()}
                      </p>
                   </div>
                </div>
                
                {subscription.monthlyCredits < 10 && (
                  <p className="text-[9px] font-bold text-rose-500/80 leading-tight bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
                    ⚠️ Credits low. Recharge soon to keep your audience engaged.
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'FORMULATING...' : 'Spark Interaction'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <List size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Poll Studio Output</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {pollResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col md:flex-row gap-8 pb-20 px-4">
               <div className="w-full md:w-1/2 flex flex-col space-y-6">
                  <div className="aspect-square bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group/poll">
                    {pollResult.imageUrl ? (
                      <img src={pollResult.imageUrl} alt="Poll Visual" className="w-full h-full object-cover group-hover/poll:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-black tracking-widest uppercase text-xs italic">Aesthetic missing</div>
                    )}
                  </div>
                  <div className="p-6 bg-secondary/10 rounded-[2rem] border-2 border-white/5 italic text-sm font-semibold opacity-60 text-center leading-relaxed">
                    AI Theme: {pollResult.imageSuggestion}
                  </div>
               </div>
               
               <div className="w-full md:w-1/2 space-y-8">
                 <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] space-y-8 shadow-2xl">
                   <div className="space-y-4">
                     <h4 className="text-xl font-black uppercase tracking-tighter italic text-primary leading-none">Interactive Logic</h4>
                     <p className="text-sm font-black italic tabular-nums leading-relaxed text-foreground/90">
                       "{pollResult.caption}"
                     </p>
                   </div>
                   
                   <div className="space-y-3">
                     {pollResult.options.map((option, idx) => (
                       <div key={idx} className="p-4 bg-background/60 backdrop-blur-md rounded-2xl border-2 border-white/5 text-xs font-black italic flex items-center gap-4 group/option hover:border-primary/30 transition-all cursor-default">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shadow-inner border border-primary/20 group-hover/option:scale-110 transition-transform">{idx+1}</div>
                          {option}
                          <CheckCircle2 className="ml-auto text-primary opacity-0 group-hover/option:opacity-100 transition-opacity" size={16} />
                       </div>
                     ))}
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-4">
                     <Button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isProcessing} variant="outline" className="h-16 rounded-2xl font-black uppercase tracking-widest border-2 border-primary/20 hover:bg-primary/5 text-primary">
                        <Save size={20} />
                        Draft
                     </Button>
                     <div className="flex gap-2">
                       <Button onClick={() => handleSave(PostStatus.SCHEDULED)} disabled={isProcessing} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                         {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
                         Post
                       </Button>
                       <Button onClick={() => setPollResult(null)} variant="ghost" className="h-16 w-16 rounded-2xl text-rose-500 hover:bg-rose-500/10">
                         <Trash2 size={24} />
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic leading-none">AI Poll Architect</h4>
                 <p className="text-muted-foreground font-medium opacity-60">AI will weave a high-engagement interactive poll to spark conversation with your followers.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollTab;
