import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  UserCircle, 
  Link as LinkIcon, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  ImageIcon,
  Leaf,
  Globe,
  ShieldCheck,
  SearchCode,
  Users,
  Calendar,
  Zap,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/useAuth';
import { getProfile, type ProfileResponse } from '../../api/profile';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: PlusCircle, label: 'Generate', href: '/generate' },
  { icon: Sparkles, label: 'AI Butler', href: '/reviews' },
  { icon: Globe, label: 'Community', href: '/community' },
  { icon: Leaf, label: 'Evergreen', href: '/evergreen' },
  { icon: LinkIcon, label: 'Microsite', href: '/microsite' },
  { icon: LinkIcon, label: 'Connect', href: '/connect' },
  { icon: ImageIcon, label: 'AI Media', href: '/media' },
  { icon: Sparkles, label: 'Brand Voice', href: '/profile/brand-voice' },
  { icon: UserCircle, label: 'Profile', href: '/profile/setup' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

import { UpgradeModal } from './UpgradeModal';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isAdminOpen, setIsAdminOpen] = useState(isAdminRoute);

  React.useEffect(() => {
    const fetchSub = async () => {
      try {
        const data = await getProfile();
        setSubscription(data.subscription);
      } catch (e) {
        console.error('Failed to sync sidebar credits', e);
      }
    };
    fetchSub();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-3xl border-r border-white/5 shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-black text-primary flex items-center gap-4 tracking-tighter">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 shrink-0">
            <Sparkles size={24} />
          </div>
        </h1>

        {user?.email === 'hkbharti77@gmail.com' && (
          <div className="space-y-2">
            {/* Toggle Header */}
            <button
              onClick={() => setIsAdminOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-5 py-3 rounded-2xl hover:bg-rose-500/10 transition-all group"
            >
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} /> Owner Control
              </span>
              <motion.div
                animate={{ rotate: isAdminOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="text-rose-500" />
              </motion.div>
            </button>

            {/* Collapsible Submenu */}
            <AnimatePresence initial={false}>
              {isAdminOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 px-2 pb-2">
                    <NavLink
                      to="/admin/system-stats"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <LayoutDashboard size={20} />
                      <span>System Stats</span>
                    </NavLink>
                    <NavLink
                      to="/admin/user-management"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <Users size={20} />
                      <span>User Management</span>
                    </NavLink>
                    <NavLink
                      to="/admin/fraud"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <ShieldCheck size={20} />
                      <span>Fraud Management</span>
                    </NavLink>
                    <NavLink
                      to="/admin/payments"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <Zap size={20} />
                      <span>Payments</span>
                    </NavLink>
                    <NavLink
                      to="/admin/broadcast"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <Sparkles size={20} />
                      <span>Broadcast Email</span>
                    </NavLink>
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <LayoutDashboard size={20} />
                      <span>Intelligence</span>
                    </NavLink>
                    <NavLink
                      to="/admin/audit"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <SearchCode size={20} />
                      <span>Token Audit</span>
                    </NavLink>
                    <NavLink
                      to="/admin/users"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                          isActive 
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                        )
                      }
                    >
                      <Users size={20} />
                      <span>User Directory</span>
                    </NavLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
              )
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Credit Balance Card */}
      <div className="px-6 py-8">
        <PlanDetailsCard subscription={subscription} onUpgrade={() => setIsUpgradeModalOpen(true)} />
      </div>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <LogOut size={20} />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen flex-col fixed left-0 top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Nav Trigger */}
      <div className="lg:hidden fixed top-6 right-6 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all border border-primary/20"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        currentTierOrdinal={subscription?.tierOrdinal}
      />
    </>
  );
};

export default Sidebar;

// ── Plan Details Card ────────────────────────────────────────────────────────

interface PlanDetailsCardProps {
  subscription: ProfileResponse['subscription'] | null;
  onUpgrade: () => void;
}

const PlanDetailsCard: React.FC<PlanDetailsCardProps> = ({ subscription, onUpgrade }) => {
  const [expanded, setExpanded] = React.useState(false);

  const tier = subscription?.tier ?? 'FREE';
  const displayTier = tier.replace('_', ' ');

  const maxCredits = (() => {
    if (tier === 'FREE')      return '10';
    if (tier === 'CREATOR')   return '1,000';
    if (tier === 'STANDARD')  return '200';
    if (tier === 'PRO')       return '1,000';
    if (tier === 'SUPER_PRO') return '4,000';
    return '10';
  })();

  const isVideoTier = ['STANDARD', 'PRO', 'SUPER_PRO'].includes(tier);

  const videoCredits = [
    { label: 'Veo Lite',     value: subscription?.videoCreditLite     ?? 0, color: 'text-emerald-400', show: isVideoTier },
    { label: 'Veo Fast',     value: subscription?.videoCreditFast     ?? 0, color: 'text-blue-400',    show: ['PRO', 'SUPER_PRO'].includes(tier) },
    { label: 'Veo Standard', value: subscription?.videoCreditStandard ?? 0, color: 'text-purple-400',  show: tier === 'SUPER_PRO' },
  ].filter(v => v.show);

  return (
    <div className="bg-gradient-to-br from-secondary/50 to-background/50 border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-6 space-y-4 text-left group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Sparkles size={60} className="text-primary" />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Zap size={12} className="text-primary" /> Cloud Intelligence
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">
              {subscription?.monthlyCredits?.toLocaleString() ?? '0'}
            </span>
            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
              / {maxCredits} Credits
            </span>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
            tier === 'FREE' ? "border-white/10 text-muted-foreground" : "border-primary/20 text-primary bg-primary/5"
          )}>
            {displayTier} PLAN
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            <ChevronDown size={14} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5 space-y-4">

              {/* Image Credits */}
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Image Credits</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-foreground">
                    {subscription?.monthlyCredits?.toLocaleString() ?? '0'}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold">/ {maxCredits} remaining</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((subscription?.monthlyCredits ?? 0) / parseFloat(maxCredits.replace(/,/g, ''))) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Bonus Credits */}
              {(subscription?.bonusCredits ?? 0) > 0 && (
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Bonus Credits</span>
                  <span className="text-sm font-black text-amber-400">{subscription?.bonusCredits}</span>
                </div>
              )}

              {/* Video Credits */}
              {isVideoTier && videoCredits.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Video Credits</p>
                  {videoCredits.map(v => (
                    <div key={v.label} className="flex items-center justify-between">
                      <span className={cn('text-[10px] font-black', v.color)}>{v.label}</span>
                      <span className={cn('text-sm font-black', v.value === 0 ? 'text-rose-400' : v.value <= 2 ? 'text-amber-400' : v.color)}>
                        {v.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Plan expiry */}
              {subscription?.expiresAt && (
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Renews</span>
                  <span className="text-[10px] font-black text-muted-foreground">
                    {new Date(subscription.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Upgrade button */}
              {['FREE', 'CREATOR', 'STANDARD', 'PRO'].includes(tier) && (
                <button
                  onClick={onUpgrade}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                >
                  Upgrade Plan <ArrowRight size={12} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
