import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  Wand2,
  Calendar as CalendarIcon,
  Trash2,
  RefreshCcw,
  LayoutGrid,
  List,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Image as ImageIcon,
  Layers,
  Link2
} from 'lucide-react';

const XLogo = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generatePostsApi, 
  generateGapAnalysisApi, 
  predictPerformanceApi, 
  generateContentStrategyApi,
  generateMemeApi,
  generateViralOpportunityApi,
  generateThreadApi,
  generateCarouselApi,
  repurposeUrlApi
} from '../../api/ai';
import type { GeneratedPost, GapIdea, MemeResponse, ViralOpportunityResponse, CarouselResponse, GenerationResponse } from '../../api/ai';
import { createPostApi, PostStatus } from '../../api/posts';
import { UpgradeModal } from '../../components/layout/UpgradeModal';
import { getProfile, type ProfileResponse } from '../../api/profile';
import { BarChart3, Target, MapPin, Lightbulb } from 'lucide-react';
import { ModelSelect, type ModelOption } from '../../components/ui/ModelSelect';

const AI_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 4.0, tier: 0, icon: Sparkles, desc: 'Ultra-fast image generation' },
  { id: 'gemini-3.1-flash-image', name: 'Gemini 3.1 Flash', cost: 10.0, tier: 0, icon: Cpu, desc: 'High-quality efficient rendering' },
  { id: 'imagen-4-fast', name: 'Imagen 4.0 Fast', cost: 2.0, tier: 1, icon: ImageIcon, desc: 'Quick turnaround visualizations' },
  { id: 'imagen-4-standard', name: 'Imagen 4.0 Standard', cost: 4.0, tier: 1, icon: ImageIcon, desc: 'Balanced creative intelligence' },
  { id: 'imagen-4-ultra', name: 'Imagen 4.0 Ultra', cost: 6.0, tier: 2, icon: ImageIcon, desc: 'Studio-grade photorealistic AI' },
  { id: 'gemini-3-pro-image', name: 'Gemini 3.0 Pro', cost: 14.0, tier: 2, icon: ShieldCheck, desc: 'Elite reasoning & deep strategy' },
];

const GeneratePage: React.FC = () => {
  const [batchCount, setBatchCount] = useState(3);
  const [selectedPlatforms, setSelectedPlatforms] = useState<('FB' | 'IG' | 'LI' | 'X')[]>(['FB', 'IG', 'LI', 'X']);
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [generatedThreads, setGeneratedThreads] = useState<string[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'create' | 'strategy' | 'meme' | 'listening' | 'carousel' | 'repurpose'>('create');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-image');
  const [isPredicting, setIsPredicting] = useState<Record<number, boolean>>({});

  // Gap Analysis State
  const [gapIdeas, setGapIdeas] = useState<any[]>([]);
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [strategyTab, setStrategyTab] = useState<'b2b' | 'personal'>('personal');
  const [gapForm, setGapForm] = useState({
    businessType: '',
    city: '',
    targetAudience: ''
  });

  // Meme & Listening State
  const [memeCommand, setMemeCommand] = useState('');
  const [memeResult, setMemeResult] = useState<MemeResponse | null>(null);
  const [viralResult, setViralResult] = useState<ViralOpportunityResponse | null>(null);
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningTopic, setListeningTopic] = useState('');

  // Carousel State
  const [carouselCommand, setCarouselCommand] = useState('');
  const [carouselSlideCount, setCarouselSlideCount] = useState(3);
  const [carouselResult, setCarouselResult] = useState<CarouselResponse | null>(null);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);

  // Repurpose State
  const [repurposeUrl, setRepurposeUrl] = useState('');
  const [isRepurposing, setIsRepurposing] = useState(false);

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

    if (isThreadMode) {
      handleGenerateThread();
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
        count: batchCount,
        modelId: selectedModel
      });
      setGeneratedPosts(response.posts);
      toast.success(`Successfully generated ${response.posts.length} posts!`);
      fetchSubscription();
    } catch (error: any) {
      console.error('Generation failed', error);
      if (error.response?.status === 402) {
        setUpgradeMessage(error.response.data?.message || "You've reached your credit limit!");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to generate posts.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateThread = async () => {
    setIsGenerating(true);
    setGeneratedThreads([]);
    setGeneratedPosts([]);
    toast.info("AI is weaving your thread...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      // Generate 2 alternative threads
      const promises = [0, 1].map(() => generateThreadApi({
        command,
        count: 1, // logic in generateThread produces a list
        modelId: selectedModel
      }));
      
      const results = await Promise.all(promises);
      setGeneratedThreads(results);
      toast.success("Threads created!");
      fetchSubscription();
    } catch (error: any) {
      toast.error("Thread generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveThread = async (thread: string[], status: PostStatus) => {
    try {
      await createPostApi({
        caption: thread[0], // First tweet is the main post caption
        hashtags: "",
        imageUrl: "",
        platform: "X",
        status: status,
        isThread: true,
        threadContent: JSON.stringify(thread),
        scheduledAt: status === PostStatus.SCHEDULED ? new Date(Date.now() + 86400000).toISOString().split('.')[0] : undefined
      });
      toast.success(status === PostStatus.DRAFT ? "Thread saved to drafts!" : "Thread scheduled!");
      setGeneratedThreads(prev => prev.filter(t => t !== thread));
    } catch (error) {
      toast.error("Failed to save thread.");
    }
  };

  const handleDraft = async (post: GeneratedPost, index: number) => {
    setProcessingId(`draft-${index}`);
    const targets: ('FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN')[] = [];
    if (selectedPlatforms.includes('FB')) targets.push('FACEBOOK');
    if (selectedPlatforms.includes('IG')) targets.push('INSTAGRAM');
    if (selectedPlatforms.includes('LI')) targets.push('LINKEDIN');

    if (targets.length === 0) {
      toast.error("Please select at least one platform.");
      setProcessingId(null);
      return;
    }

    try {
      await Promise.all(targets.map(p => 
        createPostApi({
          caption: post.caption,
          hashtags: post.hashtags.join(' '),
          imageUrl: post.imageUrl || '',
          platform: p,
          status: PostStatus.DRAFT
        })
      ));
      toast.success("Saved to drafts!");
      setGeneratedPosts(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error("Failed to save draft.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSchedule = async (post: GeneratedPost, index: number) => {
    setProcessingId(`schedule-${index}`);
    const targets: ('FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN')[] = [];
    if (selectedPlatforms.includes('FB')) targets.push('FACEBOOK');
    if (selectedPlatforms.includes('IG')) targets.push('INSTAGRAM');
    if (selectedPlatforms.includes('LI')) targets.push('LINKEDIN');

    if (targets.length === 0) {
      toast.error("Please select at least one platform.");
      setProcessingId(null);
      return;
    }

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduledAt = tomorrow.toISOString().split('.')[0];

      for (const p of targets) {
        await createPostApi({
          caption: post.caption,
          hashtags: post.hashtags.join(' '),
          imageUrl: post.imageUrl || '',
          platform: p,
          status: PostStatus.SCHEDULED,
          scheduledAt: scheduledAt
        });
      }
      toast.success("Post scheduled for tomorrow!");
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

  const handleGapAnalysis = async () => {
    if (!gapForm.businessType || !gapForm.city) {
      toast.error("Please fill in business details.");
      return;
    }
    setIsAnalyzingGap(true);
    try {
      const response = await generateGapAnalysisApi(gapForm);
      setGapIdeas(response.ideas);
      toast.success("Strategic insights discovered!");
    } catch (error: any) {
      toast.error("Failed to analyze content gaps.");
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  const handleContentStrategy = async () => {
    setIsAnalyzingGap(true);
    try {
      const response = await generateContentStrategyApi();
      setGapIdeas(response.ideas);
      toast.success("Strategic insights generated from your profile!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze content strategy.");
    } finally {
      setIsAnalyzingGap(false);
    }
  };


  const handlePredictPerformance = async (draft: string, index: number) => {
    setIsPredicting(prev => ({ ...prev, [index]: true }));
    try {
      await predictPerformanceApi(draft);
      toast.success("Performance predicted!");
    } catch (error: any) {
      toast.error("Prediction failed.");
    } finally {
      setIsPredicting(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateMeme = async () => {
    setIsGeneratingMeme(true);
    setMemeResult(null);
    toast.info("AI is designing your meme...", {
      icon: <Sparkles size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateMemeApi({ 
          modelId: selectedModel, 
          command: memeCommand 
      });
      setMemeResult(response);
      toast.success("Meme generated successfully!");
      fetchSubscription();
    } catch (error: any) {
      console.error('Meme generation failed', error);
      if (error.response?.status === 402) {
        setUpgradeMessage("You've reached your credit limit!");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error("Failed to generate meme.");
      }
    } finally {
      setIsGeneratingMeme(false);
    }
  };

  const handleGenerateViralOpportunity = async () => {
    if (!listeningTopic.trim()) {
      toast.error("Please enter a topic to listen to.");
      return;
    }
    setIsListening(true);
    setViralResult(null);
    try {
      const response = await generateViralOpportunityApi({ nicheTopic: listeningTopic });
      setViralResult(response);
      toast.success("Viral opportunity identified!");
    } catch (error: any) {
      toast.error("Failed to find viral opportunities.");
    } finally {
      setIsListening(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselCommand.trim()) {
      toast.error("Please provide a concept for the carousel.");
      return;
    }
    setIsGeneratingCarousel(true);
    setCarouselResult(null);
    toast.info("AI is designing your carousel slides...", {
      icon: <Sparkles size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await generateCarouselApi({
        command: carouselCommand,
        slideCount: carouselSlideCount,
        modelId: selectedModel
      });
      setCarouselResult(response);
      toast.success(`Successfully generated a ${response.slides.length}-slide carousel!`);
      fetchSubscription();
    } catch (error: any) {
      console.error('Carousel generation failed', error);
      if (error.response?.status === 402) {
        setUpgradeMessage("You've reached your credit limit!");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error("Failed to generate carousel.");
      }
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handleRepurpose = async () => {
    if (!repurposeUrl.trim()) {
      toast.error("Please enter a valid URL to repurpose.");
      return;
    }
    setIsRepurposing(true);
    setGeneratedPosts([]); // Clear previous posts and switch to rendering them
    toast.info("AI is extracting and repurposing content...", {
      icon: <RefreshCcw size={16} className="animate-spin text-primary" />,
    });

    try {
      const response = await repurposeUrlApi({
        url: repurposeUrl,
        modelId: selectedModel
      });
      setGeneratedPosts(response.posts);
      toast.success(`Successfully crafted ${response.posts.length} posts from your link!`);
      fetchSubscription();
    } catch (error: any) {
      console.error('Repurpose failed', error);
      if (error.response?.status === 402) {
        setUpgradeMessage("You've reached your credit limit!");
        setIsUpgradeModalOpen(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to repurpose content.");
      }
    } finally {
      setIsRepurposing(false);
    }
  };

  return (
    <PageWrapper isFullHeight>
      <div className="flex flex-col h-full space-y-6 lg:space-y-8 overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground uppercase italic px-1">AI Engine</h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80 max-w-xl px-1">Generate platform-ready content in seconds.</p>
          </div>
          
          <div className="flex bg-secondary/30 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-border/50 overflow-x-auto no-scrollbar">
            {[
              { id: 'create', label: 'AI Content', icon: Wand2 },
              { id: 'repurpose', label: 'Repurpose', icon: Link2 },
              { id: 'carousel', label: 'AI Carousels', icon: Layers },
              { id: 'meme', label: 'AI Memes', icon: ImageIcon },
              { id: 'listening', label: 'Social Trends', icon: BarChart3 },
              { id: 'strategy', label: 'Growth Engine', icon: Target }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={cn(
                  "px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                  activeMainTab === tab.id ? "bg-background shadow-xl text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex bg-secondary/30 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 self-end md:self-auto">
            <button onClick={() => setViewMode('grid')} className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-background shadow-xl text-primary scale-110" : "text-muted-foreground hover:text-foreground")}>
              <LayoutGrid size={22} />
            </button>
            <button onClick={() => setViewMode('list')} className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-background shadow-xl text-primary scale-110" : "text-muted-foreground hover:text-foreground")}>
              <List size={22} />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeMainTab === 'strategy' ? (
              <motion.div 
                key="strategy-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
                  <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 lg:p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
                    <div className="space-y-4">
                       <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Target className="text-primary" size={24} />
                        Growth Engine
                       </h3>
                       <div className="flex bg-secondary/30 p-1 rounded-xl">
                         <button
                           onClick={() => setStrategyTab('personal')}
                           className={cn("flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", strategyTab === 'personal' ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground")}
                         >
                           My Strategy
                         </button>
                         <button
                           onClick={() => setStrategyTab('b2b')}
                           className={cn("flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", strategyTab === 'b2b' ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground")}
                         >
                           B2B Analysis
                         </button>
                       </div>
                       <p className="text-xs text-muted-foreground font-medium">
                         {strategyTab === 'personal' ? "Discover content gaps tailored to your profile." : "Find how your business can help others grow."}
                       </p>
                    </div>

                    <div className="space-y-6">
                      {strategyTab === 'b2b' ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Business Type</label>
                            <div className="relative">
                              <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                              <input 
                                type="text" value={gapForm.businessType}
                                placeholder="e.g. Specialty Coffee Shop"
                                className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                                onChange={(e) => setGapForm({...gapForm, businessType: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location / City</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                              <input 
                                type="text" value={gapForm.city}
                                placeholder="e.g. New York, NY"
                                className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                                onChange={(e) => setGapForm({...gapForm, city: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Audience</label>
                            <div className="relative">
                              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                              <input 
                                type="text" value={gapForm.targetAudience}
                                placeholder="e.g. Health-conscious Gen Z"
                                className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                                onChange={(e) => setGapForm({...gapForm, targetAudience: e.target.value})}
                              />
                            </div>
                          </div>

                          <Button onClick={handleGapAnalysis} disabled={isAnalyzingGap} className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                            {isAnalyzingGap ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            {isAnalyzingGap ? 'Generating Strategy...' : 'Run B2B Analysis'}
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-6 pt-4">
                          <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                              <Wand2 size={24} />
                              <h4 className="font-black tracking-tighter uppercase italic">Auto-Analysis</h4>
                            </div>
                            <p className="text-sm font-medium text-primary/80 leading-relaxed">
                              This tool will automatically analyze your saved Business Profile and discover high-value content topics your competitors are missing.
                            </p>
                          </div>
                          <Button onClick={handleContentStrategy} disabled={isAnalyzingGap} className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                            {isAnalyzingGap ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            {isAnalyzingGap ? 'Analyzing Profile...' : 'Discover Content Ideas'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
                  <div className="flex items-center gap-6 px-4 shrink-0">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Lightbulb size={28} />
                    </div>
                    <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                    <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 italic">
                      {strategyTab === 'personal' ? 'My Content Gaps' : 'B2B Opportunities'}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                    {gapIdeas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gapIdeas.map((idea: GapIdea, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-card/60 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2rem] space-y-6 hover:border-primary/30 transition-all shadow-xl">
                            <div className="bg-primary/10 w-fit px-4 py-1.5 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">Opportunity {idx + 1}</div>
                            <h4 className="text-xl font-black tracking-tight">{idea.topic}</h4>
                            <div className="space-y-4">
                              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4">{idea.whyItWorks}</p>
                              <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                  {strategyTab === 'personal' ? 'Sample Post' : 'Solution Pitch'}
                                </p>
                                <p className="text-xs font-bold line-clamp-3">{idea.sampleCaption}</p>
                              </div>
                            </div>
                            <Button variant="ghost" className="w-full justify-between group hover:bg-primary/10 rounded-xl" onClick={() => {
                              setCommand(`Post: ${idea.topic}. Reason: ${idea.whyItWorks}. Sample: ${idea.sampleCaption}`);
                              setActiveMainTab('create');
                              toast.info("Topic loaded!");
                            }}>
                              <span className="text-[10px] font-black uppercase tracking-widest">Load into Engine</span>
                              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-6 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5">
                        <Target size={64} className="text-muted-foreground/20" />
                        <div className="space-y-2 max-w-sm">
                          <p className="text-xl font-black tracking-tighter uppercase italic">Target Locked</p>
                          <p className="text-sm text-muted-foreground font-medium">
                            {strategyTab === 'personal' ? 'Analyze your profile to discover missing content topics.' : 'Enter a target business to discover B2B growth opportunities.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeMainTab === 'carousel' ? (
              <motion.div 
                key="carousel-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
                   <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                         <Layers className="text-primary" size={24} />
                         AI Carousels
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Generate multi-slide narratives for Instagram & LinkedIn.</p>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Carousel Concept</label>
                          <textarea 
                            value={carouselCommand}
                            onChange={(e) => setCarouselCommand(e.target.value)}
                            placeholder="e.g. 5 tips for better AI prompt engineering..."
                            className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl p-4 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none h-24 custom-scrollbar"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Total Slides</label>
                            <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                              <span className="text-primary font-black text-sm">{carouselSlideCount}</span>
                            </div>
                          </div>
                          <input type="range" min="2" max="10" value={carouselSlideCount} onChange={(e) => setCarouselSlideCount(parseInt(e.target.value))} className="w-full h-1.5 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary" />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AI Model</label>
                          <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
                        </div>
                        
                        {subscription && (
                          <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < (carouselSlideCount * (AI_MODELS.find(m => m.id === selectedModel)?.cost || 1)) || (subscription.maxStoredImages !== -1 && subscription.storedImagesCount + carouselSlideCount > subscription.maxStoredImages) ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                            <div className="flex gap-6">
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Credits</p>
                                <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < (carouselSlideCount * (AI_MODELS.find(m => m.id === selectedModel)?.cost || 1)) ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(2)}</p>
                              </div>
                              <div className="space-y-0.5 border-l-2 border-primary/10 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Storage</p>
                                <p className={cn("text-xl font-black tracking-tighter", (subscription.maxStoredImages !== -1 && subscription.storedImagesCount + carouselSlideCount > subscription.maxStoredImages) ? "text-rose-500" : "text-primary")}>
                                  {subscription.storedImagesCount} / {subscription.maxStoredImages === -1 ? '∞' : subscription.maxStoredImages}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button onClick={handleGenerateCarousel} disabled={isGeneratingCarousel} className="w-full h-20 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
                          {isGeneratingCarousel ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                          {isGeneratingCarousel ? 'Crafting Slides...' : 'Generate Carousel'}
                        </Button>
                     </div>
                   </div>
                </div>

                <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                    <div className="min-h-full flex flex-col p-4 lg:p-8">
                     {carouselResult ? (
                       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8">
                         <div className="bg-card/60 backdrop-blur-lg border-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl p-8 space-y-8">
                           <div className="space-y-4 border-b border-white/5 pb-8 mb-8">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Main Caption</h4>
                              <p className="text-lg font-bold italic">{carouselResult.caption}</p>
                           </div>
                           <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory disabled-scrollbar pb-10">
                              {carouselResult.slides.map((slide, idx) => (
                                <div key={idx} className="shrink-0 w-80 bg-background/50 rounded-3xl border border-white/5 overflow-hidden snap-center flex flex-col shadow-lg">
                                  <div className="aspect-square bg-black/40 relative">
                                    {slide.imageUrl ? (
                                      <img src={slide.imageUrl} alt={`Slide ${slide.slideNumber}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                        <ImageIcon size={40} className="text-muted-foreground/30" />
                                      </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white">
                                      {slide.slideNumber} / {carouselResult.slides.length}
                                    </div>
                                  </div>
                                  <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-sm font-bold text-wrap line-clamp-4">{slide.slideText}</p>
                                  </div>
                                </div>
                              ))}
                           </div>

                           <div className="flex gap-4 pt-4 border-t border-white/5 mt-4">
                              <Button variant="outline" className="flex-1 h-14 rounded-xl font-black uppercase text-xs" onClick={async () => {
                                try {
                                  // For carousels, currently mapping to standard POST with an array-like caption representing the thread or we can just save it.
                                  await createPostApi({
                                    caption: carouselResult.caption,
                                    hashtags: "",
                                    imageUrl: carouselResult.slides[0]?.imageUrl || "", // Cover image
                                    platform: "INSTAGRAM",
                                    status: PostStatus.DRAFT,
                                    isCarousel: true,
                                    carouselContent: JSON.stringify(carouselResult)
                                  });
                                  toast.success("Carousel saved to drafts!");
                                } catch (err) {
                                  toast.error("Failed to save carousel to drafts.");
                                }
                              }}>Save as Draft</Button>
                              
                              <Button title="Schedule for tomorrow" className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0" onClick={async () => {
                                try {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  const scheduledAt = tomorrow.toISOString().split('.')[0];
                                  
                                  await createPostApi({
                                    caption: carouselResult.caption,
                                    hashtags: "",
                                    imageUrl: carouselResult.slides[0]?.imageUrl || "",
                                    platform: "INSTAGRAM",
                                    status: PostStatus.SCHEDULED,
                                    scheduledAt: scheduledAt,
                                    isCarousel: true,
                                    carouselContent: JSON.stringify(carouselResult)
                                  });
                                  toast.success("Carousel scheduled for tomorrow!");
                                } catch (err) {
                                  toast.error("Failed to schedule carousel.");
                                }
                              }}>
                                <CalendarIcon size={20} />
                              </Button>
                            </div>
                         </div>
                       </motion.div>
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-center py-20 lg:py-32 space-y-6 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 hidden lg:flex">
                          <div className="p-10 bg-primary/10 rounded-full animate-pulse">
                            <Layers size={64} className="text-primary" />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-2xl font-black italic uppercase tracking-tighter">Enter the Carousel Studio</h4>
                             <p className="text-sm text-muted-foreground font-medium">Build engaging multi-slide narratives.</p>
                          </div>
                       </div>
                     )}
                    </div>
                  </div>
                </div>
              </motion.div>

            ) : activeMainTab === 'meme' ? (
              <motion.div 
                key="meme-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
                   <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                         <ImageIcon className="text-primary" size={24} />
                         AI Memes
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Generate viral memes tailored to your brand.</p>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Meme Concept (Optional)</label>
                          <textarea 
                            value={memeCommand}
                            onChange={(e) => setMemeCommand(e.target.value)}
                            placeholder="e.g. A developer debugging production code on Friday..."
                            className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl p-4 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none h-24 custom-scrollbar"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AI Model</label>
                          <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
                        </div>
                        
                        {subscription && (
                          <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 5 || (subscription.maxStoredImages !== -1 && subscription.storedImagesCount >= subscription.maxStoredImages) ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                            <div className="flex gap-6">
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Credits</p>
                                <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(2)}</p>
                              </div>
                              <div className="space-y-0.5 border-l-2 border-primary/10 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Storage</p>
                                <p className={cn("text-xl font-black tracking-tighter", (subscription.maxStoredImages !== -1 && subscription.storedImagesCount >= subscription.maxStoredImages) ? "text-rose-500" : "text-primary")}>
                                  {subscription.storedImagesCount} / {subscription.maxStoredImages === -1 ? '∞' : subscription.maxStoredImages}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {subscription.maxStoredImages !== -1 && subscription.storedImagesCount >= subscription.maxStoredImages && (
                                <Button size="sm" onClick={() => { setUpgradeMessage("Image storage capacity is full."); setIsUpgradeModalOpen(true); }} className="h-8 text-[9px] font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 w-full sm:w-auto shadow-none">Unlock Storage</Button>
                              )}
                              {subscription.monthlyCredits < 5 && <Button size="sm" onClick={() => { setUpgradeMessage("Low credits."); setIsUpgradeModalOpen(true); }} className="h-8 text-[9px] font-black uppercase tracking-widest w-full sm:w-auto">Top Up</Button>}
                            </div>
                          </div>
                        )}

                        <Button onClick={handleGenerateMeme} disabled={isGeneratingMeme} className="w-full h-20 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
                          {isGeneratingMeme ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                          {isGeneratingMeme ? 'Crafting Meme...' : 'Generate Magic Meme'}
                        </Button>
                     </div>
                   </div>
                </div>

                <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
                  <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                    <div className="min-h-full flex flex-col items-center justify-center p-4 lg:p-8">
                     {memeResult ? (
                       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8">
                         <div className="bg-card/60 backdrop-blur-lg border-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                           <img src={memeResult.imageUrl} alt="Meme" className="w-full h-auto object-contain bg-black/20" />
                           <div className="p-8 space-y-6">
                             <p className="text-xl font-bold italic">{memeResult.caption}</p>
                             <div className="flex gap-4">
                               <Button variant="outline" className="flex-1 h-14 rounded-xl font-black uppercase text-xs" onClick={async () => {
                                 try {
                                   await createPostApi({
                                     caption: memeResult.caption,
                                     hashtags: "",
                                     imageUrl: memeResult.imageUrl,
                                     platform: "FACEBOOK",
                                     status: PostStatus.DRAFT
                                   });
                                   toast.success("Meme saved to drafts! Check your Dashboard.");
                                 } catch (err) {
                                   toast.error("Failed to save meme to drafts.");
                                 }
                               }}>Save as Draft</Button>
                               
                               <Button title="Schedule for tomorrow" className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0" onClick={async () => {
                                 try {
                                   const tomorrow = new Date();
                                   tomorrow.setDate(tomorrow.getDate() + 1);
                                   const scheduledAt = tomorrow.toISOString().split('.')[0];
                                   
                                   await createPostApi({
                                     caption: memeResult.caption,
                                     hashtags: "",
                                     imageUrl: memeResult.imageUrl,
                                     platform: "FACEBOOK",
                                     status: PostStatus.SCHEDULED,
                                     scheduledAt: scheduledAt
                                   });
                                   toast.success("Meme scheduled for tomorrow! Check your Dashboard.");
                                 } catch (err) {
                                   toast.error("Failed to schedule meme.");
                                 }
                               }}>
                                 <CalendarIcon size={20} />
                               </Button>
                             </div>
                           </div>
                         </div>
                       </motion.div>
                     ) : (
                       <div className="w-full flex flex-col items-center justify-center text-center py-20 lg:py-32 space-y-6 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5">
                          <div className="p-10 bg-primary/10 rounded-full animate-pulse">
                            <Sparkles size={64} className="text-primary" />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-2xl font-black italic uppercase tracking-tighter">Enter the Meme Studio</h4>
                             <p className="text-sm text-muted-foreground font-medium">Viral brand identity begins with a single click.</p>
                          </div>
                       </div>
                     )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeMainTab === 'listening' ? (
              <motion.div 
                key="listening-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
                  <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                         <RefreshCcw className="text-primary" size={24} />
                         Social Listening
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Discover what's trending and how to exploit the viral gap.</p>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Niche Topic</label>
                          <input 
                            type="text" value={listeningTopic}
                            placeholder="e.g. Generative AI"
                            className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                            onChange={(e) => setListeningTopic(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleGenerateViralOpportunity} disabled={isListening} className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                          {isListening ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                          {isListening ? 'Listening...' : 'Find Viral Gap'}
                        </Button>
                     </div>
                  </div>
                </div>

                <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                      {viralResult ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-primary/10 border-2 border-primary/20 p-8 rounded-[2.5rem] space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">The Trend</h4>
                                <p className="text-xl font-black leading-tight italic">{viralResult.trend}</p>
                              </div>
                              <div className="bg-rose-500/10 border-2 border-rose-500/20 p-8 rounded-[2.5rem] space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">The Viral Gap</h4>
                                <p className="text-xl font-black leading-tight italic">{viralResult.viralGap}</p>
                              </div>
                           </div>

                           <div className="bg-card/60 backdrop-blur-xl border-2 border-white/5 p-10 rounded-[3rem] space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Viral Draft Post</h4>
                              <p className="text-2xl font-bold leading-relaxed">{viralResult.draftPost}</p>
                              <div className="flex flex-wrap gap-2">
                                {viralResult.hashtags.map((h, i) => (
                                  <span key={i} className="text-primary font-black text-sm">{h}</span>
                                ))}
                              </div>
                              <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={() => {
                                setCommand(viralResult.draftPost + "\n\n" + viralResult.hashtags.join(" "));
                                setActiveMainTab('create');
                                toast.success("Draft loaded into Engine!");
                              }}>Load into Content Engine</Button>
                           </div>
                        </motion.div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-6 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5">
                           <RefreshCcw size={64} className="text-muted-foreground/20 animate-spin-slow" />
                           <div className="space-y-2">
                             <h4 className="text-2xl font-black italic uppercase tracking-tighter">Listen to the Noise</h4>
                             <p className="text-sm text-muted-foreground font-medium">Enter a topic to find what the world is missing.</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              </motion.div>
            ) : activeMainTab === 'create' || activeMainTab === 'repurpose' ? (
              <motion.div 
                key="create-repurpose-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 overflow-hidden"
              >
                <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
                  {activeMainTab === 'repurpose' ? (
                     <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
                        <div className="space-y-4">
                           <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <Link2 className="text-primary" size={24} />
                            URL to Socials
                           </h3>
                           <p className="text-xs text-muted-foreground font-medium">Extract and repurpose any Blog or Website URL into 5 distinct social media posts instantly.</p>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="space-y-4">
                             <input 
                               type="url"
                               value={repurposeUrl}
                               onChange={(e) => setRepurposeUrl(e.target.value)}
                               placeholder="https://example.com/blog-post"
                               className="w-full bg-secondary/20 border-2 border-white/5 rounded-2xl py-4 px-6 text-sm font-medium focus:border-primary/50 outline-none transition-all"
                             />
                           </div>
                           <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AI Model</label>
                             <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
                           </div>
                           
                           {subscription && (
                             <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 5 ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                               <div className="flex gap-6">
                                 <div className="space-y-0.5">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Credits Required</p>
                                   <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary")}>~5</p>
                                 </div>
                                 <div className="space-y-0.5 border-l-2 border-primary/10 pl-6 flex-1 text-right">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Available</p>
                                   <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary")}>
                                     {subscription.monthlyCredits.toFixed(1)}
                                   </p>
                                 </div>
                               </div>
                             </div>
                           )}
     
                           <Button onClick={handleRepurpose} disabled={isRepurposing} className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
                             {isRepurposing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                             {isRepurposing ? 'Extracting & Generating...' : 'Repurpose URL'}
                           </Button>
                        </div>
                     </div>
                  ) : (
                    <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-6 lg:p-10 rounded-[2.5rem] space-y-10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10">
                        <Sparkles size={120} className="text-primary" />
                      </div>
  
                      <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Platforms</label>
                      <div className="flex bg-secondary/20 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
                        {(['FB', 'IG', 'LI', 'X'] as const).map((p) => (
                          <button 
                            key={p} 
                            onClick={() => {
                              setSelectedPlatforms(prev => 
                                prev.includes(p) 
                                  ? prev.filter(x => x !== p) 
                                  : [...prev, p]
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

                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Intensity</label>
                        <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                          <span className="text-primary font-black text-sm">{batchCount}</span>
                        </div>
                      </div>
                      <input type="range" min="1" max="10" value={batchCount} onChange={(e) => setBatchCount(parseInt(e.target.value))} className="w-full h-1.5 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">AI Model</label>
                      <ModelSelect options={AI_MODELS} selectedId={selectedModel} onSelect={setSelectedModel} userTierOrdinal={subscription?.tierOrdinal || 0} purchasedModelIds={subscription?.purchasedModelIds} />
                    </div>

                    <div className="space-y-5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Concept</label>
                      <textarea value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Describe your goal..." className="w-full h-44 bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] p-6 text-lg font-medium focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner" />
                    </div>

                    <div className="space-y-4">
                      {subscription && (
                        <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 lg:p-5 rounded-[1.5rem] border-2 transition-all gap-4", subscription.monthlyCredits < 5 || (subscription.maxStoredImages !== -1 && subscription.storedImagesCount >= subscription.maxStoredImages) ? "bg-rose-500/10 border-rose-500/20" : "bg-primary/5 border-primary/10")}>
                          <div className="flex gap-6">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Credits</p>
                              <p className={cn("text-xl font-black tracking-tighter", subscription.monthlyCredits < 5 ? "text-rose-500" : "text-primary")}>{subscription.monthlyCredits.toFixed(2)}</p>
                            </div>
                            <div className="space-y-0.5 border-l-2 border-primary/10 pl-6">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-sans">Storage</p>
                              <p className={cn("text-xl font-black tracking-tighter", (subscription.maxStoredImages !== -1 && subscription.storedImagesCount >= subscription.maxStoredImages) ? "text-rose-500" : "text-primary")}>
                                {subscription.storedImagesCount} / {subscription.maxStoredImages === -1 ? '∞' : subscription.maxStoredImages}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {subscription.maxStoredImages !== -1 && subscription.storedImagesCount >= subscription.maxStoredImages && (
                              <Button size="sm" onClick={() => { setUpgradeMessage("Image storage capacity is full."); setIsUpgradeModalOpen(true); }} className="h-8 text-[9px] font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 w-full sm:w-auto shadow-none">Unlock Storage</Button>
                            )}
                            {subscription.monthlyCredits < 5 && <Button size="sm" onClick={() => { setUpgradeMessage("Low credits."); setIsUpgradeModalOpen(true); }} className="h-8 text-[9px] font-black uppercase tracking-widest w-full sm:w-auto">Top Up</Button>}
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
                )}
                </div>

                <div className="lg:col-span-8 h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
                  <div className="flex items-center gap-6 px-4 shrink-0">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Wand2 size={28} />
                    </div>
                    <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                    <h3 className="font-black text-xl uppercase tracking-[0.3em] text-muted-foreground/80 shrink-0 italic">Studio Output</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                    <AnimatePresence mode="popLayout">
                      {isGenerating ? (
                        <motion.div key="skeletons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                      ) : generatedThreads.length > 0 ? (
                        <motion.div key="threads" layout className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {generatedThreads.map((thread, threadIdx) => (
                            <motion.div key={threadIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card/60 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl relative group hover:border-primary/50 transition-all">
                              <div className="flex justify-between items-center bg-primary/10 -mx-10 -mt-10 px-10 py-6 mb-4 rounded-t-[3rem] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                  <XLogo size={20} className="text-primary" />
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Generated Thread {threadIdx + 1}</h4>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{thread.length} Tweets</span>
                              </div>
                              
                              <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                                {thread.map((tweet, tweetIdx) => (
                                  <div key={tweetIdx} className="relative pl-8 border-l-2 border-white/5 pb-6 last:pb-0">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                                    <p className="text-sm font-bold leading-relaxed">{tweet}</p>
                                    <div className="absolute -left-6 top-0 text-[10px] font-black text-muted-foreground/30">
                                      {tweetIdx + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-4 pt-4">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px]" onClick={() => handleSaveThread(thread, PostStatus.DRAFT)}>Save Draft</Button>
                                <Button className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" onClick={() => handleSaveThread(thread, PostStatus.SCHEDULED)}>
                                  <CalendarIcon size={20} />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : generatedPosts.length > 0 ? (
                        <motion.div key="posts" layout className={cn("grid gap-10", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                          {generatedPosts.map((post, index) => (
                            <motion.div key={index} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={cn("group bg-card/60 backdrop-blur-lg border-2 border-white/5 rounded-[3rem] overflow-hidden transition-all duration-500 hover:border-primary/50 flex flex-col h-full shadow-2xl relative", viewMode === 'list' && "flex-row h-72")}>
                              <div className={cn("relative overflow-hidden", viewMode === 'grid' ? "aspect-square" : "w-72 shrink-0")}>
                                {post.imageUrl ? <img src={post.imageUrl} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full bg-secondary/20 flex flex-col items-center justify-center p-8"><Sparkles className="text-primary/40" size={48} /></div>}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                  <Button size="icon" variant="secondary" className="rounded-2xl h-14 w-14" onClick={() => handlePredictPerformance(post.caption, index)} disabled={isPredicting[index]}>{isPredicting[index] ? <Loader2 className="animate-spin" /> : <BarChart3 size={24} />}</Button>
                                  <Button size="icon" variant="secondary" className="rounded-2xl h-14 w-14 text-rose-500" onClick={() => handleDelete(index)}><Trash2 size={24} /></Button>
                                </div>
                              </div>
                              <div className="p-10 flex-1 flex flex-col justify-between">
                                <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar">
                                  <p className="text-xl font-bold leading-relaxed tracking-tight italic">{post.caption.trim()} <span className="text-primary">{post.hashtags.join(' ')}</span></p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button variant="outline" size="lg" disabled={processingId === `draft-${index}`} onClick={() => handleDraft(post, index)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px]">Draft</Button>
                                  <Button size="lg" disabled={processingId === `schedule-${index}`} onClick={() => handleSchedule(post, index)} className="w-14 h-14 p-0 rounded-2xl flex items-center justify-center"><CalendarIcon size={20} /></Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20 lg:py-0 space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 relative overflow-hidden">
                          <Sparkles size={48} className="text-primary opacity-40 animate-pulse" />
                          <div className="max-w-md mx-auto space-y-3 px-6">
                            <h4 className="font-black text-4xl md:text-5xl tracking-tighter uppercase italic">AI Studio</h4>
                            <p className="text-muted-foreground font-medium opacity-60">Describe your vision and watch AI manifest your brand identity.</p>
                          </div>
                          <Button size="lg" className="px-12 h-16 rounded-[1.5rem] text-xl font-black group shadow-2xl transition-all active:scale-95" onClick={handleGenerate}>Creative Session</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} message={upgradeMessage} />
    </PageWrapper>
  );
};

export default GeneratePage;
