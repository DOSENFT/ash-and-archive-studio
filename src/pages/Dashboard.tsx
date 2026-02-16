import { useState, useCallback, useEffect } from 'react'
import CommandBar from '../components/dashboard/CommandBar'
import CommandPalette from '../components/dashboard/CommandPalette'
import SessionNexus from '../components/dashboard/SessionNexus'
import CampaignHub from '../components/dashboard/CampaignHub'
import TheForge from '../components/dashboard/TheForge'
import WorldPulse from '../components/dashboard/WorldPulse'
import ToyDock from '../components/dashboard/ToyDock'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { useDashboardMode } from '../hooks/useDashboardMode'
import { useSessionProximity } from '../hooks/useSessionProximity'
import {
  getMockDashboardData,
  DashboardData,
  PrepTask,
} from '../data/mockDashboardData'

export default function Dashboard() {
  // Load mock data
  const [data, setData] = useState<DashboardData>(() => getMockDashboardData())

  // Hooks
  const { mode, setMode } = useDashboardMode()
  const commandPalette = useCommandPalette([], (path) => {
    console.log('Navigate to:', path)
  })
  const sessionProximity = useSessionProximity(data.nextSession?.date ?? null)

  // State for collapsed sidebar (responsive)
  const [sidebarCollapsed] = useState(false)

  const [completedCommandTasks, setCompletedCommandTasks] = useState(0)
  const [academyEngagementAfterTask, setAcademyEngagementAfterTask] = useState(0)

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Handlers
  const handleEnterPrepMode = useCallback(() => {
    setMode('prep')
  }, [setMode])

  const handleTaskToggle = useCallback((taskId: string) => {
    setData(prev => {
      const toggledTask = prev.prepTasks.find(task => task.id === taskId)
      const willCompleteTask = toggledTask ? !toggledTask.completed : false

      if (willCompleteTask) {
        setCompletedCommandTasks(current => current + 1)
      }

      return {
        ...prev,
        prepTasks: prev.prepTasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      }
    })
  }, [])

  const handleAddTask = useCallback((text: string) => {
    const newTask: PrepTask = {
      id: `prep-${Date.now()}`,
      text,
      completed: false,
    }
    setData(prev => ({
      ...prev,
      prepTasks: [...prev.prepTasks, newTask],
    }))
  }, [])

  const handleSessionClick = useCallback((sessionId: string) => {
    console.log('View session:', sessionId)
  }, [])

  const handleViewAllSessions = useCallback(() => {
    console.log('View all sessions')
  }, [])

  const handleNewSession = useCallback(() => {
    console.log('Create new session')
  }, [])

  const handleViewCampaign = useCallback(() => {
    console.log('View campaign')
  }, [])

  const handleViewWorldMap = useCallback(() => {
    console.log('View world map')
  }, [])

  const handlePlotThreadClick = useCallback((threadId: string) => {
    console.log('View plot thread:', threadId)
  }, [])

  const handleContinueTraining = useCallback(() => {
    setMode('training')
    if (completedCommandTasks > 0) {
      setAcademyEngagementAfterTask(value => value + 1)
    }
    console.log('Continue training')
  }, [completedCommandTasks, setMode])

  const handleSkillClick = useCallback((skillName: string) => {
    console.log('View skill:', skillName)
  }, [])

  const handleModuleClick = useCallback((moduleId: string) => {
    if (completedCommandTasks > 0) {
      setAcademyEngagementAfterTask(value => value + 1)
    }
    console.log('Start module:', moduleId)
  }, [completedCommandTasks])

  const handleActivityClick = useCallback((activityId: string) => {
    console.log('View activity:', activityId)
  }, [])

  const handleQuickEdit = useCallback((activityId: string) => {
    console.log('Quick edit:', activityId)
  }, [])

  const handleToyClick = useCallback((toyId: string) => {
    console.log('Use toy:', toyId)
  }, [])

  const handleQuickCreate = useCallback(() => {
    console.log('Quick create')
  }, [])

  // Determine layout based on mode and session proximity
  const showExpandedSessionNexus = mode === 'prep' || sessionProximity.proximity === 'today' || sessionProximity.proximity === 'imminent'
  const showExpandedWorldPulse = mode === 'world'
  const hasUrgentCommandTasks = data.prepTasks.some(task => !task.completed)

  const getRecommendedTrainingNeed = useCallback(() => {
    const firstIncompleteTask = data.prepTasks.find(task => !task.completed)
    const taskText = firstIncompleteTask?.text.toLowerCase() ?? ''

    if (taskText.includes('voice') || taskText.includes('npc')) return 'Character voice delivery for key NPC scenes'
    if (taskText.includes('combat') || taskText.includes('encounter')) return 'Pacing encounters under pressure'
    if (taskText.includes('handout') || taskText.includes('letter') || taskText.includes('lore')) return 'Storytelling clarity for handoff moments'

    const currentArc = data.activeCampaign?.currentArc.toLowerCase() ?? ''
    if (currentArc.includes('siege') || currentArc.includes('war')) return 'High-stakes scene framing and tension control'

    return 'Adaptive improvisation for live campaign pivots'
  }, [data.activeCampaign?.currentArc, data.prepTasks])

  const recommendedTrainingNeed = getRecommendedTrainingNeed()

  return (
    <div className="min-h-screen bg-void-0 flex flex-col">
      {/* Command Bar */}
      <CommandBar
        onOpenPalette={commandPalette.open}
        mode={mode}
        onModeChange={setMode}
        userName={data.user.name}
        userTier={data.user.tier}
        notificationCount={2}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        query={commandPalette.query}
        onQueryChange={commandPalette.setQuery}
        onClose={commandPalette.close}
        results={commandPalette.results}
        selectedIndex={commandPalette.selectedIndex}
        onSelect={commandPalette.setSelectedIndex}
        onExecute={commandPalette.executeSelected}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Session Nexus */}
            <div className={`
              ${showExpandedSessionNexus ? 'lg:w-96' : 'lg:w-80'}
              ${sidebarCollapsed ? 'lg:w-16' : ''}
              transition-all duration-complex ease-forge
            `}>
              <SessionNexus
                nextSession={data.nextSession}
                prepTasks={data.prepTasks}
                recentSessions={data.recentSessions}
                onEnterPrepMode={handleEnterPrepMode}
                onTaskToggle={handleTaskToggle}
                onAddTask={handleAddTask}
                onSessionClick={handleSessionClick}
                onViewAllSessions={handleViewAllSessions}
                collapsed={sidebarCollapsed}
              />
            </div>

            {/* Right Column - Main Content Area */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Campaign Hub - Hero Card */}
              <CampaignHub
                campaign={data.activeCampaign}
                onNewSession={handleNewSession}
                onViewCampaign={handleViewCampaign}
                onViewWorldMap={handleViewWorldMap}
                onPlotThreadClick={handlePlotThreadClick}
              />

              {/* Command Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* World Pulse */}
                <div className={`${showExpandedWorldPulse ? 'md:col-span-2' : ''} min-h-[400px]`}>
                  <WorldPulse
                    activities={data.worldActivity}
                    onActivityClick={handleActivityClick}
                    onQuickEdit={handleQuickEdit}
                  />
                </div>
              </div>

              {/* Academy Layer (lower priority placement) */}
              <div>
                <TheForge
                  training={data.training}
                  hasUrgentCommandTasks={hasUrgentCommandTasks}
                  recommendedTrainingNeed={recommendedTrainingNeed}
                  completedCommandTasks={completedCommandTasks}
                  onContinueTraining={handleContinueTraining}
                  onSkillClick={handleSkillClick}
                  onModuleClick={handleModuleClick}
                />
                {academyEngagementAfterTask > 0 && (
                  <p className="text-xs text-forge-2 mt-2 px-1">
                    Academy engagements after command completion: {academyEngagementAfterTask}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toy Dock - Bottom Bar */}
      <ToyDock
        toys={data.recentToys}
        favorites={[]}
        onToyClick={handleToyClick}
        onQuickCreate={handleQuickCreate}
      />

      {/* Ambient Ember Particles (session approaching) */}
      {!prefersReducedMotion && sessionProximity.isUrgent && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="ember-particle animate-ember-rise"
              style={{
                left: `${15 + i * 15}%`,
                bottom: '-10px',
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
