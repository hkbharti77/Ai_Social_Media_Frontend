import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Keyboard, Loader2, CheckCircle2, Copy, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { toast } from 'sonner';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Razorpay order details — passed after backend creates the order */
  order: {
    order_id: string;
    amount: number;       // in paise
    currency: string;
    key_id: string;
  } | null;
  tierName: string;
  onPaymentSuccess: (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => void;
}

type Tab = 'qr' | 'upi_id';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  tierName,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('qr');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiIdError, setUpiIdError] = useState('');

  const amountInr = order ? order.amount / 100 : 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUpiId('');
      setUpiIdError('');
      setIsProcessing(false);
      setActiveTab('qr');
    }
  }, [isOpen]);

  const validateUpiId = (id: string) => {
    // UPI ID format: username@bankhandle
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(id.trim());
  };

  /** Opens Razorpay checkout pre-filled with UPI method */
  const openRazorpay = (method: 'qr' | 'upi_id') => {
    if (!order) return;

    const options: any = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'VaniAI',
      description: `Upgrade to ${tierName} Plan`,
      order_id: order.order_id,
      handler: (response: any) => {
        onPaymentSuccess(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
        onClose();
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        },
      },
      theme: { color: '#7c3aed' },
    };

    if (method === 'qr') {
      // Force QR code display
      options.method = { upi: true };
      options.config = {
        display: {
          blocks: {
            upi: { name: 'Pay via UPI QR', instruments: [{ method: 'upi', flows: ['qr'] }] },
          },
          sequence: ['block.upi'],
          preferences: { show_default_blocks: false },
        },
      };
    } else {
      // Force UPI collect (user enters UPI ID)
      options.method = { upi: true };
      options.config = {
        display: {
          blocks: {
            upi: { name: 'Pay via UPI ID', instruments: [{ method: 'upi', flows: ['collect'] }] },
          },
          sequence: ['block.upi'],
          preferences: { show_default_blocks: false },
        },
      };
      if (upiId.trim()) {
        options.prefill = { vpa: upiId.trim() };
      }
    }

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      toast.error('Payment failed: ' + response.error.description);
      setIsProcessing(false);
    });
    rzp.open();
  };

  const handleQrPay = () => {
    setIsProcessing(true);
    openRazorpay('qr');
  };

  const handleUpiIdPay = () => {
    if (!validateUpiId(upiId)) {
      setUpiIdError('Enter a valid UPI ID (e.g. name@upi, name@okaxis)');
      return;
    }
    setUpiIdError('');
    setIsProcessing(true);
    openRazorpay('upi_id');
  };

  const copyUpiId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Copied!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-widest">UPI Payment</p>
                  <p className="text-[11px] text-muted-foreground font-bold">
                    ₹{amountInr.toLocaleString('en-IN')} · {tierName} Plan
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-4 gap-2">
              <button
                onClick={() => setActiveTab('qr')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'qr'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                )}
              >
                <QrCode size={14} />
                Scan QR
              </button>
              <button
                onClick={() => setActiveTab('upi_id')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                  activeTab === 'upi_id'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                )}
              >
                <Keyboard size={14} />
                UPI ID
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-6 space-y-6">
              <AnimatePresence mode="wait">
                {activeTab === 'qr' ? (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    {/* QR placeholder — Razorpay generates the actual QR */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center">
                        <QrCode size={80} className="text-black" />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-bold text-center leading-relaxed">
                        Click below to open the QR code in your payment app
                      </p>
                    </div>

                    <div className="space-y-2 text-[11px] text-muted-foreground font-bold">
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                        Click "Open QR" below
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                        Scan with any UPI app (GPay, PhonePe, Paytm)
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                        Complete payment of ₹{amountInr.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <Button
                      onClick={handleQrPay}
                      disabled={isProcessing}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin mr-2" /> Opening...</>
                      ) : (
                        <><QrCode size={18} className="mr-2" /> Open QR Code</>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upi_id"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Your UPI ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setUpiIdError('');
                          }}
                          placeholder="yourname@upi"
                          className={cn(
                            'w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all',
                            upiIdError
                              ? 'border-rose-500/50 focus:border-rose-500'
                              : 'border-white/10 focus:border-primary/50'
                          )}
                        />
                        {upiId && (
                          <button
                            onClick={() => copyUpiId(upiId)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </div>
                      {upiIdError && (
                        <p className="text-[11px] text-rose-400 font-bold">{upiIdError}</p>
                      )}
                    </div>

                    {/* Common UPI handles hint */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Common formats</p>
                      <div className="flex flex-wrap gap-2">
                        {['@okaxis', '@oksbi', '@okicici', '@ybl', '@paytm', '@upi'].map(handle => (
                          <button
                            key={handle}
                            onClick={() => {
                              const base = upiId.split('@')[0] || 'yourname';
                              setUpiId(base + handle);
                              setUpiIdError('');
                            }}
                            className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1">
                      <p className="text-[11px] font-black text-primary">Amount to pay</p>
                      <p className="text-2xl font-black tracking-tighter">₹{amountInr.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-muted-foreground font-bold">{tierName} Plan · Monthly</p>
                    </div>

                    <Button
                      onClick={handleUpiIdPay}
                      disabled={isProcessing || !upiId.trim()}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin mr-2" /> Processing...</>
                      ) : (
                        <><CheckCircle2 size={18} className="mr-2" /> Pay ₹{amountInr.toLocaleString('en-IN')}</>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center text-[10px] text-muted-foreground/50 font-bold">
                Secured by Razorpay · 256-bit SSL encryption
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpiPaymentModal;
