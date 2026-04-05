import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generatePostsApi, generateThreadApi, type GeneratedPost } from '../../../api/ai';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface CreationTabProps {
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  selectedAspectRatio: string;
  setSelectedAspectRatio: (ratio: string) => void;
  selectedPlatforms: ('FB' | 'IG' | 'LI' | 'X')[];
  setSelectedPlatforms: (platforms: ('FB' | 'IG' | 'LI' | 'X')[]) => void;
  subscription: ProfileResponse['subscription'] | null;
  onSuccess: () => void;
  onUpgradeRequired: (message: string) => void;
  onGenerated: (posts: GeneratedPost[], threads?: string[][]) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
  selectedVoiceMode: string;
  setSelectedVoiceMode: (mode: string) => void;
  AI_MODELS: ModelOption[];
}

const CreationTab: React.FC<CreationTabProps> = ({ 
  selectedModel, 
  setSelectedModel,
  selectedAspectRatio, 
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
  const [command, setCommand] = useState('');
  const [batchCount, setBatchCount] = useState(3);
  const [isThreadMode, setIsThreadMode] = useState(false);

  const handleGenerate = async () => {
    if (!command.trim()) {
      toast.error("Please describe your campaign goal first!");
      return;
    }

    if (isThreadMode) {
      handleGenerateThread();
      return;
    }

    setIsGenerating(true);
    toast.info("AI is crafting your posts...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generatePostsApi({
        command,
        count: batchCount,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio,
        voiceMode: selectedVoiceMode
      });
      onGenerated(response.posts);
      toast.success(`Successfully generated ${response.posts.length} posts!`);
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired(error.response.data?.message || "You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate posts.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateThread = async () => {
    setIsGenerating(true);
    toast.info("AI is weaving your thread...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      // Generate 2 alternative threads
      const promises = [0, 1].map(() => generateThreadApi({
        command,
        count: 1,
        modelId: selectedModel,
        voiceMode: selectedVoiceMode
      }));
      
      const results = await Promise.all(promises);
      onGenerated([], results);
      toast.success("Threads created!");
      onSuccess();
    } catch (error) {
      handleApiError(error, "Thread generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Platforms</label>
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
              <button 
                onClick={() => {
                  if (selectedPlatforms.length === 4) setSelectedPlatforms([]);
                  else setSelectedPlatforms(['FB', 'IG', 'LI', 'X']);
                }} 
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest", 
                  selectedPlatforms.length === 4 
                    ? "bg-background shadow-lg text-primary scale-[1.02] border border-white/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                ALL
              </button>
            </div>
          </div>

          {/* Thread Mode */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Thread Mode (X / Twitter)</label>
              <button 
                onClick={() => setIsThreadMode(!isThreadMode)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-300",
                  isThreadMode ? "bg-primary" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                  isThreadMode ? "left-7" : "left-1"
                )} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic px-1 opacity-60">Generate multi-tweet narratives for high engagement.</p>
          </div>

          {/* Batch Count */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intensity</label>
              <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                <span className="text-primary font-black text-sm">{batchCount}</span>
              </div>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={batchCount} 
              onChange={(e) => setBatchCount(parseInt(e.target.value))} 
              className="w-full h-1.5 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary" 
            />
            <p className="text-[9px] text-muted-foreground/40 italic px-1">Safety Limit: Max 20 posts per batch.</p>
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Model</label>
            <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
          </div>

          {/* Brand Voice Mode */}
          <div className="space-y-4 border-l-2 border-primary/20 pl-4 bg-primary/5 p-4 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
              <Sparkles size={12} /> Personalization
            </label>
            <div className="flex bg-secondary/20 p-1 rounded-xl border border-white/5">
              <select 
                value={selectedVoiceMode}
                onChange={(e) => setSelectedVoiceMode(e.target.value)}
                className="w-full bg-transparent text-xs font-black uppercase tracking-widest text-primary focus:ring-0 outline-none px-2"
              >
                <option value="STYLE_DNA">Style DNA (+2 Credits)</option>
                <option value="FULL_CONTEXT">Full Context (+5 Credits)</option>
              </select>
            </div>
            <p className="text-[10px] text-muted-foreground/60 italic px-1 leading-tight">
              {selectedVoiceMode === 'STYLE_DNA' ? 'Uses your Style DNA Persona (+2 cr).' : 
               'Analyzes raw samples + images (+5 cr).'}
            </p>
          </div>

          {/* Concept/Command */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Concept</label>
            <textarea value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Describe your goal..." className="w-full h-44 bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-lg font-medium focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner custom-scrollbar" />
          </div>

          {/* Credit Summary & Button */}
          <div className="space-y-4">
            {subscription && (
              <div className={cn("flex flex-col items-stretch p-5 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 5 ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Available</p>
                      <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(1)}</p>
                   </div>
                   <div className="text-right space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Est. Batch Cost</p>
                      <p className="text-xl font-black tracking-tighter text-amber-500">
                        -{(() => {
                           const modelCost = AI_MODELS.find(m => m.id === selectedModel)?.cost || 4.0;
                           const voiceCost = selectedVoiceMode === 'FULL_CONTEXT' ? 5.0 : 2.0;
                           return ((modelCost + voiceCost) * (isThreadMode ? 2 : batchCount)).toFixed(1);
                        })()}
                      </p>
                   </div>
                </div>
                
                <div className="h-px bg-primary/10 w-full" />
                
                <div className="flex justify-between items-center opacity-60">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Storage</p>
                   <p className="text-sm font-black tracking-tighter text-primary">
                     {subscription.storedImagesCount} / {subscription.maxStoredImages === -1 ? '∞' : subscription.maxStoredImages}
                   </p>
                </div>
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'AI IS COOKING...' : 'Generate Magic'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Wand2 size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Studio Output</h3>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
          <Sparkles size={48} className="text-primary opacity-40 animate-pulse" />
          <div className="max-w-md mx-auto space-y-3 px-6">
            <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic">AI Studio</h4>
            <p className="text-muted-foreground font-medium opacity-60">Describe your vision and watch AI manifest your brand identity.</p>
          </div>
          <Button size="lg" className="px-12 h-16 rounded-[1.5rem] text-xl font-black group shadow-2xl transition-all active:scale-95" onClick={handleGenerate}>Creative Session</Button>
        </div>
      </div>
    </div>
  );
};

export default CreationTab;
