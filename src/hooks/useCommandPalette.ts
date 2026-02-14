import { useState, useCallback, useEffect, useMemo } from 'react'

export interface CommandItem {
  id: string
  type: 'navigation' | 'action' | 'search' | 'create'
  label: string
  description?: string
  icon?: string
  shortcut?: string
  pillarColor?: string
  action: () => void
}

export interface CommandPaletteState {
  isOpen: boolean
  query: string
  setQuery: (query: string) => void
  open: () => void
  close: () => void
  toggle: () => void
  results: CommandItem[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  executeSelected: () => void
  moveUp: () => void
  moveDown: () => void
}

// Default commands available in the command palette
const defaultCommands: Omit<CommandItem, 'action'>[] = [
  // Navigation
  { id: 'nav-dashboard', type: 'navigation', label: 'Go to Dashboard', icon: 'home', shortcut: 'G D' },
  { id: 'nav-campaign', type: 'navigation', label: 'Go to Campaign', icon: 'map', shortcut: 'G C' },
  { id: 'nav-academy', type: 'navigation', label: 'Go to Academy', icon: 'book', shortcut: 'G A' },
  { id: 'nav-settings', type: 'navigation', label: 'Go to Settings', icon: 'cog', shortcut: 'G S' },

  // Create actions
  { id: 'create-session', type: 'create', label: 'New Session', icon: 'calendar', shortcut: 'N S', pillarColor: 'arcane' },
  { id: 'create-npc', type: 'create', label: 'New NPC', icon: 'user', shortcut: 'N N', pillarColor: 'ember' },
  { id: 'create-location', type: 'create', label: 'New Location', icon: 'globe', shortcut: 'N L', pillarColor: 'verdant' },
  { id: 'create-encounter', type: 'create', label: 'New Encounter', icon: 'sword', shortcut: 'N E', pillarColor: 'eldritch' },

  // Actions
  { id: 'action-prep', type: 'action', label: 'Enter Prep Mode', icon: 'clipboard', description: 'Focus on session preparation' },
  { id: 'action-training', type: 'action', label: 'Start Training', icon: 'flame', description: 'Continue your training journey' },
  { id: 'action-quick-npc', type: 'action', label: 'Quick NPC Generator', icon: 'users', description: 'Generate a random NPC' },
]

export function useCommandPalette(
  customCommands: CommandItem[] = [],
  onNavigate?: (path: string) => void
): CommandPaletteState {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Merge default commands with custom commands
  const allCommands = useMemo(() => {
    const commands: CommandItem[] = defaultCommands.map(cmd => ({
      ...cmd,
      action: () => {
        if (cmd.type === 'navigation' && onNavigate) {
          const paths: Record<string, string> = {
            'nav-dashboard': '/dashboard',
            'nav-campaign': '/campaign',
            'nav-academy': '/academy',
            'nav-settings': '/settings',
          }
          onNavigate(paths[cmd.id] || '/')
        }
        setIsOpen(false)
      },
    }))
    return [...commands, ...customCommands]
  }, [customCommands, onNavigate])

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) {
      return allCommands.slice(0, 8) // Show first 8 when no query
    }

    const lowerQuery = query.toLowerCase()
    return allCommands
      .filter(cmd =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.type.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10)
  }, [query, allCommands])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
  }, [results.length])

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
  }, [results.length])

  const executeSelected = useCallback(() => {
    const selected = results[selectedIndex]
    if (selected) {
      selected.action()
      close()
    }
  }, [results, selectedIndex, close])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K or /
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      } else if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        open()
      }

      // Handle navigation when open
      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          close()
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          moveUp()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          moveDown()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          executeSelected()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, toggle, open, close, moveUp, moveDown, executeSelected])

  return {
    isOpen,
    query,
    setQuery,
    open,
    close,
    toggle,
    results,
    selectedIndex,
    setSelectedIndex,
    executeSelected,
    moveUp,
    moveDown,
  }
}
