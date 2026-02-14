interface AchievementBadgeProps {
  name: string
  tier: 'bronze' | 'silver' | 'gold'
  description?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const tierClasses = {
  bronze: 'metallic-badge',
  silver: 'metallic-badge metallic-badge-silver',
  gold: 'metallic-badge metallic-badge-gold',
}

const tierTextColors = {
  bronze: 'text-amber-900',
  silver: 'text-gray-800',
  gold: 'text-amber-900',
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
}

const tierIcons = {
  bronze: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  ),
  silver: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  ),
  gold: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  ),
}

export default function AchievementBadge({
  name,
  tier,
  description,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  return (
    <div className="relative group">
      <div
        className={`
          ${sizeClasses[size]} ${tierClasses[tier]} ${tierTextColors[tier]}
          rounded-full flex items-center justify-center
          ring-2 ring-white/20 ring-offset-2 ring-offset-void-1
          transition-transform duration-base ease-forge
          hover:scale-110
        `}
        role="img"
        aria-label={`${tier} badge: ${name}`}
      >
        {tierIcons[tier]}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-3 py-2 rounded-lg bg-void-0 border border-white/10
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-fast ease-forge
            whitespace-nowrap z-10
            pointer-events-none
          "
        >
          <div className="text-sm font-medium text-forge-0">{name}</div>
          {description && <div className="text-xs text-forge-2 mt-0.5">{description}</div>}
          <div className="text-xs text-forge-2 capitalize mt-1">{tier} Tier</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-void-0 border-r border-b border-white/10 rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}
