import React, { useState } from 'react';
import { BarChart3, Loader2, Sparkles, Send, Trash2, Save, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateViralOpportunityApi, type ViralOpportunityResponse, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus } from '../../../api/posts';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface TrendsTabProps {
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

const TrendsTab: React.FC<TrendsTabProps> = ({ 
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
  const [listeningTopic, setListeningTopic] = useState('');
  const [viralResult, setViralResult] = useState<ViralOpportunityResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!listeningTopic.trim()) {
      toast.error("Please enter a topic to listen to.");
      return;
    }
    
    setIsGenerating(true);
    setViralResult(null);
    toast.info("AI is analyzing real-time social trends...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateViralOpportunityApi({ nicheTopic: listeningTopic });
      setViralResult(response);
      toast.success("Viral opportunity identified!");
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    } catch (error) {
      handleApiError(error, "Failed to find viral opportunities.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!viralResult) return;
    setIsSaving(true);
    try {
      await createPostApi({
        caption: viralResult.draftPost,
        hashtags: viralResult.hashtags.join(' '),
        imageUrl: '',
        platform: selectedPlatforms.includes('X') ? 'X' : (selectedPlatforms.includes('LI') ? 'LINKEDIN' : 'TWITTER'),
        status: status
      });
      toast.success(status === PostStatus.DRAFT ? "Draft saved!" : "Scheduled!");
      setViralResult(null);
    } catch (error) {
      handleApiError(error, "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Trend Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <BarChart3 size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Social Channels</label>
            <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
              {(['X', 'LI', 'IG'] as const).map((p) => (
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

          {/* Topic Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Niche to Listen</label>
             <div className="relative group/input">
                <input 
                  type="text"
                  value={listeningTopic}
                  onChange={(e) => setListeningTopic(e.target.value)}
                  placeholder="e.g. AI Marketing Trends..."
                  className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-4 text-xs font-bold focus:border-primary/50 outline-none transition-all pl-12 shadow-inner"
                />
                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" size={18} />
             </div>
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Intelligence</label>
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
                
                {subscription.monthlyCredits < 10 && (
                  <p className="text-[9px] font-bold text-rose-500/80 leading-tight bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
                    ⚠️ Credits low. Recharge soon to keep scanning viral peaks.
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'SCANNING...' : 'Find Buzz'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <BarChart3 size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Viral Intelligence</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {viralResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 pb-20">
              <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 lg:p-12 rounded-[3.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                   <Sparkles size={300} className="text-primary" />
                </div>

                 <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Identified Trend</span>
                      <div className="h-px bg-primary/20 flex-1" />
                   </div>
                   <h4 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{viralResult.trend}</h4>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="p-8 bg-background/40 backdrop-blur-md rounded-[2rem] border-2 border-white/5 space-y-4 shadow-inner group/card hover:border-primary/30 transition-all">
                       <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Viral Gap Analysis</p>
                       <p className="text-sm font-bold leading-relaxed italic opacity-80">{viralResult.viralGap}</p>
                    </div>
                    <div className="p-8 bg-background/40 backdrop-blur-md rounded-[2rem] border-2 border-white/5 space-y-4 shadow-inner group/card hover:border-primary/30 transition-all">
                       <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Recommended Response</p>
                       <p className="text-sm font-black italic tabular-nums leading-relaxed">"{viralResult.draftPost}"</p>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 relative z-10 pt-4">
                    <Button onClick={() => handleSave(PostStatus.SCHEDULED)} disabled={isSaving} className="flex-1 h-16 rounded-[1.25rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(var(--primary),0.3)]">
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
                      Execute Viral Post
                    </Button>
                    <Button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isSaving} variant="outline" className="flex-1 h-16 rounded-[1.25rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-primary/20 hover:bg-primary/5 text-primary">
                      <Save size={20} />
                      Save to Drafts
                    </Button>
                    <Button onClick={() => setViralResult(null)} variant="ghost" className="h-16 w-16 rounded-[1.25rem] text-rose-500 hover:bg-rose-500/10 transition-all">
                      <Trash2 size={24} />
                    </Button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic leading-none">Listening for Buzz...</h4>
                 <p className="text-muted-foreground font-medium opacity-60">Enter a topic and AI will scan for viral opportunities and draft a perfect response.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsTab;
