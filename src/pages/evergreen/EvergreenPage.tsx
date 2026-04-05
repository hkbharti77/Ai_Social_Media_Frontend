import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import {
  Leaf,
  RefreshCw,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  getEvergreenPostsApi,
  unmarkEvergreenApi,
  triggerEvergreenFillApi,
  type Post,
} from '../../api/posts';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/dashboard/PostCard';

const EvergreenPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fillingSlot, setFillingSlot] = useState<'MORNING' | 'EVENING' | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvergreen();
  }, []);

  const fetchEvergreen = async () => {
    setIsLoading(true);
    try {
      const data = await getEvergreenPostsApi();
      setPosts(data);
    } catch {
      toast.error('Failed to load evergreen queue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    try {
      await unmarkEvergreenApi(id);
      toast.success('Post removed from Evergreen Queue.');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error('Failed to remove post.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleFill = async (slot: 'MORNING' | 'EVENING') => {
    setFillingSlot(slot);
    try {
      const result = await triggerEvergreenFillApi(slot);
      if (result.scheduledPostId) {
        toast.success(`♻️ Recycled post scheduled for ${slot} slot at ${result.scheduledAt?.split('T')[1]?.slice(0, 5)} IST!`);
        fetchEvergreen(); // refresh to show updated lastRecycledAt
      } else {
        toast.info(result.message);
      }
    } catch {
      toast.error('Evergreen fill failed.');
    } finally {
      setFillingSlot(null);
    }
  };

  const totalRecycled = posts.filter(p => p.lastRecycledAt).length;
  const nextFillDay = 'Tuesday';

  return (
    <PageWrapper>
      <div className="space-y-14 pb-20">

        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-amber-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="w-20 h-20 rounded-[2rem] bg-card/40 border-2 border-emerald-500/30 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-amber-300 shadow-2xl relative z-10 backdrop-blur-xl">
                <Leaf size={40} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Evergreen Queue
              </h1>
              <p className="text-muted-foreground text-lg font-medium opacity-60 max-w-xl leading-relaxed">
                Your best content, automatically recycled to keep your presence alive 24/7.
              </p>
            </div>
          </div>
        </header>

        {/* Hero Explainer */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-10"
        >
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -right-4 top-4 opacity-5">
            <RefreshCw size={180} className="text-emerald-400" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-black tracking-tighter text-emerald-300 uppercase">
                How It Works
              </h2>
              <ol className="space-y-3">
                {[
                  { icon: Star, text: 'Mark any published post as Evergreen from your dashboard.' },
                  { icon: TrendingUp, text: 'We compute a performance score — curated posts rank higher.' },
                  { icon: RefreshCw, text: 'Every Tuesday (and whenever a slot is empty), we auto-schedule your top evergreen post.' },
                  { icon: Zap, text: 'A cooldown of 14 days prevents the same post from repeating too soon.' },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-muted-foreground font-medium">
                    <div className="shrink-0 w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-0.5">
                      <Icon size={14} />
                    </div>
                    {text}
                  </li>
                ))}
              </ol>
            </div>

            {/* Quick Fill Buttons */}
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Manual Trigger</p>
              <Button
                onClick={() => handleFill('MORNING')}
                disabled={!!fillingSlot}
                className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {fillingSlot === 'MORNING' ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : (
                  <Sparkles size={16} className="mr-2" />
                )}
                Fill Morning Slot
              </Button>
              <Button
                onClick={() => handleFill('EVENING')}
                disabled={!!fillingSlot}
                variant="outline"
                className="h-14 rounded-2xl border-emerald-500/30 hover:bg-emerald-500/10 font-black uppercase tracking-widest text-sm active:scale-95 transition-all"
              >
                {fillingSlot === 'EVENING' ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : (
                  <Calendar size={16} className="mr-2" />
                )}
                Fill Evening Slot
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'In Queue', value: posts.length, icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
            { label: 'Total Recycled', value: totalRecycled, icon: RefreshCw, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
            { label: 'Avg Performance', value: (posts.length > 0 ? (posts.reduce((acc, p) => acc + (p.evergreenScore ?? 0), 0) / posts.length) : 0).toFixed(1), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
          ].map(stat => (
            <div
              key={stat.label}
              className={cn(
                'group relative flex items-center gap-6 p-8 rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:scale-[1.02]',
                stat.bg, stat.border
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-inner relative z-10', stat.bg, stat.border, stat.color)}>
                <stat.icon size={32} className="drop-shadow-[0_0_10px_currentColor]" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-black tracking-tighter">{stat.value}</p>
                  {stat.label === 'Avg Performance' && <span className="text-sm font-bold text-muted-foreground/40 italic">pts</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Fill Info */}
        <div className="flex items-center gap-3 px-2 text-sm text-muted-foreground">
          <Clock size={16} className="text-emerald-400 shrink-0" />
          <span>
            Auto-fill runs every <span className="text-foreground font-bold">{nextFillDay}</span> at{' '}
            <span className="text-foreground font-bold">6:30 AM IST</span> — and also whenever a publishing slot is empty.
          </span>
        </div>

        {/* Evergreen Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black tracking-tight uppercase tracking-[0.15em] text-muted-foreground/70 flex items-center gap-3">
              <Leaf size={18} className="text-emerald-400" />
              Queue ({posts.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 transition-all rounded-xl flex items-center gap-2"
            >
              Go to Dashboard to mark more
              <ChevronRight size={14} />
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-card/40 border-2 border-white/5 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center space-y-6 border-4 border-dashed border-emerald-500/10 rounded-[3rem] bg-emerald-500/3"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                  <Leaf size={48} />
                </div>
                <div className="max-w-sm mx-auto space-y-2">
                  <h4 className="font-black text-3xl tracking-tighter">Queue is Empty</h4>
                  <p className="text-muted-foreground opacity-70 font-medium">
                    Go to your dashboard, find a published post, and click{' '}
                    <span className="text-emerald-400 font-bold">Mark Evergreen</span> to add it here.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="px-10 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20"
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onRemove={handleRemove}
                    removingId={removingId}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EvergreenPage;
