/**
 * PHYSICS OWNER CLIENT CARD
 *
 * Owner-side client profile swipe card powered by the unified physics engine.
 * Provides Apple-grade gesture feel with:
 *
 * 1. Direct manipulation - card locked to finger
 * 2. Velocity prediction - accurate from gesture history
 * 3. Inertial release - friction-based deceleration
 * 4. Zero React re-renders during gesture
 *
 * This is the physics-enhanced version of OwnerClientTinderCard.
 */

import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { MapPin, Flame, CheckCircle, BarChart3, Home, ChevronDown, X, Eye, Share2, Heart, DollarSign, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePhysicsGesture } from '@/lib/physics';
import { triggerHaptic } from '@/utils/haptics';
import { usePWAMode } from '@/hooks/usePWAMode';
import { swipeQueue } from '@/lib/swipe/SwipeQueue';

// FALLBACK: Inline SVG with neutral colors
const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTJlOGYwIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNjYmQ1ZTEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5NGEzYjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNTAwIiByPSI4MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIi8+PHBhdGggZD0iTTM3MCA0NjBoNjB2NDBjMCAxNi41NjktMTMuNDMxIDMwLTMwIDMwcy0zMC0xMy40MzEtMzAtMzB2LTQweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNDUwIiByPSIzMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+';

// Inline placeholder - GPU-accelerated gradient
const PLACEHOLDER_GRADIENT = `linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 35%, #cbd5e1 65%, #94a3b8 100%)`;

// =============================================================================
// PERF: Global session-level image cache for client profile images
// =============================================================================
const globalClientImageCache = new Map<string, {
  loaded: boolean;
  decoded: boolean;
  failed: boolean;
}>();

export function isClientImageDecodedInCache(url: string): boolean {
  const cached = globalClientImageCache.get(url);
  return cached?.decoded === true && !cached?.failed;
}

export function preloadClientImageToCache(url: string): Promise<boolean> {
  const cached = globalClientImageCache.get(url);
  if (cached?.decoded && !cached?.failed) {
    return Promise.resolve(true);
  }

  if (cached?.loaded && !cached?.decoded && !cached?.failed) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const current = globalClientImageCache.get(url);
        if (current?.decoded || current?.failed) {
          clearInterval(checkInterval);
          resolve(!current?.failed);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 3000);
    });
  }

  globalClientImageCache.set(url, { loaded: true, decoded: false, failed: false });

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
        if ('decode' in img) {
          await img.decode();
        }
        globalClientImageCache.set(url, { loaded: true, decoded: true, failed: false });
        cleanup();
        resolve(true);
      } catch {
        globalClientImageCache.set(url, { loaded: true, decoded: true, failed: false });
        cleanup();
        resolve(true);
      }
    };

    img.onerror = () => {
      globalClientImageCache.set(url, { loaded: true, decoded: false, failed: true });
      cleanup();
      resolve(false);
    };

    img.src = url;

    setTimeout(() => {
      if (!globalClientImageCache.get(url)?.decoded) {
        globalClientImageCache.set(url, { loaded: true, decoded: true, failed: false });
        cleanup();
        resolve(true);
      }
    }, 3000);
  });
}

// Client Profile Image Gallery with skeleton loading
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

  const getCurrentSrc = useCallback(() => {
    const src = images[currentIndex];
    if (src && !failedImagesRef.current.has(src)) {
      return src;
    }
    for (let i = 0; i < images.length; i++) {
      const fallback = images[(currentIndex + i) % images.length];
      if (fallback && !failedImagesRef.current.has(fallback)) {
        return fallback;
      }
    }
    return FALLBACK_PLACEHOLDER;
  }, [images, currentIndex]);

  const displaySrc = getCurrentSrc();
  const cachedState = globalClientImageCache.get(displaySrc);
  const isLoaded = (cachedState?.decoded && !cachedState?.failed) || displaySrc === FALLBACK_PLACEHOLDER;

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
      {/* Premium skeleton shimmer placeholder */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: PLACEHOLDER_GRADIENT,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.2s ease-in-out infinite',
            willChange: 'background-position',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <svg className="w-10 h-10 text-slate-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Actual image */}
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
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        onLoad={() => {
          if (!globalClientImageCache.get(displaySrc)?.decoded) {
            globalClientImageCache.set(displaySrc, { loaded: true, decoded: true, failed: false });
            forceUpdate(n => n + 1);
          }
        }}
        onError={() => {
          if (!failedImagesRef.current.has(displaySrc)) {
            failedImagesRef.current.add(displaySrc);
            globalClientImageCache.set(displaySrc, { loaded: true, decoded: false, failed: true });
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

interface PhysicsOwnerClientCardProps {
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

const PhysicsOwnerClientCardComponent = ({
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
}: PhysicsOwnerClientCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);

  const pwaMode = usePWAMode();

  // Track position for overlay feedback
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Update swipe feedback overlay based on position
  const updateFeedback = useCallback((x: number) => {
    if (feedbackRef.current) {
      const likeEl = feedbackRef.current.querySelector('[data-like]') as HTMLElement;
      const passEl = feedbackRef.current.querySelector('[data-pass]') as HTMLElement;

      if (likeEl) {
        const opacity = Math.max(0, Math.min(1, x / 120));
        likeEl.style.opacity = String(opacity);
        likeEl.style.transform = `scale(${0.7 + opacity * 0.4}) rotate(-15deg)`;
      }

      if (passEl) {
        const opacity = Math.max(0, Math.min(1, -x / 120));
        passEl.style.opacity = String(opacity);
        passEl.style.transform = `scale(${0.7 + opacity * 0.4}) rotate(15deg)`;
      }
    }
  }, []);

  // Physics gesture hook - the magic that makes it feel amazing
  const { bind, state, triggerSwipe, reset } = usePhysicsGesture({
    swipeThreshold: 120,
    velocityThreshold: 400,
    dragAxis: 'x',
    dragElastic: 0.85,
    exitDistance: 500,
    disabled: !isTop,

    onDragStart: () => {
      triggerHaptic('light');
    },

    onAnimationFrame: (animState) => {
      updateFeedback(animState.x);
    },

    onSwipeLeft: () => {
      triggerHaptic('warning');
      swipeQueue.queueSwipe(profile.user_id, 'left', 'profile');
      onSwipe('left');
    },

    onSwipeRight: () => {
      triggerHaptic('success');
      swipeQueue.queueSwipe(profile.user_id, 'right', 'profile');
      onSwipe('right');
    },
  });

  // Reset when profile changes
  useEffect(() => {
    reset();
  }, [profile.user_id, reset]);

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

    if (clickX < width * 0.3 && images.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && images.length > 1) {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else {
      setIsInsightsPanelOpen(prev => !prev);
      triggerHaptic('medium');
    }
  }, [isTop, images.length]);

  // Button swipe handlers
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    triggerHaptic(direction === 'right' ? 'success' : 'warning');
    triggerSwipe(direction);
  }, [triggerSwipe]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card */}
      <div
        {...bind}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl relative"
        style={{
          ...bind.style,
          transform: isTop ? undefined : 'scale(0.95)',
          opacity: isTop ? 1 : 0.8,
        }}
      >
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ contain: 'paint layout' }}
        >
          {/* Swipe Feedback Overlays */}
          <div ref={feedbackRef} className="contents">
            {/* LIKED overlay */}
            <div
              data-like
              className="absolute top-6 left-6 z-30 pointer-events-none"
              style={{ opacity: 0, transform: 'scale(0.7) rotate(-15deg)' }}
            >
              <div
                className="px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider"
                style={{
                  borderColor: '#10b981',
                  color: '#10b981',
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                }}
              >
                LIKED
              </div>
            </div>

            {/* PASS overlay */}
            <div
              data-pass
              className="absolute top-6 right-6 z-30 pointer-events-none"
              style={{ opacity: 0, transform: 'scale(0.7) rotate(15deg)' }}
            >
              <div
                className="px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider"
                style={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                }}
              >
                PASS
              </div>
            </div>
          </div>

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

            {/* Image Gallery */}
            <ClientImageGallery
              images={images}
              currentIndex={Math.min(currentImageIndex, images.length - 1)}
              alt={profile.name}
              isTop={isTop}
            />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none z-10" />

            {/* Verified Badge */}
            {profile.verified && (
              <div className="absolute top-20 right-4 z-20">
                <Badge className="bg-blue-500/95 border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5 shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </Badge>
              </div>
            )}

            {/* Center-Tap Insights Panel */}
            {isInsightsPanelOpen && (
              <div
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

                  <div className="text-center mt-4 text-white/40 text-xs">
                    Tap anywhere to close
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-xl rounded-t-[24px] shadow-2xl border-t border-white/10 overflow-hidden z-20"
            style={{
              height: 350,
              transform: `translateY(${isBottomSheetExpanded ? 0 : 230}px)`,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

              {/* Quick Stats */}
              <div className="space-y-1.5 mb-1">
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
                <div
                  className="mt-4 overflow-y-auto"
                  style={{
                    maxHeight: '150px',
                    opacity: 1,
                    transition: 'opacity 0.2s ease-out 0.1s',
                  }}
                >
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
                </div>
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
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed position, outside drag */}
      {isTop && !hideActions && !isBottomSheetExpanded && !isInsightsPanelOpen && (
        <div
          className="absolute bottom-28 left-0 right-0 flex justify-center items-center z-40 pointer-events-none"
        >
          <div
            className="flex items-center gap-3 pointer-events-auto pwa-tap-zone"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Dislike */}
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleButtonSwipe('left');
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-dislike pwa-instant-tap active:scale-90 transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-7 h-7" strokeWidth={3} />
            </button>

            {/* Insights */}
            {onInsights && hasPremium && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  triggerHaptic('light');
                  onInsights();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-insights pwa-instant-tap active:scale-90 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <Eye className="w-5 h-5" />
              </button>
            )}

            {/* Share */}
            {onShare && (
              <button
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
                className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-share pwa-instant-tap active:scale-90 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Like */}
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleButtonSwipe('right');
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-heart pwa-instant-tap active:scale-90 transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              <Flame className="w-7 h-7" fill="currentColor" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Memoized export - only re-renders when profile ID or isTop changes
 */
export const PhysicsOwnerClientCard = memo(PhysicsOwnerClientCardComponent, (prev, next) => {
  return prev.profile.user_id === next.profile.user_id && prev.isTop === next.isTop;
});
