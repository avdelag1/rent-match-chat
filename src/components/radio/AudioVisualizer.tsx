import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSimulatedVisualizer, AudioVisualizerData } from '@/hooks/useAudioVisualizer';

// =====================================
// Equalizer Bars - Classic audio bars
// =====================================
interface EqualizerBarsProps {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  color?: string;
  height?: number;
  gap?: number;
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  isPlaying,
  className,
  barCount = 5,
  color = 'currentColor',
  height = 20,
  gap = 2,
}) => {
  const visualizerData = useSimulatedVisualizer(isPlaying);

  const bars = useMemo(() => {
    const data = visualizerData.frequencyData;
    const step = Math.floor(data.length / barCount);
    return Array.from({ length: barCount }, (_, i) => {
      const value = data[i * step] || 0;
      return (value / 255) * height;
    });
  }, [visualizerData.frequencyData, barCount, height]);

  if (!isPlaying) return null;

  return (
    <div className={cn('flex items-end', className)} style={{ gap, height }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{
            backgroundColor: color,
            minHeight: 3,
          }}
          animate={{ height: Math.max(3, h) }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

// =====================================
// Wave Visualizer - Smooth wave effect
// =====================================
interface WaveVisualizerProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}

export const WaveVisualizer: React.FC<WaveVisualizerProps> = ({
  isPlaying,
  className,
  color = 'rgba(255, 255, 255, 0.5)',
  width = 100,
  height = 30,
}) => {
  const { bass, mid, treble } = useSimulatedVisualizer(isPlaying);

  if (!isPlaying) return null;

  // Generate wave path based on audio data
  const generateWavePath = () => {
    const points: string[] = [];
    const segments = 20;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const progress = i / segments;

      // Combine bass, mid, treble for different parts of the wave
      let amplitude = 0;
      if (progress < 0.33) {
        amplitude = bass;
      } else if (progress < 0.66) {
        amplitude = mid;
      } else {
        amplitude = treble;
      }

      // Add some variation
      const wave = Math.sin(progress * Math.PI * 4 + Date.now() * 0.003) * 0.5 + 0.5;
      const y = height / 2 + (amplitude * wave - 0.25) * height;

      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }

    return points.join(' ');
  };

  return (
    <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <motion.path
        d={generateWavePath()}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
      />
    </svg>
  );
};

// =====================================
// Pulse Ring - Pulsing ring effect
// =====================================
interface PulseRingProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
  size?: number;
}

export const PulseRing: React.FC<PulseRingProps> = ({
  isPlaying,
  className,
  color = 'rgba(255, 255, 255, 0.3)',
  size = 100,
}) => {
  const { bass, energy, isPeak } = useSimulatedVisualizer(isPlaying);

  if (!isPlaying) return null;

  const scale = 1 + bass * 0.3;
  const opacity = 0.2 + energy * 0.5;

  return (
    <div className={cn('absolute pointer-events-none', className)}>
      {/* Main pulse ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `2px solid ${color}`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale,
          opacity,
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />

      {/* Peak pulse - expands on beats */}
      {isPeak && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid ${color}`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </div>
  );
};

// =====================================
// Glow Effect - Background glow pulse
// =====================================
interface GlowEffectProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  isPlaying,
  className,
  color = 'rgba(139, 92, 246, 0.5)', // Purple glow
}) => {
  const { bass, energy } = useSimulatedVisualizer(isPlaying);

  if (!isPlaying) return null;

  const blurSize = 20 + bass * 40;
  const opacity = 0.3 + energy * 0.4;

  return (
    <motion.div
      className={cn('absolute inset-0 pointer-events-none rounded-inherit', className)}
      animate={{
        boxShadow: `0 0 ${blurSize}px ${blurSize / 2}px ${color}`,
        opacity,
      }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    />
  );
};

// =====================================
// Particle Burst - Particles on beats
// =====================================
interface ParticleBurstProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
  particleCount?: number;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  isPlaying,
  className,
  color = 'rgba(255, 255, 255, 0.8)',
  particleCount = 8,
}) => {
  const { isPeak, bass } = useSimulatedVisualizer(isPlaying);
  const [particles, setParticles] = React.useState<Array<{ id: number; angle: number }>>([]);

  React.useEffect(() => {
    if (isPeak && isPlaying) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / particleCount) * i + Math.random() * 20,
      }));
      setParticles(prev => [...prev, ...newParticles].slice(-30)); // Keep max 30 particles
    }
  }, [isPeak, isPlaying, particleCount]);

  // Cleanup old particles
  React.useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles(prev => prev.slice(Math.min(particleCount, prev.length)));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [particles.length, particleCount]);

  if (!isPlaying) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%',
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * (50 + bass * 30),
            y: Math.sin((particle.angle * Math.PI) / 180) * (50 + bass * 30),
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// =====================================
// Spectrum Bars - Full frequency spectrum
// =====================================
interface SpectrumBarsProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
  barCount?: number;
  height?: number;
  mirrored?: boolean;
}

export const SpectrumBars: React.FC<SpectrumBarsProps> = ({
  isPlaying,
  className,
  color = 'rgba(139, 92, 246, 0.8)',
  barCount = 32,
  height = 60,
  mirrored = false,
}) => {
  const visualizerData = useSimulatedVisualizer(isPlaying);

  const bars = useMemo(() => {
    const data = visualizerData.frequencyData;
    const step = Math.floor(data.length / barCount);
    return Array.from({ length: barCount }, (_, i) => {
      const value = data[i * step] || 0;
      return (value / 255) * height;
    });
  }, [visualizerData.frequencyData, barCount, height]);

  if (!isPlaying) return null;

  const renderBars = () =>
    bars.map((h, i) => {
      // Gradient color based on height
      const hue = 260 + (h / height) * 40; // Purple to pink
      const barColor = color.includes('rgba') ? color : `hsl(${hue}, 70%, 60%)`;

      return (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{
            backgroundColor: barColor,
            minHeight: 2,
          }}
          animate={{ height: Math.max(2, h) }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      );
    });

  return (
    <div className={cn('flex items-end gap-px', className)} style={{ height }}>
      {mirrored ? (
        <>
          <div className="flex items-end gap-px flex-1 flex-row-reverse">{renderBars()}</div>
          <div className="flex items-end gap-px flex-1">{renderBars()}</div>
        </>
      ) : (
        renderBars()
      )}
    </div>
  );
};

// =====================================
// Circular Visualizer - Radial bars
// =====================================
interface CircularVisualizerProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
  size?: number;
  barCount?: number;
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  isPlaying,
  className,
  color = 'rgba(255, 255, 255, 0.6)',
  size = 120,
  barCount = 24,
}) => {
  const visualizerData = useSimulatedVisualizer(isPlaying);

  const bars = useMemo(() => {
    const data = visualizerData.frequencyData;
    const step = Math.floor(data.length / barCount);
    return Array.from({ length: barCount }, (_, i) => {
      const value = data[i * step] || 0;
      return (value / 255) * 20 + 5; // Min 5, max 25
    });
  }, [visualizerData.frequencyData, barCount]);

  if (!isPlaying) return null;

  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = size * 0.3;

  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {bars.map((length, i) => {
        const angle = (360 / barCount) * i - 90; // Start from top
        const radian = (angle * Math.PI) / 180;
        const x1 = centerX + innerRadius * Math.cos(radian);
        const y1 = centerY + innerRadius * Math.sin(radian);
        const x2 = centerX + (innerRadius + length) * Math.cos(radian);
        const y2 = centerY + (innerRadius + length) * Math.sin(radian);

        return (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        );
      })}
    </svg>
  );
};

// =====================================
// Vinyl Spin Effect - For vinyl skin
// =====================================
interface VinylSpinProps {
  isPlaying: boolean;
  className?: string;
  size?: number;
}

export const VinylSpin: React.FC<VinylSpinProps> = ({
  isPlaying,
  className,
  size = 200,
}) => {
  const { bass, energy } = useSimulatedVisualizer(isPlaying);

  return (
    <motion.div
      className={cn('relative rounded-full', className)}
      style={{ width: size, height: size }}
      animate={{
        rotate: isPlaying ? 360 : 0,
        scale: isPlaying ? 1 + bass * 0.02 : 1,
      }}
      transition={{
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        },
        scale: {
          duration: 0.1,
        },
      }}
    >
      {/* Vinyl grooves */}
      {[0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((ratio, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-gray-600/30"
          style={{
            width: size * ratio,
            height: size * ratio,
            left: (size - size * ratio) / 2,
            top: (size - size * ratio) / 2,
          }}
        />
      ))}

      {/* Center label highlight on beat */}
      <motion.div
        className="absolute rounded-full bg-white/10"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          left: size * 0.375,
          top: size * 0.375,
        }}
        animate={{
          opacity: isPlaying ? 0.1 + energy * 0.2 : 0.1,
        }}
      />
    </motion.div>
  );
};

// =====================================
// Mini Visualizer - Compact for mini player
// =====================================
interface MiniVisualizerProps {
  isPlaying: boolean;
  className?: string;
  variant?: 'bars' | 'dots' | 'wave';
  color?: string;
}

export const MiniVisualizer: React.FC<MiniVisualizerProps> = ({
  isPlaying,
  className,
  variant = 'bars',
  color = 'currentColor',
}) => {
  const { bass, mid, treble, energy } = useSimulatedVisualizer(isPlaying);

  if (!isPlaying) return null;

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[bass, mid, treble].map((value, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              scale: 0.5 + value,
              opacity: 0.4 + value * 0.6,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <svg className={className} width={24} height={12} viewBox="0 0 24 12">
        <motion.path
          d={`M 0 6 Q 6 ${6 - bass * 4} 12 6 Q 18 ${6 + mid * 4} 24 6`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Default: bars
  return (
    <div className={cn('flex items-end gap-0.5', className)}>
      {[bass, mid, treble, mid * 0.8, bass * 0.6].map((value, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: 3 + value * 12,
          }}
          transition={{ duration: 0.05 }}
        />
      ))}
    </div>
  );
};

// =====================================
// Background Rhythm Effect - For full player
// =====================================
interface BackgroundRhythmProps {
  isPlaying: boolean;
  className?: string;
  color?: string;
}

export const BackgroundRhythm: React.FC<BackgroundRhythmProps> = ({
  isPlaying,
  className,
  color = 'rgba(139, 92, 246, 0.15)',
}) => {
  const { bass, energy, isPeak } = useSimulatedVisualizer(isPlaying);

  if (!isPlaying) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {/* Pulsing gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
        }}
        animate={{
          scale: 1 + bass * 0.2,
          opacity: 0.5 + energy * 0.5,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Beat ripples */}
      {isPeak && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 50%)`,
          }}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
};

// Export all components
export default {
  EqualizerBars,
  WaveVisualizer,
  PulseRing,
  GlowEffect,
  ParticleBurst,
  SpectrumBars,
  CircularVisualizer,
  VinylSpin,
  MiniVisualizer,
  BackgroundRhythm,
};
