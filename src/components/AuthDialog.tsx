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
        if (!error) {
          // Only close on successful sign in
          onClose();
        } else {
          throw error;
        }
      } else {
        const { error } = await signUp(email, password, role, name);
        if (!error) {
          // Only close on successful sign up
          onClose();
        } else {
          throw error;
        }
      }
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
          {/* Header with enhanced gradient background */}
          <div className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-t-3xl px-6 py-10 shadow-2xl overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-red-400/20 animate-pulse"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-bounce [animation-delay:0.5s]"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/15 rounded-full animate-bounce [animation-delay:1s]"></div>
            
            {/* Back Button */}
            <button 
              onClick={onClose}
              className="absolute top-5 left-5 flex items-center gap-2 text-white/90 hover:text-white transition-all duration-200 text-sm bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Header Content */}
            <div className="text-center text-white pt-4 relative z-10">
              <motion.div 
                className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Flame className="w-10 h-10 text-white drop-shadow-lg" />
              </motion.div>
              <motion.h1 
                className="text-3xl font-bold mb-3 drop-shadow-sm"
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {isLogin ? 'Welcome Back!' : 'Join Tinderent'}
              </motion.h1>
              <motion.p 
                className="text-white/90 text-base capitalize font-medium"
                animate={{ 
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {isLogin ? 'Sign in' : 'Sign up'} as {role}
              </motion.p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-b-3xl p-8 space-y-8 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-orange-300 rounded-full animate-ping [animation-delay:0.5s]"></div>
            <div className="absolute bottom-8 left-8 w-2 h-2 bg-red-300 rounded-full animate-ping [animation-delay:1.5s]"></div>
            
            {/* OAuth Buttons */}
            <div className="space-y-4 relative z-10">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                  className="w-full h-14 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-4 shadow-sm disabled:opacity-50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <FaGoogle className="w-6 h-6 text-red-500 relative z-10" />
                  <span className="relative z-10">Continue with Google</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  type="button"
                  onClick={() => handleOAuthSignIn('facebook')}
                  disabled={isLoading}
                  className="w-full h-14 bg-[#1877F2] text-white font-semibold text-base rounded-2xl hover:bg-[#166FE5] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-4 shadow-sm disabled:opacity-50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <FaFacebook className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Continue with Facebook</span>
                </Button>
              </motion.div>
            </div>

            {/* Animated Divider */}
            <div className="relative flex items-center py-4">
              <motion.div 
                className="flex-grow border-t border-gray-300"
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <motion.span 
                className="flex-shrink mx-6 text-gray-500 text-base font-medium bg-white px-2"
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: ["#6b7280", "#f97316", "#6b7280"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                or
              </motion.span>
              <motion.div 
                className="flex-grow border-t border-gray-300"
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              ></motion.div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
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
                    className="mt-2 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-500 focus:bg-white focus:border-orange-300 transition-all duration-200 font-medium"
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
                    className="pl-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-500 focus:bg-white focus:border-orange-300 transition-all duration-200 font-medium"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    className="pl-14 pr-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-500 focus:bg-white focus:border-orange-300 transition-all duration-200 font-medium"
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

              {/* Animated Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl border-0 shadow-xl hover:shadow-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 mt-8 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <motion.div 
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Please wait...
                      </>
                    ) : (
                      <motion.span
                        animate={{ 
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </motion.span>
                    )}
                  </div>
                </Button>
              </motion.div>
            </form>

            {/* Toggle Sign In/Up */}
            <div className="text-center pt-6">
              <span className="text-gray-600 text-base">
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
                className="font-bold text-orange-600 hover:text-orange-700 transition-colors text-base underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>

            {/* Benefits Section - Enhanced */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 mt-8 border border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                {role === 'client' ? (
                  <>
                    🏠 <span>Client Benefits</span>
                  </>
                ) : (
                  <>
                    🏢 <span>Owner Benefits</span>
                  </>
                )}
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                {role === 'client' ? (
                  <>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                      <span className="font-medium">Browse properties & smart matching</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                      <span className="font-medium">Chat with owners & save favorites</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                      <span className="font-medium">Personalized recommendations</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                      <span className="font-medium">List properties & manage portfolio</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                      <span className="font-medium">Connect with quality tenants</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                      <span className="font-medium">Advanced analytics & insights</span>
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