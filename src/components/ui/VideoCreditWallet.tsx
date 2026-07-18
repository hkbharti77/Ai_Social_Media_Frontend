import React, { useEffect, useState } from 'react';
import { Film, Zap, Star, AlertTriangle, ShoppingCart, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useProfile } from '../../context/ProfileContext';
import {
  getVideoCreditWalletApi,
  getVideoCreditPacksByModelApi,
  createVideoCreditOrderApi,
  verifyVideoCreditPaymentApi,
  type VideoCreditWallet,
  type VideoCreditPack,
} from '../../api/videoCredits';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface VideoCreditWalletProps {
  userTier: string;
  onWalletUpdate?: (wallet: VideoCreditWallet) => void;
}

const MODEL_CONFIG = {
  'veo-lite':     { label: 'Veo Lite',     color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20', icon: <Film size={14} /> },
  'veo-fast':     { label: 'Veo Fast',     color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-500/20',    icon: <Zap size={14} /> },
  'veo-standard': { label: 'Veo Standard', color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-500/20',  icon: <Star size={14} /> },
};

// Which models are accessible per tier
const TIER_MODELS: Record<string, string[]> = {
  'standard':  ['veo-lite'],
  'pro':       ['veo-lite', 'veo-fast'],
  'super pro': ['veo-lite', 'veo-fast', 'veo-standard'],
};

const VideoCreditWalletComponent: React.FC<VideoCreditWalletProps> = ({ userTier, onWalletUpdate }) => {
  const { refreshProfile } = useProfile();
  const [wallet, setWallet] = useState<VideoCreditWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [packs, setPacks] = useState<Record<string, VideoCreditPack[]>>({});
  const [loadingPacks, setLoadingPacks] = useState<string | null>(null);
  const [buyingPack, setBuyingPack] = useState<string | null>(null);

  const accessibleModels = TIER_MODELS[userTier.toLowerCase()] ?? [];

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await getVideoCreditWalletApi();
      setWallet(data);
      onWalletUpdate?.(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = async (modelId: string) => {
    if (expandedModel === modelId) {
      setExpandedModel(null);
      return;
    }
    setExpandedModel(modelId);
    if (!packs[modelId]) {
      setLoadingPacks(modelId);
      try {
        const data = await getVideoCreditPacksByModelApi(modelId);
        setPacks(prev => ({ ...prev, [modelId]: data }));
      } catch {
        toast.error('Failed to load packs');
      } finally {
        setLoadingPacks(null);
      }
    }
  };

  const handleBuyPack = async (pack: VideoCreditPack) => {
    setBuyingPack(pack.packName);
    try {
      const order = await createVideoCreditOrderApi(pack.packName);

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'VaniAI Video Credits',
        description: pack.displayName,
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            await verifyVideoCreditPaymentApi(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast.success(`✅ ${pack.videoCount} video credits added to your wallet!`);
            fetchWallet();
            refreshProfile(); // Refresh sidebar
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        theme: { color: '#6366f1' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create order');
    } finally {
      setBuyingPack(null);
    }
  };

  const getBalance = (modelId: string) => {
    if (!wallet) return 0;
    if (modelId === 'veo-lite') return wallet.lite;
    if (modelId === 'veo-fast') return wallet.fast;
    return wallet.standard;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 size={20} className="animate-spin text-primary" />
      </div>
    );
  }

  if (accessibleModels.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Warnings */}
      {wallet?.warnings && wallet.warnings.length > 0 && (
        <div className="space-y-2">
          {wallet.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-model credit rows */}
      {accessibleModels.map((modelId) => {
        const cfg = MODEL_CONFIG[modelId as keyof typeof MODEL_CONFIG];
        const balance = getBalance(modelId);
        const isLow = balance > 0 && balance <= 2;
        const isEmpty = balance === 0;
        const isExpanded = expandedModel === modelId;

        return (
          <div key={modelId} className={cn('rounded-2xl border overflow-hidden transition-all', cfg.border, cfg.bg)}>
            {/* Header row */}
            <button
              onClick={() => toggleModel(modelId)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={cn('p-1.5 rounded-lg', cfg.bg, cfg.color)}>{cfg.icon}</span>
                <div className="text-left">
                  <p className={cn('text-[11px] font-black uppercase tracking-widest', cfg.color)}>{cfg.label}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">Video Credits</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  'text-2xl font-black tracking-tighter',
                  isEmpty ? 'text-rose-400' : isLow ? 'text-amber-400' : cfg.color
                )}>
                  {balance}
                </span>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </button>

            {/* Packs dropdown */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Buy More Credits</p>

                    {loadingPacks === modelId ? (
                      <div className="flex justify-center py-4">
                        <Loader2 size={18} className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {(packs[modelId] || []).map((pack) => (
                          <button
                            key={pack.packName}
                            onClick={() => handleBuyPack(pack)}
                            disabled={buyingPack === pack.packName}
                            className={cn(
                              'flex flex-col items-start p-3 rounded-xl border border-white/10 bg-background/40 hover:bg-white/5 transition-all text-left',
                              buyingPack === pack.packName && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <ShoppingCart size={11} className={cfg.color} />
                              <span className={cn('text-[10px] font-black uppercase', cfg.color)}>
                                {pack.videoCount} video{pack.videoCount > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-sm font-black text-foreground">₹{pack.priceInr}</p>
                            <p className="text-[9px] text-muted-foreground font-bold">{pack.pricePerVideo}/video</p>
                            {buyingPack === pack.packName && (
                              <Loader2 size={12} className="animate-spin mt-1 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default VideoCreditWalletComponent;
