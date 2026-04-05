import React, { useState } from 'react';
import { Smartphone, Loader2, Sparkles, Trash2, Save, Send, CloudUpload, CheckCircle2, Video, RefreshCcw, Film } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generateReelApi, type ReelResponse, type GeneratedPost } from '../../../api/ai';
import { createPostApi, PostStatus } from '../../../api/posts';
import axiosInstance from '../../../api/axios';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';

interface ReelTabProps {
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

const ReelTab: React.FC<ReelTabProps> = ({ 
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
  const [reelCommand, setReelCommand] = useState('');
  const [reelResult, setReelResult] = useState<ReelResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isUploadingReel, setIsUploadingReel] = useState(false);

  const handleGenerate = async () => {
    if (!reelCommand.trim()) {
      toast.error("Please provide a concept for your reel.");
      return;
    }
    
    setIsGenerating(true);
    setReelResult(null);
    toast.info("AI is writing your reel script & designing a thumbnail...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateReelApi({
        command: reelCommand,
        count: 1,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio,
        voiceMode: selectedVoiceMode
      });
      setReelResult(response);
      toast.success("AI Reel Script generated!");
      if (onGenerated) onGenerated([]); // Sync global state
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 402) {
        onUpgradeRequired("You've reached your credit limit!");
      } else {
        handleApiError(error, "Failed to generate reel script.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error("Please upload a valid video file (.mp4, .mov, etc.)");
      return;
    }

    setIsUploadingReel(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post<{ url: string }>('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedVideoUrl(response.data.url);
      toast.success("Video uploaded successfully! Pair it with your AI assets now.");
    } catch (error) {
      handleApiError(error, "Failed to upload video.");
    } finally {
      setIsUploadingReel(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!reelResult) return;
    setIsProcessing(true);
    try {
      await createPostApi({
        caption: reelResult.caption,
        hashtags: reelResult.hashtags.join(' '),
        imageUrl: reelResult.imageUrl || '',
        videoUrl: uploadedVideoUrl || undefined,
        platform: 'INSTAGRAM',
        status: status,
        isReel: true,
        videoScript: reelResult.videoScript
      });
      toast.success(status === PostStatus.DRAFT ? "Reel saved to drafts!" : "Reel scheduled!");
      setReelResult(null);
      setUploadedVideoUrl(null);
    } catch (error) {
      handleApiError(error, "Failed to save reel.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden">
      {/* --- Left Column: Reel Controls --- */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none">
            <Film size={120} className="text-primary" />
          </div>

          {/* Platform Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Social Channels</label>
            <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
              {(['IG', 'FB', 'LI', 'X'] as const).map((p) => (
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

          {/* Reel Concept Input */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Reel Concept</label>
             <textarea 
               value={reelCommand}
               onChange={(e) => setReelCommand(e.target.value)}
               placeholder="e.g. 3 secrets about growing a business that nobody tells you..."
               className="w-full bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all resize-none h-40 shadow-inner custom-scrollbar"
             />
          </div>

          {/* Model Select */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Script Model</label>
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans text-right">Est. Reel Cost</p>
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
                    ⚠️ Credits low. Recharge soon to avoid interruptions in your viral studio.
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full py-8 lg:py-10 text-xl lg:text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-rose-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-3 w-full">
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Film size={28} />}
                <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'SCRIPTING...' : 'Ignite Reel'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Studio Theme --- */}
      <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
        <div className="flex items-center gap-6 px-4 shrink-0">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <Video size={28} />
          </div>
          <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
          <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Production Output</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {reelResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col md:flex-row gap-8 pb-20 px-4">
               <div className="w-full md:w-1/2 flex flex-col space-y-6">
                  <div className="aspect-[9/16] bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group/reel">
                    <img src={reelResult.imageUrl} alt="Reel Thumbnail" className="w-full h-full object-cover group-hover/reel:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/reel:opacity-100 transition-opacity flex items-end p-8">
                       <span className="text-[10px] font-black uppercase text-white tracking-widest border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md">AI Generated Thumbnail</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 border-4 border-dashed border-white/5 rounded-[3rem] bg-secondary/10 flex flex-col items-center justify-center p-10 text-center space-y-6 group/upload relative overflow-hidden group hover:border-primary/40 transition-all shadow-inner">
                     {uploadedVideoUrl ? (
                         <div className="space-y-4 relative z-10">
                            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 inline-block shadow-lg">
                               <CheckCircle2 className="text-emerald-500" size={32} />
                            </div>
                            <h5 className="font-black text-xs uppercase tracking-widest text-emerald-500">Production Ready</h5>
                            <Button onClick={() => setUploadedVideoUrl(null)} variant="ghost" className="text-[10px] font-black uppercase hover:bg-emerald-500/10">Swap Asset</Button>
                         </div>
                     ) : (
                         <div className="relative z-10 flex flex-col items-center gap-4">
                            <CloudUpload size={48} className="text-primary group-hover/upload:scale-110 transition-transform" />
                            <div className="space-y-1">
                               <p className="font-black text-sm uppercase tracking-widest">Connect Raw Footage</p>
                               <p className="text-[10px] text-muted-foreground/60 font-bold italic leading-none">Sync your video with AI intelligence</p>
                            </div>
                            <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                     )}
                     
                     {isUploadingReel && (
                         <div className="absolute inset-0 bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center z-20">
                            <RefreshCcw size={40} className="animate-spin text-primary" />
                            <p className="font-black text-[10px] uppercase tracking-[0.2em] mt-4 opacity-60">Architecting Media...</p>
                         </div>
                     )}
                  </div>
               </div>

               <div className="w-full md:w-1/2 space-y-8">
                 <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] space-y-8 shadow-2xl">
                    <div className="flex flex-col space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Script & Direction</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 italic">{reelResult.audioSuggestion}</span>
                       </div>
                       <div className="p-8 bg-background/60 backdrop-blur-md rounded-[2rem] border-2 border-white/5 h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                          <div className="space-y-6">
                             {reelResult.videoScript.split('\n').map((line, i) => (
                                <p key={i} className={cn("text-xs font-bold leading-relaxed", line.startsWith('[') ? "text-primary uppercase tracking-widest" : "text-muted-foreground/80")}>
                                   {line}
                                </p>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                       <Button onClick={() => handleSave(PostStatus.SCHEDULED)} disabled={isProcessing || !uploadedVideoUrl} className="h-16 rounded-[1.25rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(var(--primary),0.3)]">
                         {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={20} />}
                         Launch Final Reel
                       </Button>
                       <div className="flex gap-2">
                         <Button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isProcessing} variant="outline" className="flex-1 h-16 rounded-[1.25rem] font-black uppercase tracking-widest border-2 border-primary/20 hover:bg-primary/5 text-primary">
                            <Save size={20} />
                            Save
                         </Button>
                         <Button onClick={() => setReelResult(null)} variant="ghost" className="h-16 w-16 rounded-[1.25rem] text-rose-500 hover:bg-rose-500/10">
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
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic leading-none">Short-Form Studio</h4>
                 <p className="text-muted-foreground font-medium opacity-60">AI will architect a high-engagement script & thumbnail for your next viral masterpiece.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelTab;
