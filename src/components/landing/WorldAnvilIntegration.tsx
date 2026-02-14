const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: 'Two-Way Sync',
    description: 'Changes flow seamlessly between platforms. Edit in either place, stay synchronized.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Canonical Integrity',
    description: 'Your World Anvil articles remain the source of truth. Never lose your lore.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: 'Selective Import',
    description: 'Choose exactly what to bring in. Import whole worlds or individual articles.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-Time Updates',
    description: 'No manual refresh needed. See changes instantly across both platforms.',
  },
]

export default function WorldAnvilIntegration() {
  return (
    <section
      className="section-padding relative overflow-hidden bg-void-1"
      aria-labelledby="integration-heading"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-void-0/50 to-transparent"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arcane/10 border border-arcane/30 mb-6">
              <svg className="w-4 h-4 text-arcane" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="font-mono text-sm text-arcane">Official Integration</span>
            </div>

            <h2
              id="integration-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-6"
            >
              Already Using{' '}
              <span className="text-arcane">World Anvil</span>?
            </h2>

            <p className="text-lg text-forge-1 mb-8">
              Bring your existing worldbuilding into The Studio. Our deep integration means you
              don't have to choose—use both tools together for the ultimate workflow.
            </p>

            {/* Feature grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-arcane/10 border border-arcane/30 flex items-center justify-center text-arcane">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-forge-0 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-forge-2">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#pricing" className="btn-primary">
                Connect Your World
              </a>
              <a
                href="#"
                className="btn-ghost"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Sync diagram */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto">
              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-arcane to-eldritch flex items-center justify-center z-10">
                <svg className="w-12 h-12 text-void-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>

              {/* Platform 1: The Studio */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 glass-card p-4 w-40 text-center">
                <div className="w-12 h-12 rounded-full bg-ember/20 border border-ember/50 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-ember" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C12 2 8 6 8 10c0 2.21 1.79 4 4 4s4-1.79 4-4c0-4-4-8-4-8z" />
                  </svg>
                </div>
                <p className="font-display font-semibold text-forge-0 text-sm">The Studio</p>
              </div>

              {/* Platform 2: World Anvil */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 glass-card p-4 w-40 text-center">
                <div className="w-12 h-12 rounded-full bg-arcane/20 border border-arcane/50 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-arcane" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
                  </svg>
                </div>
                <p className="font-display font-semibold text-forge-0 text-sm">World Anvil</p>
              </div>

              {/* Animated connection lines */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 200 200"
                aria-hidden="true"
              >
                {/* Line from Studio to center */}
                <line
                  x1="100"
                  y1="40"
                  x2="100"
                  y2="85"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                {/* Line from center to World Anvil */}
                <line
                  x1="100"
                  y1="115"
                  x2="100"
                  y2="160"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-pulse animation-delay-500"
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3dd2ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating data particles */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-arcane animate-bounce" />
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-eldritch animate-bounce animation-delay-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
