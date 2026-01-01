
import { cn } from "@/lib/utils"

/**
 * iOS-grade skeleton loading component with smooth shimmer animation
 * - Faster 1.2s duration for snappy feel (was 2s)
 * - GPU-accelerated via translateZ(0)
 * - Subtle gradient for professional look
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/80",
        // GPU-accelerated shimmer animation
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer before:bg-gradient-to-r",
        "before:from-transparent before:via-white/15 before:to-transparent",
        // Force GPU layer for smooth 60fps
        "transform-gpu",
        className
      )}
      style={{
        willChange: 'contents',
        backfaceVisibility: 'hidden',
      }}
      {...props}
    />
  )
}

export { Skeleton }
