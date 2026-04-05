import React from 'react';
import { Trash2, Calendar, Save, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { type GeneratedPost } from '../../../api/ai';
import { PostStatus } from '../../../api/posts';

interface ResultsViewProps {
  viewMode: 'grid' | 'list';
  generatedPosts: GeneratedPost[];
  generatedThreads: string[][];
  processingId: string | null;
  isPredicting: Record<number, boolean>;
  onDraft: (post: GeneratedPost, index: number) => void;
  onSchedule: (post: GeneratedPost, index: number) => void;
  onDelete: (index: number) => void;
  onPredict: (draft: string, index: number) => void;
  onSaveThread: (thread: string[], status: PostStatus) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  viewMode,
  generatedPosts,
  generatedThreads,
  processingId,
  isPredicting,
  onDraft,
  onSchedule,
  onDelete,
  onPredict,
  onSaveThread
}) => {
  if (generatedPosts.length === 0 && generatedThreads.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black uppercase tracking-tighter italic">AI Output</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-4 py-1.5 rounded-full border border-border/50">
          {generatedPosts.length > 0 ? `${generatedPosts.length} Assets Created` : `${generatedThreads.length} Threads Created`}
        </span>
      </div>

      <div className={cn(
        "grid gap-6 lg:gap-10",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {generatedPosts.map((post, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
               "bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all shadow-2xl",
               viewMode === 'list' && "flex flex-col md:flex-row h-auto md:h-80"
            )}
          >
            <div className={cn("relative overflow-hidden", viewMode === 'grid' ? "aspect-square" : "w-full md:w-80 h-80 md:h-full")}>
              <img src={post.imageUrl || ''} alt="AI Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                 <p className="text-white text-xs font-semibold italic line-clamp-3">Visual Suggestion: {post.imageSuggestion}</p>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-1 justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-medium leading-relaxed custom-scrollbar max-h-32 overflow-y-auto pr-2">{post.caption}</p>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-3">
                 <Button onClick={() => onSchedule(post, idx)} disabled={processingId?.includes(`schedule-${idx}`)} className="flex-1 py-6 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                    {processingId?.includes(`schedule-${idx}`) ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                    Schedule
                 </Button>
                 <Button onClick={() => onDraft(post, idx)} variant="outline" disabled={processingId?.includes(`draft-${idx}`)} className="rounded-xl border-white/10 hover:bg-white/5 px-4">
                    {processingId?.includes(`draft-${idx}`) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                 </Button>
                 <Button onClick={() => onPredict(post.caption, idx)} variant="outline" disabled={isPredicting[idx]} className="rounded-xl border-white/10 hover:bg-white/5 px-4 group/btn">
                    {isPredicting[idx] ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} className="group-hover/btn:text-primary transition-colors" />}
                 </Button>
                 <Button onClick={() => onDelete(idx)} variant="ghost" className="rounded-xl text-destructive hover:bg-destructive/10 px-4">
                    <Trash2 size={14} />
                 </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {generatedThreads.map((thread, threadIdx) => (
          <motion.div 
             key={`thread-${threadIdx}`}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="col-span-1 lg:col-span-2 bg-card/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6"
          >
             <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <span className="text-sm font-black uppercase italic text-primary">Thread Concept {threadIdx + 1}</span>
                <div className="flex gap-2">
                   <Button onClick={() => onSaveThread(thread, PostStatus.SCHEDULED)} variant="outline" className="rounded-xl border-primary/30 text-primary uppercase text-[10px] font-black tracking-widest">
                      Schedule Thread
                   </Button>
                   <Button onClick={() => onSaveThread(thread, PostStatus.DRAFT)} variant="ghost" className="rounded-xl text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                      Draft
                   </Button>
                </div>
             </div>
             
             <div className="space-y-4">
                {thread.map((tweet, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black">{idx+1}</div>
                       {idx < thread.length - 1 && <div className="w-0.5 flex-1 bg-white/5 my-2"></div>}
                    </div>
                    <div className="flex-1 p-4 bg-secondary/20 rounded-xl text-xs font-medium leading-relaxed">
                       {tweet}
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResultsView;
