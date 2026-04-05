import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface ReferralCardProps {
  referralCode: string | undefined;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ referralCode }) => {
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!", {
      icon: <CheckCircle2 size={16} className="text-emerald-500" />
    });
  };

  if (!referralCode) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-2 border-indigo-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute right-[-20px] top-[-20px] p-8 opacity-5 group-hover:opacity-10 transition-all group-hover:rotate-12">
        <Share2 size={150} className="text-indigo-400" />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter uppercase text-indigo-400">Refer & Earn</h3>
            <p className="text-sm font-bold text-muted-foreground">Invite friends and get 50 credits each!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/5">
          <code className="flex-1 px-4 py-2 font-mono text-sm text-indigo-300 truncate">
            {referralLink}
          </code>
          <Button 
            onClick={copyToClipboard}
            size="sm"
            className="rounded-xl h-10 px-4 bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            <Copy size={16} className="mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralCard;
