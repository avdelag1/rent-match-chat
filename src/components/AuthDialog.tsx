import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Flame, X, Mail, Lock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { loginSchema, signupSchema, forgotPasswordSchema } from '@/schemas/auth';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'client' | 'owner';
}

export function AuthDialog({ isOpen, onClose, role }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithOAuth } = useAuth();

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
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('rememberMe');
          }
          onClose();
        } else {
          throw error;
        }
      } else {
        const validated = signupSchema.parse({ name, email, password });
        const { error } = await signUp(validated.email, validated.password, role, validated.name);
        if (!error) {
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

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const { error } = await signInWithOAuth(provider, role);

      if (error) throw error;

      onClose();
    } catch (error: any) {
      console.error(`OAuth error for ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-auto border-0 p-0 overflow-hidden bg-white rounded-2xl shadow-2xl max-h-[92vh]">
        <DialogTitle className="sr-only">
          {isLogin ? 'Sign In' : 'Sign Up'} as {role}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isLogin ? 'Sign in to your account' : 'Create a new account'} to access Tinderent
        </DialogDescription>

        <div className="relative max-h-[92vh] overflow-y-auto">
          {/* Compact Header */}
          <div className={`relative px-6 py-6 overflow-hidden ${
            role === 'client'
              ? 'bg-gradient-to-br from-orange-400 to-red-500'
              : 'bg-gradient-to-br from-red-500 to-pink-600'
          }`}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Content */}
            <div className="text-center text-white relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">
                {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Join Tinderent'}
              </h1>
              <p className="text-white/90 text-sm capitalize font-medium">
                {isForgotPassword ? 'Enter your email' : `${isLogin ? 'Sign in' : 'Sign up'} as ${role}`}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white p-6 space-y-4">

            {!isForgotPassword && (
              <>
                {/* OAuth Buttons */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                    className="w-full h-11 bg-white border-2 border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <FaGoogle className="w-5 h-5 text-red-500" />
                    <span>Google</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn('facebook')}
                    disabled={isLoading}
                    className="w-full h-11 bg-[#1877F2] text-white font-medium text-sm rounded-xl hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <FaFacebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium">or</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && !isForgotPassword && (
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium text-sm mb-1.5 block">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm mb-1.5 block">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              {!isForgotPassword && (
                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium text-sm mb-1.5 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              {isLogin && !isForgotPassword && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-gray-600 text-xs">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Please wait...
                  </>
                ) : (
                  <span>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </Button>
            </form>

            {/* Toggle Sign In/Up */}
            <div className="text-center pt-2">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setEmail('');
                  }}
                  className="font-medium text-orange-600 hover:text-orange-700 transition-colors text-xs"
                >
                  ← Back to Sign In
                </button>
              ) : (
                <>
                  <span className="text-gray-600 text-xs">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmail('');
                      setPassword('');
                      setName('');
                    }}
                    className="font-semibold text-orange-600 hover:text-orange-700 transition-colors text-xs"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
