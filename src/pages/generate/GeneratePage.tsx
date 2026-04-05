import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  Wand2, 
  ImageIcon, 
  Layers, 
  Link2, 
  List, 
  Sparkles, 
  BarChart3, 
  Target, 
  LayoutGrid,
  Cpu,
  ShieldCheck,
  Compass,
  Video,
  Smartphone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UpgradeModal } from '../../components/layout/UpgradeModal';
import { getProfile, type ProfileResponse } from '../../api/profile';
import { useAiGeneration } from '../../hooks/useAiGeneration';
import type { ModelOption } from '../../components/ui/ModelSelect';

const AI_MODELS: ModelOption[] = [
  { id: 'imagen-4-fast', name: 'Imagen 4.0 Fast', cost: 2.0, tier: 1, icon: ImageIcon, desc: 'Quick turnaround visualizations' },
  { id: 'imagen-4-standard', name: 'Imagen 4.0 Standard', cost: 4.0, tier: 1, icon: ImageIcon, desc: 'Balanced creative intelligence' },
  { id: 'imagen-4-ultra', name: 'Imagen 4.0 Ultra', cost: 6.0, tier: 2, icon: Sparkles, desc: 'Studio-grade photorealistic AI' },
  { id: 'gemini-3.1-flash-image', name: 'Gemini 3.1 Flash', cost: 10.0, tier: 0, icon: Cpu, desc: 'High-quality efficient rendering' },
  { id: 'gemini-3-pro-image', name: 'Gemini 3.0 Pro', cost: 14.0, tier: 2, icon: ShieldCheck, desc: 'Elite reasoning & deep strategy' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 4.0, tier: 0, icon: Sparkles, desc: 'Standard photorealistic and fast' },
];

// Modular Components
import CreationTab from './components/CreationTab';
import CarouselTab from './components/CarouselTab';
import RepurposeTab from './components/RepurposeTab';
import CampaignTab from './components/CampaignTab';
import ReelTab from './components/ReelTab';
import StoryTab from './components/StoryTab';
import PollTab from './components/PollTab';
import MemeTab from './components/MemeTab';
import TrendsTab from './components/TrendsTab';
import StrategyTab from './components/StrategyTab';
import ResultsView from './components/ResultsView';

const GeneratePage: React.FC = () => {
  // Global State
  const [activeMainTab, setActiveMainTab] = useState<string>('create');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-image');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
  const [selectedPlatforms, setSelectedPlatforms] = useState<('FB' | 'IG' | 'LI' | 'X')[]>(['FB', 'IG', 'LI', 'X']);
  
  // App State
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [selectedVoiceMode, setSelectedVoiceMode] = useState<string>('STYLE_DNA');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  // AI Hook
  const {
    generatedPosts,
    generatedThreads,
    processingId,
    isPredicting,
    handleCreated,
    handleDraft,
    handleSchedule,
    handleDelete,
    handlePredictPerformance,
    handleSaveThread,
    setGeneratedPosts,
    setGeneratedThreads
  } = useAiGeneration();

  const fetchSubscription = React.useCallback(async () => {
    try {
      const data = await getProfile();
      setSubscription(data.subscription);
    } catch (e) {
      console.error('Failed to fetch subscription', e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubscription();
  }, [fetchSubscription]);

  const [isGenerating, setIsGenerating] = useState(false);

  const renderActiveTab = () => {
    const commonProps = {
      selectedModel,
      setSelectedModel,
      selectedAspectRatio,
      setSelectedAspectRatio,
      selectedPlatforms,
      setSelectedPlatforms,
      subscription,
      onSuccess: fetchSubscription,
      onUpgradeRequired: (msg: string) => {
        setUpgradeMessage(msg);
        setIsUpgradeModalOpen(true);
      },
      isGenerating,
      setIsGenerating,
      selectedVoiceMode,
      setSelectedVoiceMode,
      AI_MODELS
    };

    switch (activeMainTab) {
      case 'create':
        return <CreationTab {...commonProps} onGenerated={handleCreated} />;
      case 'campaign':
        return <CampaignTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'repurpose':
        return <RepurposeTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'carousel':
        return <CarouselTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'reel':
        return <ReelTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'story':
        return <StoryTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'poll':
        return <PollTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'meme':
        return <MemeTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'listening':
        return <TrendsTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      case 'strategy':
        return <StrategyTab {...commonProps} onGenerated={(posts) => handleCreated(posts)} />;
      default:
        return <CreationTab {...commonProps} onGenerated={handleCreated} />;
    }
  };

  return (
    <PageWrapper isFullHeight>
      <div className="flex flex-col h-full space-y-6 lg:space-y-8 overflow-hidden">
        {/* --- Header & Navigation --- */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0 px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">AI Engine</h1>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <Sparkles size={12} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {subscription?.monthlyCredits?.toLocaleString() ?? '...'} Credits Ready
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-[10px] md:text-xs font-bold opacity-60 uppercase tracking-widest mt-1">Creative Content Studio</p>
          </div>
          
          <div className="flex bg-secondary/20 backdrop-blur-xl p-1 rounded-2xl border border-white/5 max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'create', label: 'AI Content', icon: Wand2 },
              { id: 'campaign', label: 'Campaigns', icon: Compass },
              { id: 'repurpose', label: 'Repurpose', icon: Link2 },
              { id: 'carousel', label: 'Carousels', icon: Layers },
              { id: 'reel', label: 'Reels', icon: Video },
              { id: 'story', label: 'Stories', icon: Smartphone },
              { id: 'poll', label: 'Polls', icon: List },
              { id: 'meme', label: 'Memes', icon: ImageIcon },
              { id: 'listening', label: 'Trends', icon: BarChart3 },
              { id: 'strategy', label: 'Growth', icon: Target }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveMainTab(tab.id);
                  setGeneratedPosts([]); 
                  setGeneratedThreads([]);
                }}
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

          <div className="flex items-center gap-2">
             <div className="flex bg-secondary/20 backdrop-blur-xl p-1 rounded-2xl border border-white/5">
               <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-background shadow-xl text-primary scale-105 border border-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                 <LayoutGrid size={18} />
               </button>
               <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-background shadow-xl text-primary scale-105 border border-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                 <List size={18} />
               </button>
             </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
           {generatedPosts.length > 0 || generatedThreads.length > 0 ? (
             <ResultsView 
               viewMode={viewMode}
               generatedPosts={generatedPosts}
               generatedThreads={generatedThreads}
               processingId={processingId}
               isPredicting={isPredicting}
               onDraft={(p, i) => handleDraft(p, i, selectedPlatforms)}
               onSchedule={(p, i) => handleSchedule(p, i, selectedPlatforms)}
               onDelete={handleDelete}
               onPredict={handlePredictPerformance}
               onSaveThread={handleSaveThread}
             />
           ) : (
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeMainTab}
                 initial={{ opacity: 0, scale: 0.98, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 1.02, y: -10 }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
                 className="h-full"
               >
                 {renderActiveTab()}
               </motion.div>
             </AnimatePresence>
           )}
        </div>
      </div>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        currentTierOrdinal={subscription?.tierOrdinal}
        message={upgradeMessage}
      />
    </PageWrapper>
  );
};

export default GeneratePage;
