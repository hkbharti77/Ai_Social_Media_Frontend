import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { forgotPasswordApi } from '../../api/auth';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type FormValues = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      await forgotPasswordApi(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      // Always show success to prevent email enumeration
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full space-y-10 p-12 bg-card/40 backdrop-blur-2xl rounded-[3rem] border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative z-10"
      >
        {!submitted ? (
          <>
            <div className="text-center space-y-4">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] items-center justify-center text-white shadow-2xl shadow-primary/20 relative group">
                <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tighter text-foreground">Forgot Password?</h2>
                <p className="text-muted-foreground font-medium opacity-70">
                  Enter your email and we'll send a reset link.
                </p>
              </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                  Email Identity
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                    size={20}
                  />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                    placeholder="you@gyanvaniai.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-10 text-2xl font-black tracking-tight rounded-[1.5rem] shadow-[0_20px_40px_rgba(var(--primary),0.3)] active:scale-95 transition-all relative overflow-hidden group disabled:opacity-70 disabled:pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </div>
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex w-20 h-20 bg-green-500/20 border-2 border-green-500/30 rounded-[2rem] items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter text-foreground">Check Your Inbox</h2>
              <p className="text-muted-foreground font-medium opacity-70">
                If an account exists for{' '}
                <span className="text-primary font-bold">{submittedEmail}</span>, a reset link has been sent.
              </p>
            </div>
            <div className="p-4 bg-secondary/30 border border-white/5 rounded-2xl text-sm text-muted-foreground space-y-1">
              <p>⏱ Link expires in <strong className="text-foreground">15 minutes</strong></p>
              <p>📁 Check your spam folder if you don't see it</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
