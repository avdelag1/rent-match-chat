import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from 'framer-motion';
import { MapPin, Flame, CheckCircle, BarChart3, Home, ChevronDown, X, Eye, Share2, Heart, Info, DollarSign, User, RotateCcw, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';
import { usePWAMode } from '@/hooks/usePWAMode';

// FALLBACK: Inline SVG with neutral colors (light slate gradient - matches TinderSwipeCard)
// Using a light gradient that works in both light and dark mode
const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTJlOGYwIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNjYmQ1ZTEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5NGEzYjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNTAwIiByPSI4MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIi8+PHBhdGggZD0iTTM3MCA0NjBoNjB2NDBjMCAxNi41NjktMTMuNDMxIDMwLTMwIDMwcy0zMC0xMy40MzEtMzAtMzB2LTQweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNDUwIiByPSIzMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+';

// =============================================================================
// PERF: Global session-level image cache for client profile images
// Shared across all swipe cards to prevent re-loading on navigation
// =============================================================================
const globalClientImageCache = new Map<string, {
  loaded: boolean;
  decoded: boolean;
  failed: boolean;
  lastAccessed: number;
}>();

/**
 * PERF FIX: Check if an image is already decoded in the global cache
 * Used to determine if we can allow immediate swipe or need to wait
 */
export function isClientImageDecodedInCache(url: string): boolean {
  const cached = globalClientImageCache.get(url);
  return cached?.decoded === true && !cached?.failed;
}

/**
 * PERF FIX: Preload a client profile image into the global cache
 * Returns a promise that resolves when image is decoded (or fails)
 */
export function preloadClientImageToCache(url: string): Promise<boolean> {
  // Already cached and decoded - instant return
  const cached = globalClientImageCache.get(url);
  if (cached?.decoded && !cached?.failed) {
    return Promise.resolve(true);
  }

  // Already loading - return existing promise
  if (cached?.loaded && !cached?.decoded && !cached?.failed) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const current = globalClientImageCache.get(url);
        if (current?.decoded || current?.failed) {
          clearInterval(checkInterval);
          resolve(!current?.failed);
        }
      }, 50);
      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 3000);
    });
  }

  // Start loading
  globalClientImageCache.set(url, { loaded: true, decoded: false, failed: false, lastAccessed: Date.now() });

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    (img as any).fetchPriority = 'high';

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = async () => {
      try {
        // Decode the image for instant display
        if ('decode' in img) {
          await img.decode();
        }
        globalClientImageCache.set(url, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
        cleanup();
        resolve(true);
      } catch {
        globalClientImageCache.set(url, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
        cleanup();
        resolve(true);
      }
    };

    img.onerror = () => {
      globalClientImageCache.set(url, { loaded: true, decoded: false, failed: true, lastAccessed: Date.now() });
      cleanup();
      resolve(false);
    };

    img.src = url;

    // Timeout after 3 seconds
    setTimeout(() => {
      if (!globalClientImageCache.get(url)?.decoded) {
        globalClientImageCache.set(url, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
        cleanup();
        resolve(true);
      }
    }, 3000);
  });
}

// Client Profile Image Gallery with skeleton loading and fallback chain
const ClientImageGallery = memo(({
  images,
  currentIndex,
  alt,
  isTop
}: {
  images: string[];
  currentIndex: number;
  alt: string;
  isTop: boolean;
}) => {
  const failedImagesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Get current image with fallback chain
  const getCurrentSrc = useCallback(() => {
    const src = images[currentIndex];
    if (src && !failedImagesRef.current.has(src)) {
      return src;
    }
    // Try other images
    for (let i = 0; i < images.length; i++) {
      const fallback = images[(currentIndex + i) % images.length];
      if (fallback && !failedImagesRef.current.has(fallback)) {
        return fallback;
      }
    }
    return FALLBACK_PLACEHOLDER;
  }, [images, currentIndex]);

  const displaySrc = getCurrentSrc();

  // Check global cache first for instant display
  const cachedState = globalClientImageCache.get(displaySrc);
  const isLoaded = (cachedState?.decoded && !cachedState?.failed) || displaySrc === FALLBACK_PLACEHOLDER;

  // Preload active image with decode
  useEffect(() => {
    if (!isTop || !displaySrc || displaySrc === FALLBACK_PLACEHOLDER) return;
    if (isClientImageDecodedInCache(displaySrc) || failedImagesRef.current.has(displaySrc)) return;

    preloadClientImageToCache(displaySrc).then((success) => {
      if (!success) {
        failedImagesRef.current.add(displaySrc);
      }
      forceUpdate(n => n + 1);
    });
  }, [displaySrc, isTop]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Premium skeleton shimmer placeholder - NEVER black/dark
          Uses light slate colors that work in both light and dark mode with animated shimmer */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 150ms ease-out',
        }}
      >
        {/* Base gradient - neutral light gray */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 35%, #cbd5e1 65%, #94a3b8 100%)',
          }}
        />
        {/* Animated skeleton shimmer - sweeps across for loading effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.2s ease-in-out infinite',
            willChange: 'background-position',
          }}
        />
        {/* Secondary slower shimmer for depth */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 2s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        />
        {/* Placeholder content skeleton */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* User icon placeholder */}
          <div className="w-20 h-20 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <svg className="w-10 h-10 text-slate-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {/* Text skeleton lines */}
          <div className="flex flex-col items-center gap-2 w-48">
            <div className="h-4 w-full rounded-full bg-white/30" />
            <div className="h-3 w-3/4 rounded-full bg-white/25" />
          </div>
        </div>
      </div>

      {/* Actual image - eager for active card */}
      <img
        src={displaySrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 150ms ease-out',
          willChange: 'auto',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        onLoad={() => {
          if (!globalClientImageCache.get(displaySrc)?.decoded) {
            globalClientImageCache.set(displaySrc, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
            forceUpdate(n => n + 1);
          }
        }}
        onError={() => {
          if (!failedImagesRef.current.has(displaySrc)) {
            failedImagesRef.current.add(displaySrc);
            globalClientImageCache.set(displaySrc, { loaded: true, decoded: false, failed: true, lastAccessed: Date.now() });
            forceUpdate(n => n + 1);
          }
        }}
      />
    </div>
  );
});

interface ClientProfile {
  user_id: string;
  name: string;
  age?: number;
  city?: string;
  avatar_url?: string;
  profile_images?: string[];
  budget_max?: number;
  verified?: boolean;
  interests?: string[];
  preferred_activities?: string[];
  lifestyle_tags?: string[];
  preferred_listing_types?: string[];
  matchPercentage?: number;
}

interface OwnerClientTinderCardProps {
  profile: ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  isTop?: boolean;
  showNextCard?: boolean;
  hasPremium?: boolean;
  hideActions?: boolean;
}

// Calculate exit distance dynamically based on viewport for reliable off-screen animation
const getExitDistance = () => typeof window !== 'undefined' ? window.innerWidth + 100 : 600;

const OwnerClientTinderCardComponent = ({
  profile,
  onSwipe,
  onTap,
  onInsights,
  onMessage,
  onShare,
  onUndo,
  isTop = false,
  showNextCard = false,
  hasPremium = false,
  hideActions = false
}: OwnerClientTinderCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);

  // Track if the card is currently animating out to prevent reset interference
  const isExitingRef = useRef(false);
  const hasExitedRef = useRef(false);

  // PWA Mode optimizations - use lighter animations in PWA context
  const pwaMode = usePWAMode();

  // Motion values - GAME-LIKE INSTANT RESPONSE
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // PROGRESSIVE rotation - gradual feedback as user approaches decision threshold (120px)
  // Rotation builds smoothly from 0 to full rotation at threshold
  const rotate = useTransform(x, [-180, -120, -60, 0, 60, 120, 180], [-20, -15, -6, 0, 6, 15, 20]);

  // Subtle scale reduction as card moves away - creates depth perception
  const scale = useTransform(x, [-180, 0, 180], [0.95, 1, 0.95]);

  // Opacity stays high until near threshold, then fades slightly to indicate "leaving"
  // This gives clear feedback: card is still "here" until you commit
  const opacity = useTransform(x, [-180, -120, 0, 120, 180], [0.7, 0.9, 1, 0.9, 0.7]);

  const images = useMemo(() =>
    profile.profile_images && profile.profile_images.length > 0
      ? profile.profile_images
      : [profile.avatar_url || '/placeholder-avatar.svg'],
    [profile.profile_images, profile.avatar_url]
  );

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!isTop) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left 30% = previous, Center 40% = toggle insights panel, Right 30% = next
    if (clickX < width * 0.3 && images.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && images.length > 1) {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else {
      // Center tap toggles insights panel
      setIsInsightsPanelOpen(prev => !prev);
      triggerHaptic('medium');
    }
  }, [isTop, images.length]);

  // BUTTON SWIPE - Animate card then trigger swipe for smooth swoosh effect
  // FIX: Use tween animation for INSTANT exit - no bounce-back possible
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    isExitingRef.current = true;

    // Calculate exit distance based on viewport to ensure card fully exits
    const targetX = direction === 'right' ? getExitDistance() : -getExitDistance();

    // Haptic feedback immediately
    triggerHaptic(direction === 'right' ? 'success' : 'warning');

    // FIX: Use tween animation for direct exit - no bounce-back possible
    animate(x, targetX, {
      type: 'tween',
      duration: 0.25,
      ease: [0.32, 0.72, 0, 1], // iOS-style ease-out
      onComplete: () => {
        isExitingRef.current = false;
        onSwipe(direction);
      }
    });

    // Also animate slight y movement for natural arc feel
    animate(y, direction === 'right' ? -30 : -30, {
      type: 'tween',
      duration: 0.25,
      ease: [0.32, 0.72, 0, 1]
    });
  }, [onSwipe, x, y]);

  // PROFESSIONAL drag handling - responsive but controlled
  const handleDragStart = useCallback(() => {
    // Instant haptic feedback when finger touches
    triggerHaptic('light');
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (hasExitedRef.current) return;

    const { offset, velocity } = info;
    // HIGHER thresholds for controlled swipe decisions
    // Users must intentionally swipe far enough to commit
    const swipeThresholdX = 120; // Must drag 120px to commit to swipe
    const velocityThreshold = 400; // Fast flicks still work but need real intent

    // Calculate if swipe should trigger based on distance OR velocity
    const hasEnoughDistance = Math.abs(offset.x) > swipeThresholdX;
    const hasEnoughVelocity = Math.abs(velocity.x) > velocityThreshold;

    if (hasEnoughDistance || hasEnoughVelocity) {
      hasExitedRef.current = true;
      isExitingRef.current = true;

      // Determine direction based on offset primarily, velocity as tiebreaker
      const direction = offset.x > 0 ? 'right' : 'left';
      // Haptic feedback on successful swipe
      triggerHaptic(direction === 'right' ? 'success' : 'warning');

      // Calculate exit distance based on viewport to ensure card fully exits
      const exitX = direction === 'right' ? getExitDistance() : -getExitDistance();

      // FIX: Use tween animation for INSTANT exit - no bounce-back possible
      // Spring animations can overshoot and cause the card to snap back briefly
      animate(x, exitX, {
        type: 'tween',
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1], // iOS-style ease-out for natural feel
        onComplete: () => {
          isExitingRef.current = false;
          onSwipe(direction);
        },
      });

      // Also animate y for natural arc feel
      animate(y, -30, {
        type: 'tween',
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1],
      });
      return;
    }

    // SMOOTH SNAPBACK ANIMATION - Professional feel
    // Lower stiffness = smoother return, higher damping = no oscillation
    // This creates a satisfying "rubber band" snap back to center
    animate(x, 0, {
      type: "spring",
      stiffness: 400,  // Smooth but responsive
      damping: 30,     // Prevents bouncing
      mass: 0.8,       // Gives it weight/momentum feel
      velocity: velocity.x * 0.3 // Inherit some momentum for natural feel
    });
    animate(y, 0, {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
      velocity: velocity.y * 0.3
    });

    // Light haptic on snapback to provide feedback
    triggerHaptic('light');
  }, [onSwipe, x, y]);

  const cardStyle = {
    x,
    y,
    rotate: isTop ? rotate : 0,
    scale: isTop ? scale : 0.95,
    opacity: isTop ? opacity : 0,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '100%',
    willChange: 'transform, opacity',
    borderRadius: '1.5rem', // 24px - ensures rounded corners during animation
    overflow: 'hidden' as const,
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    transform: 'translateZ(0)',
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card - Takes most of the space */}
      <motion.div
        style={{
          x,
          y,
          rotate: isTop ? rotate : 0,
          scale: isTop ? scale : 0.95,
          opacity: isTop ? opacity : 1,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: -500, right: 500 }}
        dragElastic={0.7}
        dragMomentum={false}
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 35,
          power: 0.3,
          timeConstant: 150
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl shadow-2xl relative"
        initial={false}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.5
        }}
      >
        {/* Swipe Overlays - Premium Chinese-inspired */}
        <SwipeOverlays x={x} />

        {/* Card Content */}
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl">
          {/* Main Image with Tap Zones */}
          <div
            className="absolute inset-0 w-full h-full cursor-pointer select-none"
            onClick={handleImageClick}
            style={{ touchAction: 'manipulation' }}
          >
            {/* Story-Style Dots at Top */}
            {images.length > 1 && (
              <div className="absolute top-3 left-0 right-0 z-30 flex justify-center gap-1 px-4">
                {images.map((_, index) => (
                  <div
                    key={`image-dot-${index}`}
                    className="flex-1 h-1 rounded-full bg-white/60 overflow-hidden shadow-sm"
                  >
                    <div
                      className={`h-full bg-white shadow-lg transition-all duration-200 ${
                        index === currentImageIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Image Gallery with skeleton loading and fallback chain */}
            <ClientImageGallery
              images={images}
              currentIndex={Math.min(currentImageIndex, images.length - 1)}
              alt={profile.name}
              isTop={isTop}
            />

            {/* Bottom gradient - Lighter for better photo visibility */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10" />

            {/* Center-Tap Insights Panel - Shows client details when tapping center of photo */}
            <AnimatePresence>
              {isInsightsPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-x-4 top-16 bottom-36 z-30 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInsightsPanelOpen(false);
                    triggerHaptic('light');
                  }}
                >
                  {/* Close hint */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <X className="w-4 h-4 text-white/70" />
                    </div>
                  </div>

                  {/* Insights Content */}
                  <div className="p-4 h-full overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">
                          {profile.name}
                          {profile.age && <span className="text-white/60 ml-2 text-base font-normal">{profile.age}</span>}
                        </h3>
                        {profile.city && (
                          <div className="flex items-center text-white/70 text-sm">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span className="truncate">{profile.city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Budget & Verification */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {profile.budget_max && (
                        <div className="bg-white/10 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Max Budget</span>
                          </div>
                          <div className="text-xl font-bold text-emerald-400">${profile.budget_max.toLocaleString()}</div>
                        </div>
                      )}
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Status</span>
                        </div>
                        <div className={`text-lg font-semibold ${profile.verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {profile.verified ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* Looking For */}
                    {profile.preferred_listing_types && profile.preferred_listing_types.length > 0 && (
                      <div className="bg-white/10 rounded-xl p-3 mb-4">
                        <h4 className="text-white/60 text-xs mb-2 uppercase tracking-wide">Looking For</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.preferred_listing_types.map((type, idx) => (
                            <Badge key={`type-${idx}`} className="bg-blue-500/30 text-blue-300 border-blue-500/50 text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interests */}
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="bg-white/10 rounded-xl p-3 mb-4">
                        <h4 className="text-white/60 text-xs mb-2 uppercase tracking-wide">Interests</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.interests.slice(0, 6).map((interest, idx) => (
                            <Badge key={`interest-${idx}`} className="bg-white/10 text-white/80 border-white/20 text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {profile.interests.length > 6 && (
                            <Badge className="bg-white/5 text-white/50 border-white/10 text-xs">
                              +{profile.interests.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lifestyle */}
                    {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                      <div className="bg-purple-500/20 rounded-xl p-3">
                        <h4 className="text-purple-400 text-xs mb-2 uppercase tracking-wide font-semibold">Lifestyle</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.lifestyle_tags.slice(0, 4).map((tag, idx) => (
                            <Badge key={`lifestyle-${idx}`} className="bg-purple-500/30 text-purple-300 border-purple-500/50 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tap to close hint */}
                    <div className="text-center mt-4 text-white/40 text-xs">
                      Tap anywhere to close
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Sheet - Collapsible with Glassmorphism */}
          {/* Use translateY for GPU-friendly animation (matches TinderSwipeCard) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl rounded-t-[20px] shadow-lg border-t border-white/10 overflow-hidden z-20"
            animate={{
              y: isBottomSheetExpanded ? 0 : 230
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 32
            }}
            style={{
              height: 350,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-2 pointer-events-none">
              <div className="w-10 h-1.5 bg-white/50 rounded-full" />
            </div>

            {/* Collapsed Content */}
            <div className="px-4 pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h2 className="text-base font-bold text-foreground">
                    {profile.name}
                    {profile.age && <span className="text-sm text-muted-foreground ml-2">{profile.age}</span>}
                  </h2>
                  {profile.city && (
                    <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                </div>

                {/* Budget Display */}
                {profile.budget_max && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-500">
                      ${profile.budget_max.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">max budget</div>
                  </div>
                )}
              </div>

              {/* Enhanced Quick Stats - Two Rows */}
              <div className="space-y-1.5 mb-1">
                {/* Row 1: Looking For */}
                {profile.preferred_listing_types && profile.preferred_listing_types.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Home className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] text-muted-foreground/70">Looking for:</span>
                    <div className="flex gap-1">
                      {profile.preferred_listing_types.slice(0, 2).map((type, idx) => (
                        <Badge key={`listing-type-${idx}`} variant="secondary" className="text-[10px] h-5 px-2">
                          {type}
                        </Badge>
                      ))}
                      {profile.preferred_listing_types.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-2">
                          +{profile.preferred_listing_types.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 2: Top Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Heart className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] text-muted-foreground/70">Interests:</span>
                    <div className="flex gap-1 flex-wrap">
                      {profile.interests.slice(0, 3).map((interest, idx) => (
                        <Badge key={`interest-preview-${idx}`} variant="outline" className="text-[10px] h-5 px-2">
                          {interest}
                        </Badge>
                      ))}
                      {profile.interests.length > 3 && (
                        <Badge variant="outline" className="text-[10px] h-5 px-2">
                          +{profile.interests.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 3: Match Percentage */}
                {profile.matchPercentage && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] text-muted-foreground/70">Match:</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${profile.matchPercentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-purple-500">{profile.matchPercentage}%</span>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isBottomSheetExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mt-4 overflow-y-auto"
                  style={{ maxHeight: '150px' }}
                >
                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((interest, idx) => (
                          <Badge key={`interest-${idx}`} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Activities */}
                  {profile.preferred_activities && profile.preferred_activities.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Preferred Activities
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preferred_activities.map((activity, idx) => (
                          <Badge key={`activity-${idx}`} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lifestyle */}
                  {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Lifestyle
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.lifestyle_tags.map((tag, idx) => (
                          <Badge key={`lifestyle-${idx}`} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Expand/Collapse Indicator */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-muted-foreground h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBottomSheetExpanded(!isBottomSheetExpanded);
                  triggerHaptic('light');
                }}
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isBottomSheetExpanded ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons - Floating over card, hide when bottom sheet expanded or insights panel open */}
      <AnimatePresence>
        {isTop && !hideActions && !isBottomSheetExpanded && !isInsightsPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: pwaMode.springStiffness, damping: pwaMode.springDamping }}
            className="absolute bottom-28 left-0 right-0 flex justify-center items-center z-40 pointer-events-none"
          >
            {/* PWA TAP ZONE: Isolated from swipe gestures */}
            <div
              className="flex items-center gap-3 pointer-events-auto pwa-tap-zone"
              style={{ touchAction: 'manipulation' }}
            >
              {/* Dislike Button - Uses onPointerDown for instant PWA response */}
              <motion.button
                whileTap={pwaMode.isPWA ? undefined : { scale: 0.85 }}
                whileHover={pwaMode.isPWA ? undefined : { scale: 1.05 }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleButtonSwipe('left');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-dislike pwa-instant-tap"
                style={{ touchAction: 'manipulation' }}
                title="Dislike"
              >
                <X className="w-7 h-7" strokeWidth={3} />
              </motion.button>

              {/* Undo Button - Goes back one swipe */}
              {onUndo && (
                <motion.button
                  whileTap={pwaMode.isPWA ? undefined : { scale: 0.9 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerHaptic('light');
                    onUndo();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-undo pwa-instant-tap"
                  style={{ touchAction: 'manipulation' }}
                  title="Undo"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              )}

              {/* Message Button */}
              {onMessage && (
                <motion.button
                  whileTap={pwaMode.isPWA ? undefined : { scale: 0.9 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerHaptic('light');
                    onMessage();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-message pwa-instant-tap"
                  style={{ touchAction: 'manipulation' }}
                  title="Message"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
              )}

              {/* Share Button */}
              {onShare && (
                <motion.button
                  whileTap={pwaMode.isPWA ? undefined : { scale: 0.9 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerHaptic('light');
                    onShare();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-share pwa-instant-tap"
                  style={{ touchAction: 'manipulation' }}
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              )}

              {/* Like Button - Critical: instant response on pointer down */}
              <motion.button
                whileTap={pwaMode.isPWA ? undefined : { scale: 0.85 }}
                whileHover={pwaMode.isPWA ? undefined : { scale: 1.05 }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleButtonSwipe('right');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-heart pwa-instant-tap"
                style={{ touchAction: 'manipulation' }}
                title="Like"
              >
                <Flame className="w-7 h-7" fill="currentColor" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Memoize with custom comparison - only re-render if profile ID or isTop changes
export const OwnerClientTinderCard = memo(OwnerClientTinderCardComponent, (prevProps, nextProps) => {
  return prevProps.profile.user_id === nextProps.profile.user_id && prevProps.isTop === nextProps.isTop;
});
