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
      <DialogContent className="max-w-sm w-full mx-auto border-0 p-0 overflow-hidden max-h-[95vh] bg-transparent">
        <div className="max-h-[95vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-t-2xl px-4 py-6">
            {/* Back Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Header Content */}
            <div className="text-center text-white pt-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold mb-1">
                {isLogin ? 'Welcome Back!' : 'Join Tinderent'}
              </h1>
              <p className="text-white/90 text-sm capitalize">
                {isLogin ? 'Sign in' : 'Sign up'} as {role}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-b-2xl p-4 space-y-4 pb-6">
            {/* OAuth Buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                className="w-full h-11 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
                Continue with Google
              </Button>
              
              <Button
                type="button"
                onClick={() => handleOAuthSignIn('facebook')}
                className="w-full h-11 bg-[#1877F2] text-white font-medium rounded-xl hover:bg-[#166FE5] transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
              >
                <FaFacebook className="w-5 h-5" />
                Continue with Facebook
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-sm font-medium">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
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
                    className="mt-1 h-11 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white transition-colors"
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
                    className="pl-12 h-11 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white transition-colors"
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
                    className="pl-12 pr-12 h-11 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white transition-colors"
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
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 mt-4"
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
            <div className="text-center pt-2">
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
            <div className="bg-gray-50 rounded-xl p-3 mt-3">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                {role === 'client' ? '🏠 Client Benefits:' : '🏢 Owner Benefits:'}
              </h3>
              <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
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