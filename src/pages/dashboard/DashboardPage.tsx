import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  MoreVertical,
  Clock,
  Share2,
  Link as LinkIcon,
  Edit2,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  Download,
  Link2,
  Sunrise,
  Sunset
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import PostEditorModal from '../../components/dashboard/PostEditorModal';
import { toast } from 'sonner';
import { 
  getPostsApi, 
  deletePostApi, 
  getPostStatsApi, 
  approveDraftApi,
  type Post, 
  type DashboardStats 
} from '../../api/posts';
import { getSocialAccounts, type SocialAccount } from '../../api/social';
import { listMediaApi } from '../../api/media';

const DashboardPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ draftCount: 0, scheduledCount: 0, publishedCount: 0, failedCount: 0 });
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [recentMedia, setRecentMedia] = useState<{url: string, downloadUrl: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const [postsData, statsData, accountsData, mediaData] = await Promise.all([
        getPostsApi(),
        getPostStatsApi(),
        getSocialAccounts(),
        listMediaApi()
      ]);
      setPosts(postsData);
      setStats(statsData);
      setAccounts(accountsData);
      setRecentMedia(mediaData.slice(0, 6)); // Show latest 6
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error("Cloud sync failed. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = activeTab === 'All' 
    ? posts 
    : posts.filter(post => post.status === activeTab.toUpperCase());

  const tabs = ['All', 'Draft', 'Scheduled', 'Published', 'Failed'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'SCHEDULED': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'PUBLISHED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'FAILED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-muted-foreground bg-secondary/50 border-white/5';
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

  const handleDeletePost = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transmission?")) return;
    try {
      await deletePostApi(id);
      toast.success("Post removed from archive");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleSavePost = (_updatedPost: Post) => {
    fetchPosts();
    toast.success("Sync complete.", {
      icon: <CheckCircle2 size={16} className="text-emerald-500" />
    });
  };

  const handleApprovePost = async (id: number) => {
    try {
      await approveDraftApi(id);
      toast.success("Post approved & scheduled for IST slot.");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to approve post.");
    }
  };

  const getSlotBadge = (post: Post) => {
    if (!post.slotType) return null;
    return (
      <div className={cn(
        "absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md border border-white/10 shadow-xl",
        post.slotType === 'MORNING' ? 'bg-amber-500/80 text-white' : 'bg-indigo-600/80 text-white'
      )}>
        {post.slotType === 'MORNING' ? <Sunrise size={14} /> : <Sunset size={14} />}
        {post.slotType} SLOT
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="space-y-12 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">Content Studio</h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium opacity-70 max-w-xl">Oversee and orchestrate your global presence.</p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="w-full md:w-auto group px-10 h-16 text-xl font-black shadow-[0_20px_40px_rgba(var(--primary),0.2)] rounded-[1.5rem] active:scale-95 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-3">
              <Plus size={24} />
              Create Masterpiece
            </div>
          </Button>
        </header>

        {!isLoading && accounts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-2 border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/30">
                <LinkIcon size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">No Social Accounts Connected</h3>
                <p className="text-muted-foreground font-medium opacity-80">Connect your Facebook or Instagram to start orchestrating your presence.</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/connect'}
              variant="outline"
              className="px-8 h-12 rounded-xl border-amber-500/30 hover:bg-amber-500/10"
            >
              Go to Connections
            </Button>
          </motion.div>
        )}

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Pending Drafts', value: stats.draftCount, icon: Clock, color: 'text-blue-400' },
            { label: 'Queued Posts', value: stats.scheduledCount, icon: Calendar, color: 'text-amber-400' },
            { label: 'Viral Hits', value: stats.publishedCount, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Review Needed', value: stats.failedCount, icon: AlertCircle, color: 'text-rose-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-primary/30 transition-all group shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className={cn("p-4 rounded-2xl bg-secondary/30 border border-white/5", stat.color)}>
                  <stat.icon className={cn("group-hover:rotate-12 transition-transform duration-500")} size={28} />
                </div>
                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] pt-1">{stat.label}</div>
              </div>
              <p className="text-5xl font-black tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>
        
        {/* Connected Channels Summary */}
        {accounts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black tracking-tight uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-3">
                <Link2 size={16} className="text-primary" />
                Connected Channels
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/connect')}
                className="text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
              >
                Manage Connections
              </Button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none">
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex items-center gap-5 p-5 pr-8 bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-3xl hover:border-primary/30 transition-all shrink-0 min-w-[240px] shadow-xl"
                >
                  <div className="relative">
                    {account.profilePictureUrl ? (
                      <img 
                        src={account.profilePictureUrl} 
                        alt={account.accountName} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                      />
                    ) : (
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                        account.platform === 'FACEBOOK' ? 'bg-blue-600' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                      )}>
                        {account.platform === 'FACEBOOK' ? <LinkIcon size={24} /> : <Share2 size={24} />}
                      </div>
                    )}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-background shadow-lg",
                      account.platform === 'FACEBOOK' ? 'bg-blue-600' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                    )}>
                      {account.platform === 'FACEBOOK' ? <LinkIcon size={10} className="text-white" /> : <Share2 size={10} className="text-white" />}
                    </div>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="font-bold text-sm truncate">{account.accountName || account.platform}</h4>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Content Explorer Section */}
        <div className="space-y-10">
          <div className="flex gap-10 border-b-2 border-white/5 pb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-8 px-2 text-xs font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap",
                  activeTab === tab ? "text-primary scale-110" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabDashboardGlow"
                    className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary rounded-t-full shadow-[0_-8px_20px_rgba(var(--primary),0.6)]" 
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[4/5] bg-card/40 border-2 border-white/5 rounded-[3rem] animate-pulse" />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <motion.div 
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className="group bg-card/60 backdrop-blur-lg border-2 border-white/5 rounded-[3rem] overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col h-full shadow-2xl"
                    >
                      <div className="aspect-video bg-secondary/30 relative overflow-hidden">
                        {post.imageUrl ? (
                          <img 
                            src={post.imageUrl} 
                            alt="Output" 
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Sparkles className="text-primary/20" size={48} />
                          </div>
                        )}
                        <div className="absolute top-6 right-6">
                           <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] px-4 flex items-center gap-2 border border-white/10 shadow-2xl text-white">
                            {post.platform === 'INSTAGRAM' ? <Share2 size={14} className="text-pink-400" /> : <LinkIcon size={14} className="text-blue-400" />}
                            {post.platform}
                          </div>
                        </div>
                        {getSlotBadge(post)}
                      </div>
                      <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-xl font-bold line-clamp-3 text-foreground/90 leading-relaxed tracking-tight">
                            {post.caption} <span className="text-primary">{post.hashtags}</span>
                          </p>
                          <div className="relative group/more">
                             <button className="text-muted-foreground/40 hover:text-foreground p-3 hover:bg-white/5 rounded-2xl transition-all shrink-0 border border-transparent hover:border-white/5">
                              <MoreVertical size={24} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 hidden group-hover/more:block bg-card border-2 border-white/5 p-2 rounded-2xl shadow-2xl z-50 min-w-[120px]">
                               <button 
                                onClick={() => handleDeletePost(post.id!)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-black uppercase tracking-widest"
                               >
                                Delete
                               </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className={cn(
                            "flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 rounded-full border shadow-inner",
                            getStatusColor(post.status)
                          )}>
                            {post.status === 'SCHEDULED' && <Calendar size={14} />}
                            {post.status === 'DRAFT' && <Clock size={14} />}
                            {post.status === 'PUBLISHED' && <CheckCircle2 size={14} />}
                            {post.status === 'FAILED' && <AlertCircle size={14} />}
                            {post.status}
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditPost(post)}
                              className="gap-2.5 font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-[1.25rem] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all"
                            >
                              <Edit2 size={14} className="text-primary" />
                              Edit
                            </Button>
                            {post.status === 'DRAFT' && post.slotType && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApprovePost(post.id!)}
                                className="bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-[1.25rem] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && filteredPosts.length === 0 && (
            <div className="space-y-16">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 backdrop-blur-sm shadow-inner"
              >
                <div className="w-32 h-32 bg-secondary/40 rounded-[2.5rem] flex items-center justify-center mx-auto text-muted-foreground/50 shadow-inner">
                  <LayoutGrid size={64} />
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <h4 className="font-black text-4xl tracking-tighter">Archive is Silent</h4>
                  <p className="text-muted-foreground text-xl font-medium opacity-60">This channel has no transmissions yet. Initiate a new post to populate your grid.</p>
                </div>
                <Button size="lg" className="px-12 h-16 rounded-[1.5rem] text-lg font-black group shadow-2xl shadow-primary/20" onClick={handleCreateNew}>
                  Start New Transmission
                </Button>
              </motion.div>

              {recentMedia.length > 0 && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                      <Sparkles className="text-primary" size={32} />
                      Recent AI Discoveries
                    </h3>
                    <p className="text-muted-foreground font-medium opacity-60">Unposted media in your vault</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {recentMedia.map((asset, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -10, scale: 1.05 }}
                        className="aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white/5 bg-secondary/30 relative group cursor-pointer"
                      >
                        <img src={asset.url} alt="Recent" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                           <button 
                            onClick={handleCreateNew}
                            className="p-3 bg-primary rounded-xl text-white shadow-xl hover:scale-110 transition-transform"
                           >
                            <Plus size={20} />
                           </button>
                           <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(asset.downloadUrl || asset.url, '_blank');
                            }}
                            className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-110"
                           >
                            <Download size={20} />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PostEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        mode={modalMode}
        initialData={selectedPost}
      />
    </PageWrapper>
  );
};

export default DashboardPage;
