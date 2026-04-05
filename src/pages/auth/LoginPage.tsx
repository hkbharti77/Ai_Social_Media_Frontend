import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { loginApi } from '../../api/auth';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await loginApi(data);
      login(
        { id: response.id, email: response.email, name: response.fullName, roles: response.roles },
        response.token,
        response.refreshToken
      );
      navigate('/dashboard');
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full space-y-10 p-12 bg-card/40 backdrop-blur-2xl rounded-[3rem] border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] items-center justify-center text-white shadow-2xl shadow-primary/20 relative group">
            <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter text-foreground">VaniAI Portal</h2>
            <p className="text-muted-foreground font-medium opacity-70">Enter your credentials to access the laboratory.</p>
          </div>
        </div>
        
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center shadow-sm">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Email Identity</label>
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
                  Authenticating...
                </>
              ) : (
                <>
                  Initialize Session
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </div>
          </Button>

          <div className="text-center">
            <p className="text-sm font-bold text-muted-foreground tracking-tight">
              New to the ecosystem?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-black transition-all underline underline-offset-4 decoration-2 decoration-primary/20 hover:decoration-primary">
                Create Identity
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
