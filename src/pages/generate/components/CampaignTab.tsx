import React, { useState } from 'react';
import { Sparkles, Save, Loader2, Target, RefreshCcw, Layout, Image as ImageIcon, Smartphone } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateCampaignApi, type CampaignResponse, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus, type Post } from '../../../api/posts';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface CampaignTabProps {
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

const CampaignTab: React.FC<CampaignTabProps> = ({ 
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
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignResult, setCampaignResult] = useState<CampaignResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!campaignGoal.trim()) {
      toast.error("Please describe your campaign goal!");
      return;
    }
    
    setIsGenerating(true);
    setCampaignResult(null);
    toast.info("AI is strategizing your full 360° campaign...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateCampaignApi({
        goal: campaignGoal,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio,
        voiceMode: selectedVoiceMode
      });
      setCampaignResult(response);
      toast.success("Full Coordinated Campaign Generated!");
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired(error.response.data?.message || "You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate campaign.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDrafts = async () => {
    if (!campaignResult) return;
    
    setIsSaving(true);
    try {
      await toast.promise(async () => {
        const promises: Promise<Post>[] = [];
        
        // Save Posts
        campaignResult.posts.forEach((post) => {
          promises.push(createPostApi({
            caption: post.caption,
            hashtags: post.hashtags.join(' '),
            imageUrl: post.imageUrl || '',
            platform: selectedPlatforms.includes('FB') ? 'FACEBOOK' : 'LINKEDIN',
            status: PostStatus.DRAFT
          }));
        });
        
        // Save Stories
        campaignResult.stories.forEach((story) => {
          promises.push(createPostApi({
            caption: story.caption,
            hashtags: story.hashtags.join(' '),
            imageUrl: story.imageUrl || '',
            platform: 'INSTAGRAM',
            status: PostStatus.DRAFT,
            isStory: true
          }));
        });
        
        // Save Reel
        promises.push(createPostApi({
          caption: campaignResult.reel.caption,
          hashtags: campaignResult.reel.hashtags.join(' '),
          imageUrl: campaignResult.reel.imageUrl || '',
          platform: 'INSTAGRAM',
          status: PostStatus.DRAFT,
          isReel: true,
          videoScript: campaignResult.reel.videoScript
        }));
        
        await Promise.all(promises);
      }, {
        loading: 'Saving campaign assets to drafts...',
        success: 'All 10+ assets saved to drafts!',
        error: 'Failed to save some campaign assets.'
      });
      setCampaignResult(null);
    } catch (error) {
       console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Campaign Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Target size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Campaign Channels</label>
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

          {/* Goal Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Campaign Goal</label>
             <textarea 
               value={campaignGoal}
               onChange={(e) => setCampaignGoal(e.target.value)}
               placeholder="e.g. Launch a new eco-friendly collection for summer with limited time 20% discount..."
               className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all resize-none h-40 shadow-inner custom-scrollbar"
             />
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">AI Intelligence</label>
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">
                  {(() => {
                    const costs: Record<string, number> = {
                      'imagen-4-fast': 30,
                      'imagen-4-standard': 50,
                      'imagen-4-ultra': 60,
                      'gemini-3.1-flash-image': 40,
                      'gemini-3-pro-image': 70,
                      'gemini-2.5-flash-image': 20
                    };
                    const baseCost = costs[selectedModel] || 20;
                    const voiceCost = selectedVoiceMode === 'FULL_CONTEXT' ? 5.0 : 2.0;
                    return (baseCost + voiceCost).toFixed(0);
                  })()} Credits / Bundle
                </span>
              </div>
            </div>
            <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Target size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'STRATEGIZING...' : 'Launch Strategy'}</span>
              </div>
            </Button>
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
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">360° Studio Output</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {campaignResult ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
              <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Strategy Summary</span>
                       <h4 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none italic">{campaignResult.visualTheme}</h4>
                    </div>
                    <Button onClick={handleSaveToDrafts} disabled={isSaving} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center gap-3 bg-primary/90 hover:bg-primary">
                       {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                       Save All to Drafts
                    </Button>
                 </div>
                 
                 <div className="p-8 bg-background/40 backdrop-blur-md rounded-[2rem] border-2 border-white/5 italic text-sm font-semibold leading-relaxed text-foreground/80 shadow-inner">
                    "{campaignResult.strategySummary}"
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Post Cards */}
                 {campaignResult.posts.slice(0, 4).map((post, idx) => (
                    <div key={idx} className="bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl group/post">
                       <div className="aspect-square relative overflow-hidden">
                          <img src={post.imageUrl || ''} alt="Campaign Post" className="w-full h-full object-cover group-hover/post:scale-105 transition-transform duration-700" />
                          <div className="absolute top-6 left-6 bg-primary text-white font-black px-4 py-1.5 rounded-xl shadow-lg text-[10px] uppercase tracking-widest">
                             POST {idx + 1}
                          </div>
                       </div>
                       <div className="p-6">
                          <p className="text-xs font-bold line-clamp-3 italic opacity-80 leading-relaxed tabular-nums">"{post.caption}"</p>
                       </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <RefreshCcw size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic leading-none">Campaign Headquarters</h4>
                 <p className="text-muted-foreground font-medium opacity-60">Describe your goal and let AI create a 360° marketing plan with posts, stories, and reels.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignTab;
