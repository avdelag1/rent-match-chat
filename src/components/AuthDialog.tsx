import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const { signIn, signUp, signInWithOAuth } = useAuth();

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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-t-3xl px-6 py-8">
            {/* Back Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Header Content */}
            <div className="text-center text-white pt-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome Back!' : 'Join Tinderent'}
              </h1>
              <p className="text-white/90 text-sm capitalize">
                {isLogin ? 'Sign in' : 'Sign up'} as {role}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-b-3xl p-6 space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
                Continue with Google
              </Button>
              
              <Button
                type="button"
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={isLoading}
                className="w-full h-12 bg-[#1877F2] text-white font-medium rounded-xl hover:bg-[#166FE5] transition-all duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                <FaFacebook className="w-5 h-5" />
                Continue with Facebook
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 h-12 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                  Email Address
                </Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  Password
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
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
            </form>

            {/* Toggle Sign In/Up */}
            <div className="text-center pt-4">
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
                className="font-semibold text-orange-600 hover:text-orange-700 transition-colors text-sm"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>

            {/* Benefits Section - Compact */}
            <div className="bg-gray-50 rounded-2xl p-4 mt-6">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                {role === 'client' ? '🏠 Client Benefits:' : '🏢 Owner Benefits:'}
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                {role === 'client' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      Browse properties & smart matching
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      Chat with owners & save favorites
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      Personalized recommendations
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      List properties & manage portfolio
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      Connect with quality tenants
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      Advanced analytics & insights
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}