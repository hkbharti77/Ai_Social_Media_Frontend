import React, { useState } from 'react';
import { Sparkles, Loader2, Layers, Trash2, Save, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateCarouselApi, type CarouselResponse, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus } from '../../../api/posts';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface CarouselTabProps {
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

const CarouselTab: React.FC<CarouselTabProps> = ({ 
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
  const [carouselCommand, setCarouselCommand] = useState('');
  const [carouselSlideCount, setCarouselSlideCount] = useState(3);
  const [carouselResult, setCarouselResult] = useState<CarouselResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!carouselCommand.trim()) {
      toast.error("Please provide a concept for the carousel.");
      return;
    }
    setIsGenerating(true);
    setCarouselResult(null);
    toast.info("AI is designing your carousel slides...", {
      icon: <Sparkles size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateCarouselApi({
        command: carouselCommand,
        slideCount: carouselSlideCount,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio,
        voiceMode: selectedVoiceMode
      });
      
      // Sync with global system if needed
      if (onGenerated) onGenerated([]); 
      
      setCarouselResult(response);
      toast.success(`Successfully generated a ${response.slides.length}-slide carousel!`);
      onSuccess();
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired("You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate carousel.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!carouselResult) return;
    setIsSaving(true);
    try {
      await createPostApi({
        caption: carouselResult.caption,
        hashtags: "#carousel #ai #marketing",
        imageUrl: carouselResult.slides[0]?.imageUrl || '',
        platform: selectedPlatforms.includes('IG') ? 'INSTAGRAM' : (selectedPlatforms.includes('LI') ? 'LINKEDIN' : 'FACEBOOK'),
        status: status,
        isCarousel: true,
        carouselContent: JSON.stringify(carouselResult.slides)
      });
      toast.success(status === PostStatus.DRAFT ? "Carousel saved to drafts!" : "Carousel scheduled!");
      setCarouselResult(null);
    } catch (error) {
      handleApiError(error, "Failed to save carousel.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Carousel Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Layers size={120} className="text-primary" />
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

          {/* Concept Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Carousel Goal</label>
             <textarea 
               value={carouselCommand}
               onChange={(e) => setCarouselCommand(e.target.value)}
               placeholder="e.g. 5 simple ways to improve your SEO with AI..."
               className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all resize-none h-40 shadow-inner custom-scrollbar"
             />
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Model</label>
            <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
          </div>

          {/* Slide Count Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Slide Count</label>
              <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                <span className="text-primary font-black text-sm">{carouselSlideCount}</span>
              </div>
            </div>
            <input type="range" min="2" max="10" value={carouselSlideCount} onChange={(e) => setCarouselSlideCount(parseInt(e.target.value))} className="w-full h-1.5 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary" />
            <p className="text-[9px] text-muted-foreground/40 italic px-1">Limit: Max 10 slides per carousel.</p>
          </div>

          {/* Credit Summary & Action Button */}
          <div className="pt-4 space-y-4">
            {subscription && (
              <div className={cn("flex flex-col items-stretch p-5 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 5 ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Available</p>
                      <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(1)}</p>
                   </div>
                   <div className="text-right space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Carousel Cost</p>
                      <p className="text-xl font-black tracking-tighter text-amber-500">
                        -{(() => {
                           const modelCost = AI_MODELS.find(m => m.id === selectedModel)?.cost || 4.0;
                           const voiceCost = selectedVoiceMode === 'FULL_CONTEXT' ? 5.0 : 2.0;
                           return ((modelCost * carouselSlideCount) + voiceCost).toFixed(1);
                        })()}
                      </p>
                   </div>
                </div>
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'DESIGNING...' : 'Manifest Carousel'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Layers size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Studio Output</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {carouselResult ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-4">
                 <div className="space-y-2">
                   <h4 className="text-3xl font-black tracking-tighter uppercase italic text-foreground leading-none">Carousel Collection</h4>
                   <p className="text-sm font-medium text-muted-foreground italic opacity-70">"{carouselResult.caption}"</p>
                 </div>
                 <div className="flex gap-3">
                   <Button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isSaving} variant="outline" className="h-14 px-8 rounded-2xl border-2 border-primary/20 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 transition-all">
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2" />}
                      Save Draft
                   </Button>
                   <Button onClick={() => setCarouselResult(null)} variant="ghost" className="h-14 w-14 rounded-2xl text-rose-500 hover:bg-rose-500/10">
                      <Trash2 size={24} />
                   </Button>
                 </div>
              </div>

              <div className="flex gap-6 overflow-x-auto p-4 no-scrollbar snap-x snap-mandatory">
                 {carouselResult.slides.map((slide, idx) => (
                   <div key={idx} className="min-w-[320px] md:min-w-[400px] bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] overflow-hidden snap-center flex flex-col shadow-2xl group/slide">
                      <div className="aspect-square bg-secondary/30 relative overflow-hidden">
                         <img src={slide.imageUrl} alt={`Slide ${idx+1}`} className="w-full h-full object-cover group-hover/slide:scale-110 transition-transform duration-700" />
                         <div className="absolute top-6 left-6 bg-primary text-white font-black px-5 py-2 rounded-2xl shadow-[0_10px_20px_rgba(var(--primary),0.3)] text-xs uppercase tracking-widest">
                            Slide {slide.slideNumber}
                         </div>
                      </div>
                      <div className="p-10 flex-1 flex flex-col justify-center bg-gradient-to-b from-transparent to-black/20">
                         <p className="text-xl font-bold text-center leading-relaxed italic text-foreground/90 tabular-nums">"{slide.slideText}"</p>
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic">Carousel Designer</h4>
                 <p className="text-muted-foreground font-medium opacity-60">AI will weave a high-engagement visual narrative across multiple slides.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselTab;
