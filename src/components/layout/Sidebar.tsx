import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  ArrowRight
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
  const [isOpen, setIsOpen] = useState(false);
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-5 flex items-center gap-2">
              <ShieldCheck size={12} /> Owner Control
            </h2>
            <div className="space-y-2 px-2">
              <NavLink
                to="/admin/dashboard"
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
        <div className="bg-gradient-to-br from-secondary/50 to-background/50 border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
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
                / {subscription?.tier === 'FREE' ? '10' : (subscription?.tier === 'STANDARD' ? '100' : (subscription?.tier === 'PRO' ? '1,000' : '20,000'))} Credits
              </span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex items-center justify-between">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
              subscription?.tier === 'FREE' ? "border-white/10 text-muted-foreground" : "border-primary/20 text-primary bg-primary/5"
            )}>
              {subscription?.tier?.replace('_', ' ') ?? 'FREE'} PLAN
            </span>
            {(!subscription?.tier || subscription?.tier === 'FREE' || subscription?.tier === 'STANDARD') && (
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="text-primary text-[8px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                Upgrade <ArrowRight size={10} />
              </button>
            )}
          </div>
        </div>
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
