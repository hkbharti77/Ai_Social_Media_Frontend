import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles, RefreshCcw, Trash2, Calendar, Save, BarChart3 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { generatePostsApi, generateThreadApi, type GeneratedPost } from '../../../api/ai';
import { toast } from 'sonner';
import { handleApiError } from '../../../lib/error-utils';
import { cn } from '../../../lib/utils';
import { ModelSelect, type ModelOption } from '../../../components/ui/ModelSelect';
import { type ProfileResponse } from '../../../api/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { PostStatus } from '../../../api/posts';

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
  
  // Results Props
  generatedPosts: GeneratedPost[];
  generatedThreads: string[][];
  viewMode: 'grid' | 'list';
  onDraft: (post: GeneratedPost, index: number) => void;
  onSchedule: (post: GeneratedPost, index: number) => void;
  onDelete: (index: number) => void;
  onPredict: (draft: string, index: number) => void;
  onSaveThread: (thread: string[], status: any) => void;
  processingId: string | null;
  isPredicting: Record<number, boolean>;
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
  AI_MODELS,
  
  // Results Props
  generatedPosts,
  generatedThreads,
  viewMode,
  onDraft,
  onSchedule,
  onDelete,
  onPredict,
  onSaveThread,
  processingId,
  isPredicting
}) => {
  const [command, setCommand] = useState('');
  const [batchCount, setBatchCount] = useState(3);
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [contentType, setContentType] = useState<'MARKETING' | 'EDUCATIONAL'>('MARKETING');

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
    toast.info(`AI is crafting your ${contentType.toLowerCase()} posts...`, {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generatePostsApi({
        command,
        count: batchCount,
        modelId: selectedModel,
        aspectRatio: selectedAspectRatio,
        voiceMode: selectedVoiceMode,
        contentType: contentType
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
    toast.info(`AI is weaving your ${contentType.toLowerCase()} thread...`, {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      // Generate 2 alternative threads
      const promises = [0, 1].map(() => generateThreadApi({
        command,
        count: 1,
        modelId: selectedModel,
        voiceMode: selectedVoiceMode,
        contentType: contentType
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

          {/* Content Purpose */}
          <div className="space-y-4 border-l-2 border-emerald-500/20 pl-4 bg-emerald-500/5 p-4 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 px-1 flex items-center gap-2">
              <Sparkles size={12} /> Content Purpose
            </label>
            <div className="flex bg-secondary/20 p-1 rounded-xl border border-white/5">
              {[
                { id: 'MARKETING', label: 'Marketing' },
                { id: 'EDUCATIONAL', label: 'Educational' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setContentType(m.id as any)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                    contentType === m.id ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/60 italic px-1 leading-tight">
              {contentType === 'EDUCATIONAL' 
                ? 'Persona: Educator. Focus: Value-driven explanations & teaching.' 
                : 'Persona: Marketer. Focus: Brand growth, ROI & awareness.'}
            </p>
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
                <option value="NONE">None / Standard (0 Credits)</option>
                <option value="STYLE_DNA">Style DNA (+2 Credits)</option>
                <option value="FULL_CONTEXT">Full Context (+5 Credits)</option>
              </select>
            </div>
            <p className="text-[10px] text-muted-foreground/60 italic px-1 leading-tight">
              {selectedVoiceMode === 'STYLE_DNA' ? 'Uses your Style DNA Persona (+2 cr).' : 
               selectedVoiceMode === 'FULL_CONTEXT' ? 'Analyzes raw samples + images (+5 cr).' :
               'Standard brand identity (No extra cost).'}
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
                           const voiceCost = selectedVoiceMode === 'FULL_CONTEXT' ? 5.0 : (selectedVoiceMode === 'STYLE_DNA' ? 2.0 : 0.0);
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

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
           {generatedPosts.length > 0 || generatedThreads.length > 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-10 pb-20"
             >
               <div className={cn(
                 "grid gap-6 lg:gap-8",
                 viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
               )}>
                 {generatedPosts.map((post, idx) => (
                   <motion.div 
                     key={idx}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx * 0.05 }}
                     className={cn(
                        "bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all shadow-xl",
                        viewMode === 'list' && "flex flex-col md:flex-row h-auto md:h-64"
                     )}
                   >
                     <div className={cn("relative overflow-hidden", viewMode === 'grid' ? "aspect-square" : "w-full md:w-64 h-64 md:h-full")}>
                       <img src={post.imageUrl || ''} alt="AI Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <p className="text-white text-[10px] font-semibold italic line-clamp-2">{post.imageSuggestion}</p>
                       </div>
                     </div>
 
                     <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                       <div className="space-y-3">
                         <p className="text-xs font-medium leading-relaxed custom-scrollbar max-h-24 overflow-y-auto pr-2">{post.caption}</p>
                         <div className="flex flex-wrap gap-1.5">
                           {post.hashtags.map((tag, i) => (
                             <span key={i} className="text-[9px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">{tag}</span>
                           ))}
                         </div>
                       </div>
 
                       <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                          <Button onClick={() => onSchedule(post, idx)} disabled={processingId?.includes(`schedule-${idx}`)} className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                             {processingId?.includes(`schedule-${idx}`) ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
                             Schedule
                          </Button>
                          <Button onClick={() => onDraft(post, idx)} variant="outline" disabled={processingId?.includes(`draft-${idx}`)} className="h-10 w-10 rounded-xl border-white/10 hover:bg-white/5 p-0 flex items-center justify-center">
                             {processingId?.includes(`draft-${idx}`) ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          </Button>
                          <Button onClick={() => onPredict(post.caption, idx)} variant="outline" disabled={isPredicting[idx]} className="h-10 w-10 rounded-xl border-white/10 hover:bg-white/5 p-0 flex items-center justify-center group/btn">
                             {isPredicting[idx] ? <Loader2 size={12} className="animate-spin" /> : <BarChart3 size={12} className="group-hover/btn:text-primary transition-colors" />}
                          </Button>
                          <Button onClick={() => onDelete(idx)} variant="ghost" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 p-0 flex items-center justify-center">
                             <Trash2 size={12} />
                          </Button>
                       </div>
                     </div>
                   </motion.div>
                 ))}
 
                 {generatedThreads.map((thread, threadIdx) => (
                   <motion.div 
                      key={`thread-${threadIdx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="col-span-full bg-card/40 border border-white/5 rounded-[2rem] p-6 space-y-4"
                   >
                      <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                         <span className="text-xs font-black uppercase italic text-primary">Thread Concept {threadIdx + 1}</span>
                         <div className="flex gap-2">
                            <Button onClick={() => onSaveThread(thread, PostStatus.SCHEDULED)} variant="outline" className="h-8 px-3 rounded-lg border-primary/30 text-primary uppercase text-[8px] font-black tracking-widest">
                               Schedule
                            </Button>
                            <Button onClick={() => onSaveThread(thread, PostStatus.DRAFT)} variant="ghost" className="h-8 px-3 rounded-lg text-muted-foreground uppercase text-[8px] font-black tracking-widest">
                               Draft
                            </Button>
                         </div>
                      </div>
                      
                      <div className="space-y-3">
                         {thread.map((tweet, idx) => (
                           <div key={idx} className="flex gap-3">
                             <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[8px] font-black">{idx+1}</div>
                                {idx < thread.length - 1 && <div className="w-0.5 flex-1 bg-white/5 my-1"></div>}
                             </div>
                             <div className="flex-1 p-3 bg-secondary/10 rounded-xl text-[10px] font-medium leading-relaxed">
                                {tweet}
                             </div>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
               <Sparkles size={48} className="text-primary opacity-40 animate-pulse" />
               <div className="max-w-md mx-auto space-y-3 px-6">
                 <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic">AI Studio</h4>
                 <p className="text-muted-foreground font-medium opacity-60">Describe your vision and watch AI manifest your brand identity.</p>
               </div>
               <Button size="lg" className="px-12 h-16 rounded-[1.5rem] text-xl font-black group shadow-2xl transition-all active:scale-95" onClick={handleGenerate}>Creative Session</Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CreationTab;
