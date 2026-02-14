import { useState } from 'react'
import { Toy } from '../../data/mockDashboardData'

interface ToyDockProps {
  toys: Toy[]
  favorites?: Toy[]
  onToyClick: (toyId: string) => void
  onQuickCreate: () => void
  onToyDragStart?: (toyId: string) => void
  onToyDragEnd?: () => void
}

type FilterType = 'recent' | 'favorites' | 'npc' | 'location' | 'encounter' | 'item' | 'lore'

const typeIcons: Record<Toy['type'], JSX.Element> = {
  npc: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  encounter: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  item: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  lore: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
}

const typeColors: Record<Toy['type'], string> = {
  npc: 'hover:border-ember/50 hover:bg-ember/10 hover:text-ember',
  location: 'hover:border-verdant/50 hover:bg-verdant/10 hover:text-verdant',
  encounter: 'hover:border-arcane/50 hover:bg-arcane/10 hover:text-arcane',
  item: 'hover:border-eldritch/50 hover:bg-eldritch/10 hover:text-eldritch',
  lore: 'hover:border-forge-1/50 hover:bg-forge-1/10 hover:text-forge-1',
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'npc', label: 'NPCs' },
  { value: 'location', label: 'Locations' },
  { value: 'encounter', label: 'Encounters' },
]

interface ToyItemProps {
  toy: Toy
  onClick: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

function ToyItem({ toy, onClick, onDragStart, onDragEnd }: ToyItemProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('toy-id', toy.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd?.()
  }

  return (
    <button
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        dock-item flex flex-col items-center gap-1.5 min-w-[72px]
        ${typeColors[toy.type]}
        ${isDragging ? 'dragging' : ''}
      `}
      aria-label={`${toy.name} (${toy.type})`}
      title={toy.name}
    >
      <div className="text-forge-1">
        {typeIcons[toy.type]}
      </div>
      <span className="text-[10px] text-forge-2 truncate max-w-full px-1">
        {toy.name.length > 10 ? toy.name.slice(0, 10) + '...' : toy.name}
      </span>
    </button>
  )
}

export default function ToyDock({
  toys,
  favorites = [],
  onToyClick,
  onQuickCreate,
  onToyDragStart,
  onToyDragEnd,
}: ToyDockProps) {
  const [filter, setFilter] = useState<FilterType>('recent')

  const displayToys = (() => {
    switch (filter) {
      case 'favorites':
        return favorites
      case 'npc':
      case 'location':
      case 'encounter':
      case 'item':
      case 'lore':
        return toys.filter(t => t.type === filter)
      default:
        return toys
    }
  })()

  return (
    <div className="glass-card px-4 py-3 mx-4 mb-4">
      <div className="flex items-center gap-4">
        {/* Filter Chips */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-medium
                transition-all duration-fast ease-forge
                ${filter === option.value
                  ? 'bg-arcane/20 text-arcane'
                  : 'text-forge-2 hover:text-forge-0 hover:bg-void-2/50'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-8 bg-white/10" />

        {/* Toys Scroll Area */}
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {displayToys.length === 0 ? (
              <div className="flex items-center justify-center py-2 px-4 text-sm text-forge-2">
                No toys in this category
              </div>
            ) : (
              displayToys.map(toy => (
                <ToyItem
                  key={toy.id}
                  toy={toy}
                  onClick={() => onToyClick(toy.id)}
                  onDragStart={() => onToyDragStart?.(toy.id)}
                  onDragEnd={onToyDragEnd}
                />
              ))
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-white/10" />

        {/* Quick Create Button */}
        <button
          onClick={onQuickCreate}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            bg-gradient-to-r from-arcane/20 to-eldritch/20
            border border-arcane/30
            text-arcane text-sm font-medium
            hover:from-arcane/30 hover:to-eldritch/30 hover:border-arcane/50
            transition-all duration-base ease-forge
            flex-shrink-0
            breathing-glow
          "
          aria-label="Quick create"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>
    </div>
  )
}
