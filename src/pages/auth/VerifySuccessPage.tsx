import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Rocket, 
  UserPlus, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';

const VerifySuccessPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageWrapper showSidebar={false}>
            <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
                <div className="max-w-xl w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="bg-card/40 backdrop-blur-3xl border-2 border-white/5 p-12 rounded-[4rem] shadow-[0_80px_160px_rgba(0,0,0,0.6)] text-center relative overflow-hidden group"
                    >
                        {/* Animated background elements */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                        <div className="absolute -right-20 -top-20 p-20 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Rocket size={320} className="text-primary rotate-12" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            {/* Success Icon */}
                            <div className="relative inline-block">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-400 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20"
                                >
                                    <CheckCircle2 size={48} />
                                </motion.div>
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-2 -right-2 text-primary"
                                >
                                    <Sparkles size={24} />
                                </motion.div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                    Identity <span className="text-primary">Verified</span>
                                </h1>
                                <p className="text-muted-foreground text-lg font-medium opacity-70 leading-relaxed">
                                    Namaste! Your neural baseline is confirmed. You have been granted full access to the AI Content Studio.
                                </p>
                            </div>

                            {/* Rewards Grid */}
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                        <Zap size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Welcome Bonus</p>
                                        <p className="text-xl font-black">15.0 <span className="text-[10px] opacity-50">CREDITS</span></p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Status</p>
                                        <p className="text-xl font-black">SECURE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4">
                                <Button 
                                    onClick={() => navigate('/login')}
                                    className="w-full h-18 text-xl font-black italic rounded-[1.5rem] shadow-[0_20px_40px_rgba(var(--primary),0.3)] bg-primary hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    Sign In to Studio
                                    <ArrowRight size={24} />
                                </Button>
                            </div>

                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                                GyanVaniAi Laboratory ● System Ready
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default VerifySuccessPage;
