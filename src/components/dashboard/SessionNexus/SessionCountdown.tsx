import { ProgressRing } from '../shared'
import { useSessionProximity, SessionProximity } from '../../../hooks/useSessionProximity'
import { formatSessionDate } from '../../../data/mockDashboardData'

interface SessionCountdownProps {
  sessionDate: Date | null
  campaignName: string
  players: string[]
  onEnterPrepMode: () => void
}

const proximityConfig: Record<SessionProximity, { ringColor: 'arcane' | 'ember' | 'verdant' | 'eldritch'; animate: boolean }> = {
  none: { ringColor: 'arcane', animate: false },
  past: { ringColor: 'arcane', animate: false },
  distant: { ringColor: 'arcane', animate: true },
  approaching: { ringColor: 'ember', animate: true },
  imminent: { ringColor: 'ember', animate: false },
  today: { ringColor: 'ember', animate: false },
}

export default function SessionCountdown({
  sessionDate,
  campaignName,
  players,
  onEnterPrepMode,
}: SessionCountdownProps) {
  const proximityState = useSessionProximity(sessionDate)
  const { proximity, daysUntil, hoursUntil, message, isUrgent } = proximityState
  const { ringColor, animate } = proximityConfig[proximity]

  // Calculate progress for ring (0-100, based on 14-day countdown)
  const maxDays = 14
  const progress = sessionDate
    ? Math.max(0, Math.min(100, ((maxDays - Math.max(0, daysUntil)) / maxDays) * 100))
    : 0

  if (!sessionDate) {
    return (
      <div className="card-depth-2 p-4 text-center">
        <div className="text-forge-2 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No session scheduled</p>
        </div>
        <button
          className="btn-ghost text-sm py-2 px-4 w-full"
          onClick={onEnterPrepMode}
        >
          Schedule Session
        </button>
      </div>
    )
  }

  return (
    <div className={`card-depth-2 p-4 ${isUrgent ? 'pulse-ember' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-forge-1">Next Session</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isUrgent ? 'bg-ember/20 text-ember' : 'bg-arcane/20 text-arcane'
        }`}>
          {message}
        </span>
      </div>

      {/* Countdown Ring */}
      <div className="flex justify-center mb-4">
        <ProgressRing
          progress={progress}
          size={140}
          strokeWidth={8}
          color={ringColor}
          showLabel={false}
          animate={animate}
        >
          <div className="text-center">
            {proximity === 'today' ? (
              <>
                <div className="text-3xl font-display font-bold text-ember animate-pulse">
                  {hoursUntil}h
                </div>
                <div className="text-xs text-forge-2 uppercase tracking-wider">
                  Showtime
                </div>
              </>
            ) : proximity === 'imminent' ? (
              <>
                <div className="text-3xl font-display font-bold text-ember">
                  {hoursUntil}h
                </div>
                <div className="text-xs text-forge-2 uppercase tracking-wider">
                  Tomorrow
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-display font-bold text-forge-0">
                  {daysUntil}
                </div>
                <div className="text-xs text-forge-2 uppercase tracking-wider">
                  Days
                </div>
              </>
            )}
          </div>
        </ProgressRing>
      </div>

      {/* Session Details */}
      <div className="space-y-2 mb-4">
        <div className="text-center">
          <div className="text-sm font-medium text-forge-0 truncate">{campaignName}</div>
          <div className="text-xs text-forge-2">{formatSessionDate(sessionDate)}</div>
        </div>

        {/* Players */}
        <div className="flex items-center justify-center gap-1">
          <div className="flex -space-x-2">
            {players.slice(0, 4).map((player, i) => (
              <div
                key={player}
                className="w-6 h-6 rounded-full bg-void-2 border-2 border-void-1 flex items-center justify-center"
                title={player}
                style={{ zIndex: players.length - i }}
              >
                <span className="text-[10px] font-medium text-forge-1">
                  {player.charAt(0)}
                </span>
              </div>
            ))}
          </div>
          {players.length > 4 && (
            <span className="text-xs text-forge-2">+{players.length - 4}</span>
          )}
          <span className="text-xs text-forge-2 ml-1">players</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onEnterPrepMode}
        className={`
          w-full py-2 px-4 rounded-lg font-medium text-sm
          transition-all duration-base ease-forge
          ${isUrgent
            ? 'bg-ember/20 text-ember border border-ember/30 hover:bg-ember/30'
            : 'bg-arcane/10 text-arcane border border-arcane/30 hover:bg-arcane/20'
          }
        `}
      >
        Enter Prep Mode
      </button>
    </div>
  )
}
