import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Heart,
  X,
  MessageCircle,
  Sparkles,
  Home as HomeIcon,
  ChevronRight,
  Check
} from 'lucide-react';

interface OnboardingProps {
  role: 'client' | 'owner';
  onComplete: () => void;
}

export function Onboarding({ role, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const clientSteps = [
    {
      icon: HomeIcon,
      title: "Welcome to TindeRent! 🏠",
      description: "Swipe through properties and find your perfect match. It's that simple!",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            className="w-40 h-56 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-2xl"
            animate={{
              rotateY: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="p-4 text-white">
              <div className="w-full h-32 bg-white/20 rounded-lg mb-2" />
              <div className="h-2 bg-white/30 rounded mb-1" />
              <div className="h-2 bg-white/30 rounded w-2/3" />
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      icon: Heart,
      title: "Swipe Right to Like ❤️",
      description: "See a property you love? Swipe right or tap the heart to like it!",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            className="absolute"
            animate={{
              x: [0, 100],
              rotate: [0, 15],
              opacity: [1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <div className="w-40 h-56 bg-white rounded-2xl shadow-2xl border-4 border-pink-500">
              <div className="p-4">
                <div className="w-full h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg mb-2" />
                <Heart className="w-8 h-8 text-pink-500 mx-auto mt-4" fill="currentColor" />
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      icon: X,
      title: "Swipe Left to Skip ➡️",
      description: "Not interested? Swipe left or tap the X to see the next property.",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            className="absolute"
            animate={{
              x: [0, -100],
              rotate: [0, -15],
              opacity: [1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <div className="w-40 h-56 bg-white rounded-2xl shadow-2xl border-4 border-gray-400">
              <div className="p-4">
                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-2" />
                <X className="w-8 h-8 text-gray-500 mx-auto mt-4" />
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      icon: MessageCircle,
      title: "Match & Chat! 💬",
      description: "When an owner likes you back, it's a match! Start chatting and arrange viewings.",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <MessageCircle className="w-16 h-16 text-white" fill="white" />
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const ownerSteps = [
    {
      icon: Sparkles,
      title: "Welcome, Property Owner! 🏡",
      description: "Connect with potential tenants who love your property. Let's get started!",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            className="w-40 h-56 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-2xl"
            animate={{
              rotateY: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="p-4 text-white">
              <Sparkles className="w-8 h-8 mb-2" />
              <div className="h-2 bg-white/30 rounded mb-2" />
              <div className="h-2 bg-white/30 rounded w-3/4" />
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      icon: HomeIcon,
      title: "Create Your Listings 📋",
      description: "Add your properties with great photos and descriptions to attract the right tenants.",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-48 h-40 bg-white rounded-2xl shadow-2xl p-4 border-2 border-blue-500">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded" />
                <div className="h-16 bg-gradient-to-br from-purple-200 to-purple-300 rounded" />
                <div className="h-16 bg-gradient-to-br from-green-200 to-green-300 rounded" />
                <div className="h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded" />
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      icon: Heart,
      title: "Discover Interested Clients 👥",
      description: "Swipe through client profiles who match your property preferences. Like the ones you want to connect with!",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center gap-4">
          <motion.div
            className="w-24 h-32 bg-white rounded-xl shadow-lg border-2 border-pink-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="p-2">
              <div className="w-full h-16 bg-gradient-to-br from-pink-200 to-pink-300 rounded mb-1" />
              <Heart className="w-4 h-4 text-pink-500 mx-auto" />
            </div>
          </motion.div>
          <motion.div
            className="w-24 h-32 bg-white rounded-xl shadow-lg border-2 border-blue-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut"
            }}
          >
            <div className="p-2">
              <div className="w-full h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded mb-1" />
              <Heart className="w-4 h-4 text-blue-500 mx-auto" />
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      icon: MessageCircle,
      title: "Match & Connect! 💬",
      description: "When there's mutual interest, it's a match! Chat with clients and schedule viewings.",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <MessageCircle className="w-16 h-16 text-white" fill="white" />
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const steps = role === 'client' ? clientSteps : ownerSteps;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem(`tinderent_onboarding_${role}`, 'completed');
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`tinderent_onboarding_${role}`, 'completed');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Illustration */}
              <div className="mb-6">
                {steps[currentStep].illustration}
              </div>

              {/* Content */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {React.createElement(steps[currentStep].icon, {
                    className: "w-6 h-6 text-white",
                  })}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {steps[currentStep].title}
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-gradient-to-r from-orange-500 to-red-500'
                        : index < currentStep
                        ? 'w-2 bg-green-500'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  size="lg"
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {!isLastStep && (
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                  >
                    Skip Tutorial
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
