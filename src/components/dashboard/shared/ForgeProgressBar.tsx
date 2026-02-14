interface ForgeProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  color?: 'arcane' | 'ember' | 'verdant' | 'eldritch'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const colorGradients = {
  arcane: 'from-arcane via-cyan-400 to-arcane',
  ember: 'from-amber-500 via-orange-500 to-amber-500',
  verdant: 'from-verdant via-emerald-400 to-verdant',
  eldritch: 'from-eldritch via-purple-400 to-eldritch',
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const glowColors = {
  arcane: 'shadow-[0_0_10px_rgba(61,210,255,0.5)]',
  ember: 'shadow-[0_0_10px_rgba(244,181,69,0.5)]',
  verdant: 'shadow-[0_0_10px_rgba(57,217,138,0.5)]',
  eldritch: 'shadow-[0_0_10px_rgba(139,92,246,0.5)]',
}

export default function ForgeProgressBar({
  progress,
  label,
  showPercentage = true,
  color = 'ember',
  size = 'md',
  animated = true,
}: ForgeProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-forge-1">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-mono text-forge-2">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full bg-void-2/50 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} rounded-full
            bg-gradient-to-r ${colorGradients[color]}
            ${glowColors[color]}
            ${animated ? 'transition-all duration-complex ease-forge' : ''}
          `}
          style={{
            width: `${clampedProgress}%`,
            backgroundSize: '200% 100%',
            animation: animated ? 'emberShimmer 3s ease-in-out infinite' : 'none',
          }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  )
}
