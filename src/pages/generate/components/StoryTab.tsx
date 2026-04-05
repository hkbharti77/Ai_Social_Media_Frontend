import React, { useState } from 'react';
import { Sparkles, Loader2, Trash2, Save, RefreshCcw, ImageIcon, LayoutGrid, Smartphone, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateStoryApi, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus } from '../../../api/posts';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface StoryTabProps {
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
  selectedVoiceMode: string;
  setSelectedVoiceMode: (mode: string) => void;
  AI_MODELS: ModelOption[];
}

const StoryTab: React.FC<StoryTabProps> = ({ 
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
  selectedVoiceMode,
  setSelectedVoiceMode,
  AI_MODELS
}) => {
  const [storyCommand, setStoryCommand] = useState('');
  const [storyResult, setStoryResult] = useState<GeneratedPost | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!storyCommand.trim()) {
      toast.error("Please provide a concept for your story.");
      return;
    }
    
    setIsGenerating(true);
    setStoryResult(null);
    toast.info("AI is visualizing your story narratives...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateStoryApi({
        command: storyCommand,
        count: 1,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio,
        voiceMode: selectedVoiceMode
      });
      if (response.posts && response.posts.length > 0) {
        setStoryResult(response.posts[0]);
        toast.success("Vertical story generated!");
      }
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired(error.response.data?.message || "You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate story.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!storyResult) return;
    setIsProcessing(true);
    try {
      await createPostApi({
        caption: storyResult.caption,
        hashtags: storyResult.hashtags.join(' '),
        imageUrl: storyResult.imageUrl || '',
        platform: selectedPlatforms.includes('IG') ? 'INSTAGRAM' : 'FACEBOOK',
        status: status,
        isStory: true,
        scheduledAt: status === PostStatus.SCHEDULED ? new Date(Date.now() + 86400000).toISOString().split('.')[0] : undefined
      });
      toast.success(status === PostStatus.DRAFT ? "Story saved to drafts!" : "Story scheduled!");
      setStoryResult(null);
    } catch (error) {
      handleApiError(error, "Failed to save story.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Story Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Smartphone size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Engagement Channels</label>
            <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
              {(['IG', 'FB'] as const).map((p) => (
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

          {/* Brand Voice Mode */}
          <div className="space-y-4 border-l-2 border-primary/20 pl-4 bg-primary/5 p-4 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
              <Sparkles size={12} /> Personalization
            </label>
            <div className="flex bg-secondary/20 p-1 rounded-xl border border-white/5">
              {[
                { id: 'STYLE_DNA', label: 'DNA' },
                { id: 'FULL_CONTEXT', label: 'Full' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedVoiceMode(m.id)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                    selectedVoiceMode === m.id ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Story Concept Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Story Concept</label>
             <textarea 
               value={storyCommand}
               onChange={(e) => setStoryCommand(e.target.value)}
               placeholder="e.g. Behind the scenes of a product launch..."
               className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all resize-none h-40 shadow-inner custom-scrollbar"
             />
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '1:1', label: 'Feed', icon: LayoutGrid },
                { id: '9:16', label: 'Story', icon: Smartphone },
                { id: '16:9', label: 'Wide', icon: ImageIcon }
              ].map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedAspectRatio(ratio.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group/btn",
                    selectedAspectRatio === ratio.id 
                      ? "border-primary bg-primary/10 text-primary shadow-lg scale-105" 
                      : "border-white/5 bg-secondary/20 text-muted-foreground hover:border-white/10"
                  )}
                >
                  <ratio.icon size={20} className={cn(selectedAspectRatio === ratio.id ? "animate-pulse" : "")} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Select */}
          <div className="space-y-4 pt-4 border-t border-white/5">
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Est. Story Cost</p>
                      <p className="text-xl font-black tracking-tighter text-amber-500">
                        -{(() => {
                           const modelCost = AI_MODELS.find(m => m.id === selectedModel)?.cost || 4.0;
                           const voiceCost = selectedVoiceMode === 'FULL_CONTEXT' ? 5.0 : (selectedVoiceMode === 'STYLE_DNA' ? 2.0 : 0.0);
                           return (modelCost + voiceCost).toFixed(1);
                        })()}
                      </p>
                   </div>
                </div>
                
                {subscription.monthlyCredits < 10 && (
                  <p className="text-[9px] font-bold text-rose-500/80 leading-tight bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
                    ⚠️ Credits low. Recharge soon to avoid interruptions in your story studio.
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-fuchsia-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'VISUALIZING...' : 'Create Story'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Smartphone size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Vertical Studio</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {storyResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col md:flex-row gap-8 pb-20 px-4">
               <div className="w-full md:w-1/2 aspect-[9/16] bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative group/story">
                 <img src={storyResult.imageUrl || ''} alt="Story Preview" className="w-full h-full object-cover group-hover/story:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-white text-sm font-black italic tabular-nums leading-relaxed opacity-0 group-hover/story:opacity-100 transition-opacity duration-300">
                       "{storyResult.caption}"
                    </p>
                 </div>
               </div>
               
               <div className="w-full md:w-1/2 space-y-8 flex flex-col justify-center">
                 <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] space-y-8 shadow-2xl">
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black uppercase tracking-tighter italic text-primary leading-none">Story Narrative</h4>
                       <div className="p-6 bg-background/60 backdrop-blur-md rounded-[2rem] border-2 border-white/5 shadow-inner">
                          <p className="text-sm font-black italic leading-relaxed text-foreground/90">
                             {storyResult.caption}
                          </p>
                          <div className="mt-6 flex flex-wrap gap-2">
                             {storyResult.hashtags.map((tag, i) => (
                                <span key={i} className="text-[10px] font-black italic text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">#{tag}</span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3 pt-4">
                       <Button onClick={() => handleSave(PostStatus.SCHEDULED)} disabled={isProcessing} className="w-full h-16 rounded-[1.25rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(var(--primary),0.3)]">
                         {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : <Calendar size={20} />}
                         Schedule Story
                       </Button>
                       <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isProcessing} variant="outline" className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest border-2 border-primary/20 hover:bg-primary/5 text-primary">
                             <Save size={20} />
                             Draft
                          </Button>
                          <Button onClick={() => setStoryResult(null)} variant="ghost" className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10">
                             <Trash2 size={24} />
                          </Button>
                       </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <Smartphone size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic leading-none">Dreaming of Verticals</h4>
                 <p className="text-muted-foreground font-medium opacity-60">AI will architect a high-engagement vertical story sequence for your brand.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryTab;
