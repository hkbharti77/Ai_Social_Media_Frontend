import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  Sparkles, 
  MessageSquare, 
  Star, 
  Loader2, 
  RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { getReviewsApi, generateReviewReplyApi, postReviewReplyApi, type ReviewData } from '../../api/reviews';

const ReviewButlerPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isPosting, setIsPosting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getReviewsApi();
      setReviews(data);
    } catch {
      toast.error("Failed to fetch Facebook reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReply = async (review: ReviewData) => {
    setIsGenerating(prev => ({ ...prev, [review.id]: true }));
    try {
      const reply = await generateReviewReplyApi(review);
      setReplies(prev => ({ ...prev, [review.id]: reply }));
      toast.success("AI Draft generated!");
    } catch {
      toast.error("Failed to generate AI reply.");
    } finally {
      setIsGenerating(prev => ({ ...prev, [review.id]: false }));
    }
  };

  const handlePostReply = async (reviewId: string) => {
    const replyText = replies[reviewId];
    if (!replyText) return;

    setIsPosting(prev => ({ ...prev, [reviewId]: true }));
    try {
      await postReviewReplyApi({ reviewId, replyText });
      toast.success("Reply posted to Facebook!");
      // Optionally remove or mark as replied
    } catch {
      toast.error("Failed to post reply.");
    } finally {
      setIsPosting(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground uppercase italic px-1">AI Butler</h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80 max-w-xl px-1">Automated reputation management for Facebook.</p>
          </div>
          <Button 
            onClick={fetchReviews}
            variant="outline"
            className="rounded-2xl border-white/10 hover:bg-white/5 h-14 px-8 uppercase font-black text-[10px] tracking-widest"
          >
            <RefreshCcw size={16} className="mr-2" />
            Sync Reviews
          </Button>
        </header>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {reviews.map((review, idx) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row gap-10 hover:border-primary/20 transition-all group"
              >
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">{review.reviewerName}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{new Date(review.createdTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                      <Star className="text-amber-500 fill-amber-500" size={16} />
                      <span className="text-amber-500 font-black text-lg">{review.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-secondary/20 rounded-[2rem] border border-white/5">
                    <p className="text-lg font-bold italic leading-relaxed text-foreground/90">"{review.reviewText}"</p>
                  </div>
                </div>

                <div className="w-full lg:w-[450px] space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">AI Butler Draft</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleGenerateReply(review)}
                      disabled={isGenerating[review.id]}
                      className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                    >
                      {isGenerating[review.id] ? <Loader2 className="animate-spin mr-2" size={12} /> : <Sparkles className="mr-2" size={12} />}
                      Re-Generate
                    </Button>
                  </div>
                  
                  <textarea 
                    value={replies[review.id] || ''}
                    onChange={(e) => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))}
                    placeholder="Click the butler to generate a reply..."
                    className="w-full h-44 bg-secondary/30 border-2 border-white/5 rounded-[2rem] p-6 text-sm font-medium focus:border-primary/50 focus:outline-none transition-all resize-none shadow-inner"
                  />

                  <div className="flex gap-4">
                    {!replies[review.id] && (
                      <Button 
                        onClick={() => handleGenerateReply(review)}
                        disabled={isGenerating[review.id]}
                        className="flex-1 h-14 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] bg-primary shadow-xl shadow-primary/20"
                      >
                         {isGenerating[review.id] ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                         Ask Butler
                      </Button>
                    )}
                    {replies[review.id] && (
                      <Button 
                        onClick={() => handlePostReply(review.id)}
                        disabled={isPosting[review.id]}
                        className="flex-1 h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-xs bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 group overflow-hidden relative"
                      >
                         <div className="relative flex items-center justify-center gap-3">
                           {isPosting[review.id] ? <Loader2 className="animate-spin" /> : <MessageSquare size={20} />}
                           POST TO FACEBOOK
                         </div>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-6 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5">
            <MessageSquare size={64} className="text-muted-foreground/20" />
            <div className="space-y-2 max-w-sm">
              <p className="text-xl font-black tracking-tighter uppercase italic">No Reviews Detected</p>
              <p className="text-sm text-muted-foreground font-medium">Your reputation is spotless. We'll alert you when new feedback arrives.</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ReviewButlerPage;
