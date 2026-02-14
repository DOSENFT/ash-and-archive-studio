import SessionCountdown from './SessionCountdown'
import PrepChecklist from './PrepChecklist'
import SessionHistory from './SessionHistory'
import { NextSession, PrepTask, Session } from '../../../data/mockDashboardData'

interface SessionNexusProps {
  nextSession: NextSession | null
  prepTasks: PrepTask[]
  recentSessions: Session[]
  onEnterPrepMode: () => void
  onTaskToggle: (taskId: string) => void
  onAddTask: (text: string) => void
  onSessionClick: (sessionId: string) => void
  onViewAllSessions: () => void
  collapsed?: boolean
}

export default function SessionNexus({
  nextSession,
  prepTasks,
  recentSessions,
  onEnterPrepMode,
  onTaskToggle,
  onAddTask,
  onSessionClick,
  onViewAllSessions,
  collapsed = false,
}: SessionNexusProps) {
  if (collapsed) {
    // Collapsed sidebar view - icons only
    return (
      <aside className="w-16 flex flex-col gap-2 p-2" aria-label="Session controls">
        <button
          onClick={onEnterPrepMode}
          className="
            w-12 h-12 rounded-xl bg-void-1/80 border border-white/10
            flex items-center justify-center
            text-forge-2 hover:text-arcane hover:border-arcane/30
            transition-all duration-base ease-forge
          "
          aria-label="Session countdown"
          title="Next session"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={() => {}}
          className="
            w-12 h-12 rounded-xl bg-void-1/80 border border-white/10
            flex items-center justify-center
            text-forge-2 hover:text-arcane hover:border-arcane/30
            transition-all duration-base ease-forge
          "
          aria-label="Prep checklist"
          title="Prep checklist"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>

        <button
          onClick={onViewAllSessions}
          className="
            w-12 h-12 rounded-xl bg-void-1/80 border border-white/10
            flex items-center justify-center
            text-forge-2 hover:text-arcane hover:border-arcane/30
            transition-all duration-base ease-forge
          "
          aria-label="Session history"
          title="Session history"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4" aria-label="Session controls">
      <SessionCountdown
        sessionDate={nextSession?.date ?? null}
        campaignName={nextSession?.campaignName ?? ''}
        players={nextSession?.players ?? []}
        onEnterPrepMode={onEnterPrepMode}
      />

      <PrepChecklist
        tasks={prepTasks}
        onTaskToggle={onTaskToggle}
        onAddTask={onAddTask}
      />

      <SessionHistory
        sessions={recentSessions}
        onSessionClick={onSessionClick}
        onViewAll={onViewAllSessions}
      />
    </aside>
  )
}

export { SessionCountdown, PrepChecklist, SessionHistory }
