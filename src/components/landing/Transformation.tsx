const transformations = [
  {
    title: 'NPCs that players remember forever',
    description:
      'Master voice techniques, physicality, and character depth that make every NPC feel like a real person.',
  },
  {
    title: 'One source of truth for your world',
    description:
      'Everything connected, searchable, and accessible. Your world lives in one place, beautifully organized.',
  },
  {
    title: 'Improv confidence that never falters',
    description:
      'Handle any curveball with grace. When players zig, you zag brilliantly.',
  },
  {
    title: 'Prep in minutes, not hours',
    description:
      'Efficient systems and reusable assets mean more playing, less preparing.',
  },
  {
    title: 'Sessions that feel like magic',
    description:
      'That flow state where everything clicks—tension, humor, drama, and triumph in perfect balance.',
  },
]

export default function Transformation() {
  return (
    <section
      className="section-padding relative overflow-hidden bg-void-1"
      aria-labelledby="transformation-heading"
    >
      {/* Background accents */}
      <div
        className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 bg-verdant -translate-y-1/2"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-5 bg-arcane"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Illustration placeholder */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square max-w-lg mx-auto relative">
              {/* Decorative frame */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-verdant/20 via-arcane/10 to-eldritch/20 p-[1px]">
                <div className="w-full h-full rounded-3xl bg-void-1 flex items-center justify-center overflow-hidden">
                  {/* Abstract illustration */}
                  <svg
                    className="w-3/4 h-3/4 text-verdant/30"
                    viewBox="0 0 200 200"
                    fill="none"
                    aria-hidden="true"
                  >
                    {/* DM figure silhouette */}
                    <circle cx="100" cy="60" r="25" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M60 180 L100 100 L140 180"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Rising stars/sparks */}
                    <circle cx="50" cy="50" r="3" fill="currentColor" className="animate-pulse" />
                    <circle cx="150" cy="40" r="2" fill="currentColor" className="animate-pulse animation-delay-200" />
                    <circle cx="170" cy="80" r="3" fill="currentColor" className="animate-pulse animation-delay-500" />
                    <circle cx="30" cy="90" r="2" fill="currentColor" className="animate-pulse animation-delay-300" />
                    {/* Spell effects */}
                    <path
                      d="M70 120 Q100 70 130 120"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass-card px-4 py-2 animate-fade-in-up animation-delay-200">
                <span className="text-sm font-mono text-verdant">+500% Confidence</span>
              </div>
              <div className="absolute -bottom-4 -left-4 glass-card px-4 py-2 animate-fade-in-up animation-delay-500">
                <span className="text-sm font-mono text-arcane">Pro-Level Skills</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p className="text-verdant font-mono text-sm tracking-widest uppercase mb-4">
              The Transformation
            </p>
            <h2
              id="transformation-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-6"
            >
              Imagine Running a Session Where{' '}
              <span className="text-verdant">Everything Clicks</span>
            </h2>
            <p className="text-lg text-forge-1 mb-10">
              This isn't wishful thinking. It's what happens when you train like the masters do.
            </p>

            {/* Transformation checklist */}
            <ul className="space-y-4" role="list">
              {transformations.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-verdant/20 border border-verdant/50 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-verdant"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-forge-0 font-semibold">{item.title}</h3>
                    <p className="text-forge-2 text-sm mt-1">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
