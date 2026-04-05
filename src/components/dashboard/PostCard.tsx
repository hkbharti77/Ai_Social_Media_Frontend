import React from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Edit2,
  Clock,
  CheckCircle2,
  MoreVertical,
  Share2,
  Link as LinkIcon,
  Sunrise,
  Sunset,
  Loader2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Layers,
  Smartphone,
  PieChart
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { type Post } from '../../api/posts';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (id: number) => void;
  onToggleEvergreen?: (post: Post) => void;
  onApprove?: (id: number) => void;
  onRemove?: (id: number) => void;       // Evergreen page: remove from queue
  evergreenLoadingId?: number | null;
  removingId?: number | null;            // Evergreen page: removing state
  getStatusColor?: (status: string) => string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onToggleEvergreen,
  onApprove,
  onRemove,
  evergreenLoadingId = null,
  removingId = null,
  getStatusColor,
}) => {
  // Evergreen mode = when onRemove is provided (used in EvergreenPage)
  const isEvergreenMode = !!onRemove;

  // Carousel Helper
  const carouselData = React.useMemo(() => {
    if (!post.isCarousel || !post.carouselContent) return null;
    try {
      return JSON.parse(post.carouselContent) as { slides: { imageUrl?: string; caption?: string; [key: string]: unknown }[] };
    } catch {
      return null;
    }
  }, [post.isCarousel, post.carouselContent]);

  const pollData = React.useMemo(() => {
    if (!post.isPoll || !post.pollContent) return null;
    try {
      return JSON.parse(post.pollContent) as { question: string; options: { text: string; [key: string]: unknown }[] };
    } catch {
      return null;
    }
  }, [post.isPoll, post.pollContent]);

  const getSlotBadge = () => {
    if (!post.slotType) return null;
    return (
      <div className={cn(
        "absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md border border-white/10 shadow-xl z-20",
        post.slotType === 'MORNING' ? 'bg-amber-500/80 text-white' : 'bg-indigo-600/80 text-white'
      )}>
        {post.slotType === 'MORNING' ? <Sunrise size={14} /> : <Sunset size={14} />}
        {post.slotType} SLOT
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={cn(
        "group backdrop-blur-lg border-2 rounded-[3rem] overflow-hidden transition-all duration-500 flex flex-col h-full shadow-2xl relative",
        isEvergreenMode
          ? "bg-card/60 border-emerald-500/20 hover:border-emerald-400/50 hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)]"
          : "bg-card/60 border-white/5 hover:border-primary/50 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
      )}
    >
      {/* ── Image Area ─────────────────────────────────── */}
      <div className="aspect-[4/5] bg-secondary/20 relative overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.caption || 'Post preview'}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            {isEvergreenMode ? (
              <Leaf className="text-emerald-400/30" size={48} />
            ) : post.isPoll && pollData ? (
              <div className="w-full h-full p-8 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <PieChart size={48} className="text-primary/20" />
                <div className="w-full space-y-2">
                  {pollData.options.slice(0, 3).map((opt, i) => (
                    <div key={i} className="h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-3">
                      <span className="text-[9px] font-bold text-muted-foreground/60">{opt.text}</span>
                    </div>
                  ))}
                  {pollData.options.length > 3 && <div className="text-center text-[8px] font-black text-muted-foreground/40">+{pollData.options.length - 3} MORE</div>}
                </div>
              </div>
            ) : (
              <Sparkles size={48} className="text-primary/20" />
            )}
          </div>
        )}

        {/* Story Indicator */}
        {post.isStory && (
          <div className={cn(
            "absolute flex items-center gap-2 z-20",
            post.slotType ? "top-20 left-6" : "top-6 left-6"
          )}>
            <div className="bg-rose-500/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2.5">
              <Smartphone size={14} className="text-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                Story
              </span>
            </div>
          </div>
        )}

        {/* Poll Indicator */}
        {post.isPoll && (
          <div className={cn(
            "absolute flex items-center gap-2 z-20",
            post.slotType ? "top-20 left-6" : "top-6 left-6"
          )}>
            <div className="bg-primary/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2.5">
              <PieChart size={14} className="text-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                Poll
              </span>
            </div>
          </div>
        )}

        {/* Carousel Indicator */}
        {post.isCarousel && carouselData && !post.isStory && !post.isPoll && (
          <div className={cn(
            "absolute flex items-center gap-2 z-20",
            post.slotType ? "top-20 left-6" : "top-6 left-6"
          )}>
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2.5">
              <Layers size={14} className="text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                Carousel
              </span>
            </div>
          </div>
        )}

        {/* Slide Preview count (bottom-right) */}
        {post.isCarousel && carouselData && (
          <div className="absolute bottom-6 right-6 z-10">
            <div className="bg-primary/20 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-primary/30 shadow-xl flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(3, carouselData.slides.length))].map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-md bg-primary border border-white/20 shadow-sm" />
                ))}
              </div>
              <span className="text-[9px] font-black text-primary uppercase">
                {carouselData.slides.length} SLIDES
              </span>
            </div>
          </div>
        )}

        {/* Dashboard mode — Floating Evergreen Toggle (top-right) */}
        {!isEvergreenMode && post.status === 'PUBLISHED' && onToggleEvergreen && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleEvergreen(post)}
            disabled={evergreenLoadingId === post.id}
            className={cn(
              "absolute top-6 right-6 z-30 w-11 h-11 p-0 rounded-2xl backdrop-blur-xl border transition-all duration-300 active:scale-90 shadow-2xl",
              post.isEvergreen
                ? "border-emerald-500/50 bg-emerald-500/20 shadow-emerald-500/20"
                : "border-white/10 bg-black/20 hover:bg-black/40 text-white"
            )}
          >
            {evergreenLoadingId === post.id ? (
              <Loader2 size={16} className="animate-spin text-emerald-400" />
            ) : (
              <Leaf
                size={20}
                className={cn(
                  "relative z-10 transition-all duration-300",
                  post.isEvergreen ? "scale-110" : "opacity-70 group-hover:opacity-100"
                )}
                fill={post.isEvergreen ? "url(#leaf-gradient)" : "none"}
                stroke={post.isEvergreen ? "#34d399" : "currentColor"}
              />
            )}
          </Button>
        )}

        {/* Evergreen mode — Evergreen + Score badges */}
        {isEvergreenMode && (
          <>
            <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 shadow-2xl flex items-center gap-2.5 z-20">
              <Leaf size={14} className="text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-50">Evergreen</span>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-2 z-20">
              <TrendingUp size={12} className="text-amber-400" />
              <span className="text-[10px] font-black tracking-widest text-white">
                {(post.evergreenScore ?? 0).toFixed(1)}
              </span>
            </div>
          </>
        )}

        {/* Dashboard mode — Slot badge (top-left) */}
        {!isEvergreenMode && getSlotBadge()}

        {/* Platform badge */}
        <div className={cn(
          "absolute px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl z-10 transition-transform group-hover:scale-105",
          isEvergreenMode ? "bottom-4 right-4" : "bottom-6 left-6"
        )}>
          <p className="text-[10px] font-black tracking-widest text-white uppercase flex items-center gap-2">
            {post.platform === 'INSTAGRAM'
              ? <Share2 size={12} className="text-pink-400" />
              : <LinkIcon size={12} className="text-blue-400" />
            }
            {post.platform}
          </p>
        </div>
      </div>

      {/* ── Content Area ────────────────────────────────── */}
      <div className="p-8 flex-1 flex flex-col justify-between space-y-6">

        {/* Caption */}
        <div className="flex justify-between items-start gap-4">
          <p className="text-lg font-bold line-clamp-3 text-foreground/90 leading-relaxed tracking-tight">
            {post.caption}{' '}
            <span className={isEvergreenMode ? "text-emerald-400/80" : "text-primary"}>
              {post.hashtags}
            </span>
          </p>

          {/* Dashboard mode — Three-dot delete menu */}
          {!isEvergreenMode && onDelete && (
            <div className="relative group/more shrink-0">
              <button className="text-muted-foreground/40 hover:text-foreground p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                <MoreVertical size={24} />
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover/more:block bg-card border-2 border-white/5 p-2 rounded-2xl shadow-2xl z-50 min-w-[120px]">
                <button
                  onClick={() => onDelete(post.id!)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-black uppercase tracking-widest"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Evergreen mode — Recycled date info */}
        {isEvergreenMode && (
          <div className="space-y-1.5 text-[11px] text-muted-foreground font-medium">
            {post.lastRecycledAt ? (
              <div className="flex items-center gap-2">
                <RefreshCw size={12} className="text-emerald-400 shrink-0" />
                <span>
                  Last recycled:{' '}
                  <span className="text-foreground">
                    {new Date(post.lastRecycledAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-amber-400 shrink-0" />
                <span className="text-amber-400/80">Never recycled — will run on next empty slot.</span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────── */}
        <div className={cn(
          "pt-4 border-t border-white/5",
          isEvergreenMode ? "flex flex-col gap-3" : "flex items-center justify-between"
        )}>
          {/* Dashboard mode — Status badge */}
          {!isEvergreenMode && getStatusColor && (
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-3 rounded-full border shadow-inner",
              getStatusColor(post.status)
            )}>
              {post.status === 'PUBLISHED' && <CheckCircle2 size={14} />}
              {post.status === 'DRAFT' && <Clock size={14} />}
              {post.status}
            </div>
          )}

          {/* Dashboard mode — Edit / Approve buttons */}
          {!isEvergreenMode && (
            <div className="flex items-center gap-3">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(post)}
                  className="gap-2.5 font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-[1.25rem] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all bg-white/3"
                >
                  <Edit2 size={14} className="text-primary" />
                  Edit
                </Button>
              )}
              {post.status === 'DRAFT' && post.slotType && onApprove && (
                <Button
                  size="sm"
                  onClick={() => onApprove(post.id!)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-[1.25rem] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-white"
                >
                  Approve
                </Button>
              )}
            </div>
          )}

          {/* Evergreen mode — Remove from Queue button */}
          {isEvergreenMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove!(post.id!)}
              disabled={removingId === post.id}
              className="w-full h-12 rounded-2xl border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
            >
              {removingId === post.id ? (
                <RefreshCw size={14} className="animate-spin mr-2" />
              ) : (
                <Leaf size={14} className="mr-2 opacity-60" />
              )}
              Remove from Queue
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
