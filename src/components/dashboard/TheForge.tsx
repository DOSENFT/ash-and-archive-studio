import { Training, Skill, TrainingModule } from '../../data/mockDashboardData'
import { DashboardCard, ForgeProgressBar } from './shared'

interface TheForgeProps {
  training: Training
  hasUrgentCommandTasks: boolean
  recommendedTrainingNeed: string
  completedCommandTasks: number
  onContinueTraining: () => void
  onSkillClick: (skillName: string) => void
  onModuleClick: (moduleId: string) => void
}


const pillarColors: Record<string, 'arcane' | 'ember' | 'verdant' | 'eldritch'> = {
  voice: 'arcane',
  improv: 'ember',
  worldbuilding: 'verdant',
  storytelling: 'eldritch',
}

const skillColorMap: Record<string, 'arcane' | 'ember' | 'verdant' | 'eldritch'> = {
  arcane: 'arcane',
  ember: 'ember',
  verdant: 'verdant',
  eldritch: 'eldritch',
}

interface AcademyHighlightCardProps {
  currentTrack: Skill
  module: TrainingModule
  recommendedNeed: string
  onClick: () => void
}

function AcademyHighlightCard({ currentTrack, module, recommendedNeed, onClick }: AcademyHighlightCardProps) {
  const color = pillarColors[module.pillar] || 'arcane'
  const colorClasses = {
    arcane: 'border-arcane/30 hover:border-arcane/50',
    ember: 'border-ember/30 hover:border-ember/50',
    verdant: 'border-verdant/30 hover:border-verdant/50',
    eldritch: 'border-eldritch/30 hover:border-eldritch/50',
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg
        bg-void-2/30 border ${colorClasses[color]}
        text-left transition-all duration-base ease-forge
        hover:bg-void-2/50 group
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-forge-2 uppercase tracking-wider">Academy Highlight</span>
        <span className="text-xs text-forge-2">{module.duration}</span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-forge-2 mb-1 uppercase tracking-wide">Current Track</p>
        <div className="text-sm font-medium text-forge-0">{currentTrack.name}</div>
        <ForgeProgressBar
          progress={currentTrack.progress}
          showPercentage={false}
          color={(skillColorMap[currentTrack.color] || 'arcane')}
          size="sm"
        />
      </div>

      <div className="mb-3">
        <p className="text-xs text-forge-2 mb-1 uppercase tracking-wide">Next Milestone</p>
        <div className="text-sm font-medium text-forge-0 group-hover:text-arcane transition-colors">
          {module.name}
        </div>
      </div>

      <div className="text-xs text-forge-2">
        Recommended for campaign need: <span className="text-forge-1">{recommendedNeed}</span>
      </div>
    </button>
  )
}

export default function TheForge({
  training,
  hasUrgentCommandTasks,
  recommendedTrainingNeed,
  completedCommandTasks,
  onContinueTraining,
  onSkillClick,
  onModuleClick,
}: TheForgeProps) {
  const { currentStreak, skills, nextModule } = training
  const currentTrack = skills.reduce((topSkill, skill) => (
    skill.progress > topSkill.progress ? skill : topSkill
  ), skills[0])

  const ctaStyles = hasUrgentCommandTasks
    ? 'bg-void-2/20 border border-void-0 text-forge-2 hover:text-forge-1 hover:bg-void-2/40'
    : 'bg-gradient-to-r from-ember/20 to-orange-500/20 border border-ember/30 text-ember hover:from-ember/30 hover:to-orange-500/30 hover:border-ember/50'

  return (
    <DashboardCard depth={2} padding="none" className="relative overflow-hidden forge-fire">
      {/* Forge Fire Effect (left edge) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-t from-ember via-orange-500 to-transparent opacity-60"
        aria-hidden="true"
      />

      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-forge-1">The Forge</h3>
            {/* Streak Badge */}
            {currentStreak > 0 && (
              <div className={`
                flex items-center gap-1.5 px-2 py-0.5 rounded-full
                bg-ember/20 text-ember text-xs font-medium
                ${currentStreak >= 7 ? 'animate-pulse' : ''}
              `}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                <span>{currentStreak} day streak</span>
              </div>
            )}
          </div>
        </div>

        {/* One highlighted academy card by default */}
        {nextModule && (
          <div className="mb-4">
            <AcademyHighlightCard
              currentTrack={currentTrack}
              module={nextModule}
              recommendedNeed={recommendedTrainingNeed}
              onClick={() => onModuleClick(nextModule.id)}
            />
          </div>
        )}

        <p className="text-xs text-forge-2 mb-4">
          {completedCommandTasks > 0
            ? `Academy engagement is now tracking after ${completedCommandTasks} completed command task${completedCommandTasks === 1 ? '' : 's'}.`
            : 'Complete a command task to unlock post-task academy engagement tracking.'}
        </p>

        {/* CTA */}
        <button
          onClick={onContinueTraining}
          className={`
            w-full py-2.5 px-4 rounded-lg font-medium text-sm
            transition-all duration-base ease-forge
            flex items-center justify-center gap-2
            ${ctaStyles}
          `}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          Continue Training
        </button>

        <button
          onClick={() => onSkillClick(currentTrack.name)}
          className="w-full mt-2 py-2 text-xs text-forge-2 hover:text-forge-1 transition-colors"
        >
          Explore all academy tracks
        </button>
      </div>
    </DashboardCard>
  )
}
