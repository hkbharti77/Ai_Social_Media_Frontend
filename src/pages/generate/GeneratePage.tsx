import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  Link as LinkIcon,
  Share2,
  Wand2,
  Save,
  Calendar as CalendarIcon,
  Trash2,
  RefreshCcw,
  LayoutGrid,
  List,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePostsApi } from '../../api/ai';
import type { GeneratedPost } from '../../api/ai';
import { createPostApi, PostStatus } from '../../api/posts';
import { UpgradeModal } from '../../components/layout/UpgradeModal';
import { getProfile, type ProfileResponse } from '../../api/profile';

const GeneratePage: React.FC = () => {
  const [batchCount, setBatchCount] = useState(3);
  const [platform, setPlatform] = useState<'FB' | 'IG' | 'BOTH'>('BOTH');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);

  React.useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await getProfile();
      setSubscription(data.subscription);
    } catch (e) {
      console.error('Failed to fetch subscription', e);
    }
  };

  const handleGenerate = async () => {
    if (!command.trim()) {
      toast.error("Please describe your campaign goal first!");
      return;
    }

    setIsGenerating(true);
    setGeneratedPosts([]);
    toast.info("AI is crafting your posts...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generatePostsApi({
        command,
        count: batchCount
      });
      setGeneratedPosts(response.posts);
      toast.success(`Successfully generated ${response.posts.length} posts!`);
      fetchSubscription(); // Refresh credits
    } catch (error: any) {
      console.error('Generation failed', error);
      if (error.response?.status === 402) {
        setUpgradeMessage(error.response.data?.message || "You've reached your credit limit!");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error("Failed to generate posts. Ensure your Business Profile is set up.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraft = async (post: GeneratedPost, index: number) => {
    setProcessingId(`draft-${index}`);
    const targetPlatform = platform === 'BOTH' ? 'FACEBOOK' : (platform === 'FB' ? 'FACEBOOK' : 'INSTAGRAM');
    try {
      await createPostApi({
        caption: post.caption,
        hashtags: post.hashtags.join(' '),
        imageUrl: post.imageUrl || '',
        platform: targetPlatform,
        status: PostStatus.DRAFT
      });
      toast.success("Post saved to drafts!", { icon: <Save size={16} /> });
      setGeneratedPosts(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error("Failed to save draft.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSchedule = async (post: GeneratedPost, index: number) => {
    setProcessingId(`schedule-${index}`);
    const targetPlatform = platform === 'BOTH' ? 'INSTAGRAM' : (platform === 'FB' ? 'FACEBOOK' : 'INSTAGRAM');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createPostApi({
        caption: post.caption,
        hashtags: post.hashtags.join(' '),
        imageUrl: post.imageUrl || '',
        platform: targetPlatform,
        status: PostStatus.SCHEDULED,
        scheduledAt: tomorrow.toISOString().split('.')[0]
      });

      toast.success("Post scheduled successfully!", {
        description: "Scheduled for tomorrow",
        icon: <CalendarIcon size={16} />
      });
      setGeneratedPosts(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error("Failed to schedule post.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (index: number) => {
    setGeneratedPosts(prev => prev.filter((_, i) => i !== index));
    toast.error("Post removed.");
  };

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground uppercase italic px-1">AI Engine</h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80 max-w-xl px-1">Generate platform-ready content in seconds.</p>
          </div>
          <div className="flex bg-secondary/30 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 self-end md:self-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                viewMode === 'grid' ? "bg-background shadow-xl text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid size={22} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                viewMode === 'list' ? "bg-background shadow-xl text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List size={22} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Controls Panel - Premium Glassmorphism */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-10 rounded-[2.5rem] space-y-10 sticky top-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={120} className="text-primary" />
              </div>

              <div className="space-y-5">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Target Platforms</label>
                <div className="flex bg-secondary/20 p-2 rounded-[1.5rem] border border-white/5">
                  {(['FB', 'IG', 'BOTH'] as const).map((p) => (
                    <button 
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-500 text-sm font-black",
                        platform === p 
                          ? "bg-background shadow-[0_8px_20px_rgba(0,0,0,0.4)] text-primary scale-105" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p === 'FB' && <LinkIcon size={18} />}
                      {p === 'IG' && <Share2 size={18} />}
                      {p === 'BOTH' && <RefreshCcw size={18} />}
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Post Intensity</label>
                  <div className="flex flex-col items-end">
                    <span className="text-primary font-black text-3xl tracking-tighter leading-none">{batchCount}</span>
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-1">Total Posts</span>
                  </div>
                </div>
                <div className="px-1">
                  <input 
                    type="range" min="1" max="10" value={batchCount} 
                    onChange={(e) => setBatchCount(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary shadow-inner"
                  />
                  <div className="flex justify-between mt-3 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    <span>Low</span>
                    <span>High Batch</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Creative Direction</label>
                <textarea 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Describe your campaign goal..."
                  className="w-full h-44 bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-lg font-medium focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="space-y-4">
                {subscription && (
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                    subscription.monthlyCredits < 5 ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10"
                  )}>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credits Remaining</p>
                      <p className={cn(
                        "text-xl font-black tracking-tighter",
                        subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary"
                      )}>
                        {subscription.monthlyCredits} <span className="text-[10px] opacity-60 uppercase tracking-widest ml-1">{subscription.tier}</span>
                      </p>
                    </div>
                    {subscription.monthlyCredits < 5 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-rose-500/20 hover:bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10"
                      >
                        Top Up
                      </Button>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full py-10 text-2xl font-black gap-4 shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all group overflow-hidden relative whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 w-full">
                    {isGenerating ? <Loader2 className="animate-spin shrink-0" size={28} /> : <Sparkles className="shrink-0" size={28} />}
                    <span className="truncate tracking-tighter italic uppercase">{isGenerating ? 'AI IS COOKING...' : 'Generate Magic'}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Results Grid - ABC Card Style */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-6 px-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                <Wand2 size={28} />
              </div>
              <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
              <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Studio Output</h3>
            </div>

            <AnimatePresence mode="popLayout">
              {isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card/40 border-2 border-white/5 rounded-[3rem] aspect-[4/5] animate-pulse relative overflow-hidden shadow-xl">
                      <div className="h-3/5 bg-secondary/30" />
                      <div className="p-10 space-y-6">
                        <div className="h-8 bg-secondary/30 rounded-full w-3/4" />
                        <div className="h-4 bg-secondary/30 rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : generatedPosts.length > 0 ? (
                <motion.div 
                  layout
                  className={cn(
                    "grid gap-10",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {generatedPosts.map((post, index) => (
                    <motion.div 
                      key={index} 
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className={cn(
                        "group bg-card/60 backdrop-blur-lg border-2 border-white/5 rounded-[3rem] overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col h-full shadow-2xl relative max-h-[850px]",
                        viewMode === 'grid' ? "flex-col" : "flex-row h-72"
                      )}
                    >
                      <div className={cn(
                        "relative overflow-hidden",
                        viewMode === 'grid' ? "aspect-square" : "w-72 shrink-0"
                      )}>
                        {post.imageUrl ? (
                          <img 
                            src={post.imageUrl} 
                            alt="AI Output" 
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <Sparkles className="text-primary/40" size={48} />
                            <p className="text-xs text-muted-foreground font-medium italic line-clamp-4 px-4">{post.imageSuggestion}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/10 px-3 py-1 rounded-full">AI Photo Concept</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                          <Button 
                            size="icon" variant="secondary" 
                            className="rounded-2xl shadow-2xl h-14 w-14 hover:scale-110 transition-all active:scale-95 bg-white/10 border-white/20 backdrop-blur-md"
                            onClick={() => toast.success("Refinement requested")}
                          >
                            <RefreshCcw size={24} />
                          </Button>
                          <Button 
                            size="icon" variant="secondary" 
                            className="rounded-2xl shadow-2xl h-14 w-14 text-rose-500 hover:bg-rose-500/20 hover:scale-110 transition-all active:scale-95 bg-white/10 border-white/20 backdrop-blur-md"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 size={24} />
                          </Button>
                        </div>
                        <div className="absolute top-4 left-4">
                           <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] px-4 flex items-center gap-2 border border-white/10 shadow-2xl text-white">
                            {platform === 'IG' ? <Share2 size={14} className="text-pink-400" /> : <LinkIcon size={14} className="text-blue-400" />}
                            {platform === 'BOTH' ? (index % 2 === 0 ? 'Facebook' : 'Instagram') : (platform === 'FB' ? 'Facebook' : 'Instagram')}
                          </div>
                        </div>
                      </div>

                      <div className={cn(
                        "p-10 flex-1 flex flex-col justify-between",
                        viewMode === 'grid' ? "space-y-8" : "space-y-4 py-8"
                      )}>
                        <div className="space-y-4 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
                          <p className={cn(
                            "text-xl font-bold leading-relaxed tracking-tight text-foreground/90 font-sans italic",
                            viewMode === 'list' && "line-clamp-2"
                          )}>
                            {post.caption.trim()} <span className="text-primary truncate">{post.hashtags.join(' ')}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" size="lg" 
                            disabled={processingId === `draft-${index}`}
                            onClick={() => handleDraft(post, index)}
                            className="flex-1 gap-3 h-14 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] border-2 border-white/10 hover:bg-white/5 transition-all"
                          >
                            {processingId === `draft-${index}` ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                            Draft
                          </Button>
                          <Button 
                            size="lg" 
                            disabled={processingId === `schedule-${index}`}
                            onClick={() => handleSchedule(post, index)}
                            className="w-14 h-14 p-0 shrink-0 flex items-center justify-center rounded-[1.25rem] font-black shadow-2xl shadow-primary/20 active:scale-95 transition-all"
                          >
                            {processingId === `schedule-${index}` ? <Loader2 className="animate-spin" size={18} /> : <CalendarIcon size={20} />}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="py-20 md:py-32 text-center space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                  <div className="relative space-y-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-[inset_0_4px_30px_rgba(0,0,0,0.3)] border border-primary/20">
                      <Sparkles size={48} className="animate-pulse" />
                    </div>
                    <div className="max-w-md mx-auto space-y-3 px-6">
                      <h4 className="font-black text-4xl md:text-5xl tracking-tighter text-foreground uppercase italic px-1">AI Studio</h4>
                      <p className="text-muted-foreground text-base md:text-lg font-medium opacity-60 leading-relaxed max-w-sm mx-auto">Describe your vision and watch AI manifest your brand identity.</p>
                    </div>
                    <Button size="lg" className="px-12 h-16 rounded-[1.5rem] text-xl font-black group shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all active:scale-95" onClick={handleGenerate}>
                      Creative Session
                      <ChevronRight size={24} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        message={upgradeMessage}
      />
    </PageWrapper>
  );
};

export default GeneratePage;
