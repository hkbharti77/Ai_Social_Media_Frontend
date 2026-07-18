import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { 
  User, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  Mail,
  Lock,
  Globe,
  Smartphone,
  CheckCircle2,
  Film,
  Zap,
  Star,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../context/useAuth';
import { useProfile } from '../../context/ProfileContext';
import { getProfile, changePasswordApi, type ProfileResponse } from '../../api/profile';
import { getPaymentHistory, getUsageHistory, downloadReceiptPdf, type PaymentOrder, type CreditUsage } from '../../api/usage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, FileText, Download, Heart } from 'lucide-react';
import { getLoginHistoryApi, type LoginHistoryEntry } from '../../api/auth';
import ReferralCard from '../../components/dashboard/ReferralCard';
import {
  getVideoCreditWalletApi,
  getVideoCreditPacksByModelApi,
  createVideoCreditOrderApi,
  createCustomVideoCreditOrderApi,
  verifyVideoCreditPaymentApi,
  type VideoCreditWallet,
  type VideoCreditPack,
} from '../../api/videoCredits';
import { cn } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { Razorpay: any; } }

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { refreshProfile } = useProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [usage, setUsage] = useState<CreditUsage[]>([]);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login history state
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);

  // Video credits state
  const [wallet, setWallet] = useState<VideoCreditWallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [packs, setPacks] = useState<Record<string, VideoCreditPack[]>>({});
  const [loadingPacks, setLoadingPacks] = useState<string | null>(null);
  const [buyingPack, setBuyingPack] = useState<string | null>(null);
  const [activeVideoModel, setActiveVideoModel] = useState<'veo-lite' | 'veo-fast' | 'veo-standard'>('veo-lite');
  // Custom quantity
  const [customQty, setCustomQty] = useState<string>('');
  const [buyingCustom, setBuyingCustom] = useState(false);

  const fetchLoginHistory = async () => {
    setLoginHistoryLoading(true);
    try {
      const data = await getLoginHistoryApi();
      setLoginHistory(data);
    } catch { /* silent */ }
    finally { setLoginHistoryLoading(false); }
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (!pwOld || !pwNew || !pwConfirm) { setPwError('All fields are required.'); return; }
    if (pwNew.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwError("New passwords don't match."); return; }
    try {
      setPwLoading(true);
      await changePasswordApi(pwOld, pwNew);
      toast.success('✅ Password updated successfully!');
      setShowPasswordModal(false);
      setPwOld(''); setPwNew(''); setPwConfirm('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const data = await getProfile();
      setSubscription(data.subscription);
      
      const [payData, usageData] = await Promise.all([
        getPaymentHistory(),
        getUsageHistory()
      ]);
      setPayments(payData);
      setUsage(usageData);
    } catch (e) {
      console.error('Failed to sync settings', e);
    }
  };

  React.useEffect(() => {
    fetchData();
    
    // Check for tab query parameter
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const fetchWallet = async () => {
    setWalletLoading(true);
    try {
      const data = await getVideoCreditWalletApi();
      setWallet(data);
    } catch { /* silent */ }
    finally { setWalletLoading(false); }
  };

  const fetchPacksForModel = async (modelId: string) => {
    if (packs[modelId]) return;
    setLoadingPacks(modelId);
    try {
      const data = await getVideoCreditPacksByModelApi(modelId);
      setPacks(prev => ({ ...prev, [modelId]: data }));
    } catch { toast.error('Failed to load packs'); }
    finally { setLoadingPacks(null); }
  };

  React.useEffect(() => {
    if (activeSection === 'video_credits') {
      fetchWallet();
      fetchPacksForModel(activeVideoModel);
    }
    if (activeSection === 'security') {
      fetchLoginHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  React.useEffect(() => {
    if (activeSection === 'video_credits') fetchPacksForModel(activeVideoModel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoModel]);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            await verifyVideoCreditPaymentApi(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            toast.success(`✅ ${pack.videoCount} video credits added!`);
            fetchWallet();
            refreshProfile(); // Refresh sidebar
          } catch { toast.error('Payment verification failed.'); }
        },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => toast.info('Payment cancelled') },
      };
      new window.Razorpay(options).open();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to create order');
    } finally { setBuyingPack(null); }
  };

  const handleBuyCustom = async () => {
    const qty = parseInt(customQty);
    if (!qty || qty < 1 || qty > 500) {
      toast.error('Enter a number between 1 and 500');
      return;
    }
    setBuyingCustom(true);
    try {
      const order = await createCustomVideoCreditOrderApi(activeVideoModel, qty);

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'VaniAI Video Credits',
        description: `${qty} custom ${activeVideoModel} credits`,
        order_id: order.order_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            await verifyVideoCreditPaymentApi(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            toast.success(`✅ ${qty} video credits added!`);
            setCustomQty('');
            fetchWallet();
            refreshProfile(); // Refresh sidebar
          } catch { toast.error('Payment verification failed.'); }
        },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => toast.info('Payment cancelled') },
      };
      new window.Razorpay(options).open();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to create order');
    } finally { setBuyingCustom(false); }
  };

  // Tier-based accessible models
  const tierName = subscription?.tier?.toLowerCase().replace('_', ' ') || 'free';
  const accessibleModels: { id: 'veo-lite' | 'veo-fast' | 'veo-standard'; label: string; icon: React.ReactNode; color: string; bg: string; border: string; balance: number }[] = [
    { id: 'veo-lite' as const,     label: 'Veo Lite',     icon: <Film size={18} />,  color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20', balance: wallet?.lite ?? 0 },
    { id: 'veo-fast' as const,     label: 'Veo Fast',     icon: <Zap size={18} />,   color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-500/20',    balance: wallet?.fast ?? 0 },
    { id: 'veo-standard' as const, label: 'Veo Standard', icon: <Star size={18} />,  color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-500/20',  balance: wallet?.standard ?? 0 },
  ].filter(m => {
    if (['standard'].includes(tierName)) return m.id === 'veo-lite';
    if (['pro'].includes(tierName)) return m.id !== 'veo-standard';
    if (['super pro', 'superpro'].includes(tierName)) return true;
    return false;
  });

  const isVideoEligible = ['standard', 'pro', 'super pro', 'superpro'].includes(tierName);

  const sections = [
    { id: 'account', title: 'Account Settings', desc: 'Secure and personalize your profile.', icon: User, color: 'text-blue-400' },
    { id: 'billing', title: 'Subscription & Billing', desc: 'Enterprise plan and invoices.', icon: CreditCard, color: 'text-emerald-400' },
    ...(isVideoEligible ? [{ id: 'video_credits', title: 'Video Credits', desc: 'Buy Veo video credits for your wallet.', icon: Film, color: 'text-purple-400' }] : []),
    { id: 'security', title: 'Security & Login History', desc: 'Recent login activity and device access.', icon: ShieldCheck, color: 'text-red-400' },
    { id: 'referral', title: 'Refer & Earn', desc: 'Secure 50 bonus credits for every verified pioneer.', icon: Heart, color: 'text-rose-400' },
    { id: 'usage', title: 'Usage Activity', desc: 'Real-time ledger of AI credit consumption.', icon: History, color: 'text-orange-400' },
    { id: 'notifications', title: 'Alert Preferences', desc: 'Customize your real-time notification lab.', icon: Bell, color: 'text-amber-400' },
    { id: 'api', title: 'API & Integrations', desc: 'Connect to external neural networks.', icon: ShieldCheck, color: 'text-indigo-400' },
  ];

  const handleSave = () => {
    toast.success("Preferences updated and synchronized.", {
      icon: <CheckCircle2 size={16} className="text-emerald-500" />
    });
    setActiveSection(null);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'security':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tighter">Login History</h3>
                <p className="text-muted-foreground text-sm font-medium opacity-70 mt-1">
                  Recent access to your account across all devices
                </p>
              </div>
              <button
                onClick={fetchLoginHistory}
                disabled={loginHistoryLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-colors"
              >
                {loginHistoryLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Refresh
              </button>
            </div>

            {/* Login events list */}
            {loginHistoryLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="p-12 text-center bg-white/5 rounded-[1.5rem] border-2 border-dashed border-white/5 text-muted-foreground">
                No login history found yet.
              </div>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((entry) => {
                  const deviceEmoji = entry.deviceType === 'MOBILE' ? '📱' : entry.deviceType === 'TABLET' ? '📟' : '💻';
                  const isSuccess = entry.status === 'SUCCESS';
                  const loginDate = new Date(entry.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  });

                  return (
                    <div
                      key={entry.id}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all gap-4 ${
                        entry.isNewIp
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : isSuccess
                          ? 'bg-secondary/20 border-white/5 hover:border-white/10'
                          : 'bg-red-500/5 border-red-500/15'
                      }`}
                    >
                      {/* Left: device + details */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                          entry.isNewIp ? 'bg-amber-500/15' : isSuccess ? 'bg-white/5' : 'bg-red-500/10'
                        }`}>
                          {deviceEmoji}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{entry.browser}</span>
                            <span className="text-muted-foreground text-xs">on</span>
                            <span className="font-bold text-sm">{entry.operatingSystem}</span>
                            {entry.isNewIp && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                🆕 New IP
                              </span>
                            )}
                            {!isSuccess && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                Failed
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                            <span>🌐 {entry.ipAddress}</span>
                            <span>·</span>
                            <span>{entry.deviceType}</span>
                            <span>·</span>
                            <span>{loginDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: status badge */}
                      <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                        isSuccess
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {isSuccess ? '✓ Success' : '✗ Failed'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Security tip */}
            <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
              <p className="text-xs text-blue-400 font-bold">
                🔐 <strong>Security Tip:</strong> If you see a login you don't recognize, change your password immediately from Account Settings.
              </p>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Display Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium" defaultValue={user?.name || user?.email?.split('@')[0] || ''} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Identity Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium" defaultValue={user?.email || ''} />
                </div>
              </div>
            </div>
            <div className="pt-6 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-3">
                <div className="h-px bg-white/5 flex-1" />
                <Lock size={16} /> Security
                <div className="h-px bg-white/5 flex-1" />
              </h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => { setPwError(null); setShowPasswordModal(true); }} className="h-14 rounded-xl px-8 border-2 border-white/5 hover:bg-white/5 font-bold flex items-center gap-2">
                  <KeyRound size={16} /> Rotate Password
                </Button>
                <Button variant="outline" className="h-14 rounded-xl px-8 border-2 border-white/5 hover:bg-white/5 font-bold">Enable 2FA Authentication</Button>
              </div>
            </div>
          </div>
        );
      case 'video_credits':
        return (
          <div className="space-y-8">
            {/* No video access message */}
            {accessibleModels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                <Film size={48} className="text-muted-foreground/30" />
                <div className="text-center space-y-2">
                  <h4 className="font-black text-xl tracking-tighter">No Video Access</h4>
                  <p className="text-muted-foreground font-medium opacity-60 max-w-xs">
                    Video credits are available on Standard, Pro, and Super Pro plans.
                  </p>
                </div>
                <Button onClick={() => navigate('/pricing')} className="mt-2">Upgrade Plan</Button>
              </div>
            )}

            {accessibleModels.length > 0 && (
              <>
                {/* Wallet warnings */}
                {wallet?.warnings && wallet.warnings.length > 0 && (
                  <div className="space-y-2">
                    {wallet.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Wallet balance cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accessibleModels.map(m => (
                    <div key={m.id} className={cn('p-6 rounded-[1.5rem] border-2', m.bg, m.border)}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={m.color}>{m.icon}</span>
                        <p className={cn('text-[11px] font-black uppercase tracking-widest', m.color)}>{m.label}</p>
                      </div>
                      <p className={cn('text-4xl font-black tracking-tighter', m.balance === 0 ? 'text-rose-400' : m.balance <= 2 ? 'text-amber-400' : m.color)}>
                        {walletLoading ? '...' : m.balance}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1">credits remaining</p>
                    </div>
                  ))}
                </div>

                {/* Model tab selector */}
                <div className="space-y-6">
                  <div className="flex bg-secondary/20 p-1.5 rounded-2xl border border-white/5 gap-1">
                    {accessibleModels.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setActiveVideoModel(m.id)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                          activeVideoModel === m.id
                            ? cn('bg-background shadow-lg', m.color)
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span>{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Packs grid */}
                  {loadingPacks === activeVideoModel ? (
                    <div className="flex justify-center py-12">
                      <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(packs[activeVideoModel] || []).map(pack => {
                        const modelCfg = accessibleModels.find(m => m.id === activeVideoModel)!;
                        const isBuying = buyingPack === pack.packName;
                        return (
                          <motion.button
                            key={pack.packName}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBuyPack(pack)}
                            disabled={isBuying}
                            className={cn(
                              'flex flex-col items-start p-5 rounded-[1.5rem] border-2 bg-card/40 hover:bg-white/5 transition-all text-left relative overflow-hidden group',
                              modelCfg.border,
                              isBuying && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <div className={cn('absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity', modelCfg.color)}>
                              <ShoppingCart size={48} />
                            </div>
                            <div className={cn('flex items-center gap-1.5 mb-3 text-[10px] font-black uppercase tracking-widest', modelCfg.color)}>
                              {modelCfg.icon}
                              {pack.packType === 'Manual' ? 'Manual' : 'Pack'}
                            </div>
                            <p className="text-2xl font-black tracking-tighter text-foreground">
                              {pack.videoCount} video{pack.videoCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-xl font-black text-primary mt-1">₹{pack.priceInr}</p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">{pack.pricePerVideo}/video</p>
                            {isBuying && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-[1.5rem]">
                                <Loader2 size={24} className="animate-spin text-primary" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                  {/* Custom quantity section */}
                  <div className="mt-6 p-6 rounded-[1.5rem] border-2 border-white/10 bg-white/5 space-y-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">Custom Quantity</p>
                      <p className="text-[10px] text-muted-foreground/60 font-bold">Enter any number of credits you want to buy</p>
                    </div>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Number of videos
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={customQty}
                          onChange={e => setCustomQty(e.target.value)}
                          placeholder="e.g. 7"
                          className="w-full bg-background/60 border-2 border-white/10 focus:border-primary/50 rounded-2xl px-5 py-4 text-lg font-black outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                        <div className="px-5 py-4 bg-primary/10 border-2 border-primary/20 rounded-2xl min-w-[100px] text-center">
                          <p className="text-lg font-black text-primary">
                            {customQty && parseInt(customQty) > 0
                              ? `₹${parseInt(customQty) * ({'veo-lite': 55, 'veo-fast': 140, 'veo-standard': 470}[activeVideoModel as 'veo-lite' | 'veo-fast' | 'veo-standard'] || 55)}`
                              : '₹0'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleBuyCustom}
                        disabled={buyingCustom || !customQty || parseInt(customQty) < 1}
                        className="h-[58px] px-6 rounded-2xl font-black"
                      >
                        {buyingCustom ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 font-bold">
                      Price: ₹{({'veo-lite': 55, 'veo-fast': 140, 'veo-standard': 470} as Record<string, number>)[activeVideoModel]}/video · Max 500 per order
                    </p>
                  </div>

                <p className="text-center text-[10px] text-muted-foreground/40 font-bold">
                  Video credits never expire · Secured by Razorpay
                </p>
              </>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-10">
            <div className="bg-primary/10 backdrop-blur-md border-2 border-primary/20 p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={120} className="text-primary" />
              </div>
              <div className="space-y-2 relative">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Active Tier</p>
                <h3 className="text-4xl font-black tracking-tighter capitalize">{subscription?.tier.toLowerCase().replace('_', ' ') || 'Free'}</h3>
                <p className="text-muted-foreground text-lg font-medium opacity-70 italic">
                  {subscription?.monthlyCredits} Credits Remaining
                </p>
              </div>
              <Button 
                onClick={() => navigate('/pricing')}
                className="h-16 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 relative"
              >
                Change Plan
              </Button>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Historical Invoices</h4>
              <div className="grid gap-4">
                {payments.length > 0 ? payments.map(pay => (
                  <div key={pay.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-secondary/30 rounded-[1.5rem] border-2 border-white/5 hover:border-white/10 transition-all group gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {pay.targetTier
                            ? pay.targetTier.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) + ' Plan Renewal'
                            : 'Video Credits Purchase'}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          {new Date(pay.completedAt || pay.createdAt).toLocaleDateString()} · {pay.razorpayPaymentId || pay.razorpayOrderId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-8">
                      <span className="text-xl font-black tracking-tight text-emerald-400">₹{pay.amount / 100}</span>
                      {pay.status === 'COMPLETED' && (
                        <Button 
                          variant="ghost" 
                          onClick={async () => {
                            try {
                              await downloadReceiptPdf(pay.razorpayOrderId);
                            } catch {
                              toast.error('Receipt not available for this order');
                            }
                          }}
                          className="h-10 rounded-lg text-primary hover:bg-primary/5 font-bold flex items-center gap-2"
                        >
                          <Download size={16} /> Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center bg-white/5 rounded-[1.5rem] border-2 border-dashed border-white/5 text-muted-foreground">
                    No payment history discovered in this identity sector.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'referral':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-rose-500/5 border-2 border-rose-500/10 p-8 rounded-[2rem] mb-8 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                 <Heart size={120} className="text-rose-400" />
               </div>
               <h3 className="text-xl font-bold mb-2 flex items-center gap-2 relative z-10 text-rose-400">
                 <Heart size={20} fill="currentColor" />
                 The Pioneer Program
               </h3>
               <p className="text-muted-foreground relative z-10 leading-relaxed font-medium">
                 Expand our collective neural network. When a new user joins via your unique frequency and verifies their identity, 
                 your account is rewarded with <span className="text-rose-400 font-black">50 credits</span> immediately. No limits.
               </p>
             </div>
             <ReferralCard referralCode={subscription?.referralCode} />
          </div>
        );
      case 'usage':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-orange-500/10 border-2 border-orange-500/20 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Total Consumed</p>
                <h4 className="text-3xl font-black tracking-tighter">{Math.abs(usage.reduce((acc, curr) => acc + curr.amount, 0))} Credits</h4>
              </div>
              <div className="bg-blue-500/10 border-2 border-blue-500/20 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Average Daily</p>
                <h4 className="text-3xl font-black tracking-tighter">1.2 Units</h4>
              </div>
              <div className="bg-purple-500/10 border-2 border-purple-500/20 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Cortex Load</p>
                <h4 className="text-3xl font-black tracking-tighter">Optimal</h4>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Usage Log</h4>
              <div className="grid gap-4">
                {usage.length > 0 ? usage.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-6 bg-secondary/30 rounded-[1.5rem] border-2 border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{u.purpose}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{new Date(u.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black tracking-tight text-orange-400">{u.amount} Units</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center bg-white/5 rounded-[1.5rem] border-2 border-dashed border-white/5 text-muted-foreground">
                    No neural activity detected in your consumption history.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            {[
              { title: 'Neural Summaries', desc: 'Daily AI generation insights via email.', icon: Mail },
              { title: 'Cortex Alerts', desc: 'Instant push notifications for platform events.', icon: Smartphone },
              { title: 'Studio Direct', desc: 'Browser-level updates during active sessions.', icon: Globe },
            ].map(item => (
              <div key={item.title} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 bg-secondary/30 rounded-[2rem] border-2 border-white/5 group hover:border-white/10 transition-all gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-background/50 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-white/5 shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg md:text-xl font-black tracking-tight">{item.title}</p>
                    <p className="text-sm text-muted-foreground font-medium opacity-70">{item.desc}</p>
                  </div>
                </div>
                <button className="w-16 h-8 bg-primary rounded-full relative shadow-inner overflow-hidden group/switch self-end md:self-auto">
                  <div className="absolute inset-0 bg-primary opacity-90" />
                  <div className="absolute right-1.5 top-1.5 w-5 h-5 bg-white rounded-full shadow-2xl transition-transform" />
                </button>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="py-24 text-center space-y-6 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground/30">
              <ShieldCheck size={48} />
            </div>
            <div className="max-w-xs mx-auto">
              <h4 className="font-black text-2xl tracking-tighter">Under Construction</h4>
              <p className="text-muted-foreground font-medium opacity-60 italic">This sector is currently being optimized for peak performance.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
    <PageWrapper>
      <div className="max-w-5xl space-y-12 pb-20">
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <AnimatePresence mode="wait">
              {activeSection && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setActiveSection(null)}
                  className="p-3 bg-secondary/50 hover:bg-secondary rounded-[1.25rem] transition-all text-muted-foreground border border-white/5 shadow-xl"
                >
                  <ChevronLeft size={24} />
                </motion.button>
              )}
            </AnimatePresence>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
              {activeSection ? sections.find(s => s.id === activeSection)?.title : 'Control Center'}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl font-medium opacity-70 leading-relaxed max-w-2xl px-1">
            {activeSection ? sections.find(s => s.id === activeSection)?.desc : 'Calibrate your identity and optimize your laboratory settings.'}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!activeSection ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {sections.map((section) => (
                <div 
                  key={section.id} 
                  onClick={() => setActiveSection(section.id)}
                  className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-10 rounded-[2.5rem] flex flex-col justify-between group hover:border-primary/50 transition-all cursor-pointer shadow-2xl relative overflow-hidden h-[240px]"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <section.icon size={120} className={section.color} />
                  </div>
                  <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all border border-white/5 shadow-inner">
                    <section.icon size={32} />
                  </div>
                  <div className="space-y-2 relative">
                    <h3 className="font-black text-2xl tracking-tighter flex items-center gap-2">
                      {section.title}
                      <ChevronRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500" size={24} />
                    </h3>
                    <p className="text-muted-foreground font-medium opacity-70 text-lg leading-snug">{section.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-card/40 backdrop-blur-3xl border-2 border-white/5 p-6 md:p-12 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative"
            >
              <div className="relative z-10">
                {renderSectionContent()}
                
                <div className="pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-end gap-6">
                  <Button variant="ghost" onClick={() => setActiveSection(null)} className="w-full md:w-auto h-14 px-10 rounded-xl font-bold order-2 md:order-1">Discard Changes</Button>
                  <Button 
                    className="w-full md:w-auto h-14 px-12 rounded-xl text-lg font-black shadow-2xl shadow-primary/20 order-1 md:order-2"
                    onClick={handleSave}
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>

    {/* ── Change Password Modal ─────────────────────────────────────── */}
    <AnimatePresence>
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-md bg-[#0f1729] border-2 border-white/10 rounded-[2rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <KeyRound size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter">Rotate Password</h3>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Security Update</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error */}
            {pwError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold">
                {pwError}
              </div>
            )}

            {/* Fields */}
            <div className="space-y-5">
              {/* Old Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={pwOld}
                    onChange={e => setPwOld(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-secondary/30 border-2 border-white/5 rounded-xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowOld(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={pwNew}
                    onChange={e => setPwNew(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-secondary/30 border-2 border-white/5 rounded-xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={pwConfirm}
                    onChange={e => setPwConfirm(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleChangePassword(); }}
                    className="w-full pl-12 pr-12 py-3.5 bg-secondary/30 border-2 border-white/5 rounded-xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                    placeholder="Repeat new password"
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="ghost"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 h-12 rounded-xl font-bold border-2 border-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="flex-1 h-12 rounded-xl font-black relative overflow-hidden group disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {pwLoading ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : <><KeyRound size={18} /> Update Password</>}
                </span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

// Internal icon for the billing card
const TrendingUp: React.FC<{ size?: number, className?: string }> = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default SettingsPage;
