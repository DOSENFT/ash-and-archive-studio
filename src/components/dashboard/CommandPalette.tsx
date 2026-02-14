import { useEffect, useRef } from 'react'
import { CommandItem } from '../../hooks/useCommandPalette'

interface CommandPaletteProps {
  isOpen: boolean
  query: string
  onQueryChange: (query: string) => void
  onClose: () => void
  results: CommandItem[]
  selectedIndex: number
  onSelect: (index: number) => void
  onExecute: () => void
}

const typeIcons: Record<CommandItem['type'], JSX.Element> = {
  navigation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  action: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  create: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
}

const pillarColorClasses: Record<string, string> = {
  arcane: 'text-arcane bg-arcane/10',
  ember: 'text-ember bg-ember/10',
  verdant: 'text-verdant bg-verdant/10',
  eldritch: 'text-eldritch bg-eldritch/10',
}

export default function CommandPalette({
  isOpen,
  query,
  onQueryChange,
  onClose,
  results,
  selectedIndex,
  onSelect,
  onExecute,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="command-palette-backdrop animate-fade-in-up"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="command-palette animate-scale-in" style={{ animationDuration: '0.2s' }}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-forge-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onExecute()
              }
            }}
            className="command-palette-input pl-14"
            placeholder="Search commands, navigate, or create..."
            aria-label="Search commands"
            aria-controls="command-results"
            aria-activedescendant={results[selectedIndex]?.id}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <kbd className="px-2 py-1 bg-void-2/50 rounded text-xs text-forge-2">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div
          id="command-results"
          ref={listRef}
          className="command-palette-results"
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <div className="px-6 py-8 text-center text-forge-2">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No commands found</p>
              <p className="text-xs mt-1 text-forge-2/70">Try a different search term</p>
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={item.id}
                id={item.id}
                role="option"
                aria-selected={index === selectedIndex}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(index)
                  onExecute()
                }}
                onMouseEnter={() => onSelect(index)}
              >
                {/* Type Icon */}
                <div className={`p-2 rounded-lg ${item.pillarColor ? pillarColorClasses[item.pillarColor] : 'text-forge-2 bg-void-2/50'}`}>
                  {typeIcons[item.type]}
                </div>

                {/* Label & Description */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-forge-0 truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-forge-2 truncate">{item.description}</div>
                  )}
                </div>

                {/* Shortcut */}
                {item.shortcut && (
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-void-2/50 rounded text-xs text-forge-2 font-mono">
                    {item.shortcut}
                  </kbd>
                )}

                {/* Type Badge */}
                <span className="hidden md:block text-xs text-forge-2 capitalize">{item.type}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-forge-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-void-2/50 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-void-2/50 rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-void-2/50 rounded">ESC</kbd>
              Close
            </span>
          </div>
          <span className="text-forge-2/60">Type / for quick commands</span>
        </div>
      </div>
    </div>
  )
}
