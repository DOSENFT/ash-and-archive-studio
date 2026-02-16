import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react'

const testimonials = [
  {
    quote:
      "I've been DMing for 15 years and thought I knew it all. The Training Academy showed me how much I was leaving on the table. My players noticed the difference immediately.",
    author: 'Marcus Chen',
    role: 'Forever DM, 15 years',
    avatar: 'MC',
  },
  {
    quote:
      'The Toy Method is genius. I used to spend hours prepping NPCs. Now I can generate a memorable character in minutes by combining toys. Game-changer.',
    author: 'Sarah Blackwood',
    role: 'Campaign Writer',
    avatar: 'SB',
  },
  {
    quote:
      "Finally, one place for my world. I migrated from 5 different tools and haven't looked back. The World Anvil sync is seamless.",
    author: 'James Thornton',
    role: 'Worldbuilder, 8 campaigns',
    avatar: 'JT',
  },
  {
    quote:
      "I was terrified of improv. Now it's my favorite part of sessions. The confidence-building exercises actually work.",
    author: 'Elena Rodriguez',
    role: 'New DM, 2 years',
    avatar: 'ER',
  },
  {
    quote:
      'As someone who runs games professionally, this tool pays for itself. My prep time dropped 60% and session quality went up.',
    author: 'David Kim',
    role: 'Professional DM',
    avatar: 'DK',
  },
]

const trustBadges = [
  { label: 'World Anvil', sublabel: 'Official Partner' },
  { label: '50,000+', sublabel: 'Active DMs' },
  { label: '4.9/5', sublabel: 'User Rating' },
  { label: '100+', sublabel: 'Training Modules' },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  const activateSlide = useCallback((index: number, shouldFocus = false) => {
    const normalized = (index + testimonials.length) % testimonials.length
    setCurrentIndex(normalized)
    if (shouldFocus) {
      dotRefs.current[normalized]?.focus()
    }
  }, [])

  const handleDotKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      activateSlide(index + 1, true)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      activateSlide(index - 1, true)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      activateSlide(0, true)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      activateSlide(testimonials.length - 1, true)
    }
  }

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  return (
    <section
      className="section-padding relative overflow-hidden bg-void-1"
      aria-labelledby="testimonials-heading"
    >
      {/* Background accents */}
      <div
        className="ambient-accent ambient-accent--eldritch top-0 left-1/4 w-72 h-72"
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-eldritch font-mono text-sm tracking-widest uppercase mb-4">
            From The Community
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-4"
          >
            DMs Who've Been Forged
          </h2>
          <p className="text-lg text-forge-1 max-w-2xl mx-auto">
            Real stories from Dungeon Masters who transformed their game.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-4xl mx-auto mb-16"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(event) => {
            const nextFocus = event.relatedTarget as Node | null
            if (!event.currentTarget.contains(nextFocus)) {
              setIsPaused(false)
            }
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials carousel"
        >
          {/* Testimonial card */}
          <div id="testimonial-panel" className="glass-card p-8 md:p-12 text-center" aria-live="polite">
            {/* Quote icon */}
            <div className="flex justify-center mb-6">
              <svg
                className="w-12 h-12 text-eldritch/30"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Quote */}
            <blockquote className="mb-8">
              <p className="text-xl md:text-2xl text-forge-0 font-display leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arcane to-eldritch flex items-center justify-center">
                <span className="font-display font-semibold text-void-0">
                  {testimonials[currentIndex].avatar}
                </span>
              </div>
              <div className="text-left">
                <p className="font-display font-semibold text-forge-0">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-sm text-forge-2">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-forge-2 hover:text-forge-0 hover:bg-void-2 transition-all duration-base"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2" role="tablist" aria-label="Testimonial slides" aria-orientation="horizontal">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-controls="testimonial-panel"
                  id={`testimonial-tab-${index}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  tabIndex={index === currentIndex ? 0 : -1}
                  ref={(element) => {
                    dotRefs.current[index] = element
                  }}
                  onClick={() => activateSlide(index)}
                  onKeyDown={(event) => handleDotKeyDown(event, index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-base ${
                    index === currentIndex
                      ? 'bg-eldritch w-8'
                      : 'bg-forge-2/50 hover:bg-forge-2'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-forge-2 hover:text-forge-0 hover:bg-void-2 transition-all duration-base"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="glass-card p-6 text-center hover:bg-void-2/50 transition-colors duration-enter"
            >
              <p className="text-2xl md:text-3xl font-display font-bold text-forge-0 mb-1">
                {badge.label}
              </p>
              <p className="text-sm text-forge-2">{badge.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
