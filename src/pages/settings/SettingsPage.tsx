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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'account', title: 'Account Settings', desc: 'Secure and personalize your profile.', icon: User, color: 'text-blue-400' },
    { id: 'billing', title: 'Subscription & Billing', desc: 'Manage your enterprise plan and invoices.', icon: CreditCard, color: 'text-emerald-400' },
    { id: 'notifications', title: 'Alert Preferences', desc: 'Customize your real-time notification lab.', icon: Bell, color: 'text-amber-400' },
    { id: 'api', title: 'API & Integrations', desc: 'Connect to external neural networks.', icon: ShieldCheck, color: 'text-purple-400' },
  ];

  const handleSave = () => {
    toast.success("Preferences updated and synchronized.", {
      icon: <CheckCircle2 size={16} className="text-emerald-500" />
    });
    setActiveSection(null);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
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
                <Button variant="outline" className="h-14 rounded-xl px-8 border-2 border-white/5 hover:bg-white/5 font-bold">Rotate Password</Button>
                <Button variant="outline" className="h-14 rounded-xl px-8 border-2 border-white/5 hover:bg-white/5 font-bold">Enable 2FA Authentication</Button>
              </div>
            </div>
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
                <h3 className="text-4xl font-black tracking-tighter">Pro Enterprise</h3>
                <p className="text-muted-foreground text-lg font-medium opacity-70 italic">Synchronized until Oct 24, 2026</p>
              </div>
              <Button className="h-16 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 relative">Change Plan</Button>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Historical Documents</h4>
              <div className="grid gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between items-center p-6 bg-secondary/30 rounded-[1.5rem] border-2 border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Invoice #{1024 - i}</p>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Sept {24-i}, 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xl font-black tracking-tight">$29.00</span>
                      <Button variant="ghost" className="h-10 rounded-lg text-primary hover:bg-primary/5 font-bold">Download Asset</Button>
                    </div>
                  </div>
                ))}
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
