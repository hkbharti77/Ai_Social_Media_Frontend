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
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: PlusCircle, label: 'Generate', href: '/generate' },
  { icon: LinkIcon, label: 'Connect', href: '/connect' },
  { icon: ImageIcon, label: 'AI Media', href: '/media' },
  { icon: UserCircle, label: 'Profile', href: '/profile/setup' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-3xl border-r border-white/5 shadow-2xl">
      <div className="p-8">
        <h1 className="text-2xl font-black text-primary flex items-center gap-4 tracking-tighter">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 shrink-0">
            <Sparkles size={24} />
          </div>
          <span className="mt-1">VaniAI</span>
        </h1>
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
    </>
  );
};

export default Sidebar;
