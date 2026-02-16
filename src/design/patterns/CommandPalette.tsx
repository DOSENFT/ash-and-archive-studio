import {
  forwardRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type HTMLAttributes,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  label: string
  description?: string
  shortcut?: string
  icon?: React.ReactNode
  action?: () => void
  href?: string
  group: string
}

const defaultCommands: Command[] = [
  // Navigation
  {
    id: 'home',
    label: 'Go to Home',
    shortcut: '⌘D',
    href: '/app/home',
    group: 'Navigation',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'academy',
    label: 'Go to Academy',
    shortcut: '⌘1',
    href: '/app/academy',
    group: 'Navigation',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'world',
    label: 'Go to World Building',
    shortcut: '⌘2',
    href: '/app/world',
    group: 'Navigation',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'campaign',
    label: 'Go to Campaign',
    shortcut: '⌘3',
    href: '/app/campaign',
    group: 'Navigation',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
  },
  {
    id: 'toybox',
    label: 'Go to Toybox',
    shortcut: '⌘4',
    href: '/app/toybox',
    group: 'Navigation',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
  // Actions
  {
    id: 'new-campaign',
    label: 'Create New Campaign',
    group: 'Actions',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: 'start-training',
    label: 'Start Training Drill',
    group: 'Actions',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Open Settings',
    shortcut: '⌘,',
    href: '/app/settings',
    group: 'Actions',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export interface CommandPaletteProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  commands?: Command[]
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ open, onClose, commands = defaultCommands, className, ...props }, ref) => {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Filter commands based on search
    const filteredCommands = useMemo(() => {
      if (!search) return commands
      const lower = search.toLowerCase()
      return commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(lower) ||
          cmd.description?.toLowerCase().includes(lower) ||
          cmd.group.toLowerCase().includes(lower)
      )
    }, [commands, search])

    // Group commands
    const groupedCommands = useMemo(() => {
      const groups: Record<string, Command[]> = {}
      filteredCommands.forEach((cmd) => {
        if (!groups[cmd.group]) groups[cmd.group] = []
        groups[cmd.group].push(cmd)
      })
      return groups
    }, [filteredCommands])

    // Get flat list for keyboard navigation
    const flatCommands = useMemo(() => {
      return Object.values(groupedCommands).flat()
    }, [groupedCommands])

    // Handle command execution
    const executeCommand = useCallback(
      (command: Command) => {
        if (command.href) {
          navigate(command.href)
        } else if (command.action) {
          command.action()
        }
        onClose()
        setSearch('')
        setSelectedIndex(0)
      },
      [navigate, onClose]
    )

    // Keyboard navigation
    useEffect(() => {
      if (!open) return

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setSelectedIndex((i) =>
              i < flatCommands.length - 1 ? i + 1 : 0
            )
            break
          case 'ArrowUp':
            e.preventDefault()
            setSelectedIndex((i) =>
              i > 0 ? i - 1 : flatCommands.length - 1
            )
            break
          case 'Enter':
            e.preventDefault()
            if (flatCommands[selectedIndex]) {
              executeCommand(flatCommands[selectedIndex])
            }
            break
          case 'Escape':
            e.preventDefault()
            onClose()
            setSearch('')
            setSelectedIndex(0)
            break
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, flatCommands, selectedIndex, executeCommand, onClose])

    // Reset selection when search changes
    useEffect(() => {
      setSelectedIndex(0)
    }, [search])

    // Global keyboard shortcut
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          if (open) {
            onClose()
          } else {
            // Parent should handle opening
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    if (!open) return null

    let currentIndex = -1

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-void-0/80 backdrop-blur-sm z-50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Palette */}
        <div
          ref={ref}
          className={cn(
            'fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl',
            'bg-void-1 border border-white/10 rounded-2xl shadow-2xl',
            'z-50 overflow-hidden',
            'animate-[scaleIn_240ms_cubic-bezier(0.22,1,0.36,1)]',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          {...props}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-white/10">
            <svg
              className="w-5 h-5 text-forge-2 shrink-0"
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className={cn(
                'flex-1 py-4 bg-transparent',
                'text-forge-0 placeholder:text-forge-2',
                'focus:outline-none'
              )}
              autoFocus
            />
            <kbd className="text-xs font-mono text-forge-2 bg-void-2 px-2 py-1 rounded">
              ESC
            </kbd>
          </div>

          {/* Command list */}
          <div className="max-h-80 overflow-y-auto py-2">
            {flatCommands.length === 0 ? (
              <div className="py-8 text-center text-forge-2">
                No commands found
              </div>
            ) : (
              Object.entries(groupedCommands).map(([group, cmds]) => (
                <div key={group}>
                  <div className="px-4 py-2 text-xs font-mono text-forge-2 uppercase tracking-wide">
                    {group}
                  </div>
                  {cmds.map((cmd) => {
                    currentIndex++
                    const isSelected = currentIndex === selectedIndex
                    const itemIndex = currentIndex

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2',
                          'text-left transition-colors duration-[120ms]',
                          isSelected
                            ? 'bg-arcane/10 text-forge-0'
                            : 'text-forge-1 hover:bg-void-2'
                        )}
                      >
                        {cmd.icon && (
                          <span className={isSelected ? 'text-arcane' : 'text-forge-2'}>
                            {cmd.icon}
                          </span>
                        )}
                        <span className="flex-1">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="text-xs font-mono text-forge-2 bg-void-2 px-2 py-0.5 rounded">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </>
    )
  }
)

CommandPalette.displayName = 'CommandPalette'
