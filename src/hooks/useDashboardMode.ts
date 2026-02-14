import { useState, useCallback, useEffect } from 'react'

export type DashboardMode = 'studio' | 'prep' | 'training' | 'world'

export interface DashboardModeState {
  mode: DashboardMode
  setMode: (mode: DashboardMode) => void
  toggleMode: () => void
  modeLabel: string
  modeDescription: string
}

const modeInfo: Record<DashboardMode, { label: string; description: string }> = {
  studio: {
    label: 'Studio Mode',
    description: 'Full dashboard with all tools and features',
  },
  prep: {
    label: 'Prep Mode',
    description: 'Session-focused minimal view',
  },
  training: {
    label: 'Training Mode',
    description: 'Academy front-and-center',
  },
  world: {
    label: 'World Mode',
    description: 'World building tools maximized',
  },
}

const modeOrder: DashboardMode[] = ['studio', 'prep', 'training', 'world']

export function useDashboardMode(): DashboardModeState {
  const [mode, setModeState] = useState<DashboardMode>(() => {
    // Restore from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardMode')
      if (saved && modeOrder.includes(saved as DashboardMode)) {
        return saved as DashboardMode
      }
    }
    return 'studio'
  })

  const setMode = useCallback((newMode: DashboardMode) => {
    setModeState(newMode)
    localStorage.setItem('dashboardMode', newMode)
  }, [])

  const toggleMode = useCallback(() => {
    const currentIndex = modeOrder.indexOf(mode)
    const nextIndex = (currentIndex + 1) % modeOrder.length
    setMode(modeOrder[nextIndex])
  }, [mode, setMode])

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('dashboardMode', mode)
  }, [mode])

  return {
    mode,
    setMode,
    toggleMode,
    modeLabel: modeInfo[mode].label,
    modeDescription: modeInfo[mode].description,
  }
}
