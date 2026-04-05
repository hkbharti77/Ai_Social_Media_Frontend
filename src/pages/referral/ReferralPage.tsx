import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  Users, 
  Sparkles, 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  Copy,
  Share2,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { getProfile, type ProfileResponse } from '../../api/profile';

const ReferralPage: React.FC = () => {
  const [subscription, setSubscription] = useState<ProfileResponse['subscription'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setSubscription(data.subscription);
      } catch (e) {
        toast.error("Failed to sync neural connection.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const referralCode = subscription?.referralCode || "PIONEER_CODE";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link encoded and copied!", {
        icon: <CheckCircle2 size={16} className="text-emerald-500" />
    });
  };

  const shareOnTwitter = () => {
    const text = `Join me on the AI Content Studio! Use my link to get 30 free AI credits. 🚀 #AI #Marketing\n\n${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const steps = [
    { title: 'Invite Friends', desc: 'Share your unique frequency link with fellow digital architects.', icon: Users, color: 'text-blue-400' },
    { title: 'Verification', desc: 'They join and verify their identity through our neural gates.', icon: ShieldCheck, color: 'text-emerald-400' },
    { title: 'Harvest Credits', desc: 'You both receive a massive bonus to power your creativity.', icon: Zap, color: 'text-amber-400' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-16 pb-20">
        <header className="space-y-4 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles size={14} className="animate-pulse" /> Pioneer Program Active
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic">
            Expanding the <span className="text-primary italic">Neural Network</span>
          </h1>
          <p className="text-muted-foreground text-xl font-medium opacity-70 max-w-2xl mx-auto">
            Orchestrate growth. Secure persistent credits for every verified user you onboard to the studio environment.
          </p>
        </header>

        {/* Main Link Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12">
            <div className="bg-card/40 backdrop-blur-3xl border-2 border-white/5 p-10 md:p-16 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-all group-hover:rotate-12">
                <Share2 size={240} className="text-primary" />
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black tracking-tighter">Your Unique Frequency</h3>
                    <p className="text-muted-foreground font-medium opacity-60">Share this link to initiate the connection.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="bg-secondary/30 border-2 border-white/5 p-4 rounded-3xl flex items-center justify-between group/input hover:border-primary/30 transition-all">
                      <code className="text-lg font-mono text-primary truncate px-4">
                        {isLoading ? "Synchronizing..." : referralLink}
                      </code>
                      <Button 
                        onClick={copyToClipboard}
                        className="h-14 px-8 rounded-2xl bg-primary shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <Copy size={16} /> Copy
                      </Button>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={shareOnTwitter}
                      className="h-16 rounded-3xl border-2 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <Share2 size={20} className="text-blue-400" /> Share on Social Lab
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/10 border-2 border-primary/20 p-10 rounded-[3rem] space-y-6">
                   <div className="flex justify-between items-start">
                     <div className="p-4 bg-primary/20 rounded-2xl text-primary">
                        <Gift size={32} />
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Current Payout</p>
                       <h4 className="text-4xl font-black tracking-tighter">50 <span className="text-sm font-medium">Credits</span></h4>
                     </div>
                   </div>
                   <div className="h-px bg-primary/20" />
                   <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                     "Each successful verification grants you 50 non-resetting bonus credits. These persist through billing cycles."
                   </p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Total</p>
                        <p className="text-xl font-black">{subscription?.bonusCredits?.toFixed(1) || '0.0'}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Referrals</p>
                        <p className="text-xl font-black">---</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black tracking-tighter italic">Operational Procedure</h2>
            <div className="h-px bg-white/5 flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-card/40 border-2 border-white/5 p-10 rounded-[2.5rem] relative group hover:border-primary/20 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                  <step.icon size={120} className={step.color} />
                </div>
                <div className="space-y-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-background/50 border border-white/5 shadow-inner ${step.color}`}>
                    <step.icon size={28} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black tracking-tighter">{step.title}</h4>
                    <p className="text-muted-foreground font-medium opacity-70 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:translate-x-2 transition-transform">
                      <ArrowRight size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard CTA or History */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="p-5 bg-primary/10 rounded-full text-primary">
                <TrendingUp size={40} />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black tracking-tight">Expand the Digital Frontier</h4>
                <p className="text-muted-foreground font-medium opacity-70">Top pioneers earn exclusive "Founder" badge and 1000+ credits.</p>
              </div>
            </div>
            <Button className="h-14 px-10 rounded-2xl text-lg font-black italic">View Leaderboard (Coming Soon)</Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ReferralPage;
