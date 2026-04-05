import React, { useState } from 'react';
import { Link2, Loader2, Sparkles, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { repurposeUrlApi, type GeneratedPost } from '../../../api/ai';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface RepurposeTabProps {
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

const RepurposeTab: React.FC<RepurposeTabProps> = ({ 
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
  const [repurposeUrl, setRepurposeUrl] = useState('');
  const [repurposeCount, setRepurposeCount] = useState(5);

  const handleRepurpose = async () => {
    if (!repurposeUrl.trim()) {
      toast.error("Please enter a valid URL to repurpose.");
      return;
    }
    setIsGenerating(true);
    toast.info("AI is extracting and repurposing content...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await repurposeUrlApi({
        url: repurposeUrl,
        modelId: selectedModel,
        count: repurposeCount,
        aspectRatio: selectedAspectRatio
      });
      onGenerated(response.posts);
      toast.success(`Successfully crafted ${response.posts.length} posts!`);
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired("You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to repurpose content.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Alchemy Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Link2 size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Target Platforms</label>
            <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
              {(['FB', 'IG', 'LI', 'X'] as const).map((p) => (
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

          {/* URL Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Source Alchemy</label>
             <div className="relative group/input">
                <input 
                  type="url"
                  value={repurposeUrl}
                  onChange={(e) => setRepurposeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-4 text-xs font-bold focus:border-primary/50 outline-none transition-all pl-12 shadow-inner"
                />
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
             </div>
             <p className="text-[10px] text-muted-foreground italic px-1 opacity-60">Paste a link to extract value.</p>
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Model</label>
            <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
          </div>

          {/* Intensity Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Extraction Depth</label>
              <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                <span className="text-primary font-black text-sm">{repurposeCount}</span>
              </div>
            </div>
            <input type="range" min="1" max="10" value={repurposeCount} onChange={(e) => setRepurposeCount(parseInt(e.target.value))} className="w-full h-1.5 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary" />
          </div>

          {/* Credit Summary & Action */}
          <div className="space-y-6 pt-4">
            {subscription && (
              <div className={cn("flex flex-col items-stretch p-5 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < (repurposeCount * 4) ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Available</p>
                      <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < (repurposeCount * 4) ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(1)}</p>
                   </div>
                   <div className="text-right space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Est. Batch Cost</p>
                      <p className="text-xl font-black tracking-tighter text-amber-500">
                        -{(() => {
                           const modelCost = AI_MODELS.find(m => m.id === selectedModel)?.cost || 4.0;
                           return (modelCost * repurposeCount).toFixed(1);
                        })()}
                      </p>
                   </div>
                </div>
                
                {subscription.monthlyCredits < (repurposeCount * 4) && (
                  <p className="text-[9px] font-bold text-rose-500/80 leading-tight bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
                    ⚠️ Credits low. Reduce depth or recharge to alchemize more content.
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleRepurpose} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'ALCHEMIZING...' : 'Transmute Link'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Link2 size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Alchemy Output</h3>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
          <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
          <div className="max-w-md mx-auto space-y-3 px-6">
            <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic">Content Alchemist</h4>
            <p className="text-muted-foreground font-medium opacity-60">Paste a URL and let AI transmute existing knowledge into viral content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepurposeTab;
