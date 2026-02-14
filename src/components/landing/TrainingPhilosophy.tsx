const credentials = [
  'RADA-inspired voice techniques',
  'Juilliard improvisation frameworks',
  'Carnegie Mellon storytelling methods',
  'UCB improv comedy principles',
  'Professional acting coaching adapted for tabletop',
]

export default function TrainingPhilosophy() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      aria-labelledby="philosophy-heading"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-void-0 via-void-1 to-void-2"
        aria-hidden="true"
      />

      {/* Decorative elements */}
      <div
        className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl opacity-10 bg-verdant"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 left-10 w-80 h-80 rounded-full blur-3xl opacity-5 bg-arcane"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Editorial layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Main content - 7 columns */}
          <div className="lg:col-span-7">
            <p className="text-verdant font-mono text-sm tracking-widest uppercase mb-4">
              Our Philosophy
            </p>
            <h2
              id="philosophy-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-8"
            >
              Trained Like Artists.{' '}
              <span className="text-verdant">Ready Like Professionals.</span>
            </h2>

            {/* Lead paragraph - larger text */}
            <p className="text-xl text-forge-0 leading-relaxed mb-8">
              We don't believe in shortcuts. Every technique in The Studio is borrowed from the
              world's finest drama schools and adapted specifically for the unique demands of
              Dungeon Mastering.
            </p>

            {/* Body text */}
            <div className="prose prose-lg prose-invert">
              <p className="text-forge-1 leading-relaxed mb-6">
                When actors train at RADA or Juilliard, they don't just memorize lines—they learn
                to inhabit characters, command attention, and create moments that audiences remember
                forever. That's exactly what a great DM does at the table.
              </p>
              <p className="text-forge-1 leading-relaxed mb-6">
                Our curriculum was developed with input from professional actors, improv coaches,
                and career DMs. We've distilled decades of performance wisdom into practical,
                actionable modules you can apply to your very next session.
              </p>
              <p className="text-forge-1 leading-relaxed">
                This isn't theory. It's practice. Every lesson includes exercises, recordings to
                review, and progression tracking so you can see yourself improving week over week.
              </p>
            </div>

            {/* Pull quote */}
            <blockquote className="my-12 pl-6 border-l-4 border-verdant">
              <p className="text-2xl font-display text-forge-0 mb-4">
                "The difference between a good DM and a legendary one isn't talent—it's training."
              </p>
              <cite className="text-forge-2 not-italic">
                — The Studio Philosophy
              </cite>
            </blockquote>
          </div>

          {/* Sidebar - 5 columns */}
          <aside className="lg:col-span-5">
            {/* Credentials box */}
            <div className="glass-card p-8 sticky top-8">
              <h3 className="text-xl font-display font-semibold text-forge-0 mb-6 flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-verdant"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                Training Credentials
              </h3>

              <ul className="space-y-4" role="list">
                {credentials.map((credential, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-verdant flex-shrink-0 mt-0.5"
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
                    <span className="text-forge-1">{credential}</span>
                  </li>
                ))}
              </ul>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="text-center">
                  <p className="text-3xl font-display font-bold text-verdant">120+</p>
                  <p className="text-sm text-forge-2">Training Modules</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-display font-bold text-verdant">40hrs</p>
                  <p className="text-sm text-forge-2">Curriculum Content</p>
                </div>
              </div>

              {/* CTA */}
              <a
                href="#pricing"
                className="mt-8 block w-full btn-primary text-center"
              >
                Start Training
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
