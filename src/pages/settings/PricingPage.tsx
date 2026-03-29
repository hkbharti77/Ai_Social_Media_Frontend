import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { 
  Star, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  History,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { getProfile, type ProfileResponse } from '../../api/profile';
import { getPricingTiersApi, type PricingTier } from '../../api/pricing';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../api/payment';
import { toast } from 'sonner';

const PricingPage: React.FC = () => {
  const [tiers, setTiers] = React.useState<PricingTier[]>([]);
  const [subscription, setSubscription] = React.useState<ProfileResponse['subscription'] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    setIsLoading(true);
    try {
      const [pricingData, profileData] = await Promise.all([
        getPricingTiersApi(),
        getProfile()
      ]);
      setTiers(pricingData);
      setSubscription(profileData.subscription);
    } catch (e) {
      console.error('Failed to sync enterprise pricing', e);
      toast.error("Cloud pricing sync failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentTier = (tierName: string) => {
    if (!subscription) return tierName.toLowerCase() === "free";
    return subscription.tier.toUpperCase() === tierName.toUpperCase().replace(' ', '_');
  };

  const handleUpgrade = async (tier: PricingTier) => {
    if (isCurrentTier(tier.name)) return;
    
    const loadingToast = toast.loading(`Preparing upgrade for ${tier.name}...`);
    
    try {
      // 1. Create Order
      const order = await createRazorpayOrder(tier.name, tier.priceAmount);
      console.log('Order created:', order);
      
      // Handle Free tier directly if returned by backend
      if (order.is_free) {
        toast.success("Plan updated successfully!", { 
            description: `You are now on the ${tier.name} plan.`,
            id: loadingToast 
        });
        fetchPricingData();
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
            // Refresh data
            fetchPricingData();
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
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment Failed", {
          description: response.error.description
        });
      });
      rzp.open();
      toast.dismiss(loadingToast);
      
    } catch (error) {
      console.error('Upgrade failed', error);
      toast.error("Failed to initiate payment", { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">Syncing Enterprise Rates...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-16 pb-20">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"
          >
            <Sparkles size={14} />
            Live Enterprise Rates
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase"
          >
            Power Your <span className="text-primary">Identity</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg font-medium opacity-60"
          >
            Dynamically optimized pricing tiers for global scale.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
          {tiers
            .filter((_, idx) => {
              const currentOrdinal = subscription?.tierOrdinal ?? 0;
              // Only show tiers higher than the current one
              return idx > currentOrdinal;
            })
            .map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={cn(
                  "relative flex flex-col p-8 rounded-[3rem] border-2 transition-all duration-500 overflow-hidden group",
                  tier.popular ? "border-primary/30 bg-primary/5 popular-card" : "border-white/5 bg-white/5",
                  tier.popular && "bg-gradient-to-b from-primary/10 to-transparent shadow-2xl shadow-primary/10 scale-105 z-10"
                )}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Star size={140} className="text-primary" />
                  </div>
                )}

                <div className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className={cn(
                        "text-3xl font-black italic uppercase tracking-tight",
                        tier.name === 'Standard' ? 'text-blue-400' : (tier.name === 'Pro' ? 'text-primary' : 'text-purple-400')
                      )}>{tier.name}</h3>
                      {tier.popular && (
                        <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                          Recommended
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-foreground">{tier.priceInr}</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">/month</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">{tier.description}</p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-border to-transparent" />

                  <ul className="space-y-4 flex-1">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground/90">
                        <div className={cn("shrink-0 p-1 rounded-md", tier.popular ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
                          <Check size={14} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleUpgrade(tier)}
                    className={cn(
                      "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl",
                      tier.popular ? "shadow-primary/20" : "shadow-black/20"
                    )}
                  >
                    Upgrade to {tier.name}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          
          {/* Fallback if no upgrades available */}
          {tiers.filter((_, idx) => idx > (subscription?.tierOrdinal ?? 0)).length === 0 && (
            <div className="col-span-full py-20 text-center space-y-6 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Star size={40} />
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="font-black text-2xl tracking-tighter italic uppercase">Peak Performance</h4>
                <p className="text-muted-foreground font-medium opacity-60">You are currently on our highest tier. Your studio is operating at maximum neurological throughput.</p>
              </div>
            </div>
          )}
        </div>

        {/* Feature Comparison Grid - Simplified */}
        <section className="pt-20 space-y-12">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tight">Technical Capability</h2>
                <p className="text-muted-foreground font-medium text-sm">Every tier includes our core AI safety and brand isolation protocols.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: ShieldCheck, title: "Data Isolation", desc: "Your training data and generated media are strictly scoped to your account." },
                    { icon: Cpu, title: "Neural Engine", desc: "Powered by Gemini 1.5 Pro and Imagen 3 for state-of-the-art creativity." },
                    { icon: History, title: "Usage Analytics", desc: "Real-time tracking of your AI credits and generation frequency." }
                ].map((item, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-secondary/20 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <item.icon size={24} />
                        </div>
                        <h4 className="font-black uppercase italic text-lg">{item.title}</h4>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default PricingPage;
