import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Zap, Rocket, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useNavigate } from 'react-router-dom';

import { getPricingTiersApi, type PricingTier } from '../../api/pricing';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../api/payment';
import { toast } from 'sonner';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const tierStyles: Record<string, any> = {
  'Standard': { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'Pro': { icon: Star, color: 'text-primary', bg: 'bg-primary/10', popular: true },
  'Super Pro': { icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();
  const [tiers, setTiers] = React.useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchTiers();
    }
  }, [isOpen]);

  const fetchTiers = async () => {
    setIsLoading(true);
    try {
      const data = await getPricingTiersApi();
      // Filter out Free tier for upgrade modal
      setTiers(data.filter(t => t.name.toLowerCase() !== 'free'));
    } catch (e) {
      console.error('Failed to fetch upgrade tiers', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: PricingTier) => {
    const loadingToast = toast.loading(`Preparing upgrade to ${tier.name}...`);
    
    try {
      // 1. Create Order
      const order = await createRazorpayOrder(tier.name, tier.priceAmount);
      
      // Handle Free tier directly if returned by backend
      if (order.is_free) {
        toast.success("Plan updated successfully!", { 
            description: `You are now on the ${tier.name} plan.`,
            id: loadingToast 
        });
        onClose();
        navigate('/settings');
        return;
      }
      
      // 2. Open Razorpay Checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "VaniAI",
        description: `Upgrade to ${tier.name} Plan`,
        order_id: order.order_id,
        handler: async (response: any) => {
          console.log('Payment Response:', response);
          const verifyingToast = toast.loading("Verifying payment...");
          try {
            await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast.success("Payment successful!", { 
                description: `You are now on the ${tier.name} plan.`,
                id: verifyingToast 
            });
            onClose();
            navigate('/settings');
          } catch (error) {
            toast.error("Payment verification failed", { id: verifyingToast });
          }
        },
        prefill: {
          name: "VaniAI User",
          email: "user@vaniai.com",
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      toast.dismiss(loadingToast);
      
    } catch (error) {
      console.error('Upgrade failed', error);
      toast.error("Failed to initiate payment", { id: loadingToast });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Upgrade Your Plan" 
      maxWidth="2xl"
      className="!bg-background/95 border-primary/20"
    >
      <div className="space-y-8 py-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary animate-bounce">
            <Sparkles size={32} />
          </div>
          <h3 className="text-3xl font-black tracking-tighter italic uppercase text-foreground">
            {message || "Limit Reached"}
          </h3>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            You've hit your current plan's limit. Upgrade now to unlock more AI magic and faster generation speeds.
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-primary">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Sparkles size={48} />
            </motion.div>
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Enterprise Rates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const style = tierStyles[tier.name] || tierStyles['Standard'];
              const Icon = style.icon;
              
              return (
                <motion.div
                  key={tier.name}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col justify-between ${
                    tier.popular ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-white/5 bg-secondary/10 hover:border-white/20'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className={`w-12 h-12 ${style.bg} ${style.color} rounded-xl flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl tracking-tight text-foreground uppercase italic">{tier.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight mt-1">{tier.description}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-foreground">{tier.priceInr}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">/mo</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/80">
                        <Check size={14} className="text-green-500" />
                        {tier.monthlyCredits.toLocaleString()} Credits
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/80">
                        <Check size={14} className="text-green-500" />
                        Fast Speed
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleUpgrade(tier)}
                    variant={tier.popular ? 'default' : 'outline'}
                    className={`w-full mt-6 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] ${
                      !tier.popular && 'border-white/10'
                    }`}
                  >
                    Select {tier.name}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center">
            <button 
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
            >
                Maybe Later
            </button>
        </div>
      </div>
    </Modal>
  );
};
