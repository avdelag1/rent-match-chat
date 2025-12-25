import { memo } from 'react';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

function SwipessLogoComponent({ size = 'md', className = '', showGlow = true }: SwipessLogoProps) {
  // Size configurations
  const sizeConfig = {
    sm: { fontSize: 32, strokeWidth: 2.5, width: 160, height: 50 },
    md: { fontSize: 56, strokeWidth: 3.5, width: 280, height: 85 },
    lg: { fontSize: 80, strokeWidth: 4.5, width: 400, height: 120 },
    xl: { fontSize: 100, strokeWidth: 5.5, width: 500, height: 150 },
  };

  const config = sizeConfig[size];
  const uniqueId = `swipess-${size}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow effect underneath */}
      {showGlow && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-10%',
            left: '10%',
            right: '10%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(255, 140, 0, 0.8) 0%, rgba(255, 100, 0, 0.5) 40%, transparent 70%)',
            filter: 'blur(15px)',
            zIndex: 0,
          }}
        />
      )}

      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}
      >
        <defs>
          {/* Yellow-Orange gradient for fill - matching the reference image */}
          <linearGradient id={`${uniqueId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="20%" stopColor="#FFD633" />
            <stop offset="40%" stopColor="#FFC107" />
            <stop offset="60%" stopColor="#FFB000" />
            <stop offset="80%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FF7A00" />
          </linearGradient>
        </defs>

        {/* Layer 1: Deepest shadow (darkest, furthest offset) */}
        <text
          x={config.width / 2 + 4}
          y={config.height / 2 + 6}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Quicksand', 'Poppins', 'Arial Black', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill="#1a0500"
          stroke="#1a0500"
          strokeWidth={config.strokeWidth + 6}
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          SWIPESS
        </text>

        {/* Layer 2: Mid shadow */}
        <text
          x={config.width / 2 + 2}
          y={config.height / 2 + 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Quicksand', 'Poppins', 'Arial Black', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill="#3d0a00"
          stroke="#3d0a00"
          strokeWidth={config.strokeWidth + 4}
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          SWIPESS
        </text>

        {/* Layer 3: Dark red-brown outline */}
        <text
          x={config.width / 2}
          y={config.height / 2 + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Quicksand', 'Poppins', 'Arial Black', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill="#6B1C00"
          stroke="#6B1C00"
          strokeWidth={config.strokeWidth + 2}
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          SWIPESS
        </text>

        {/* Layer 4: Main text with gradient fill and thin stroke */}
        <text
          x={config.width / 2}
          y={config.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Quicksand', 'Poppins', 'Arial Black', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill={`url(#${uniqueId}-fill)`}
          stroke="#8B3000"
          strokeWidth={config.strokeWidth}
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          SWIPESS
        </text>
      </svg>
    </div>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
