import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Download, Trash2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MediaAsset {
  url: string;
  downloadUrl?: string;
}

interface MediaCardProps {
  asset: MediaAsset;
  viewMode: 'grid' | 'list';
  onDeleteClick: (url: string) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ asset, viewMode, onDeleteClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      className={cn(
        'group relative bg-card/40 border-2 border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-2xl',
        viewMode === 'list' && 'flex items-center gap-8 h-48'
      )}
    >
      <div className={cn(
        'relative overflow-hidden bg-secondary/20',
        viewMode === 'grid' ? 'aspect-square' : 'h-full w-48 shrink-0'
      )}>
        <img
          src={asset.url}
          alt="AI Visual"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
          <a
            href={asset.url}
            target="_blank"
            rel="noreferrer"
            className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white transition-all hover:scale-110"
          >
            <ExternalLink size={20} />
          </a>
          <button
            onClick={() => window.open(asset.downloadUrl || asset.url, '_blank')}
            className="p-4 bg-primary/80 hover:bg-primary border border-primary/20 rounded-2xl text-white transition-all hover:scale-110"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => onDeleteClick(asset.url)}
            className="p-4 bg-red-500/80 hover:bg-red-500 border border-red-500/20 rounded-2xl text-white transition-all hover:scale-110"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <div className="bg-primary/90 backdrop-blur-md p-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] px-3 flex items-center gap-1.5 shadow-2xl text-white">
            <Sparkles size={10} />
            AI Official
          </div>
        </div>
      </div>

      <div className="p-8 space-y-3">
        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest truncate">
          {asset.url.split('/').pop()?.split('?')[0]}
        </p>
      </div>
    </motion.div>
  );
};

export default MediaCard;
