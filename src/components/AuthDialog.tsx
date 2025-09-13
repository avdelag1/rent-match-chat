
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, User, Facebook, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'client' | 'owner';
}

export function AuthDialog({ isOpen, onClose, role }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false); // Start with login first
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(formData.email, formData.password, role, formData.name);
      } else {
        await signIn(formData.email, formData.password, role);
      }
      
      // Reset form and close dialog on success
      setFormData({ email: '', password: '', confirmPassword: '', name: '' });
      onClose();
    } catch (error: any) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
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
      onClose();
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const roleTitle = role === 'client' ? 'Client' : 'Owner';
  const roleDescription = role === 'client' 
    ? 'Looking for the perfect rental property?' 
    : 'Ready to list your properties?';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-none shadow-2xl overflow-hidden"
                     style={{ 
                       background: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #ea580c 100%)'
                     }}>
        <DialogHeader className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              type: "spring",
              damping: 10,
              stiffness: 100
            }}
          >
            <DialogTitle className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Join Tinderent' : 'Welcome Back'}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-base">
              {isSignUp 
                ? `Create your ${roleTitle.toLowerCase()} account` 
                : `Sign in to your ${roleTitle.toLowerCase()} account`
              }
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Login Buttons */}
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 py-6 backdrop-blur-sm"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Google
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 py-6 backdrop-blur-sm"
              >
                <Facebook className="mr-2 h-5 w-5" />
                Facebook
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 px-2 text-white/90">Or continue with email</span>
            </div>
          </div>
          {/* Email Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? 'signup' : 'login'}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isSignUp ? -20 : 20, scale: 0.95 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-sm font-medium text-white/90">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50 backdrop-blur-sm"
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/90">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white/90">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>
              
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/90">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50 backdrop-blur-sm"
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-6 shadow-lg backdrop-blur-sm border border-white/30 transition-all duration-200"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? `Create ${roleTitle} Account` : `Sign In`}
                </Button>
              </motion.div>
            </motion.form>
          </AnimatePresence>
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ email: '', password: '', confirmPassword: '', name: '' });
              }}
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
