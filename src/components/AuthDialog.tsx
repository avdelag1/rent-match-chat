import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Flame, Mail, Lock, User, ArrowLeft, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FaGoogle } from 'react-icons/fa';
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

  const handleOAuthSignIn = async (e: React.MouseEvent<HTMLButtonElement>, provider: 'google') => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const { error } = await signInWithOAuth(provider, role);

      if (error) {
        throw error;
      }

      // OAuth initiated successfully - browser will redirect to Google
      // Note: Don't reset isLoading here, the page will redirect anyway
      console.log(`${provider} OAuth initiated successfully, redirecting to provider...`);
    } catch (error: any) {
      console.error(`OAuth error for ${provider}:`, error);
      setIsLoading(false); // Reset loading state on error
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
              <DialogTitle className="sr-only">
                {isLogin ? 'Sign In' : 'Sign Up'} as {role}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isLogin ? 'Sign in to your account' : 'Create a new account'} to access Tinderent
              </DialogDescription>

              {/* Back Button */}
              <button
                onClick={onClose}
                className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* Logo and Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4 shadow-lg">
                  <Flame className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-muted-foreground">
                  {isForgotPassword 
                    ? 'Enter your email to receive a reset link' 
                    : `${isLogin ? 'Sign in' : 'Sign up'} to continue as ${role}`
                  }
                </p>
              </div>

              {/* Main Card */}
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
                {!isForgotPassword && (
                  <>
                    {/* Google OAuth Button */}
                    <Button
                      type="button"
                      onClick={(e) => handleOAuthSignIn(e, 'google')}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-12 border-2 font-medium text-base hover:bg-accent transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-5 h-5 mr-3 animate-spin" />
                          Connecting to Google...
                        </>
                      ) : (
                        <>
                          <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                          Continue with Google
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center my-8">
                      <div className="flex-grow border-t border-border"></div>
                      <span className="flex-shrink mx-4 text-muted-foreground text-sm">or</span>
                      <div className="flex-grow border-t border-border"></div>
                    </div>
                  </>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field (Sign Up Only) */}
                  {!isLogin && !isForgotPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-foreground">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-11 h-12 bg-background border-border text-base"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-11 h-12 bg-background border-border text-base"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  {!isForgotPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-11 pr-11 h-12 bg-background border-border text-base"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {!isLogin && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be 8+ characters with uppercase, lowercase, and number
                        </p>
                      )}
                    </div>
                  )}

                  {/* Remember Me & Forgot Password */}
                  {isLogin && !isForgotPassword && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all mt-6"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Please wait...
                      </>
                    ) : (
                      <span>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}</span>
                    )}
                  </Button>
                </form>

                {/* Toggle Sign In/Up */}
                <div className="text-center mt-6">
                  {isForgotPassword ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setEmail('');
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setEmail('');
                          setPassword('');
                          setName('');
                        }}
                        className="text-primary hover:underline font-semibold"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
