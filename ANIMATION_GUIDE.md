# Animation & UI Enhancement Guide

This guide documents all the new animation utilities and UI enhancements added to the app, inspired by modern UI libraries like Aceternity UI, HyperUI, and 21st.dev.

## 🎨 New Components

### AnimatedSection & AnimatedDiv
Components that fade in when scrolled into view.

```tsx
import { AnimatedSection, AnimatedDiv } from '@/components/AnimatedSection';

// Slide up animation
<AnimatedSection animation="slide-up" delay={0.2}>
  <h1>Your Content</h1>
</AnimatedSection>

// Available animations: fade, slide-up, slide-left, slide-right, scale, blur
<AnimatedDiv animation="scale" duration={0.5}>
  <p>Scales in!</p>
</AnimatedDiv>
```

### AnimatedCard
Modern cards with smooth hover effects and optional 3D tilt.

```tsx
import { AnimatedCard, GradientBorderCard, GlassCard } from '@/components/ui/animated-card';

// Basic animated card
<AnimatedCard hoverScale={1.05} glowEffect>
  <h3>Hover me!</h3>
</AnimatedCard>

// Card with 3D tilt effect
<AnimatedCard enableTilt>
  <p>Move your mouse over me</p>
</AnimatedCard>

// Gradient border card
<GradientBorderCard>
  <p>Beautiful gradient border on hover</p>
</GradientBorderCard>

// Glass morphism card
<GlassCard>
  <p>Modern glass effect</p>
</GlassCard>
```

### AnimatedButton
Buttons with smooth animations and ripple effects.

```tsx
import { AnimatedButton, RippleButton } from '@/components/ui/animated-button';

// Animated button with variants
<AnimatedButton variant="default" size="lg">
  Click me
</AnimatedButton>

// Variants: default, outline, ghost, glow
<AnimatedButton variant="glow">
  Glowing Button
</AnimatedButton>

// Button with ripple effect
<RippleButton>
  Ripple Effect
</RippleButton>
```

## 🪝 Custom Hooks

### useScrollAnimation
Hook for creating scroll-triggered animations.

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={ref} className={isVisible ? 'animate-fade-in-up' : 'opacity-0'}>
      Content appears on scroll
    </div>
  );
}
```

### useStaggeredScrollAnimation
For staggered list animations.

```tsx
import { useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

function MyList() {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  const { ref, visibleItems } = useStaggeredScrollAnimation(items.length);

  return (
    <div ref={ref}>
      {items.map((item, i) => (
        <div
          key={i}
          className={visibleItems.includes(i) ? 'animate-fade-in-up' : 'opacity-0'}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

## 🎭 CSS Animation Classes

### Fade In Animations
```css
.animate-fade-in-up      /* Fades in from below */
.animate-fade-in-down    /* Fades in from above */
.animate-fade-in-left    /* Fades in from left */
.animate-fade-in-right   /* Fades in from right */
.animate-fade-in-scale   /* Fades in with scale */
```

### Entrance Animations
```css
.soft-entrance           /* Smooth entrance with blur */
.bounce-entrance         /* Bouncy entrance */
.slide-fade-entrance     /* Slide and fade */
```

### Hover Effects
```css
.hover-lift              /* Lifts on hover */
.hover-scale             /* Scales on hover */
.hover-glow-primary      /* Glows with primary color */
.card-gradient-border    /* Gradient border on hover */
.shimmer-hover           /* Shimmer effect on hover */
```

### Delay Utilities
```css
.delay-100   /* 100ms delay */
.delay-200   /* 200ms delay */
.delay-300   /* 300ms delay */
.delay-400   /* 400ms delay */
.delay-500   /* 500ms delay */
```

### Example: Staggered Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <AnimatedCard className="delay-100">Card 1</AnimatedCard>
  <AnimatedCard className="delay-200">Card 2</AnimatedCard>
  <AnimatedCard className="delay-300">Card 3</AnimatedCard>
</div>
```

## 📱 Mobile Layout Improvements

### Fixed Issues
- ✅ Horizontal overflow prevention
- ✅ Better container padding (1rem on mobile)
- ✅ Proper touch target sizes (min 44px)
- ✅ Responsive text sizing
- ✅ Better modal/dialog sizing
- ✅ Input field zoom prevention (16px font-size)
- ✅ Safe area support for notches and gesture bars
- ✅ Improved scrollbar styling (hidden on mobile)

### Safe Area Classes
```css
.safe-area-pt        /* Safe area padding top */
.safe-area-pb        /* Safe area padding bottom */
.safe-area-px        /* Safe area padding horizontal */
.safe-area-p         /* Safe area padding all sides */
```

## 🎨 Glass Morphism & Modern Effects

### Glass Effect
```tsx
<div className="glass-effect-enhanced">
  Modern glass morphism effect
</div>
```

### Button Effects
```tsx
<button className="btn-smooth">
  Smooth ripple on hover
</button>
```

## 🚀 Tailwind Animation Classes

All animations are available as Tailwind classes:

```tsx
<div className="animate-soft-entrance">Soft entrance</div>
<div className="animate-scale-in">Scale in</div>
<div className="animate-blur-in">Blur in</div>
<div className="animate-shimmer">Shimmer effect</div>
<div className="animate-glow-pulse">Pulsing glow</div>
```

## 💡 Best Practices

1. **Use `triggerOnce: true`** for scroll animations to avoid re-triggering
2. **Stagger animations** for lists using delay classes
3. **Combine animations** for unique effects
4. **Test on mobile** to ensure smooth 60fps performance
5. **Use `will-animate` class** for better performance on animated elements

## 🎯 Performance Tips

- All animations use CSS transforms for GPU acceleration
- `will-change` is managed automatically
- Reduced motion preferences are respected
- Mobile-optimized with shorter durations

## 📚 Examples

### Hero Section with Staggered Animations
```tsx
<AnimatedSection animation="fade">
  <h1 className="animate-fade-in-up">Welcome</h1>
  <p className="animate-fade-in-up delay-200">Subtitle</p>
  <AnimatedButton className="delay-400" variant="glow">
    Get Started
  </AnimatedButton>
</AnimatedSection>
```

### Card Grid with Hover Effects
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map((item, i) => (
    <AnimatedCard
      key={item.id}
      hoverScale={1.05}
      glowEffect
      className={`delay-${(i + 1) * 100}`}
    >
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </AnimatedCard>
  ))}
</div>
```

### Smooth Page Transitions
```tsx
<div className="soft-entrance">
  <AnimatedSection animation="slide-up" delay={0.1}>
    <h1>Page Title</h1>
  </AnimatedSection>

  <AnimatedSection animation="slide-up" delay={0.2}>
    <p>Page content...</p>
  </AnimatedSection>
</div>
```

## 🎨 Combining with Framer Motion

You can still use Framer Motion for complex animations:

```tsx
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      Complex animation
    </motion.div>
  );
}
```

---

**Happy animating! 🎉**
