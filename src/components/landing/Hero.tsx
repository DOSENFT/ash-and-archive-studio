import { useEffect, useRef, useState } from 'react'

interface Ember {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function Hero() {
  const [embers, setEmbers] = useState<Ember[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLElement>(null)

  // Generate ember particles
  useEffect(() => {
    const generateEmbers = () => {
      const newEmbers: Ember[] = []
      for (let i = 0; i < 30; i++) {
        newEmbers.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 4 + 3,
          delay: Math.random() * 4,
        })
      }
      setEmbers(newEmbers)
    }
    generateEmbers()
  }, [])

  // Mouse follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-void-2 via-void-0 to-void-0" />

      {/* Mouse-follow glow effect */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-opacity duration-500"
        style={{
          left: mousePos.x - 192,
          top: mousePos.y - 192,
          background: 'radial-gradient(circle, rgba(244,181,69,0.1) 0%, transparent 70%)',
          opacity: mousePos.x || mousePos.y ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="ember-particle animate-ember-rise"
            style={{
              left: `${ember.x}%`,
              bottom: `${ember.y}%`,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Constellation/Archive pattern overlay - subtle dots */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="section-container relative z-10 text-center">
        {/* Logo/Brand mark placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ember via-arcane to-eldritch p-[2px]">
            <div className="w-full h-full rounded-full bg-void-0 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-ember"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                {/* Stylized flame/book icon */}
                <path d="M12 2C12 2 8 6 8 10c0 2.21 1.79 4 4 4s4-1.79 4-4c0-4-4-8-4-8z" />
                <path d="M12 14v8" strokeLinecap="round" />
                <path d="M8 18h8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pre-headline */}
        <p className="text-ember font-mono text-sm tracking-widest uppercase mb-4 animate-fade-in-up">
          Ash & Archive
        </p>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-in-up animation-delay-100">
          <span className="block text-forge-0">Where Dungeon Masters</span>
          <span className="block gradient-text">Are Forged</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-forge-1 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
          Elite training. Legendary world-building.{' '}
          <span className="text-forge-0">The complete studio for DMs who refuse to be ordinary.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
          <a
            href="#pricing"
            className="btn-primary text-lg"
          >
            Enter The Studio
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <button
            type="button"
            className="btn-ghost text-lg"
            aria-label="Watch the vision video"
          >
            <svg
              className="mr-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Watch the Vision
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#pain-points"
            className="block p-2 text-forge-2 hover:text-arcane transition-colors duration-base"
            aria-label="Scroll to learn more"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
