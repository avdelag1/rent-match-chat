/**
 * SIMPLE OWNER SWIPE CARD
 * 
 * Uses the EXACT same pattern as the landing page logo swipe.
 * Simple, clean, no complex physics - just framer-motion's built-in drag.
 */

import { memo, useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, X, Eye, Share2, Heart, DollarSign, User, Briefcase, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/utils/haptics';
import { swipeQueue } from '@/lib/swipe/SwipeQueue';

const SWIPE_THRESHOLD = 120;
const FALLBACK_PLACEHOLDER = '/placeholder.svg';

// Client profile type
interface ClientProfile {
  user_id: string;
  name?: string | null;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  profile_images?: string[] | null;
  interests?: string[] | null;
  languages?: string[] | null;
  work_schedule?: string | null;
  cleanliness_level?: string | null;
  noise_tolerance?: string | null;
  personality_traits?: string[] | null;
  preferred_activities?: string[] | null;
  // From profiles table
  budget_min?: number | null;
  budget_max?: number | null;
  monthly_income?: number | null;
  verified?: boolean | null;
  lifestyle_tags?: string[] | null;
}

// Simple image component
const CardImage = memo(({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Skeleton */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
        style={{ opacity: loaded ? 0 : 1 }}
      />
      
      {/* Image */}
      <img
        src={error ? FALLBACK_PLACEHOLDER : (src || FALLBACK_PLACEHOLDER)}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        draggable={false}
      />
    </div>
  );
});

interface SimpleOwnerSwipeCardProps {
  profile: ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  isTop?: boolean;
  hideActions?: boolean;
}

function SimpleOwnerSwipeCardComponent({
  profile,
  onSwipe,
  onTap,
  onInsights,
  onMessage,
  onShare,
  isTop = true,
  hideActions = false,
}: SimpleOwnerSwipeCardProps) {
  const isDragging = useRef(false);
  const hasExited = useRef(false);
  
  // Motion value for horizontal position - EXACTLY like the landing page logo
  const x = useMotionValue(0);
  
  // Transform effects based on x position
  const cardOpacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);
  const cardRotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const cardBlur = useTransform(x, [-200, 0, 200], [4, 0, 4]);
  
  // Like/Pass overlay opacity
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  
  // Image state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = useMemo(() => {
    return Array.isArray(profile.profile_images) && profile.profile_images.length > 0 
      ? profile.profile_images 
      : [FALLBACK_PLACEHOLDER];
  }, [profile.profile_images]);
  
  const imageCount = images.length;
  const currentImage = images[currentImageIndex] || FALLBACK_PLACEHOLDER;

  // Reset state when profile changes
  useEffect(() => {
    hasExited.current = false;
    setCurrentImageIndex(0);
    x.set(0);
  }, [profile.user_id, x]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    triggerHaptic('light');
  }, []);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hasExited.current) return;
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Check if swipe threshold is met
    const shouldSwipe = Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500;
    
    if (shouldSwipe) {
      hasExited.current = true;
      const direction = offset > 0 ? 'right' : 'left';
      
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      swipeQueue.queueSwipe(profile.user_id, direction, 'profile');
      
      const exitX = direction === 'right' ? 500 : -500;
      x.set(exitX);
      
      setTimeout(() => {
        onSwipe(direction);
      }, 150);
    } else {
      x.set(0);
    }
    
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  }, [profile.user_id, onSwipe, x]);

  const handleCardTap = useCallback(() => {
    if (!isDragging.current && onTap) {
      onTap();
    }
  }, [onTap]);

  const handleImageTap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (imageCount <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width * 0.3) {
      setCurrentImageIndex(prev => prev === 0 ? imageCount - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7) {
      setCurrentImageIndex(prev => prev === imageCount - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    }
  }, [imageCount]);

  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    if (hasExited.current) return;
    hasExited.current = true;
    
    triggerHaptic(direction === 'right' ? 'success' : 'warning');
    swipeQueue.queueSwipe(profile.user_id, direction, 'profile');
    
    const exitX = direction === 'right' ? 500 : -500;
    x.set(exitX);
    
    setTimeout(() => {
      onSwipe(direction);
    }, 150);
  }, [profile.user_id, onSwipe, x]);

  // Format budget
  const budgetText = profile.budget_min && profile.budget_max 
    ? `$${profile.budget_min.toLocaleString()} - $${profile.budget_max.toLocaleString()}`
    : profile.budget_max 
      ? `Up to $${profile.budget_max.toLocaleString()}`
      : null;

  if (!isTop) {
    return (
      <div 
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl"
        style={{ 
          transform: 'scale(0.95)', 
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      >
        <CardImage src={currentImage} alt={profile.name || 'Client'} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardTap}
        style={{
          x,
          opacity: cardOpacity,
          scale: cardScale,
          rotate: cardRotate,
          filter: useTransform(cardBlur, (v) => `blur(${v}px)`),
        }}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-none rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Image area */}
        <div 
          className="absolute inset-0 w-full h-full"
          onClick={handleImageTap}
        >
          <CardImage src={currentImage} alt={profile.name || 'Client'} />
          
          {/* Image dots */}
          {imageCount > 1 && (
            <div className="absolute top-3 left-4 right-4 z-20 flex gap-1">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  className={`flex-1 h-1 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
          
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
        </div>
        
        {/* LIKE overlay */}
        <motion.div
          className="absolute top-8 left-8 z-30 pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          <div className="px-6 py-3 rounded-xl border-4 border-green-500 text-green-500 font-black text-3xl tracking-wider transform -rotate-12">
            LIKE
          </div>
        </motion.div>
        
        {/* NOPE overlay */}
        <motion.div
          className="absolute top-8 right-8 z-30 pointer-events-none"
          style={{ opacity: passOpacity }}
        >
          <div className="px-6 py-3 rounded-xl border-4 border-red-500 text-red-500 font-black text-3xl tracking-wider transform rotate-12">
            NOPE
          </div>
        </motion.div>
        
        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white text-xl font-bold">
              {profile.name || 'Anonymous'}
            </h2>
            {profile.age && (
              <span className="text-white/80 text-lg">{profile.age}</span>
            )}
          </div>
          
          {profile.city && (
            <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm">
            {budgetText && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <DollarSign className="w-3 h-3" /> {budgetText}
              </span>
            )}
            {profile.work_schedule && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Briefcase className="w-3 h-3" /> {profile.work_schedule}
              </span>
            )}
          </div>
        </div>
        
        {/* Verified badge */}
        {profile.verified && (
          <div className="absolute top-16 right-4 z-20">
            <Badge className="bg-blue-500/90 border-blue-400 text-white flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="text-sm">Verified</span>
            </Badge>
          </div>
        )}
      </motion.div>
      
      {/* Action buttons */}
      {!hideActions && (
        <div className="flex justify-center items-center gap-4 py-4 px-4">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-2 border-red-400 bg-background hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => handleButtonSwipe('left')}
          >
            <X className="w-6 h-6 text-red-500" />
          </Button>
          
          {onInsights && (
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-blue-400 bg-background hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={(e) => {
                e.stopPropagation();
                onInsights();
              }}
            >
              <Eye className="w-5 h-5 text-blue-500" />
            </Button>
          )}
          
          {onMessage && (
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-background hover:bg-cyan-50 dark:hover:bg-cyan-950"
              onClick={(e) => {
                e.stopPropagation();
                onMessage();
              }}
            >
              <MessageCircle className="w-5 h-5 text-cyan-500" />
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-purple-400 bg-background hover:bg-purple-50 dark:hover:bg-purple-950"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <Share2 className="w-5 h-5 text-purple-500" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-2 border-green-400 bg-background hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => handleButtonSwipe('right')}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </Button>
        </div>
      )}
    </div>
  );
}

export const SimpleOwnerSwipeCard = memo(SimpleOwnerSwipeCardComponent);
