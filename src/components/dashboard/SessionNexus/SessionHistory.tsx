import { Session } from '../../../data/mockDashboardData'

interface SessionHistoryProps {
  sessions: Session[]
  onSessionClick: (sessionId: string) => void
  onViewAll: () => void
}

// Color palette for campaigns
const campaignColors: Record<string, string> = {
  'The Shattered Crown': 'border-l-arcane',
  'default': 'border-l-eldritch',
}

function getCampaignColor(campaignName: string): string {
  return campaignColors[campaignName] || campaignColors.default
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-ember' : 'text-forge-2/30'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ))}
    </div>
  )
}

export default function SessionHistory({
  sessions,
  onSessionClick,
  onViewAll,
}: SessionHistoryProps) {
  const displaySessions = sessions.slice(0, 5)

  return (
    <div className="card-depth-2 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-forge-1">Recent Sessions</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-arcane hover:text-arcane/80 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Session Stack */}
      {sessions.length === 0 ? (
        <div className="text-center py-6 text-forge-2">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">No sessions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displaySessions.map((session, index) => (
            <button
              key={session.id}
              onClick={() => onSessionClick(session.id)}
              className={`
                w-full text-left p-3 rounded-lg
                bg-void-2/30 border-l-2 ${getCampaignColor(session.campaign)}
                hover:bg-void-2/50 transition-all duration-fast ease-forge
                group
              `}
              style={{
                transform: `translateY(${index * 2}px)`,
                zIndex: displaySessions.length - index,
              }}
              aria-label={`Session: ${session.name}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-forge-0 truncate group-hover:text-arcane transition-colors">
                    {session.name}
                  </div>
                  <div className="text-xs text-forge-2 mt-0.5">
                    {formatDate(session.date)}
                  </div>
                </div>
                {session.rating && (
                  <StarRating rating={session.rating} />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
