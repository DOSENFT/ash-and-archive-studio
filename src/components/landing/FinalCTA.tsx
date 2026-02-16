import { useState } from 'react'
import InteractiveCTA, { type CTAState } from './InteractiveCTA'

export default function FinalCTA() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const hasEmail = email.trim().length > 0
  const ctaState: CTAState = isSubmitting ? 'loading' : hasEmail ? 'idle' : 'blocked'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasEmail) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section
      id="final-cta"
      className="section-padding relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Background with ember effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-void-0 via-void-1 to-void-0" />
        <div className="absolute inset-0 bg-gradient-radial from-ember/5 via-transparent to-transparent" />
      </div>

      {/* Floating embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="ember-particle animate-ember-rise"
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: '10%',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 4 + 4}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="section-container relative z-10 text-center">
        {/* Headline */}
        <h2
          id="final-cta-heading"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-forge-0 mb-6"
        >
          From the Ash of Uncertainty,
          <br />
          <span className="gradient-text">Your Legend Rises</span>
        </h2>

        <p className="text-xl text-forge-1 max-w-2xl mx-auto mb-4">
          The Archive Awaits Your Story
        </p>

        <p className="text-lg text-forge-2 max-w-xl mx-auto mb-12">
          Join thousands of DMs who've transformed their game. Start your 14-day free trial today.
        </p>

        {/* Email capture form */}
        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-xl bg-void-2 border border-white/10 text-forge-0 placeholder:text-forge-2 focus:outline-none focus:ring-2 focus:ring-arcane focus:border-transparent transition-all duration-base"
              />
              <InteractiveCTA
                type="submit"
                state={ctaState}
                flashSuccessOnClick={false}
                loadingLabel="Joining The Studio"
                blockedLabel="Enter an email before continuing"
                className="whitespace-nowrap"
              >
                {isSubmitting ? 'Joining...' : 'Enter The Studio'}
              </InteractiveCTA>
            </div>
            <p className="text-sm text-forge-2 mt-4">
              Free 14-day trial. No credit card required.
            </p>
          </form>
        ) : (
          <div className="glass-card max-w-lg mx-auto p-8 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-verdant/20 border border-verdant/50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-verdant"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-forge-0 mb-2">
              Welcome to The Studio
            </h3>
            <p className="text-forge-1">
              Check your email for your access link. Your journey begins now.
            </p>
          </div>
        )}

        {/* Social proof micro-stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-forge-0">50,000+</p>
            <p className="text-sm text-forge-2">DMs Trained</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-forge-0">4.9/5</p>
            <p className="text-sm text-forge-2">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-forge-0">120+</p>
            <p className="text-sm text-forge-2">Training Modules</p>
          </div>
        </div>
      </div>
    </section>
  )
}
