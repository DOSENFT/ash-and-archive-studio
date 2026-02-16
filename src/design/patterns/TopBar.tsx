import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TopBarProps extends HTMLAttributes<HTMLElement> {
  breadcrumbs?: ReactNode
  actions?: ReactNode
  onMenuClick?: () => void
  onSearchClick?: () => void
}

export const TopBar = forwardRef<HTMLElement, TopBarProps>(
  (
    {
      breadcrumbs,
      actions,
      onMenuClick,
      onSearchClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between h-16 px-4 lg:px-6',
          'bg-void-0/80 backdrop-blur-md',
          'border-b border-white/5',
          'sticky top-0 z-40',
          className
        )}
        {...props}
      >
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className={cn(
                'lg:hidden p-2 -ml-2 rounded-lg',
                'text-forge-1 hover:text-forge-0 hover:bg-void-2',
                'transition-colors duration-[180ms]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane'
              )}
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'bg-void-2 text-forge-2',
                'hover:text-forge-0 hover:bg-void-2/80',
                'transition-colors duration-[180ms]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane',
                'hidden sm:flex'
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm">Search</span>
              <kbd className="text-xs font-mono bg-void-1 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Mobile search */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className={cn(
                'p-2 rounded-lg sm:hidden',
                'text-forge-1 hover:text-forge-0 hover:bg-void-2',
                'transition-colors duration-[180ms]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane'
              )}
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}

          {/* Custom actions */}
          {actions}

          {/* Notifications */}
          <button
            className={cn(
              'relative p-2 rounded-lg',
              'text-forge-1 hover:text-forge-0 hover:bg-void-2',
              'transition-colors duration-[180ms]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane'
            )}
            aria-label="Notifications"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ember rounded-full" />
          </button>

          {/* User avatar */}
          <button
            className={cn(
              'flex items-center gap-2 p-1 rounded-lg',
              'hover:bg-void-2',
              'transition-colors duration-[180ms]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane'
            )}
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eldritch to-arcane flex items-center justify-center">
              <span className="text-white font-semibold text-sm">DM</span>
            </div>
          </button>
        </div>
      </header>
    )
  }
)

TopBar.displayName = 'TopBar'
