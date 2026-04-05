import React, { useState } from 'react';
import { Sparkles, Loader2, ImageIcon, Trash2, Save, Send, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateMemeApi, type MemeResponse, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus } from '../../../api/posts';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface MemeTabProps {
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

const MemeTab: React.FC<MemeTabProps> = ({ 
  selectedModel, 
  setSelectedModel,
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
  const [memeCommand, setMemeCommand] = useState('');
  const [memeResult, setMemeResult] = useState<MemeResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMemeResult(null);
    toast.info("AI is designing your meme...", {
      icon: <Sparkles size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateMemeApi({ 
          modelId: selectedModel, 
          command: memeCommand,
          voiceMode: selectedVoiceMode
      });
      if (onGenerated) onGenerated([]); // Sync global state
      setMemeResult(response);
      toast.success("Meme generated successfully!");
      onSuccess();
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired("You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate meme.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!memeResult) return;
    setIsProcessing(true);
    try {
      await createPostApi({
        caption: memeResult.caption,
        hashtags: "#meme #ai #socialmedia",
        imageUrl: memeResult.imageUrl,
        platform: selectedPlatforms.includes('IG') ? 'INSTAGRAM' : (selectedPlatforms.includes('FB') ? 'FACEBOOK' : 'LINKEDIN'),
        status: status
      });
      toast.success(status === PostStatus.DRAFT ? "Meme saved to drafts!" : "Meme scheduled!");
      setMemeResult(null);
    } catch (error) {
      handleApiError(error, "Failed to save meme.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Meme Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <ImageIcon size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Target Platforms</label>
            <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
              {(['FB', 'IG', 'LI'] as const).map((p) => (
                <button 
                  key={p} 
                  onClick={() => {
                    setSelectedPlatforms(
                      selectedPlatforms.includes(p) 
                        ? selectedPlatforms.filter(x => x !== p) 
                        : [...selectedPlatforms, p]
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

          {/* Prompt Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Meme Concept</label>
             <textarea 
               value={memeCommand}
               onChange={(e) => setMemeCommand(e.target.value)}
               placeholder="e.g. When the client asks for a 'quick' 5-minute change that takes 4 hours..."
               className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all resize-none h-40 shadow-inner custom-scrollbar"
             />
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Model</label>
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Est. Meme Cost</p>
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
                    ⚠️ Credits low. Recharge soon to keep the humor flowing.
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'BREWING HUMOR...' : 'Ignite Meme'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <ImageIcon size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Studio Output</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {memeResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center space-y-8 pb-20 px-4">
              <div className="w-full max-w-lg aspect-square bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group/meme">
                <img src={memeResult.imageUrl} alt="AI Meme" className="w-full h-full object-cover group-hover/meme:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/meme:opacity-100 transition-opacity" />
              </div>
              
              <div className="w-full max-w-lg space-y-6">
                <div className="p-8 bg-card/40 backdrop-blur-xl rounded-[2rem] border-2 border-white/5 shadow-inner">
                  <p className="text-xl font-black italic text-center leading-tight tracking-tight">
                    "{memeResult.caption}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isProcessing} variant="outline" className="h-16 rounded-2xl font-black uppercase tracking-widest border-2 border-primary/20 hover:bg-primary/5 flex items-center justify-center gap-3 text-primary">
                    <Save size={20} />
                    Draft
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(PostStatus.SCHEDULED)} disabled={isProcessing} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(var(--primary),0.3)]">
                      {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      Post
                    </Button>
                    <Button onClick={() => setMemeResult(null)} variant="ghost" className="h-16 w-16 rounded-2xl text-rose-500 hover:bg-rose-500/10">
                      <Trash2 size={24} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic">Meme Architect</h4>
                 <p className="text-muted-foreground font-medium opacity-60">AI will soon craft a high-engagement viral asset for your brand.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeTab;
