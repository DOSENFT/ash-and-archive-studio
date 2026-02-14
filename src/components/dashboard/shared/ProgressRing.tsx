interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: 'arcane' | 'ember' | 'verdant' | 'eldritch'
  showLabel?: boolean
  label?: string
  children?: React.ReactNode
  animate?: boolean
}

const colorMap = {
  arcane: {
    stroke: '#3dd2ff',
    glow: 'rgba(61, 210, 255, 0.4)',
  },
  ember: {
    stroke: '#f4b545',
    glow: 'rgba(244, 181, 69, 0.4)',
  },
  verdant: {
    stroke: '#39d98a',
    glow: 'rgba(57, 217, 138, 0.4)',
  },
  eldritch: {
    stroke: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'arcane',
  showLabel = true,
  label,
  children,
  animate = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  const { stroke, glow } = colorMap[color]

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className={animate ? 'orbital-ring' : ''}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${glow})`,
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
        {/* Decorative dots around the ring */}
        {[0, 90, 180, 270].map((angle) => (
          <circle
            key={angle}
            cx={size / 2 + radius * Math.cos((angle * Math.PI) / 180)}
            cy={size / 2 + radius * Math.sin((angle * Math.PI) / 180)}
            r={2}
            fill="rgba(255, 255, 255, 0.3)"
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
        {showLabel && !children && (
          <>
            <span className="text-2xl font-display font-bold text-forge-0">{Math.round(progress)}%</span>
            {label && <span className="text-xs text-forge-2 mt-1">{label}</span>}
          </>
        )}
      </div>
    </div>
  )
}
