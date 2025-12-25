import { memo } from 'react';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

function SwipessLogoComponent({ size = 'md', className = '', showGlow = true }: SwipessLogoProps) {
  // Size configurations
  const sizeConfig = {
    sm: { fontSize: 28, strokeWidth: 3, shadowOffset: 2, height: 40 },
    md: { fontSize: 48, strokeWidth: 4, shadowOffset: 3, height: 65 },
    lg: { fontSize: 72, strokeWidth: 5, shadowOffset: 4, height: 95 },
    xl: { fontSize: 96, strokeWidth: 6, shadowOffset: 5, height: 125 },
  };

  const config = sizeConfig[size];
  const uniqueId = `swipess-${size}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Glow effect underneath */}
      {showGlow && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: -config.fontSize * 0.15,
            width: config.fontSize * 4,
            height: config.fontSize * 0.4,
            background: 'radial-gradient(ellipse at center, rgba(255, 140, 0, 0.7) 0%, rgba(255, 100, 0, 0.4) 30%, transparent 70%)',
            filter: `blur(${config.fontSize * 0.2}px)`,
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${config.fontSize * 5} ${config.height}`}
        style={{
          width: config.fontSize * 5,
          height: config.height,
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Yellow-Orange gradient for fill */}
          <linearGradient id={`${uniqueId}-gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFEB3B" />
            <stop offset="15%" stopColor="#FFD54F" />
            <stop offset="35%" stopColor="#FFCA28" />
            <stop offset="55%" stopColor="#FFB300" />
            <stop offset="75%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#FF6D00" />
          </linearGradient>

          {/* Inner highlight gradient for 3D effect */}
          <linearGradient id={`${uniqueId}-highlight`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="30%" stopColor="#FFEE58" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id={`${uniqueId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx={config.shadowOffset} dy={config.shadowOffset * 1.5} stdDeviation="0" floodColor="#3D0A00" floodOpacity="1" />
            <feDropShadow dx={config.shadowOffset * 0.5} dy={config.shadowOffset} stdDeviation="0" floodColor="#5C1500" floodOpacity="1" />
          </filter>

          {/* Outer glow filter */}
          <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor="#FF6D00" floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shadow layer (darkest, furthest back) */}
        <text
          x="50%"
          y="70%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Quicksand', 'Poppins', 'Arial Rounded MT Bold', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill="#2D0A00"
          stroke="#2D0A00"
          strokeWidth={config.strokeWidth + 4}
          strokeLinejoin="round"
          style={{
            transform: `translate(${config.shadowOffset * 1.2}px, ${config.shadowOffset * 1.8}px)`,
          }}
        >
          SWIPESS
        </text>

        {/* Dark outline layer */}
        <text
          x="50%"
          y="70%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Quicksand', 'Poppins', 'Arial Rounded MT Bold', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill="#5C1500"
          stroke="#5C1500"
          strokeWidth={config.strokeWidth + 2}
          strokeLinejoin="round"
          style={{
            transform: `translate(${config.shadowOffset * 0.6}px, ${config.shadowOffset}px)`,
          }}
        >
          SWIPESS
        </text>

        {/* Main outline stroke (dark red-brown) */}
        <text
          x="50%"
          y="70%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Quicksand', 'Poppins', 'Arial Rounded MT Bold', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill="none"
          stroke="#8B2500"
          strokeWidth={config.strokeWidth}
          strokeLinejoin="round"
        >
          SWIPESS
        </text>

        {/* Main gradient fill */}
        <text
          x="50%"
          y="70%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Quicksand', 'Poppins', 'Arial Rounded MT Bold', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill={`url(#${uniqueId}-gradient)`}
        >
          SWIPESS
        </text>

        {/* Top highlight shine effect */}
        <text
          x="50%"
          y="70%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Quicksand', 'Poppins', 'Arial Rounded MT Bold', sans-serif"
          fontWeight="800"
          fontSize={config.fontSize}
          fill={`url(#${uniqueId}-highlight)`}
          style={{
            clipPath: 'inset(0 0 60% 0)',
            opacity: 0.6,
          }}
        >
          SWIPESS
        </text>
      </svg>
    </div>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
