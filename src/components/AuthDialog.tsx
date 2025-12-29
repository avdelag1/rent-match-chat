import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Eye, EyeOff, Flame, Mail, Lock, User, ArrowLeft, Loader,
  Home, Building2, Check, X, Shield, Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FaGoogle } from 'react-icons/fa';
import { loginSchema, signupSchema, forgotPasswordSchema } from '@/schemas/auth';
import { Capacitor } from '@capacitor/core';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'client' | 'owner';
}

const getStorageKey = (role: 'client' | 'owner', field: string) => `auth_${role}_${field}`;

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  return {
    checks,
    score,
    label: score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong',
    color: score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500',
  };
};

export function AuthDialog({ isOpen, onClose, role }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { signIn, signUp, signInWithOAuth } = useAuth();

  // Check if running on a native platform (iOS/Android)
  const isNativePlatform = Capacitor.isNativePlatform();

  // Role-specific theming - Clean minimal style
  const roleTheme = useMemo(() => ({
    client: {
      gradient: 'from-orange-500 via-red-500 to-rose-500',
      gradientBg: 'from-black via-black to-black',
      accent: 'text-orange-400',
      accentBg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      ring: 'ring-orange-500/30',
      glow: '',
      icon: Home,
      title: 'Client',
      description: 'Find your perfect rental property',
      buttonGlow: '',
    },
    owner: {
      gradient: 'from-orange-500 via-red-500 to-rose-500',
      gradientBg: 'from-black via-black to-black',
      accent: 'text-orange-400',
      accentBg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      ring: 'ring-orange-500/30',
      glow: '',
      icon: Building2,
      title: 'Seller',
      description: 'List properties, vehicles, or workers',
      buttonGlow: '',
    },
  }), []);

  const theme = roleTheme[role];
  const RoleIcon = theme.icon;

  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  // Reset form state when role changes and load remembered credentials
  useEffect(() => {
    if (isOpen) {
      const rememberedEmail = localStorage.getItem(getStorageKey(role, 'email')) || '';
      const hasRemembered = !!rememberedEmail;

      setEmail(rememberedEmail);
      setPassword('');
      setRememberMe(hasRemembered);
      setName('');
      setIsLogin(true);
      setIsForgotPassword(false);
      setShowPassword(false);
    }
  }, [isOpen, role]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = forgotPasswordSchema.parse({ email });

      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });

      setIsForgotPassword(false);
      setEmail('');
    } catch (error: any) {
      if (error.errors) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Please check your input.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isForgotPassword) {
      return handleForgotPassword(e);
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const validated = loginSchema.parse({ email, password });
        const { error } = await signIn(validated.email, validated.password, role);
        if (!error) {
          if (rememberMe) {
            localStorage.setItem(getStorageKey(role, 'email'), validated.email);
          } else {
            localStorage.removeItem(getStorageKey(role, 'email'));
          }
          onClose();
        } else {
          throw error;
        }
      } else {
        if (!agreeToTerms) {
          toast({
            title: "Terms Required",
            description: "Please agree to the terms and conditions to continue.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const validated = signupSchema.parse({ name, email, password });
        const { error } = await signUp(validated.email, validated.password, role, validated.name);
        if (!error) {
          localStorage.removeItem(getStorageKey(role, 'email'));
          localStorage.removeItem(getStorageKey(role, 'password'));
          onClose();
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      if (error.errors) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Please check your input.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Authentication failed.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (e: React.MouseEvent<HTMLButtonElement>, provider: 'google') => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const { error } = await signInWithOAuth(provider, role);

      if (error) throw error;
    } catch (error: any) {
      console.error(`OAuth error for ${provider}:`, error);
      setIsLoading(false);
    }
  };

  // Removed fire particles for cleaner design

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-black will-change-transform">

          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10">
            <motion.div
              className="w-full max-w-md will-change-transform"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <DialogTitle className="sr-only">
                {isLogin ? 'Sign In' : 'Sign Up'} as {role}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isLogin ? 'Sign in to your account' : 'Create a new account'} to access Swipess
              </DialogDescription>

              {/* Back Button */}
              <button
                onClick={onClose}
                className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-all duration-200 group active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* Role Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.accentBg} ${theme.border} border mb-6 animate-fade-in`}>
                <RoleIcon className={`w-4 h-4 ${theme.accent}`} />
                <span className={`text-sm font-semibold ${theme.accent}`}>{theme.title}</span>
              </div>

              {/* Logo and Header */}
              <div className="text-center mb-8 animate-fade-in">
              {/* SWiPESS Brand Logo */}
              <div className="mb-4">
                <span className="swipess-logo-medium text-2xl">
                  <span className="font-black">SW</span>
                  <span className="font-light" style={{ fontSize: '0.85em' }}>i</span>
                  <span className="font-black">PESS</span>
                </span>
              </div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-white/50">
                  {isForgotPassword
                    ? 'Enter your email to receive a reset link'
                    : theme.description
                  }
                </p>
              </div>

              {/* Main Card - Minimal black design */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 animate-fade-in">
                {!isForgotPassword && !isNativePlatform && (
                  <>
                    {/* Google OAuth Button */}
                    <div>
                      <Button
                        type="button"
                        onClick={(e) => handleOAuthSignIn(e, 'google')}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-14 border border-white/10 bg-white/[0.02] font-semibold text-base text-white hover:bg-white/[0.05] hover:border-white/20 transition-all"
                      >
                        {isLoading ? (
                          <>
                            <Loader className="w-5 h-5 mr-3 animate-spin" />
                            Connecting to Google...
                          </>
                        ) : (
                          <>
                            <FaGoogle className="w-5 h-5 mr-3 text-white" />
                            Continue with Google
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center my-8">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-4 text-white/30 text-sm font-medium">or continue with email</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>
                  </>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field (Sign Up Only) */}
                  <AnimatePresence>
                    {!isLogin && !isForgotPassword && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="name" className="text-sm font-medium text-white/60">
                          Full Name
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-orange-400 transition-colors" />
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="pl-12 h-14 text-base bg-transparent border-0 border-b border-white/10 rounded-none text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-0"
                            placeholder="John Doe"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-white/60">
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-orange-400 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 h-14 text-base bg-transparent border-0 border-b border-white/10 rounded-none text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-0"
                        placeholder="you@example.com"
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <AnimatePresence>
                    {!isForgotPassword && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Label htmlFor="password" className="text-sm font-medium text-white/60">
                          Password
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-orange-400 transition-colors" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-12 pr-12 h-14 text-base bg-transparent border-0 border-b border-white/10 rounded-none text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-0"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Password Strength Indicator (Sign Up Only) */}
                        {!isLogin && password && (
                          <motion.div
                            className="space-y-3 pt-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {/* Strength Bar */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${passwordStrength.color} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${
                                passwordStrength.score <= 1 ? 'text-red-400' :
                                passwordStrength.score === 2 ? 'text-orange-400' :
                                passwordStrength.score === 3 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {passwordStrength.label}
                              </span>
                            </div>

                            {/* Requirements Checklist */}
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'length', label: '8+ characters' },
                                { key: 'lowercase', label: 'Lowercase' },
                                { key: 'uppercase', label: 'Uppercase' },
                                { key: 'number', label: 'Number' },
                              ].map(({ key, label }) => (
                                <div
                                  key={key}
                                  className={`flex items-center gap-2 text-xs ${
                                    passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                                      ? 'text-green-400'
                                      : 'text-white/40'
                                  }`}
                                >
                                  {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                  <span>{label}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Terms and Conditions (Sign Up Only) */}
                  <AnimatePresence>
                    {!isLogin && !isForgotPassword && (
                      <motion.div
                        className="space-y-3 pt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative mt-0.5">
                            <input
                              type="checkbox"
                              checked={agreeToTerms}
                              onChange={(e) => setAgreeToTerms(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className={`w-5 h-5 rounded-md border-2 border-white/30 bg-white/5 peer-checked:bg-gradient-to-br peer-checked:${theme.gradient} peer-checked:border-transparent transition-all flex items-center justify-center`}>
                              {agreeToTerms && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                            I agree to the{' '}
                            <a
                              href="/terms-of-service"
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${theme.accent} hover:underline font-medium`}
                            >
                              Terms of Service
                            </a>
                            {' '}and{' '}
                            <a
                              href="/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${theme.accent} hover:underline font-medium`}
                            >
                              Privacy Policy
                            </a>
                          </span>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember Me & Forgot Password */}
                  {isLogin && !isForgotPassword && (
                    <motion.div
                      className="flex items-center justify-between"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border-2 border-white/30 bg-white/5 peer-checked:bg-gradient-to-br peer-checked:${theme.gradient} peer-checked:border-transparent transition-all flex items-center justify-center`}>
                            {rememberMe && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </div>
                        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className={`text-sm ${theme.accent} hover:underline font-medium`}
                      >
                        Forgot password?
                      </button>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 text-base font-bold bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 text-white transition-all mt-4 relative overflow-hidden group hover:opacity-90"
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                      />

                      {isLoading ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Please wait...
                        </>
                      ) : (
                        <span className="flex items-center gap-2 relative z-10">
                          {isForgotPassword ? (
                            <>
                              <Mail className="w-5 h-5" />
                              Send Reset Link
                            </>
                          ) : isLogin ? (
                            <>
                              <Shield className="w-5 h-5" />
                              Sign In
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Create Account
                            </>
                          )}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Toggle Sign In/Up */}
                <motion.div
                  className="text-center mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isForgotPassword ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setEmail('');
                      }}
                      className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </button>
                  ) : (
                    <p className="text-sm text-white/60">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setEmail('');
                          setPassword('');
                          setName('');
                          setShowPassword(false);
                          setAgreeToTerms(false);
                        }}
                        className={`${theme.accent} hover:underline font-semibold`}
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 mt-6 text-white/30 animate-fade-in">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Secured with industry-standard encryption</span>
              </div>
            </motion.div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
