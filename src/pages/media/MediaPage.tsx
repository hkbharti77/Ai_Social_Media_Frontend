import React, { useEffect, useState, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Search, LayoutGrid, List, Upload, Loader2, CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { uploadMediaApi, listMediaApi, deleteMediaApi } from '../../api/media';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import MediaCard, { type MediaAsset } from '../../components/media/MediaCard';

const MediaPage: React.FC = () => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const assets = await listMediaApi();
      setMediaAssets(assets);
    } catch (error) {
      console.error('Failed to fetch media', error);
      toast.error('Failed to load media library.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isValid) {
      toast.error('Only images and videos are allowed.');
      return;
    }

    setIsUploading(true);
    toast.info(`Uploading ${file.name}...`);

    try {
      const result = await uploadMediaApi(file);
      setMediaAssets(prev => [result, ...prev]);
      toast.success('Media uploaded successfully!', {
        icon: <CheckCircle2 size={16} className="text-emerald-500" />
      });
    } catch (error: any) {
      console.error('Upload failed', error);
      toast.error(error?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteClick = (url: string) => {
    setAssetToDelete(url);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await deleteMediaApi(assetToDelete);
      setMediaAssets(prev => prev.filter(item => item.url !== assetToDelete));
      toast.success('Asset deleted successfully');
    } catch (error: any) {
      console.error('Delete failed', error);
      toast.error(error?.response?.data?.error || 'Failed to delete asset');
    } finally {
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
    }
  };

  const filteredMedia = mediaAssets.filter(asset =>
    asset.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground flex items-center gap-4">
              AI Vault
              <div className="bg-primary/10 p-2 rounded-2xl">
                <ImageIcon className="text-primary" size={32} />
              </div>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80 max-w-xl">
              Your collection of production-grade AI visual assets hosted on S3.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-card/40 border-2 border-white/5 rounded-2xl py-3.5 pl-12 pr-6 focus:border-primary/50 outline-none transition-all shadow-xl"
              />
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="gap-2 px-6 h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all relative overflow-hidden group shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2">
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {isUploading ? 'Uploading...' : 'Upload Asset'}
              </div>
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* View toggle */}
            <div className="flex bg-secondary/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  viewMode === 'grid' ? 'bg-background shadow-xl text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid size={22} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  viewMode === 'list' ? 'bg-background shadow-xl text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List size={22} />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-card/40 border-2 border-white/5 rounded-[2rem] animate-pulse" />
              ))}
            </motion.div>
          ) : filteredMedia.length > 0 ? (
            <motion.div
              layout
              className={cn(
                'grid gap-8',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
              )}
            >
              {filteredMedia.map((asset, index) => (
                <MediaCard
                  key={index}
                  asset={asset}
                  viewMode={viewMode}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-40 text-center space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5"
            >
              <div className="w-24 h-24 bg-secondary/40 rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground/30">
                <ImageIcon size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-3xl tracking-tighter">No AI assets found</h3>
                <p className="text-muted-foreground font-medium opacity-60">
                  Upload files or generate images from your creative sessions.
                </p>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button onClick={handleUploadClick} size="lg" className="rounded-2xl px-10 h-14 gap-2">
                  <Upload size={20} /> Upload Media
                </Button>
                <Button onClick={() => window.location.href = '/generate'} variant="outline" size="lg" className="rounded-2xl px-10 h-14">
                  Generate First Asset
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Asset"
          maxWidth="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="rounded-xl px-6 bg-red-600 hover:bg-red-700"
              >
                Delete Permanently
              </Button>
            </>
          }
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-foreground">Are you sure?</p>
              <p className="text-muted-foreground">
                This will permanently delete the asset from your S3 bucket. This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default MediaPage;
