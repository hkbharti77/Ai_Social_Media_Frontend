import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  MessageSquare, 
  RefreshCcw, 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  User, 
  Globe,
  Loader2,
  Zap,
  MoreVertical,
  MessageCircle,
  Hash
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getInboxApi, syncCommentsApi, draftReplyApi, sendReplyApi } from '../../api/community';
import type { Comment } from '../../api/community';
import { toast } from 'sonner';

const CommunityDashboard: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<string | null>(null);

  useEffect(() => {
    fetchInbox();
  }, [filterSentiment]);

  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const data = await getInboxApi(filterSentiment || undefined);
      setComments(data);
      if (data.length > 0 && !selectedComment) {
        setSelectedComment(data[0]);
        setReplyText(data[0].aiDraftReply || '');
      }
    } catch (error) {
      toast.error("Failed to load community inbox");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Syncing latest community interactions...");
    try {
      await syncCommentsApi();
      await fetchInbox();
      toast.success("Community Hub Updated!");
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDraftAI = async () => {
    if (!selectedComment) return;
    setIsDrafting(true);
    try {
      const { draft } = await draftReplyApi(selectedComment.id);
      setReplyText(draft);
      setComments(prev => prev.map(c => c.id === selectedComment.id ? { ...c, aiDraftReply: draft } : c));
      toast.success("AI Drafted a human-like response!");
    } catch (error) {
      toast.error("AI drafting failed");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedComment || !replyText.trim()) return;
    setIsSending(true);
    try {
      await sendReplyApi(selectedComment.id, replyText);
      setComments(prev => prev.map(c => c.id === selectedComment.id ? { ...c, isReplied: true } : c));
      toast.success("Reply posted successfully!");
      setReplyText('');
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'NEGATIVE': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'QUESTION': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'SPAM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-muted-foreground bg-white/5 border-white/10';
    }
  };

  return (
    <PageWrapper>
      <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
        {/* --- Header Area --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
              COMMUNITY <span className="text-primary tracking-widest not-italic">HUB</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse ml-2">PRO VERSION</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Manage your brand's reputation with AI-powered triage and empathy.</p>
          </div>
          
          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            <div className="flex bg-secondary/20 p-1 rounded-xl border border-white/5 flex-1 md:flex-none">
              {['ALL', 'POSITIVE', 'NEGATIVE', 'QUESTION'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSentiment(s === 'ALL' ? null : s)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    (filterSentiment === s || (s === 'ALL' && !filterSentiment)) 
                      ? "bg-background shadow-lg text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button 
                onClick={handleSync} 
                disabled={isSyncing} 
                className="rounded-xl h-10 px-4 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
            >
              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
            </Button>
          </div>
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* --- Main Content Split --- */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* --- Left Rail: Inbox List --- */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 bg-card/20 rounded-[2rem] border border-white/5 overflow-hidden">
             <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Triage Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">{comments.length} PENDING</span>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 italic space-y-4">
                    <MessageSquare size={48} />
                    <p className="text-sm">Inbox clear. Community is happy!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <button
                      key={comment.id}
                      onClick={() => {
                        setSelectedComment(comment);
                        setReplyText(comment.aiDraftReply || '');
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden",
                        selectedComment?.id === comment.id 
                          ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                          : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-[10px] font-bold border border-white/10">
                            {comment.authorName.charAt(0)}
                          </div>
                          <span className="font-bold text-xs truncate max-w-[120px]">{comment.authorName}</span>
                        </div>
                        {comment.sentiment && (
                          <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", getSentimentColor(comment.sentiment))}>
                            {comment.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic mb-2">"{comment.text}"</p>
                      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                        <div className="flex items-center gap-2">
                           {comment.platform} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {comment.isReplied && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={8}/> REPLIED</span>}
                      </div>

                      {comment.priority === 'HIGH' && (
                        <div className="absolute top-0 right-0 w-1 h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                      )}
                    </button>
                  ))
                )}
             </div>
          </div>

          {/* --- Right View: Detailed Conversation & AI Action --- */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-card/40 backdrop-blur-2xl rounded-[3rem] border-2 border-white/5 shadow-2xl relative overflow-hidden">
             {selectedComment ? (
               <div className="flex-1 flex flex-col min-h-0">
                  {/* Top: Comment Context */}
                  <div className="p-8 border-b border-white/5 space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                              <User size={24} />
                           </div>
                           <div>
                              <h3 className="font-black text-xl tracking-tight">{selectedComment.authorName}</h3>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Interaction on {selectedComment.platform}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-lg", getSentimentColor(selectedComment.sentiment || ''))}>
                              AI DETECTED: {selectedComment.sentiment || 'NEUTRAL'}
                           </span>
                           {selectedComment.priority === 'HIGH' && (
                             <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black animate-pulse">
                               <AlertCircle size={12} /> PRIORITY ACTION REQUIRED
                             </span>
                           )}
                        </div>
                     </div>

                     <div className="bg-background/40 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 space-y-4 shadow-inner">
                        <div className="flex items-center gap-2 opacity-40">
                           <MessageCircle size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Original Comment</span>
                        </div>
                        <p className="text-base font-medium italic text-foreground/90 leading-relaxed tabular-nums">"{selectedComment.text}"</p>
                        
                        {selectedComment.post && (
                          <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-3">
                             <div className="p-2 bg-white/5 rounded-lg">
                                <Hash size={12} className="text-muted-foreground" />
                             </div>
                             <p className="text-[10px] font-bold text-muted-foreground/60 truncate italic max-w-sm">Context: "{selectedComment.post.caption}"</p>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Middle: AI Crafting Area */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                              <Sparkles size={20} />
                           </div>
                           <h4 className="text-sm font-black uppercase tracking-widest text-foreground/80">AI Community Persona</h4>
                        </div>
                        <Button 
                           onClick={handleDraftAI} 
                           disabled={isDrafting}
                           className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all shadow-xl"
                        >
                           {isDrafting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Zap size={14} className="mr-2 fill-current" />}
                           {selectedComment.aiDraftReply ? 'Regenerate Draft' : 'Analyze & Draft'}
                        </Button>
                     </div>

                     <div className="relative group">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Draft your brand reply here... Let AI find the perfect tone."
                          className="w-full h-48 bg-secondary/30 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none shadow-inner"
                        />
                        {isDrafting && (
                          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 animate-pulse">
                             <div className="flex flex-col items-center gap-4">
                                <Sparkles className="text-primary animate-bounce" size={32} />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Synthesizing Human Tone...</span>
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-wrap gap-2 pt-2">
                        {['Supportive', 'Expert', 'Witty', 'Empathetic', 'Professional'].map(tone => (
                           <button key={tone} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                             {tone}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Bottom: Action Rail */}
                  <div className="p-8 bg-white/5 border-t border-white/5 h-28 flex items-center justify-between">
                     <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                        <button className="p-3 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all">
                           <Trash2 size={20} />
                        </button>
                        <button className="p-3 hover:bg-white/10 rounded-xl transition-all">
                           <MoreVertical size={20} />
                        </button>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-4">Pro Plan: Unmetered AI Replies</p>
                        <Button 
                          onClick={handleSendReply}
                          disabled={isSending || !replyText.trim() || selectedComment.isReplied}
                          className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-[0_15px_30px_rgba(var(--primary),.3)] group overflow-hidden relative"
                        >
                           <div className="relative z-10 flex items-center gap-3">
                              {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                              {selectedComment.isReplied ? 'REPLIED' : 'Push to Social'}
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in duration-700">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="relative p-8 bg-card/60 backdrop-blur-xl border-2 border-white/10 rounded-[3rem] text-primary shadow-2xl">
                      <Globe size={64} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="max-w-xs space-y-2">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">Command Center</h4>
                    <p className="text-muted-foreground text-sm font-medium opacity-60 leading-relaxed">Select an interaction from the triage queue to begin building your community.</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CommunityDashboard;
