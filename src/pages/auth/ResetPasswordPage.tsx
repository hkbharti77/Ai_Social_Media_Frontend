import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowLeft, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { resetPasswordApi, validateResetTokenApi } from '../../api/auth';

const schema = z
  .object({
    newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [tokenStatus, setTokenStatus] = React.useState<'checking' | 'valid' | 'invalid'>('checking');
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Validate token on mount
  React.useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      return;
    }
    validateResetTokenApi(token)
      .then(() => setTokenStatus('valid'))
      .catch(() => setTokenStatus('invalid'));
  }, [token]);

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError(null);
      setIsLoading(true);
      await resetPasswordApi(token, data.newPassword);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || 'Something went wrong. Please request a new reset link.');
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
        {/* Checking token */}
        {tokenStatus === 'checking' && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-medium">Validating reset link...</p>
          </div>
        )}

        {/* Invalid token */}
        {tokenStatus === 'invalid' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="inline-flex w-20 h-20 bg-red-500/20 border-2 border-red-500/30 rounded-[2rem] items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter text-foreground">Link Expired</h2>
              <p className="text-muted-foreground font-medium opacity-70">
                This password reset link is invalid or has expired. Links are valid for 15 minutes only.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/30 rounded-2xl text-primary font-bold hover:bg-primary/30 transition-colors"
            >
              Request New Link
            </Link>
          </motion.div>
        )}

        {/* Success */}
        {tokenStatus === 'valid' && success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="inline-flex w-20 h-20 bg-green-500/20 border-2 border-green-500/30 rounded-[2rem] items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter text-foreground">Password Reset!</h2>
              <p className="text-muted-foreground font-medium opacity-70">
                Your password has been updated successfully. Redirecting to login...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          </motion.div>
        )}

        {/* Reset form */}
        {tokenStatus === 'valid' && !success && (
          <>
            <div className="text-center space-y-4">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] items-center justify-center text-white shadow-2xl shadow-primary/20 relative group">
                <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tighter text-foreground">New Password</h2>
                <p className="text-muted-foreground font-medium opacity-70">
                  Choose a strong password for your account.
                </p>
              </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center">
                  {apiError}
                </div>
              )}

              <div className="space-y-6">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                      size={20}
                    />
                    <input
                      {...register('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-14 pr-14 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                      size={20}
                    />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      className="w-full pl-14 pr-14 py-4 bg-secondary/30 border-2 border-white/5 rounded-2xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs font-bold text-rose-500 px-1">{errors.confirmPassword.message}</p>
                  )}
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
                      Updating...
                    </>
                  ) : (
                    'Reset Password'
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
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
