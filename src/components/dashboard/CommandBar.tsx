import { DashboardMode } from '../../hooks/useDashboardMode'

interface CommandBarProps {
  onOpenPalette: () => void
  mode: DashboardMode
  onModeChange: (mode: DashboardMode) => void
  userName: string
  userTier: 'ember' | 'forge' | 'archive'
  notificationCount?: number
}

const modeConfig: Record<DashboardMode, { label: string; icon: JSX.Element }> = {
  studio: {
    label: 'Studio',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  prep: {
    label: 'Prep',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  training: {
    label: 'Training',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  world: {
    label: 'World',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

const tierColors = {
  ember: 'text-ember',
  forge: 'text-arcane',
  archive: 'text-eldritch',
}

export default function CommandBar({
  onOpenPalette,
  mode,
  onModeChange,
  userName,
  userTier,
  notificationCount = 0,
}: CommandBarProps) {
  const modes: DashboardMode[] = ['studio', 'prep', 'training', 'world']

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-card mx-4 mt-4 px-4 py-2 flex items-center gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arcane to-eldritch flex items-center justify-center">
            <svg className="w-5 h-5 text-void-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-semibold text-forge-0 hidden sm:block">The Studio</span>
        </div>

        {/* Spotlight Search Button */}
        <button
          onClick={onOpenPalette}
          className="
            flex-1 max-w-md flex items-center gap-3 px-4 py-2
            bg-void-2/50 border border-white/5 rounded-xl
            text-forge-2 text-sm
            hover:bg-void-2 hover:border-white/10
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane
            transition-all duration-base ease-forge
            group
          "
          aria-label="Open command palette"
        >
          <svg className="w-4 h-4 group-hover:text-arcane transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Search or type a command...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden md:flex ml-auto items-center gap-1 px-2 py-0.5 bg-void-0/50 rounded text-xs text-forge-2">
            <span className="text-forge-1">⌘</span>K
          </kbd>
        </button>

        {/* Mode Toggle */}
        <div className="hidden md:flex items-center bg-void-2/30 rounded-lg p-1" role="tablist" aria-label="Dashboard mode">
          {modes.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => onModeChange(m)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                transition-all duration-fast ease-forge
                ${mode === m
                  ? 'bg-void-1 text-arcane shadow-sm'
                  : 'text-forge-2 hover:text-forge-0'
                }
              `}
            >
              {modeConfig[m].icon}
              <span className="hidden lg:inline">{modeConfig[m].label}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* New Session Quick Action */}
          <button
            className="
              hidden sm:flex items-center gap-2 px-3 py-1.5
              bg-gradient-to-r from-arcane/20 to-eldritch/20
              border border-arcane/30 rounded-lg
              text-arcane text-sm font-medium
              hover:from-arcane/30 hover:to-eldritch/30 hover:border-arcane/50
              transition-all duration-base ease-forge
            "
            aria-label="Create new session"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden lg:inline">New</span>
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 text-forge-2 hover:text-forge-0 transition-colors"
            aria-label={`${notificationCount} notifications`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-ember rounded-full" />
            )}
          </button>

          {/* User Avatar */}
          <button
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-void-2/50 transition-colors"
            aria-label="User menu"
          >
            <div className={`w-8 h-8 rounded-full bg-void-2 border-2 ${tierColors[userTier].replace('text-', 'border-')} flex items-center justify-center`}>
              <span className="text-sm font-display font-bold text-forge-0">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
