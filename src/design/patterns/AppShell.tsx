import { useState, useCallback, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'
import { CommandPalette } from './CommandPalette'

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/app/home': [{ label: 'Home' }],
  '/app/academy': [{ label: 'Academy' }],
  '/app/world': [{ label: 'World Building' }],
  '/app/campaign': [{ label: 'Campaign' }],
  '/app/toybox': [{ label: 'Toybox' }],
  '/app/library': [{ label: 'Library' }],
  '/app/settings': [{ label: 'Settings' }],
}

export interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Get breadcrumbs for current route
  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const path = location.pathname

    // Check for exact match first
    if (routeBreadcrumbs[path]) {
      return routeBreadcrumbs[path]
    }

    // Build breadcrumbs from path segments
    const segments = path.split('/').filter(Boolean)
    const crumbs: BreadcrumbItem[] = []
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1

      // Format segment for display
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      label = label.replace(/-/g, ' ')

      crumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      })
    })

    return crumbs
  }, [location.pathname])

  // Handle keyboard shortcut for command palette
  const handleSearchClick = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])

  return (
    <div className="flex h-screen bg-void-0 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SideNav
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-void-0/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <SideNav />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar
          breadcrumbs={<Breadcrumbs items={getBreadcrumbs()} />}
          onMenuClick={() => setMobileMenuOpen(true)}
          onSearchClick={handleSearchClick}
        />

        {/* Page content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'px-4 py-6 lg:px-8 lg:py-8'
          )}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  )
}
