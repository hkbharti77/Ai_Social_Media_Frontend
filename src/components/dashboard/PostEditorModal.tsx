import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Link as LinkIcon, Share2, Loader2, Image as ImageIcon,
  Sparkles, Hash, Calendar, CheckCircle2, Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { createPostApi, updatePostApi, schedulePostApi, type Post, PostStatus } from '../../api/posts';
import { toast } from 'sonner';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  mode: 'create' | 'edit';
  initialData?: Post | null;
}

const PostEditorModal: React.FC<PostEditorModalProps> = ({ isOpen, onClose, onSave, mode, initialData }) => {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [platform, setPlatform] = useState<'FACEBOOK' | 'INSTAGRAM'>('INSTAGRAM');
  const [status, setStatus] = useState<string>(PostStatus.DRAFT);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Compute a default tomorrow datetime for scheduling
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  };

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setCaption(initialData.caption || '');
      setHashtags(initialData.hashtags || '');
      setImageUrl(initialData.imageUrl || '');
      setPlatform((initialData.platform?.toUpperCase() === 'FACEBOOK' ? 'FACEBOOK' : 'INSTAGRAM'));
      setStatus(initialData.status || PostStatus.DRAFT);
      setScheduledAt(initialData.scheduledAt ? initialData.scheduledAt.slice(0, 16) : getTomorrow());
    } else {
      setCaption('');
      setHashtags('');
      setImageUrl('');
      setPlatform('INSTAGRAM');
      setStatus(PostStatus.DRAFT);
      setScheduledAt(getTomorrow());
    }
  }, [mode, initialData, isOpen]);

  const handleSave = async () => {
    if (!caption.trim()) {
      toast.error('Caption is required');
      return;
    }
    setIsSaving(true);
    try {
      const postData: Post = {
        caption,
        hashtags,
        imageUrl,
        platform,
        status: status as typeof PostStatus[keyof typeof PostStatus],
        scheduledAt: status === PostStatus.SCHEDULED ? scheduledAt : undefined,
      };

      let savedPost: Post;
      if (mode === 'edit' && initialData?.id) {
        savedPost = await updatePostApi(initialData.id, postData);
        // If status changed to SCHEDULED, also set the schedule
        if (status === PostStatus.SCHEDULED && scheduledAt) {
          savedPost = await schedulePostApi(initialData.id, scheduledAt);
        }
        toast.success('Post updated!', { icon: <CheckCircle2 size={16} className="text-emerald-500" /> });
      } else {
        savedPost = await createPostApi(postData);
        toast.success('Post created!', { icon: <CheckCircle2 size={16} className="text-emerald-500" /> });
      }

      onSave(savedPost);
      onClose();
    } catch (error: any) {
      console.error('Failed to save post', error);
      toast.error(error?.response?.data?.message || 'Failed to save post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl bg-card/60 backdrop-blur-3xl border-2 border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.7)] rounded-[2rem] md:rounded-[3rem] overflow-hidden my-auto"
          >
            <div className="p-6 md:p-14 space-y-10">
              <header className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-primary">
                    <Sparkles size={16} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cortex Content Editor</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                    {mode === 'create' ? 'Initialize Post' : 'Refine Transmission'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Editor */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Caption */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                      Caption
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="What story are you telling your audience?"
                      className="w-full h-36 md:h-48 px-6 py-5 bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium resize-none shadow-inner"
                    />
                  </div>

                  {/* Hashtags */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                      <Hash size={14} /> Hashtags
                    </label>
                    <input
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      placeholder="#AI #Automation #SocialMedia"
                      className="w-full px-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium shadow-inner"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                      <ImageIcon size={14} /> Image URL
                    </label>
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... (paste URL or use AI Vault)"
                      className="w-full px-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Platform */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Platform</label>
                      <div className="flex bg-secondary/20 p-2 rounded-2xl border border-white/5">
                        {(['FACEBOOK', 'INSTAGRAM'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 text-xs font-black',
                              platform === p
                                ? 'bg-background shadow-2xl text-primary scale-105'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {p === 'FACEBOOK' ? <LinkIcon size={16} /> : <Share2 size={16} />}
                            {p === 'FACEBOOK' ? 'FB' : 'IG'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none appearance-none cursor-pointer font-black uppercase tracking-widest text-xs shadow-inner"
                      >
                        <option value={PostStatus.DRAFT}>Draft</option>
                        <option value={PostStatus.SCHEDULED}>Schedule</option>
                      </select>
                    </div>
                  </div>

                  {/* Schedule datetime — shown only when status = SCHEDULED */}
                  <AnimatePresence>
                    {status === PostStatus.SCHEDULED && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                          <Calendar size={14} /> Schedule Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="w-full px-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium shadow-inner"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right: Image Preview */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Studio Preview
                    </label>
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                      {platform === 'INSTAGRAM' ? <Share2 size={12} /> : <LinkIcon size={12} />}
                      Live on {platform === 'FACEBOOK' ? 'Facebook' : 'Instagram'}
                    </div>
                  </div>
                  <div className="aspect-[4/5] bg-secondary/20 border-2 border-white/5 rounded-[3rem] overflow-hidden relative group shadow-2xl">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Post Visual"
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                        <ImageIcon size={48} />
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Paste image URL above</p>
                      </div>
                    )}
                    {imageUrl && (
                      <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(imageUrl, '_blank')}
                          className="p-4 bg-primary/80 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-primary transition-all hover:scale-110 shadow-2xl"
                          title="Download Asset"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                    {(caption || hashtags) && (
                      <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/10 shadow-2xl">
                        <p className="text-sm line-clamp-3 font-medium text-white/90 leading-relaxed italic">
                          "{caption || 'Your caption here...'}"
                          {hashtags && <span className="ml-2 text-primary/80">{hashtags}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <footer className="flex flex-col md:flex-row justify-end gap-4 pt-8 border-t-2 border-white/5">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full md:w-auto h-14 px-10 rounded-[1.25rem] font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all order-2 md:order-1"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto h-14 px-14 gap-3 rounded-[1.25rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 active:scale-95 transition-all relative overflow-hidden group order-1 md:order-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {mode === 'create' ? 'Establish Post' : 'Commit Changes'}
                  </div>
                </Button>
              </footer>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostEditorModal;
