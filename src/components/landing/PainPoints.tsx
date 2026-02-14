const painPoints = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    ),
    title: '"My NPCs all sound the same"',
    description:
      'You want to bring characters to life, but every tavern keeper sounds like your last tavern keeper. Voice acting feels impossible without training.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: '"My notes are everywhere"',
    description:
      "Google Docs, Notion, sticky notes, that one napkin... Your world lives in a dozen places and you can't find anything when you need it.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: '"Players went off-script again"',
    description:
      "They ignored your dungeon, befriended the villain, and now they're opening a bakery. Your improv skills aren't ready for this.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: '"I prep for 8 hours, run for 3"',
    description:
      'The prep-to-play ratio is destroying you. You spend more time preparing than actually playing, and burnout is setting in.',
  },
]

export default function PainPoints() {
  return (
    <section
      id="pain-points"
      className="section-padding relative overflow-hidden"
      aria-labelledby="pain-points-heading"
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 bg-ember"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-ember font-mono text-sm tracking-widest uppercase mb-4">
            The Struggle Is Real
          </p>
          <h2
            id="pain-points-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-4"
          >
            Sound Familiar?
          </h2>
          <p className="text-lg text-forge-1 max-w-2xl mx-auto">
            Every DM has been here. The question is: will you stay stuck, or will you level up?
          </p>
        </div>

        {/* Pain point cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {painPoints.map((point, index) => (
            <article
              key={index}
              className="glass-card glow-border p-8 group hover:bg-void-2/80 transition-colors duration-enter"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-ember/10 border border-ember/30 flex items-center justify-center text-ember mb-6 group-hover:scale-110 transition-transform duration-enter">
                {point.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-display font-semibold text-forge-0 mb-3">
                {point.title}
              </h3>

              {/* Description */}
              <p className="text-forge-1 leading-relaxed">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
