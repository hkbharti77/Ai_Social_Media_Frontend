import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Link as LinkIcon, Share2, Loader2, Image as ImageIcon,
  Sparkles, Hash, Calendar, CheckCircle2, Download, Plus, Layers,
  Smartphone, PieChart, Trash2, ArrowRight, Video,
  CloudUpload
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { createPostApi, updatePostApi, schedulePostApi, type Post, PostStatus } from '../../api/posts';
import { listMediaApi, uploadMediaApi } from '../../api/media';
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
  const [platform, setPlatform] = useState<'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN'>('INSTAGRAM');
  const [status, setStatus] = useState<string>(PostStatus.DRAFT);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isCarousel, setIsCarousel] = useState(false);
  const [carouselContent, setCarouselContent] = useState<string | undefined>(undefined);
  const [isStory, setIsStory] = useState(false);
  const [isPoll, setIsPoll] = useState(false);
  const [isReel, setIsReel] = useState(false);
  const [videoScript, setVideoScript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  // Vault/AI States
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultMedia, setVaultMedia] = useState<{url: string, downloadUrl: string}[]>([]);
  const [isFetchingVault, setIsFetchingVault] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

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
      setPlatform((initialData.platform?.toUpperCase() === 'FACEBOOK' ? 'FACEBOOK' : initialData.platform?.toUpperCase() === 'LINKEDIN' ? 'LINKEDIN' : 'INSTAGRAM'));
      setStatus(initialData.status || PostStatus.DRAFT);
      setScheduledAt(initialData.scheduledAt ? initialData.scheduledAt.slice(0, 16) : getTomorrow());
      setIsCarousel(!!initialData.isCarousel);
      setCarouselContent(initialData.carouselContent);
      setIsStory(!!initialData.isStory);
      setIsPoll(!!initialData.isPoll);
      setIsReel(!!initialData.isReel);
      setVideoScript(initialData.videoScript || '');
      setVideoUrl(initialData.videoUrl || '');
      
      if (initialData.isPoll && initialData.pollContent) {
        try {
          const poll = JSON.parse(initialData.pollContent);
          setPollQuestion(poll.question || '');
          setPollOptions(poll.options || [{ text: '' }, { text: '' }]);
        } catch (e) {
          console.error("Failed to parse poll content", e);
        }
      }
    } else {
      setCaption('');
      setHashtags('');
      setImageUrl('');
      setPlatform('INSTAGRAM');
      setStatus(PostStatus.DRAFT);
      setScheduledAt(getTomorrow());
      setIsCarousel(false);
      setCarouselContent(undefined);
      setIsStory(false);
      setIsPoll(false);
      setIsReel(false);
      setVideoScript('');
      setVideoUrl('');
      setPollQuestion('');
      setPollOptions([{ text: '' }, { text: '' }]);
    }
  }, [mode, initialData, isOpen]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error("Please upload a valid video file (.mp4, .mov, etc.)");
      return;
    }

    setIsUploading(true);
    try {
      const data = await uploadMediaApi(file);
      setVideoUrl(data.url);
      toast.success("Final video asset uploaded!");
    } catch (error) {
      console.error("Video upload failed", error);
      toast.error("Failed to upload video.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setIsImageUploading(true);
    try {
      const data = await uploadMediaApi(file);
      setImageUrl(data.url);
      toast.success("Design asset uploaded!");
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const fetchVaultMedia = async () => {
    setIsFetchingVault(true);
    try {
      const data = await listMediaApi();
      setVaultMedia(data);
    } catch (error) {
      console.error("Failed to fetch vault", error);
      toast.error("Could not reach cloud vault.");
    } finally {
      setIsFetchingVault(false);
    }
  };

  const handleAiSuggest = async (type: 'caption' | 'hashtags') => {
    setIsAiThinking(true);
    try {
      const prompt = `Suggest a ${type} for a ${platform} post. ${caption ? `Current context: ${caption}` : `Focus on ${platform} growth.`}`;
      const response = await axiosInstance.post<{posts: {caption: string, hashtags: string}[]}>('/ai/generate', {
        command: prompt,
        count: 1,
        modelId: 'gemini-1.5-flash',
        aspectRatio: '1:1'
      });
      
      const suggested = response.data.posts[0];
      if (type === 'caption') setCaption(suggested.caption);
      if (type === 'hashtags') setHashtags(suggested.hashtags);
      toast.success(`${type === 'caption' ? 'Caption' : 'Hashtags'} generated by AI!`);
    } catch (error) {
      console.error("AI Suggestion failed", error);
      toast.error("AI Assistant is currently offline.");
    } finally {
      setIsAiThinking(false);
    }
  };

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
        isCarousel,
        carouselContent,
        isStory,
        isPoll,
        isReel,
        videoScript,
        videoUrl,
        pollContent: isPoll ? JSON.stringify({ question: pollQuestion || caption, options: pollOptions }) : undefined
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
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Failed to save post', err);
      toast.error(err?.response?.data?.message || 'Failed to save post. Please try again.');
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
                  {/* Content Type Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Content Format</label>
                    <div className="flex bg-secondary/10 p-1.5 rounded-2xl border border-white/5 gap-2 flex-wrap">
                      {[
                        { id: 'post', label: 'Feed Post', icon: Layers, active: !isStory && !isPoll && !isReel },
                        { id: 'story', label: 'Story', icon: Smartphone, active: isStory },
                        { id: 'poll', label: 'Interactive Poll', icon: PieChart, active: isPoll },
                        { id: 'reel', label: 'Video/Reel', icon: Video, active: isReel }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setIsStory(type.id === 'story');
                            setIsPoll(type.id === 'poll');
                            setIsReel(type.id === 'reel');
                          }}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                            type.active 
                              ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                              : "text-muted-foreground hover:bg-white/5"
                          )}
                        >
                          <type.icon size={14} />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isPoll ? (
                    <>
                      {/* Caption */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Caption
                      </label>
                      <button 
                        onClick={() => handleAiSuggest('caption')}
                        disabled={isAiThinking}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group"
                      >
                        {isAiThinking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />}
                        AI Suggest
                      </button>
                    </div>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="What story are you telling your audience?"
                      className="w-full h-36 md:h-48 px-6 py-5 bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium resize-none shadow-inner"
                    />
                  </div>

                  {isReel && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                        <Video size={14} /> Video Script
                      </label>
                      <textarea
                        value={videoScript}
                        onChange={(e) => setVideoScript(e.target.value)}
                        placeholder="Your video script goes here..."
                        className="w-full h-48 px-6 py-5 bg-secondary/20 border-2 border-primary/20 rounded-[1.5rem] focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium resize-none shadow-inner font-mono text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Hashtags */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Hash size={14} /> Hashtags
                      </label>
                      <button 
                        onClick={() => handleAiSuggest('hashtags')}
                        disabled={isAiThinking}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group"
                      >
                        {isAiThinking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />}
                        Smart Tags
                      </button>
                    </div>
                    <input
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      placeholder="#AI #Automation #SocialMedia"
                      className="w-full px-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium shadow-inner"
                    />
                  </div>

                  {/* Video URL / Upload */}
                  {isReel && (
                    <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-500">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                           {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />} Video Asset
                        </label>
                        {videoUrl && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Uploaded ✓</span>}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://... (Direct Video URL)"
                          className="w-full px-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none transition-all text-xs font-mono"
                        />
                        <label className="flex items-center justify-center gap-3 px-6 py-4 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:bg-primary/20 transition-all group">
                          <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                          <CloudUpload size={18} className="text-primary group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Upload MP4</span>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Poll Editor */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Poll Question</label>
                    <textarea
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="What would you like to ask your audience?"
                      className="w-full h-24 px-6 py-5 bg-secondary/20 border-2 border-white/5 rounded-[1.5rem] focus:border-primary/50 focus:outline-none transition-all text-lg font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Poll Options</label>
                      <span className="text-[10px] font-bold text-muted-foreground/60">{pollOptions.length}/4 Options</span>
                    </div>
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-3 animate-in zoom-in-95 duration-300">
                        <div className="relative flex-1">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                            {index + 1}
                          </div>
                          <input
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...pollOptions];
                              newOptions[index].text = e.target.value;
                              setPollOptions(newOptions);
                            }}
                            placeholder={`Option ${index + 1}...`}
                            className="w-full pl-16 pr-6 py-4 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none transition-all font-medium"
                          />
                        </div>
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                            className="p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl transition-all border border-rose-500/10 shadow-lg shadow-rose-500/5 group"
                          >
                            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 4 && (
                      <button
                        onClick={() => setPollOptions([...pollOptions, { text: '' }])}
                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Platform */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Platform Target</label>
                      <div className="flex bg-secondary/20 p-1.5 rounded-2xl border border-white/5 gap-1">
                        {(['FACEBOOK', 'INSTAGRAM', 'LINKEDIN'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={cn(
                              'relative flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-300 text-[9px] md:text-[10px] font-black uppercase overflow-hidden',
                              platform === p
                                ? cn(
                                    'text-white shadow-xl scale-[1.02] z-10',
                                    p === 'INSTAGRAM' && 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-rose-500/20',
                                    p === 'FACEBOOK' && 'bg-blue-600 shadow-blue-500/20',
                                    p === 'LINKEDIN' && 'bg-[#0077b5] shadow-blue-400/20'
                                  )
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 z-0'
                            )}
                          >
                            {p === 'FACEBOOK' ? <LinkIcon size={12} className="shrink-0" /> : p === 'INSTAGRAM' ? <Share2 size={12} className="shrink-0" /> : <div className="w-3 h-3 flex items-center justify-center font-bold text-[8px] bg-white text-[#0077b5] rounded-sm shrink-0">in</div>}
                            <span className="truncate">{p === 'FACEBOOK' ? 'Facebook' : p === 'INSTAGRAM' ? 'Instagram' : 'LinkedIn'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Publishing Mode</label>
                      <div className="relative group">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full h-[60px] px-6 bg-secondary/20 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none appearance-none cursor-pointer font-black uppercase tracking-widest text-[11px] shadow-inner text-foreground/80"
                        >
                          <option value={PostStatus.DRAFT}>Draft (Save to Archive)</option>
                          <option value={PostStatus.SCHEDULED}>Schedule (Auto-Transmit)</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                          <Plus size={16} className="rotate-45" />
                        </div>
                      </div>
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
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                        {platform === 'INSTAGRAM' ? <Share2 size={12} /> : platform === 'FACEBOOK' ? <LinkIcon size={12} /> : <div className="w-3 h-3 flex items-center justify-center font-bold text-[8px] bg-primary text-white rounded-[2px]">in</div>}
                        Live on {platform === 'FACEBOOK' ? 'Facebook' : platform === 'INSTAGRAM' ? 'Instagram' : 'LinkedIn'}
                      </div>
                      <div className="h-px flex-1 bg-white/5" />
                      <div className="flex gap-2">
                        <label className="p-2 cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group" title="Upload Local Image">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <CloudUpload size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </label>
                        <button 
                          onClick={() => {
                            if (!isVaultOpen) fetchVaultMedia();
                            setIsVaultOpen(!isVaultOpen);
                          }}
                          className={cn(
                            "p-2 rounded-lg border transition-all group",
                            isVaultOpen ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                          )}
                          title="Browse Cloud Vault"
                        >
                          <Layers size={14} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "bg-secondary/20 border-2 border-white/5 rounded-[3rem] overflow-hidden relative group shadow-2xl transition-all duration-700",
                    (isStory || isReel) ? "aspect-[9/16] max-h-[500px] mx-auto" : platform === 'INSTAGRAM' ? "aspect-square" : "aspect-[4/5]"
                  )}>
                    {isVaultOpen ? (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl z-30 p-6 flex flex-col animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Layers size={14} /> Cloud Vault
                           </h3>
                           <button onClick={() => setIsVaultOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground">
                            <X size={14} />
                           </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {isFetchingVault ? (
                            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                              <Loader2 className="animate-spin" size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Opening Secure Vault...</span>
                            </div>
                          ) : vaultMedia.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                              <ImageIcon size={32} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Vault is Empty</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {vaultMedia.map((asset, idx) => (
                                <motion.div
                                  key={idx}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setImageUrl(asset.url);
                                    setIsVaultOpen(false);
                                  }}
                                  className="aspect-square rounded-xl overflow-hidden border-2 border-white/5 hover:border-primary cursor-pointer transition-all shadow-lg"
                                >
                                  <img src={asset.url} className="w-full h-full object-cover" alt="Vault Asset" />
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {isImageUploading && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-4 animate-in fade-in">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 animate-pulse">
                          <CloudUpload size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Encrypting & Uploading...</p>
                      </div>
                    )}

                    {isReel && videoUrl ? (
                      <video 
                        src={videoUrl} 
                        controls 
                        poster={imageUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                    ) : imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Post Visual"
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                        <ImageIcon size={48} />
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                          {isReel ? 'Upload video or cover' : 'Upload or Select Media'}
                        </p>
                      </div>
                    )}

                    {/* Poll Preview Overlay */}
                    {isPoll && (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/60 backdrop-blur-[2px] flex items-center justify-center p-8">
                        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-6">
                          <div className="flex items-center gap-3 text-primary animate-pulse">
                            <PieChart size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Poll</span>
                          </div>
                          <h4 className="text-xl font-bold text-white tracking-tight leading-tight">
                            {pollQuestion || "Your question will appear here..."}
                          </h4>
                          <div className="space-y-3">
                            {pollOptions.map((opt, i) => (
                              <div key={i} className="group/opt relative h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center px-4 transition-all overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 group-hover/opt:w-full transition-all duration-500 opacity-20" />
                                <span className="relative text-xs font-bold text-white/80">{opt.text || `Option ${i+1}`}</span>
                                <div className="ml-auto relative">
                                  <ArrowRight size={14} className="text-white/20 group-hover/opt:text-primary transition-colors translate-x-4 group-hover/opt:translate-x-0 transition-transform duration-300" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] text-center pt-2">Poll expires in 24 hours</p>
                        </div>
                      </div>
                    )}

                    {/* Carousel Layer Indicator */}
                    {isCarousel && (
                      <div className="absolute top-6 left-6 z-20">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2.5">
                          <Layers size={14} className="text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                            Carousel Post
                          </span>
                        </div>
                      </div>
                    )}
                    {isReel && (
                      <div className="absolute top-6 left-6 z-20">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2.5">
                          <Video size={14} className="text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                            Video Reel Script
                          </span>
                        </div>
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
