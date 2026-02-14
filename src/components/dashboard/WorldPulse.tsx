import { useState } from 'react'
import { WorldActivity, formatRelativeTime } from '../../data/mockDashboardData'
import { DashboardCard } from './shared'

interface WorldPulseProps {
  activities: WorldActivity[]
  onActivityClick: (activityId: string) => void
  onQuickEdit: (activityId: string) => void
}

type FilterType = 'all' | 'npc' | 'location' | 'item' | 'lore'

const typeConfig: Record<WorldActivity['type'], { label: string; color: string; icon: JSX.Element }> = {
  npc: {
    label: 'NPC',
    color: 'text-ember bg-ember/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  location: {
    label: 'Location',
    color: 'text-verdant bg-verdant/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  item: {
    label: 'Item',
    color: 'text-arcane bg-arcane/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  lore: {
    label: 'Lore',
    color: 'text-eldritch bg-eldritch/10',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'npc', label: 'NPCs' },
  { value: 'location', label: 'Locations' },
  { value: 'item', label: 'Items' },
  { value: 'lore', label: 'Lore' },
]

interface ActivityItemProps {
  activity: WorldActivity
  onClick: () => void
  onQuickEdit: () => void
  isNew?: boolean
}

function ActivityItem({ activity, onClick, onQuickEdit, isNew = false }: ActivityItemProps) {
  const config = typeConfig[activity.type]

  return (
    <div className="relative group">
      {/* Timeline connector */}
      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-white/10" aria-hidden="true" />

      <div className="flex gap-3">
        {/* Timeline dot */}
        <div className="relative z-10 flex-shrink-0">
          <div className={`timeline-dot ${config.color.split(' ')[1]}`}>
            {isNew && (
              <span className="absolute inset-0 rounded-full bg-current animate-ping opacity-75" />
            )}
          </div>
        </div>

        {/* Content */}
        <button
          onClick={onClick}
          className="
            flex-1 min-w-0 p-3 -mt-1 rounded-lg
            bg-void-2/30 hover:bg-void-2/50
            text-left transition-all duration-fast ease-forge
            group/item
          "
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Type badge + action */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${config.color}`}>
                  {config.icon}
                  {config.label}
                </span>
                <span className="text-xs text-forge-2">
                  {activity.action === 'created' ? 'Created' : 'Edited'}
                </span>
              </div>

              {/* Name */}
              <div className="text-sm font-medium text-forge-0 truncate group-hover/item:text-arcane transition-colors">
                {activity.name}
              </div>

              {/* Timestamp */}
              <div className="text-xs text-forge-2 mt-0.5">
                {formatRelativeTime(activity.timestamp)}
              </div>
            </div>

            {/* Quick Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickEdit()
              }}
              className="
                opacity-0 group-hover/item:opacity-100
                p-1.5 rounded-lg bg-void-2/50
                text-forge-2 hover:text-arcane hover:bg-void-2
                transition-all duration-fast
              "
              aria-label={`Quick edit ${activity.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </button>
      </div>
    </div>
  )
}

export default function WorldPulse({
  activities,
  onActivityClick,
  onQuickEdit,
}: WorldPulseProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter)

  // Consider items from the last hour as "new"
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  return (
    <DashboardCard depth={2} padding="none" className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-forge-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-arcane animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
            </svg>
            World Pulse
          </h3>
          <span className="text-xs text-forge-2">{filteredActivities.length} items</span>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar" role="tablist">
          {filterOptions.map(option => (
            <button
              key={option.value}
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap
                transition-all duration-fast ease-forge
                ${filter === option.value
                  ? 'bg-arcane/20 text-arcane'
                  : 'bg-void-2/30 text-forge-2 hover:text-forge-0 hover:bg-void-2/50'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-forge-2">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1 text-forge-2/70">Start building your world</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick(activity.id)}
              onQuickEdit={() => onQuickEdit(activity.id)}
              isNew={activity.timestamp > oneHourAgo && index === 0}
            />
          ))
        )}
      </div>
    </DashboardCard>
  )
}
