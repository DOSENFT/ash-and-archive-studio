import { useMemo, useState } from 'react'
import { Campaign, CampaignCanonItem, PlotThread, WorldCanonFact } from '../../data/mockDashboardData'
import { DashboardCard } from './shared'

interface CampaignHubProps {
  campaign: Campaign | null
  worldCanonFacts: WorldCanonFact[]
  campaignCanonItems: CampaignCanonItem[]
  unresolvedConflictCount: number
  onNewSession: () => void
  onViewCampaign: () => void
  onViewWorldMap: () => void
  onPlotThreadClick: (threadId: string) => void
  onResolveConflict: (campaignItemId: string) => void
}

const statusColors: Record<PlotThread['status'], { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-verdant/10', text: 'text-verdant', dot: 'bg-verdant' },
  dormant: { bg: 'bg-ember/10', text: 'text-ember', dot: 'bg-ember' },
  resolved: { bg: 'bg-forge-2/10', text: 'text-forge-2', dot: 'bg-forge-2' },
}

interface StatBadgeProps {
  label: string
  value: number
  color: 'arcane' | 'ember' | 'verdant' | 'eldritch'
}

function StatBadge({ label, value, color }: StatBadgeProps) {
  const colorClasses = {
    arcane: 'bg-arcane/10 text-arcane border-arcane/30',
    ember: 'bg-ember/10 text-ember border-ember/30',
    verdant: 'bg-verdant/10 text-verdant border-verdant/30',
    eldritch: 'bg-eldritch/10 text-eldritch border-eldritch/30',
  }

  return (
    <div className={`px-3 py-2 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-lg font-display font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  )
}

export default function CampaignHub({
  campaign,
  worldCanonFacts,
  campaignCanonItems,
  unresolvedConflictCount,
  onNewSession,
  onViewCampaign,
  onViewWorldMap,
  onPlotThreadClick,
  onResolveConflict,
}: CampaignHubProps) {
  const [selectedConflictItemId, setSelectedConflictItemId] = useState<string | null>(null)

  const selectedConflictItem = useMemo(
    () => campaignCanonItems.find(item => item.id === selectedConflictItemId),
    [campaignCanonItems, selectedConflictItemId]
  )

  const selectedWorldFact = useMemo(() => {
    if (!selectedConflictItem?.conflict) return null
    return worldCanonFacts.find(fact => fact.id === selectedConflictItem.conflict?.worldFactId) ?? null
  }, [selectedConflictItem, worldCanonFacts])

  const worldFactsById = useMemo<Map<string, WorldCanonFact>>(() => {
    const entries = worldCanonFacts.map((fact): [string, WorldCanonFact] => [fact.id, fact])
    return new Map(entries)
  }, [worldCanonFacts])

  if (!campaign) {
    return (
      <DashboardCard depth={1} padding="lg" className="relative overflow-hidden">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-void-2 flex items-center justify-center">
            <svg className="w-10 h-10 text-forge-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-forge-0 mb-2">No Active Campaign</h3>
          <p className="text-forge-2 mb-6">Start your journey by creating a new campaign</p>
          <button className="btn-primary">
            Create Campaign
          </button>
        </div>
      </DashboardCard>
    )
  }

  const activeThreads = campaign.plotThreads.filter(t => t.status === 'active')
  const otherThreads = campaign.plotThreads.filter(t => t.status !== 'active')

  return (
    <DashboardCard depth={1} padding="none" className="relative overflow-hidden">
      {/* Background Art with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: campaign.artUrl ? `url(${campaign.artUrl})` : 'none',
          backgroundColor: 'rgb(20, 29, 40)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-void-1 via-void-1/80 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-arcane uppercase tracking-wider font-medium">Active Campaign</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-ember/15 text-ember border border-ember/40">
                {unresolvedConflictCount} unresolved conflict{unresolvedConflictCount === 1 ? '' : 's'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-forge-0 mb-1">
              {campaign.name}
            </h2>
            <p className="text-sm text-forge-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {campaign.currentArc}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={onNewSession}
              className="
                px-4 py-2 rounded-lg
                bg-gradient-to-r from-arcane/20 to-eldritch/20
                border border-arcane/30
                text-arcane text-sm font-medium
                hover:from-arcane/30 hover:to-eldritch/30
                transition-all duration-base ease-forge
              "
            >
              New Session
            </button>
            <button
              onClick={onViewCampaign}
              className="
                px-4 py-2 rounded-lg
                bg-void-2/50 border border-white/10
                text-forge-1 text-sm font-medium
                hover:bg-void-2 hover:text-forge-0
                transition-all duration-base ease-forge
              "
            >
              View
            </button>
            <button
              onClick={onViewWorldMap}
              className="
                p-2 rounded-lg
                bg-void-2/50 border border-white/10
                text-forge-1
                hover:bg-void-2 hover:text-forge-0
                transition-all duration-base ease-forge
              "
              aria-label="World Map"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatBadge label="Sessions" value={campaign.stats.sessions} color="arcane" />
          <StatBadge label="NPCs" value={campaign.stats.npcs} color="ember" />
          <StatBadge label="Locations" value={campaign.stats.locations} color="verdant" />
          <StatBadge label="Players" value={campaign.stats.players} color="eldritch" />
        </div>

        {/* Plot Threads */}
        <div className="mb-5">
          <h3 className="text-sm font-medium text-forge-1 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Plot Threads
          </h3>

          <div className="flex flex-wrap gap-2">
            {activeThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onPlotThreadClick(thread.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium
                  ${statusColors[thread.status].bg} ${statusColors[thread.status].text}
                  border border-current/20
                  hover:border-current/40 hover:scale-[1.02]
                  transition-all duration-fast ease-forge
                  flex items-center gap-2
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[thread.status].dot}`} />
                {thread.name}
              </button>
            ))}

            {otherThreads.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-forge-2">
                <span className="px-2 py-1">+{otherThreads.length} more</span>
              </div>
            )}
          </div>
        </div>

        {/* Canon Boundary Layer */}
        <div className="rounded-xl border border-white/10 bg-void-2/30 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-medium text-forge-0">Canon Boundary Layer</h3>
            <div className="flex items-center gap-2 text-[11px] text-forge-2">
              <span className="px-2 py-0.5 rounded bg-arcane/15 text-arcane border border-arcane/30">World Canon</span>
              <span className="px-2 py-0.5 rounded bg-eldritch/15 text-eldritch border border-eldritch/30">Campaign Canon</span>
            </div>
          </div>

          <div className="space-y-2">
            {campaignCanonItems.map((item) => {
              const inheritedFacts = item.inheritedFactIds
                .map(id => worldFactsById.get(id))
                .filter((fact): fact is WorldCanonFact => Boolean(fact))

              return (
                <div key={item.id} className="rounded-lg border border-white/10 bg-void-1/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm text-forge-0 font-medium">{item.title}</div>
                      <div className="text-xs text-forge-2">{item.summary}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-eldritch/15 text-eldritch border border-eldritch/30 text-[11px]">
                      Campaign Canon
                    </span>
                  </div>

                  <div className="text-[11px] text-forge-2 mb-2">
                    <span className="text-forge-1">Dependency / Inheritance:</span>{' '}
                    {inheritedFacts.length > 0
                      ? inheritedFacts.map(fact => fact.title).join(', ')
                      : 'No inherited world facts'}
                  </div>

                  {item.conflict?.status === 'unresolved' && (
                    <div className="rounded-md border border-ember/40 bg-ember/10 px-2.5 py-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-ember">
                        Conflict Flag: diverges from <strong>World Canon</strong>
                      </div>
                      <button
                        onClick={() => setSelectedConflictItemId(item.id)}
                        className="px-2.5 py-1 rounded bg-ember/20 hover:bg-ember/30 border border-ember/40 text-[11px] text-ember font-medium transition-colors"
                      >
                        Resolve Conflict
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Constellation Decoration */}
        <svg
          className="absolute bottom-4 right-4 w-32 h-32 opacity-10 pointer-events-none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="2" fill="#3dd2ff" />
          <circle cx="80" cy="30" r="3" fill="#3dd2ff" />
          <circle cx="50" cy="70" r="2" fill="#3dd2ff" />
          <circle cx="30" cy="50" r="1.5" fill="#8b5cf6" />
          <circle cx="70" cy="80" r="2" fill="#8b5cf6" />
          <line className="constellation-line" x1="20" y1="20" x2="80" y2="30" />
          <line className="constellation-line" x1="80" y1="30" x2="50" y2="70" />
          <line className="constellation-line" x1="50" y1="70" x2="20" y2="20" />
          <line className="constellation-line" x1="30" y1="50" x2="70" y2="80" />
        </svg>
      </div>

      {selectedConflictItem?.conflict && selectedWorldFact && (
        <div className="absolute inset-0 z-20 bg-void-0/90 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto rounded-xl border border-white/10 bg-void-1 p-4 md:p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h4 className="text-lg font-display font-semibold text-forge-0">Resolve Conflict</h4>
                <p className="text-xs text-forge-2 mt-1">Side-by-side compare for {selectedConflictItem.title}</p>
              </div>
              <button
                onClick={() => setSelectedConflictItemId(null)}
                className="px-2 py-1 rounded border border-white/10 text-xs text-forge-1 hover:text-forge-0 hover:bg-void-2/60 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-arcane/30 bg-arcane/10 p-3">
                <div className="text-xs text-arcane font-medium mb-1">World Canon (Source of Truth)</div>
                <div className="text-sm text-forge-0 mb-1">{selectedWorldFact.title}</div>
                <p className="text-xs text-forge-1">{selectedConflictItem.conflict.worldValue}</p>
              </div>

              <div className="rounded-lg border border-eldritch/30 bg-eldritch/10 p-3">
                <div className="text-xs text-eldritch font-medium mb-1">Campaign Canon (In-use in sessions)</div>
                <div className="text-sm text-forge-0 mb-1">{selectedConflictItem.title}</div>
                <p className="text-xs text-forge-1">{selectedConflictItem.conflict.campaignValue}</p>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-void-2/40 p-3 mb-4 text-xs text-forge-1">
              <span className="text-forge-0 font-medium">Context:</span> {selectedConflictItem.conflict.note}
            </div>

            <button
              onClick={() => {
                onResolveConflict(selectedConflictItem.id)
                setSelectedConflictItemId(null)
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-arcane/30 to-eldritch/30 border border-arcane/40 text-arcane text-sm font-medium hover:from-arcane/40 hover:to-eldritch/40 transition-colors"
            >
              One-click Reconcile
            </button>
          </div>
        </div>
      )}
    </DashboardCard>
  )
}
