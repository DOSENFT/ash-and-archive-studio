import { useState } from 'react'

const pillars = [
  {
    id: 'world-building',
    name: 'World Building Engine',
    shortName: 'Worlds',
    color: 'cyan',
    colorClass: 'text-arcane',
    bgClass: 'bg-arcane/10',
    borderClass: 'border-arcane/30',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    headline: 'Build Worlds That Feel Alive',
    description:
      'From sprawling cities to intricate dungeons, create environments that breathe with history, culture, and adventure waiting to happen.',
    features: [
      'Interactive city builder with district systems',
      'Procedural dungeon designer with narrative hooks',
      'Geography and climate modeling',
      'Culture and faction relationship mapping',
      'Timeline and historical event tracking',
    ],
  },
  {
    id: 'campaign-building',
    name: 'Campaign Building',
    shortName: 'Campaigns',
    color: 'amber',
    colorClass: 'text-ember',
    bgClass: 'bg-ember/10',
    borderClass: 'border-ember/30',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    headline: 'Craft Stories That Resonate',
    description:
      'Structure your narrative with professional storytelling tools. Build tension, plant seeds, and create moments players will talk about for years.',
    features: [
      'Story spine and three-act structure tools',
      'Dynamic timeline with branching possibilities',
      'Session planner with pacing guides',
      'Lore integration and continuity tracking',
      'Plot thread management system',
    ],
  },
  {
    id: 'dm-training',
    name: 'DM Training Academy',
    shortName: 'Training',
    color: 'emerald',
    colorClass: 'text-verdant',
    bgClass: 'bg-verdant/10',
    borderClass: 'border-verdant/30',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    headline: 'Train Like a Professional',
    description:
      'Access the same techniques used at top drama schools. Voice acting, improvisation, and performance skills—all adapted for the DM chair.',
    features: [
      'Voice acting fundamentals and exercises',
      'Improvisation drills and confidence builders',
      'Character physicality workshops',
      'Pacing and dramatic timing mastery',
      'Handling difficult player situations',
    ],
  },
  {
    id: 'toy-method',
    name: 'The Toy Method',
    shortName: 'Toys',
    color: 'purple',
    colorClass: 'text-eldritch',
    bgClass: 'bg-eldritch/10',
    borderClass: 'border-eldritch/30',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
        />
      </svg>
    ),
    headline: 'Our Secret Weapon',
    description:
      'The revolutionary "Toy Method" gives you modular, reusable building blocks for every aspect of your game—NPCs, locations, encounters, and more.',
    features: [
      'NPC Toys: Personality, motivation, and quirk modules',
      'World Toys: Plug-and-play locations and environments',
      'Lore Toys: Connectable history and mythology pieces',
      'Encounter Toys: Scalable challenge frameworks',
      'Combine freely for infinite variety',
    ],
  },
]

export default function FourPillars() {
  const [activeTab, setActiveTab] = useState(pillars[0].id)

  return (
    <section
      className="section-padding relative overflow-hidden"
      aria-labelledby="pillars-heading"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-void-0 via-void-1 to-void-0"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-arcane font-mono text-sm tracking-widest uppercase mb-4">
            The Complete System
          </p>
          <h2
            id="pillars-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-4"
          >
            Four Pillars of Mastery
          </h2>
          <p className="text-lg text-forge-1 max-w-2xl mx-auto">
            A comprehensive suite designed to elevate every aspect of your Dungeon Mastering.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12" role="tablist" aria-label="Feature pillars">
          {pillars.map((pillar) => (
            <button
              key={pillar.id}
              role="tab"
              aria-selected={activeTab === pillar.id}
              aria-controls={`panel-${pillar.id}`}
              id={`tab-${pillar.id}`}
              onClick={() => setActiveTab(pillar.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-display font-medium
                transition-all duration-base ease-forge
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane
                ${
                  activeTab === pillar.id
                    ? `${pillar.bgClass} ${pillar.colorClass} ${pillar.borderClass} border`
                    : 'text-forge-2 hover:text-forge-0 hover:bg-void-2'
                }
              `}
            >
              {pillar.icon}
              <span className="hidden sm:inline">{pillar.name}</span>
              <span className="sm:hidden">{pillar.shortName}</span>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            id={`panel-${pillar.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${pillar.id}`}
            hidden={activeTab !== pillar.id}
            className={activeTab === pillar.id ? 'animate-fade-in-up' : ''}
          >
            <div className="glass-card p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content */}
                <div>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${pillar.bgClass} ${pillar.borderClass} border mb-6`}
                  >
                    <span className={pillar.colorClass}>{pillar.icon}</span>
                    <span className={`font-mono text-sm ${pillar.colorClass}`}>{pillar.name}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-forge-0 mb-4">
                    {pillar.headline}
                  </h3>
                  <p className="text-lg text-forge-1 mb-8">{pillar.description}</p>

                  {/* Feature list */}
                  <ul className="space-y-3" role="list">
                    {pillar.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className={`w-5 h-5 ${pillar.colorClass} flex-shrink-0 mt-0.5`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4"
                          />
                        </svg>
                        <span className="text-forge-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual placeholder */}
                <div className="relative">
                  <div
                    className={`aspect-video rounded-2xl ${pillar.bgClass} border ${pillar.borderClass} flex items-center justify-center`}
                  >
                    <div className={`${pillar.colorClass} opacity-30`}>
                      <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {pillar.icon.props.children}
                      </svg>
                    </div>
                  </div>
                  {/* Decorative glow */}
                  <div
                    className={`absolute -inset-4 rounded-3xl blur-2xl opacity-20 -z-10`}
                    style={{
                      backgroundColor:
                        pillar.color === 'cyan'
                          ? '#3dd2ff'
                          : pillar.color === 'amber'
                          ? '#f4b545'
                          : pillar.color === 'emerald'
                          ? '#39d98a'
                          : '#8b5cf6',
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
