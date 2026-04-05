import { useState } from 'react';
import { toast } from 'sonner';
import { type GeneratedPost } from '../api/ai';
import { createPostApi, PostStatus } from '../api/posts';
import { predictPerformanceApi } from '../api/ai';
import { handleApiError } from '../lib/error-utils';

export function useAiGeneration() {
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [generatedThreads, setGeneratedThreads] = useState<string[][]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState<Record<number, boolean>>({});

  const handleCreated = (posts: GeneratedPost[], threads?: string[][]) => {
    setGeneratedPosts(posts);
    if (threads) setGeneratedThreads(threads);
  };

  const handleDraft = async (post: GeneratedPost, index: number, selectedPlatforms: string[]) => {
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
      handleApiError(error, "Failed to save draft.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSchedule = async (post: GeneratedPost, index: number, selectedPlatforms: string[]) => {
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
      handleApiError(error, "Failed to schedule post.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (index: number) => {
    setGeneratedPosts(prev => prev.filter((_, i) => i !== index));
    toast.error("Post removed.");
  };

  const handlePredictPerformance = async (draft: string, index: number) => {
    setIsPredicting(prev => ({ ...prev, [index]: true }));
    try {
      await predictPerformanceApi(draft);
      toast.success("Performance predicted!");
    } catch (error) {
      handleApiError(error, "Prediction failed.");
    } finally {
      setIsPredicting(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSaveThread = async (thread: string[], status: PostStatus) => {
    try {
      await createPostApi({
        caption: thread[0],
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
      handleApiError(error, "Failed to save thread.");
    }
  };

  return {
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
  };
}
