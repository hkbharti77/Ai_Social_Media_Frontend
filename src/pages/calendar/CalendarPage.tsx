import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostEditorModal from '../../components/dashboard/PostEditorModal';
import VisualCalendar from '../../components/dashboard/VisualCalendar';
import { toast } from 'sonner';
import { 
  getPostsApi, 
  deletePostApi, 
  schedulePostApi,
  recyclePostApi,
  type Post
} from '../../api/posts';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const CalendarPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postTargetId, setPostTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getPostsApi();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
      toast.error("Cloud sync failed. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setModalMode('edit');
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postTargetId) return;
    setIsDeleting(true);
    try {
      await deletePostApi(postTargetId);
      toast.success("Post removed from archive");
      fetchPosts();
      setIsDeleteModalOpen(false);
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePost = () => {
    fetchPosts();
  };

  const handleDateChange = async (postId: number, newDate: Date) => {
    try {
      const dateStr = newDate.toISOString();
      const post = posts.find(p => p.id === postId);
      
      if (post?.status === 'PUBLISHED') {
        await recyclePostApi(postId, dateStr);
        toast.success('Post recycled & scheduled!');
      } else {
        await schedulePostApi(postId, dateStr);
        toast.success('Post rescheduled successfully!');
      }
      
      fetchPosts();
    } catch (error) {
      toast.error('Sync failed. Please try again.');
      console.error(error);
    }
  };

  const handleCalendarAddPost = (date: Date) => {
    setModalMode('create');
    setSelectedPost({
      caption: '',
      hashtags: '',
      imageUrl: '',
      platform: 'INSTAGRAM',
      status: 'SCHEDULED',
      scheduledAt: date.toISOString()
    } as Post);
    setIsModalOpen(true);
  };

  return (
    <PageWrapper>
      <div className="space-y-8 pb-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">Content Planner</h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium opacity-70 max-w-xl">
              Drag and drop to orchestrate your social media strategy.
            </p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="group px-10 h-16 text-xl font-black shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-3">
              <Plus size={24} />
              New Strategy
            </div>
          </Button>
        </header>

        <div className="bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] p-2 lg:p-4 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] flex items-center justify-center"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VisualCalendar 
                  posts={posts} 
                  onDateChange={handleDateChange}
                  onEditPost={handleEditPost}
                  onAddPost={handleCalendarAddPost}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PostEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        mode={modalMode}
        initialData={selectedPost}
      />
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Strategy"
        message="Are you sure you want to delete this planned post? This action will remove it from your schedule."
        confirmText="Destroy"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageWrapper>
  );
};

export default CalendarPage;
