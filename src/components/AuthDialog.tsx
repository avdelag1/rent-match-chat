import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Flame, ArrowLeft, Mail, Lock } from 'lucide-react';
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
      
      // Close dialog on successful OAuth initiation
      onClose();
    } catch (error: any) {
      console.error(`OAuth error for ${provider}:`, error);
      // Error handling is done in signInWithOAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-auto border-0 p-0 overflow-hidden max-h-[95vh] bg-transparent">
        <DialogTitle className="sr-only">
          {isLogin ? 'Sign In' : 'Sign Up'} as {role}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isLogin ? 'Sign in to your account' : 'Create a new account'} to access Tinderent
        </DialogDescription>
        <div className="max-h-[95vh] overflow-y-auto">
        <div className="relative">
          {/* Header with role-specific gradient background and animated blobs */}
          <div className={`relative rounded-t-3xl px-6 py-10 shadow-2xl overflow-hidden ${
            role === 'client' 
              ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600' 
              : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600'
          }`}>
            {/* Animated gradient blobs - role-specific */}
            <div className="absolute inset-0 opacity-30">
              {role === 'client' ? (
                <>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-300 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </>
              ) : (
                <>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-pink-400 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-700 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </>
              )}
            </div>
            
            {/* Back Button with modern circular design */}
            <button 
              onClick={onClose}
              className={`absolute top-5 left-5 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center text-white border-2 border-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-12 active:scale-95 ${
                role === 'client'
                  ? 'bg-gradient-to-br from-yellow-500/80 to-orange-600/80 hover:shadow-lg hover:shadow-orange-500/50'
                  : 'bg-gradient-to-br from-orange-600/80 to-red-700/80 hover:shadow-lg hover:shadow-orange-500/50'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Header Content with animations */}
            <div className="text-center text-white pt-4 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                <Flame className="w-10 h-10 text-white drop-shadow-lg animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold mb-3 drop-shadow-sm animate-fade-in">
                {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Join Tinderent'}
              </h1>
              <p className="text-white/90 text-base capitalize font-medium animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {isForgotPassword ? 'Enter your email to reset password' : `${isLogin ? 'Sign in' : 'Sign up'} as ${role}`}
              </p>
            </div>
          </div>

          {/* Main Content with glass morphism effect */}
          <div className="bg-white rounded-b-3xl p-8 space-y-8 relative overflow-hidden backdrop-blur-sm">
            
            {!isForgotPassword && (
              <>
                {/* OAuth Buttons */}
                <div className="space-y-4 relative z-10">
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                    className="w-full h-14 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-4 shadow-sm disabled:opacity-50"
                  >
                    <FaGoogle className="w-6 h-6 text-red-500" />
                    <span>Continue with Google</span>
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn('facebook')}
                    disabled={isLoading}
                    className="w-full h-14 bg-[#1877F2] text-white font-semibold text-base rounded-2xl hover:bg-[#166FE5] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-4 shadow-sm disabled:opacity-50"
                  >
                    <FaFacebook className="w-6 h-6" />
                    <span>Continue with Facebook</span>
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-6 text-gray-500 text-base font-medium bg-white px-2">
                    or
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && !isForgotPassword && (
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-semibold text-base">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-500 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 font-medium transform focus:scale-[1.02]"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-gray-700 font-semibold text-base">
                  Email Address
                </Label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-500 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 font-medium transform focus:scale-[1.02]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              {!isForgotPassword && (
                <div>
                  <Label htmlFor="password" className="text-gray-700 font-semibold text-base">
                    Password
                  </Label>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-14 pr-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-500 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 font-medium transform focus:scale-[1.02]"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              {isLogin && !isForgotPassword && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl border-0 shadow-xl hover:shadow-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 mt-8 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
                    </span>
                  )}
                </div>
              </Button>
            </form>

            {/* Toggle Sign In/Up */}
            <div className="text-center pt-4">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setEmail('');
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors text-sm underline"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  <span className="text-gray-600 text-sm">
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
                    className="font-bold text-orange-600 hover:text-orange-700 transition-colors text-sm underline"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}