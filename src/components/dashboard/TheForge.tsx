import { Training, Skill, Achievement, TrainingModule } from '../../data/mockDashboardData'
import { DashboardCard, ForgeProgressBar, AchievementBadge } from './shared'

interface TheForgeProps {
  training: Training
  onContinueTraining: () => void
  onSkillClick: (skillName: string) => void
  onModuleClick: (moduleId: string) => void
}

const skillIcons: Record<string, JSX.Element> = {
  microphone: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  lightning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  globe: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  book: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
}

const pillarColors: Record<string, 'arcane' | 'ember' | 'verdant' | 'eldritch'> = {
  voice: 'arcane',
  improv: 'ember',
  worldbuilding: 'verdant',
  storytelling: 'eldritch',
}

// Static color classes for Tailwind (can't use template literals)
const skillIconColorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  arcane: {
    bg: 'bg-arcane/10',
    text: 'text-arcane',
    hover: 'group-hover:bg-arcane/20',
  },
  ember: {
    bg: 'bg-ember/10',
    text: 'text-ember',
    hover: 'group-hover:bg-ember/20',
  },
  verdant: {
    bg: 'bg-verdant/10',
    text: 'text-verdant',
    hover: 'group-hover:bg-verdant/20',
  },
  eldritch: {
    bg: 'bg-eldritch/10',
    text: 'text-eldritch',
    hover: 'group-hover:bg-eldritch/20',
  },
}

const skillColorMap: Record<string, 'arcane' | 'ember' | 'verdant' | 'eldritch'> = {
  arcane: 'arcane',
  ember: 'ember',
  verdant: 'verdant',
  eldritch: 'eldritch',
}

interface SkillRowProps {
  skill: Skill
  onClick: () => void
}

function SkillRow({ skill, onClick }: SkillRowProps) {
  const icon = skillIcons[skill.icon] || skillIcons.book
  const color = skillColorMap[skill.color] || 'arcane'
  const iconColors = skillIconColorClasses[color] || skillIconColorClasses.arcane

  return (
    <button
      onClick={onClick}
      className="w-full group"
      aria-label={`${skill.name}: ${skill.progress}% complete`}
    >
      <div className="flex items-center gap-3 mb-1.5">
        <div className={`p-1.5 rounded-lg ${iconColors.bg} ${iconColors.text} ${iconColors.hover} transition-colors`}>
          {icon}
        </div>
        <span className="text-sm text-forge-1 group-hover:text-forge-0 transition-colors flex-1 text-left">
          {skill.name}
        </span>
        <span className="text-xs font-mono text-forge-2">{skill.progress}%</span>
      </div>
      <ForgeProgressBar
        progress={skill.progress}
        showPercentage={false}
        color={color}
        size="sm"
      />
    </button>
  )
}

interface NextModuleCardProps {
  module: TrainingModule
  onClick: () => void
}

function NextModuleCard({ module, onClick }: NextModuleCardProps) {
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
        w-full p-3 rounded-lg
        bg-void-2/30 border ${colorClasses[color]}
        text-left transition-all duration-base ease-forge
        hover:bg-void-2/50 group
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-forge-2 uppercase tracking-wider">Up Next</span>
        <span className="text-xs text-forge-2">{module.duration}</span>
      </div>
      <div className="text-sm font-medium text-forge-0 group-hover:text-arcane transition-colors">
        {module.name}
      </div>
    </button>
  )
}

export default function TheForge({
  training,
  onContinueTraining,
  onSkillClick,
  onModuleClick,
}: TheForgeProps) {
  const { currentStreak, skills, nextModule, recentAchievements } = training

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

        {/* Skills Grid */}
        <div className="space-y-4 mb-4">
          {skills.map((skill) => (
            <SkillRow
              key={skill.name}
              skill={skill}
              onClick={() => onSkillClick(skill.name)}
            />
          ))}
        </div>

        {/* Next Module */}
        {nextModule && (
          <div className="mb-4">
            <NextModuleCard
              module={nextModule}
              onClick={() => onModuleClick(nextModule.id)}
            />
          </div>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs text-forge-2 uppercase tracking-wider mb-2">Recent Achievements</h4>
            <div className="flex gap-2">
              {recentAchievements.slice(0, 3).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  tier={achievement.tier}
                  description={achievement.description}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onContinueTraining}
          className="
            w-full py-2.5 px-4 rounded-lg font-medium text-sm
            bg-gradient-to-r from-ember/20 to-orange-500/20
            border border-ember/30
            text-ember
            hover:from-ember/30 hover:to-orange-500/30 hover:border-ember/50
            transition-all duration-base ease-forge
            flex items-center justify-center gap-2
          "
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          Continue Training
        </button>
      </div>
    </DashboardCard>
  )
}
