import InteractiveCTA from './InteractiveCTA'

const tiers = [
  {
    name: 'Ember',
    tagline: 'The spark begins',
    price: 9,
    period: '/month',
    description: 'Perfect for new DMs ready to start their journey.',
    color: 'ember',
    colorClass: 'text-ember',
    bgClass: 'bg-ember/10',
    borderClass: 'border-ember/30',
    gradientClass: 'from-ember to-amber-600',
    features: [
      'Basic world-building tools',
      'Session planner',
      '10 training modules',
      'Community access',
      '5 NPC Toys',
      '3 World Toys',
    ],
    limitations: [
      'Limited campaign history',
      'Basic voice training',
    ],
    cta: 'Start Free Trial',
    recommended: false,
  },
  {
    name: 'Forge',
    tagline: 'Where mastery is forged',
    price: 24,
    period: '/month',
    description: 'For serious DMs committed to excellence.',
    color: 'arcane',
    colorClass: 'text-arcane',
    bgClass: 'bg-arcane/10',
    borderClass: 'border-arcane/30',
    gradientClass: 'from-arcane to-eldritch',
    features: [
      'Full world-building engine',
      'Campaign management suite',
      'All 120+ training modules',
      'World Anvil integration',
      'Unlimited Toys (all types)',
      'Advanced voice training',
      'Improv workshop access',
      'Priority support',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    recommended: true,
  },
  {
    name: 'Archive',
    tagline: 'Full access, legacy status',
    price: 49,
    period: '/month',
    description: 'For professional DMs and worldbuilding masters.',
    color: 'eldritch',
    colorClass: 'text-eldritch',
    bgClass: 'bg-eldritch/10',
    borderClass: 'border-eldritch/30',
    gradientClass: 'from-eldritch to-purple-800',
    features: [
      'Everything in Forge, plus:',
      '1-on-1 coaching sessions',
      'Custom Toy creation',
      'White-label exports',
      'API access',
      'Founding member status',
      'Early access to features',
      'Direct team access',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    recommended: false,
  },
]

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="section-padding relative overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-void-1 via-void-0 to-void-1"
        aria-hidden="true"
      />

      {/* Decorative elements */}
      <div
        className="ambient-accent ambient-accent--eldritch top-1/4 left-0 w-72 h-72"
        aria-hidden="true"
      />
      <div
        className="ambient-accent ambient-accent--arcane bottom-1/4 right-0 w-80 h-80"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-arcane font-mono text-sm tracking-widest uppercase mb-4">
            Choose Your Path
          </p>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-4"
          >
            Enter The Studio
          </h2>
          <p className="text-lg text-forge-1 max-w-2xl mx-auto mb-6">
            14-day free trial on all plans. No credit card required.
          </p>

          {/* Billing toggle placeholder */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-void-2 text-sm">
            <span className="text-forge-0 font-medium">Monthly</span>
            <span className="text-forge-2">/</span>
            <span className="text-forge-2">Annual (Save 20%)</span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`
                relative glass-card p-8 flex flex-col
                ${tier.recommended ? 'ring-2 ring-arcane md:-mt-4 md:mb-4' : ''}
              `}
            >
              {/* Recommended badge */}
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-arcane to-eldritch rounded-full">
                  <span className="text-sm font-semibold text-void-0">Recommended</span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tier.bgClass} ${tier.borderClass} border mb-4`}
                >
                  <span className={`font-mono text-sm ${tier.colorClass}`}>{tier.name}</span>
                </div>
                <p className="text-forge-2 text-sm mb-4">{tier.tagline}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-forge-0">${tier.price}</span>
                  <span className="text-forge-2">{tier.period}</span>
                </div>
                <p className="text-forge-1 mt-2">{tier.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow" role="list">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 ${tier.colorClass} flex-shrink-0 mt-0.5`}
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
                    <span className="text-forge-1">{feature}</span>
                  </li>
                ))}
                {tier.limitations.map((limitation, index) => (
                  <li key={`limit-${index}`} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-forge-2 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                    <span className="text-forge-2">{limitation}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <InteractiveCTA
                href="#final-cta"
                variant={tier.recommended ? 'primary' : 'ghost'}
                aria-label={`${tier.cta} for the ${tier.name} plan`}
                className={
                  tier.recommended
                    ? 'w-full justify-center'
                    : `w-full justify-center border ${tier.borderClass} ${tier.colorClass} hover:text-forge-0`
                }
              >
                {tier.cta}
              </InteractiveCTA>
            </article>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-forge-2 mt-12 text-sm">
          Cancel anytime. No questions asked. Your data stays yours.
        </p>
      </div>
    </section>
  )
}
