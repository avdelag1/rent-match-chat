import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye, EyeOff, Flame, ArrowLeft, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'client' | 'owner';
}

export function AuthDialog({ isOpen, onClose, role }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password, role);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, role, name);
        if (error) throw error;
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            role: role
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden">
          <div className="relative min-h-[600px]" style={{ background: 'var(--app-gradient)' }}>
            {/* Back Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to role selection</span>
            </button>

            {/* White Card Container */}
            <div className="absolute inset-4 top-16 rounded-3xl bg-white p-8 flex flex-col justify-center" style={{ boxShadow: 'var(--shadow-card)' }}>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--button-gradient)' }}>
                  <Flame className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600">
                  {isLogin ? 'Sign in' : 'Sign up'} as {role}
                </p>
              </div>

              <div className="space-y-6">
                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <FaGoogle className="w-5 h-5 text-red-500" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn('facebook')}
                    className="w-full py-3 bg-[#1877F2] text-white font-semibold rounded-xl hover:bg-[#166FE5] transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <FaFacebook className="w-5 h-5" />
                    Continue with Facebook
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field (Sign Up Only) */}
                  {!isLogin && (
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                      <div className="mt-2 relative">
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="py-3 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                    <div className="mt-2 relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 py-3 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                    <div className="mt-2 relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-12 pr-12 py-3 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 text-white font-semibold rounded-xl border-0"
                    style={{ background: 'var(--button-gradient)' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Please wait...
                      </div>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>

                  {/* Toggle Sign In/Up */}
                  <div className="text-center">
                    <span className="text-gray-600">
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
                      className="font-semibold"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </div>

                  {/* Benefits Section */}
                  {role === 'client' && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {isLogin ? 'Client Account Benefits:' : 'What you get as a client:'}
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Browse and swipe through property listings</li>
                        <li>• Match with property owners</li>
                        <li>• Chat with matched owners</li>
                        <li>• Save favorite properties</li>
                        <li>• Get personalized recommendations</li>
                      </ul>
                    </div>
                  )}
                  
                  {role === 'owner' && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {isLogin ? 'Owner Account Benefits:' : 'What you get as an owner:'}
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• List your properties for rent</li>
                        <li>• View and match with potential tenants</li>
                        <li>• Chat with interested clients</li>
                        <li>• Manage your property portfolio</li>
                        <li>• Access detailed analytics</li>
                      </ul>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
}