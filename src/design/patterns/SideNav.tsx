import { forwardRef, type HTMLAttributes } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  pillar?: 'arcane' | 'ember' | 'verdant' | 'eldritch'
}

const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/app/home',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Academy',
    href: '/app/academy',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    pillar: 'verdant',
  },
  {
    label: 'World',
    href: '/app/world',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    pillar: 'arcane',
  },
  {
    label: 'Campaign',
    href: '/app/campaign',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    pillar: 'ember',
  },
  {
    label: 'Toybox',
    href: '/app/toybox',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
    pillar: 'eldritch',
  },
  {
    label: 'Library',
    href: '/app/library',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
]

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    href: '/app/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

const pillarColors = {
  arcane: 'text-arcane',
  ember: 'text-ember',
  verdant: 'text-verdant',
  eldritch: 'text-eldritch',
}

const pillarBgColors = {
  arcane: 'bg-arcane/10',
  ember: 'bg-ember/10',
  verdant: 'bg-verdant/10',
  eldritch: 'bg-eldritch/10',
}

export interface SideNavProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  onToggle?: () => void
}

export const SideNav = forwardRef<HTMLElement, SideNavProps>(
  ({ collapsed = false, onToggle, className, ...props }, ref) => {
    const location = useLocation()

    const renderNavItem = (item: NavItem) => {
      const isActive = location.pathname.startsWith(item.href)
      const activeColor = item.pillar ? pillarColors[item.pillar] : 'text-arcane'
      const activeBg = item.pillar ? pillarBgColors[item.pillar] : 'bg-arcane/10'

      return (
        <NavLink
          key={item.href}
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            'text-forge-1 hover:text-forge-0 hover:bg-void-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-void-0',
            isActive && [activeBg, activeColor, 'font-medium'],
            collapsed && 'justify-center px-2'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className={cn(isActive && activeColor)}>{item.icon}</span>
          {!collapsed && (
            <span className="flex-1 truncate">{item.label}</span>
          )}
          {!collapsed && item.badge && (
            <span className="text-xs font-mono bg-void-2 px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </NavLink>
      )
    }

    return (
      <nav
        ref={ref}
        className={cn(
          'flex flex-col h-full',
          'bg-void-1 border-r border-white/5',
          'transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
        aria-label="Main navigation"
        {...props}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-white/5',
          collapsed && 'justify-center px-2'
        )}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arcane to-ember flex items-center justify-center">
              <span className="text-void-0 font-bold text-sm">A</span>
            </div>
            {!collapsed && (
              <span className="font-display font-semibold text-forge-0">
                Ash & Archive
              </span>
            )}
          </div>
        </div>

        {/* Main nav */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/5" />

        {/* Bottom nav */}
        <div className="py-4 px-2 space-y-1">
          {bottomNavItems.map(renderNavItem)}
        </div>

        {/* Collapse toggle */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center h-12 mx-2 mb-2 rounded-lg',
              'text-forge-2 hover:text-forge-0 hover:bg-void-2',
              'transition-colors duration-[180ms]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={cn(
                'w-5 h-5 transition-transform duration-[240ms]',
                collapsed && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </nav>
    )
  }
)

SideNav.displayName = 'SideNav'
