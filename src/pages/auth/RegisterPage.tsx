import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { registerApi } from '../../api/auth';
import { toast } from 'sonner';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
  role: z.string().optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const generateFingerprint = () => {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth.toString(),
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString()
  ];
  return btoa(parts.join('|')).slice(0, 32);
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setValue('referralCode', refCode);
      toast.success(`Referral code "${refCode}" detected!`, {
        icon: <CheckCircle2 size={16} className="text-emerald-500" />
      });
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      setIsLoading(true);
      await registerApi({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        roles: data.role ? [data.role] : [],
        referralCode: data.referralCode,
        deviceFingerprint: generateFingerprint()
      });
      navigate('/login');
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full space-y-10 p-12 bg-card/40 backdrop-blur-2xl rounded-[3rem] border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative z-10 my-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] items-center justify-center text-white shadow-2xl shadow-primary/20 relative group">
            <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter text-foreground">Join the Lab</h2>
            <p className="text-muted-foreground font-medium opacity-70">Initialize your VaniAI workspace today.</p>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center shadow-sm">
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  {...register('fullName')}
                  type="text"
                  className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                  placeholder="Enterprise User"
                />
              </div>
              {errors.fullName && <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Identity Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                  placeholder="you@vaniaiai.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Confirm Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.confirmPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Referral Code (Optional)</label>
              <div className="relative group">
                <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  {...register('referralCode')}
                  type="text"
                  className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                  placeholder="FRIEND_CODE"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Account Role</label>
              <div className="relative group">
                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <select
                  {...register('role')}
                  className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled hidden className="bg-[#020617] text-white">Select Role (Default: User)</option>
                  <option value="ROLE_USER" className="bg-[#020617] text-white">User Identity</option>
                  <option value="ROLE_ADMIN" className="bg-[#020617] text-white">Admin privileges</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
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
                  Establishing...
                </>
              ) : (
                <>
                  Establish Workspace
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </div>
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm font-bold text-muted-foreground tracking-tight">
              Already a scientist?{' '}
              <Link to="/login" className="text-primary font-black transition-all underline underline-offset-4 decoration-2 decoration-primary/20 hover:decoration-primary">
                SignIn Identity
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
