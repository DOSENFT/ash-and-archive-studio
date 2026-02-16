import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useInView, useReducedMotion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { Badge, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

// ============================================================================
// DESIGN SYSTEM TOKENS
// ============================================================================
const PILLAR = {
  arcane: { primary: '#3dd2ff', glow: 'rgba(61,210,255,0.4)', bg: 'rgba(61,210,255,0.08)' },
  ember: { primary: '#f4b545', glow: 'rgba(244,181,69,0.4)', bg: 'rgba(244,181,69,0.08)' },
  verdant: { primary: '#39d98a', glow: 'rgba(57,217,138,0.4)', bg: 'rgba(57,217,138,0.08)' },
  eldritch: { primary: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', bg: 'rgba(139,92,246,0.08)' },
} as const

const ZONE = {
  command: { accent: '#f4b545', tint: 'rgba(244,181,69,0.03)' },
  growth: { accent: '#39d98a', tint: 'rgba(57,217,138,0.03)' },
} as const

const EASE = [0.22, 1, 0.36, 1] as const

// Mock session state
type SessionState = 'active' | 'prep-needed' | 'scheduled' | 'no-session'
const sessionState: SessionState = 'prep-needed'

// ============================================================================
// PREMIUM BACKGROUND - Zone-aware ambient system
// ============================================================================
function PremiumBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Base */}
      <div className="absolute inset-0 bg-void-0" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Command zone tint (top) */}
      <div
        className="absolute inset-x-0 top-0 h-[60%]"
        style={{ background: `linear-gradient(180deg, ${ZONE.command.tint} 0%, transparent 100%)` }}
      />

      {/* Growth zone tint (bottom) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{ background: `linear-gradient(0deg, ${ZONE.growth.tint} 0%, transparent 100%)` }}
      />

      {/* Ambient orb - command zone */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600, top: '-10%', right: '-5%',
          background: `radial-gradient(circle, ${ZONE.command.tint} 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ambient orb - growth zone */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500, bottom: '-8%', left: '-3%',
          background: `radial-gradient(circle, ${ZONE.growth.tint} 0%, transparent 60%)`,
          filter: 'blur(70px)',
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(7,11,16,0.25) 100%)' }} />
    </div>
  )
}

// ============================================================================
// CURSOR GLOW - Zone-aware color shift
// ============================================================================
function CursorGlow() {
  const prefersReducedMotion = useReducedMotion()
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const [zone, setZone] = useState<'command' | 'growth'>('command')

  const smoothX = useSpring(cursorX, { stiffness: 180, damping: 28 })
  const smoothY = useSpring(cursorY, { stiffness: 180, damping: 28 })

  useEffect(() => {
    if (prefersReducedMotion) return
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setZone(e.clientY < window.innerHeight * 0.55 ? 'command' : 'growth')
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed pointer-events-none z-0 will-change-transform"
      style={{
        x: smoothX, y: smoothY,
        width: 220, height: 220, marginLeft: -110, marginTop: -110,
        background: `radial-gradient(circle, ${zone === 'command' ? 'rgba(244,181,69,0.06)' : 'rgba(57,217,138,0.06)'} 0%, transparent 70%)`,
        filter: 'blur(20px)',
      }}
      aria-hidden="true"
    />
  )
}

// ============================================================================
// GLASS CARD - Premium material with depth tokens
// ============================================================================
function GlassCard({ children, className, pillar, depth = 1, tiltEnabled = false }: {
  children: React.ReactNode
  className?: string
  pillar?: keyof typeof PILLAR
  depth?: 1 | 2 | 3
  tiltEnabled?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const config = pillar ? PILLAR[pillar] : null

  const depthStyles = {
    1: 'bg-void-1/65 border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.2)]',
    2: 'bg-void-1/50 border-white/[0.04] shadow-[0_1px_8px_rgba(0,0,0,0.15)]',
    3: 'bg-void-2/40 border-white/[0.03] shadow-none',
  }

  const card = (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden backdrop-blur-xl border',
        depthStyles[depth],
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={tiltEnabled ? { y: -2 } : undefined}
      transition={{ duration: 0.2, ease: EASE }}
    >
      {/* Edge glow */}
      {config && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 20px ${config.glow}, inset 0 0 12px ${config.bg}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Top edge highlight */}
      {config && (
        <motion.div
          className="absolute top-0 left-4 right-4 h-px rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${config.primary}80, transparent)` }}
          initial={{ opacity: 0.1, scaleX: 0.3 }}
          animate={{ opacity: isHovered ? 0.6 : 0.1, scaleX: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Surface gradient */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-white/[0.01] to-transparent" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )

  if (tiltEnabled) {
    return (
      <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} glareEnable glareMaxOpacity={0.06} glareColor="#fff" glarePosition="all" glareBorderRadius="16px" scale={1.008} transitionSpeed={300} className="transform-gpu">
        {card}
      </Tilt>
    )
  }
  return card
}

// ============================================================================
// ANIMATED COUNTER
// ============================================================================
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion) { setDisplay(value); return }
    let start: number, frame: number
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1000, 1)
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value, inView, prefersReducedMotion])

  return <span ref={ref}>{display}{suffix}</span>
}

// ============================================================================
// HEADER - Orientation layer ("I know where I am")
// ============================================================================
function Header() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const u = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    u(); const i = setInterval(u, 1000); return () => clearInterval(i)
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.header
      className="flex items-center justify-between mb-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="banner"
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          className="w-2 h-2 rounded-full bg-verdant"
          animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-label="System online"
        />
        <span className="text-sm text-forge-1">
          {greeting}, <span className="text-forge-0 font-medium">Director</span>
        </span>
      </div>
      <time className="text-xs font-mono text-forge-2">{time}</time>
    </motion.header>
  )
}

// ============================================================================
// PRIMARY CTA - Agency layer ("I know what to do next")
// ============================================================================
function PrimaryCTA() {
  const ctaMap = {
    'active': { label: 'Continue Session', sub: 'The Siege of Thornwall • In Progress', icon: '▶', pillar: 'ember' as const },
    'prep-needed': { label: 'Prep Your Session', sub: '2 days until The Siege of Thornwall', icon: '📋', pillar: 'ember' as const },
    'scheduled': { label: 'Review Session Plan', sub: 'The Siege of Thornwall in 5 days', icon: '📖', pillar: 'arcane' as const },
    'no-session': { label: 'Plan Next Session', sub: 'No upcoming sessions', icon: '✨', pillar: 'verdant' as const },
  }
  const c = ctaMap[sessionState]
  const p = PILLAR[c.pillar]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.45, ease: EASE }}
      className="col-span-full lg:col-span-8"
    >
      <GlassCard pillar={c.pillar} className="p-5 cursor-pointer group" tiltEnabled>
        <div className="flex items-center gap-4">
          <motion.div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: p.bg, boxShadow: `0 0 16px ${p.bg}` }}
            whileHover={{ scale: 1.06, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {c.icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-forge-2 uppercase tracking-wider mb-0.5">Your Next Step</p>
            <h2 className="text-xl md:text-2xl font-display font-bold text-forge-0 leading-tight">{c.label}</h2>
            <p className="text-sm text-forge-1 mt-0.5">{c.sub}</p>
          </div>

          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: p.primary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span className="text-void-0 text-lg" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
          </motion.div>
        </div>

        {sessionState === 'prep-needed' && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-forge-2 uppercase tracking-wider">Prep Progress</span>
              <span className="text-xs font-mono text-verdant font-medium">4/6</span>
            </div>
            <div className="h-1.5 bg-void-0/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${p.primary}, #39d98a)` }}
                initial={{ width: 0 }}
                animate={{ width: '67%' }}
                transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              />
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

// ============================================================================
// SESSION COUNTDOWN - Momentum layer ("I see progress")
// ============================================================================
function SessionCountdown() {
  const [t, setT] = useState({ d: 2, h: 14, m: 32, s: 45 })
  useEffect(() => {
    const i = setInterval(() => {
      setT(p => {
        let { d, h, m, s } = p; s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) { h = 23; d-- }
        if (d < 0) { d = 0; h = 0; m = 0; s = 0 }
        return { d, h, m, s }
      })
    }, 1000)
    return () => clearInterval(i)
  }, [])

  const urgent = t.d < 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.45, ease: EASE }}
      className="col-span-full sm:col-span-1 lg:col-span-4"
    >
      <GlassCard pillar={urgent ? 'ember' : undefined} className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          {urgent && (
            <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
          )}
          <span className="text-[10px] font-mono text-forge-2 uppercase tracking-wider">Next Session</span>
        </div>

        <div className="flex items-center justify-between gap-1 flex-1" aria-label={`${t.d} days, ${t.h} hours, ${t.m} minutes, ${t.s} seconds`}>
          {[{ v: t.d, l: 'd' }, { v: t.h, l: 'h' }, { v: t.m, l: 'm' }, { v: t.s, l: 's' }].map((u, i) => (
            <div key={i} className="text-center flex-1">
              <div className={cn('text-xl font-display font-bold', urgent ? 'text-ember' : 'text-forge-0')}>
                {String(u.v).padStart(2, '0')}
              </div>
              <div className="text-[8px] font-mono text-forge-2 uppercase">{u.l}</div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-forge-1 truncate mt-2 pt-2 border-t border-white/5">The Siege of Thornwall</p>
      </GlassCard>
    </motion.div>
  )
}

// ============================================================================
// CAMPAIGN ALERTS - Status layer ("I feel informed")
// ============================================================================
function CampaignAlerts() {
  const alerts = [
    { thread: 'The Missing Prince', severity: 'hot', reason: 'Players heading here next' },
    { thread: 'Dragon Cult Rising', severity: 'warm', reason: 'New clue planted last session' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.45, ease: EASE }}
      className="col-span-full lg:col-span-4"
    >
      <GlassCard pillar="ember" className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-forge-0 uppercase tracking-wider">Alerts</h3>
          <Badge variant="warning" size="sm" className="text-[9px] px-1.5">{alerts.length}</Badge>
        </div>

        <div className="flex-1 space-y-2">
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              className="p-2.5 rounded-lg bg-void-0/25 border border-white/[0.04] group cursor-pointer hover:border-ember/30 transition-colors"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              whileHover={{ x: 2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  className={cn('w-1.5 h-1.5 rounded-full', a.severity === 'hot' ? 'bg-red-500' : 'bg-ember')}
                  animate={a.severity === 'hot' ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-forge-0 truncate flex-1">{a.thread}</span>
                <span className="text-[9px] text-forge-2 group-hover:text-ember transition-colors">Review →</span>
              </div>
              <p className="text-[9px] text-forge-2 pl-3.5">{a.reason}</p>
            </motion.div>
          ))}
        </div>

        <Button variant="ghost" size="sm" className="w-full justify-between text-[10px] h-7 mt-3">
          <span>All Threads</span>
          <span className="text-ember">→</span>
        </Button>
      </GlassCard>
    </motion.div>
  )
}

// ============================================================================
// KPI ROW - Momentum/Status
// ============================================================================
function KPIRow() {
  const kpis = [
    { label: 'Streak', value: 12, suffix: 'd', trend: '+3', pillar: 'verdant' as const },
    { label: 'Sessions', value: 47, suffix: '', pillar: 'ember' as const },
    { label: 'Threads', value: 7, suffix: '', alert: true, pillar: 'arcane' as const },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.45, ease: EASE }}
      className="col-span-full lg:col-span-8"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {kpis.map((k, i) => (
          <GlassCard key={i} pillar={k.pillar} depth={2} className="p-3" tiltEnabled>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-forge-2 uppercase tracking-wider">{k.label}</span>
              {k.trend && <span className="text-[8px] font-mono text-verdant bg-verdant/10 px-1 py-0.5 rounded">↑{k.trend}</span>}
              {k.alert && <motion.div className="w-1.5 h-1.5 rounded-full bg-arcane" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />}
            </div>
            <p className="text-lg font-display font-bold" style={{ color: PILLAR[k.pillar].primary }}>
              <AnimatedCounter value={k.value} suffix={k.suffix} />
            </p>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================================
// SEMANTIC TRANSITION RAIL
// ============================================================================
function TransitionRail() {
  return (
    <motion.div
      className="col-span-full my-4 flex items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      role="separator"
      aria-label="Transition to growth zone"
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-void-2/40 border border-white/[0.04]">
        <div className="w-1.5 h-1.5 rounded-full bg-verdant/60" />
        <span className="text-[9px] font-mono text-forge-2 uppercase tracking-widest">Growth Zone</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  )
}

// ============================================================================
// TRAINING PROGRESS - Growth zone primary
// ============================================================================
function TrainingProgress() {
  const progress = 72
  const circ = 2 * Math.PI * 32

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.45, ease: EASE }}
      className="col-span-full lg:col-span-8"
    >
      <GlassCard pillar="verdant" className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-[68px] h-[68px] flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="34" cy="34" r="32" fill="none" stroke="currentColor" strokeWidth="4" className="text-void-2/30" />
              <motion.circle
                cx="34" cy="34" r="32" fill="none" stroke="url(#tGrad)" strokeWidth="5" strokeLinecap="round"
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - (progress / 100) * circ }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
                style={{ strokeDasharray: circ }}
              />
              <defs>
                <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#39d98a" />
                  <stop offset="100%" stopColor="#3dd2ff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold font-display text-verdant">{progress}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono text-forge-2 uppercase tracking-wider">Current Track</p>
            <h3 className="text-sm font-semibold text-forge-0">Foundation Mastery</h3>
            <p className="text-[10px] text-forge-2 mt-0.5">Next: Voice Projection II</p>
          </div>

          <Button variant="primary" size="sm" className="flex-shrink-0 text-xs h-8 px-3">
            Continue <motion.span className="ml-1" animate={{ x: [0, 2, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
          </Button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-forge-2">Daily streak</span>
          <span className="text-[10px] font-mono text-ember font-medium">🔥 12 days</span>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ============================================================================
// RECENT ACTIVITY - Growth zone context
// ============================================================================
function RecentActivity() {
  const items = [
    { label: 'Completed Voice Warmup', time: '2h ago', pillar: 'verdant' as const },
    { label: 'Added The Iron Council', time: '5h ago', pillar: 'arcane' as const },
    { label: 'Session notes updated', time: '1d ago', pillar: 'ember' as const },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.45, ease: EASE }}
      className="col-span-full sm:col-span-1 lg:col-span-4 lg:row-span-2"
    >
      <GlassCard depth={2} className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-forge-0 uppercase tracking-wider">Recent</h3>
          <span className="text-[9px] text-forge-2 font-mono">24h</span>
        </div>

        <div className="flex-1 space-y-1">
          {items.map((a, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.015] transition-colors group cursor-pointer"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              whileHover={{ x: 3 }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PILLAR[a.pillar].primary }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-forge-0 truncate group-hover:text-arcane transition-colors">{a.label}</p>
                <p className="text-[9px] text-forge-2">{a.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ============================================================================
// SECONDARY ACTIONS - Growth zone navigation
// ============================================================================
function SecondaryActions() {
  const actions = [
    { label: 'Create Asset', icon: '✨', desc: 'NPC, location, item' },
    { label: 'Library', icon: '📚', desc: 'Templates & resources' },
    { label: 'World Atlas', icon: '🗺️', desc: 'Explore your world' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45, ease: EASE }}
      className="col-span-full lg:col-span-8"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((a, i) => (
          <GlassCard key={i} depth={3} className="p-3 cursor-pointer group" tiltEnabled>
            <motion.div
              className="flex flex-col items-center text-center gap-1.5"
              whileHover={{ y: -2 }}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-[10px] font-medium text-forge-0 group-hover:text-arcane transition-colors">{a.label}</span>
              <span className="text-[9px] text-forge-2 hidden sm:block">{a.desc}</span>
            </motion.div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================================
// POST-ACTION EXPANSION (contextual, appears after primary action)
// ============================================================================
function ExpansionSurface() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
      className="col-span-full"
    >
      <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl bg-void-2/30 border border-white/[0.03]">
        <span className="text-[10px] text-forge-2">Unlock advanced tools</span>
        <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-arcane">
          Explore Premium →
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// HOME PAGE - Dual-Zone Command Center
// ============================================================================
export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <PremiumBackground />
      <CursorGlow />

      <div className="relative z-10">
        {/* Orientation */}
        <Header />

        {/* ═══════════════════════════════════════════════════════════════════
            ZONE A: COMMAND LAYER (~60% visual weight)
            Purpose: Orchestrate immediate high-value action
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Agency: Primary CTA (8 cols) */}
          <PrimaryCTA />

          {/* Momentum: Countdown (4 cols) */}
          <SessionCountdown />

          {/* Status: KPIs (8 cols) + Alerts (4 cols) */}
          <KPIRow />
          <CampaignAlerts />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SEMANTIC TRANSITION RAIL
        ═══════════════════════════════════════════════════════════════════ */}
        <TransitionRail />

        {/* ═══════════════════════════════════════════════════════════════════
            ZONE B: GROWTH LAYER (~40% visual weight)
            Purpose: Long-term mastery, exploration, expansion
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Training Progress (8 cols) */}
          <TrainingProgress />

          {/* Recent Activity (4 cols, spans 2 rows) */}
          <RecentActivity />

          {/* Secondary Actions (8 cols) */}
          <SecondaryActions />

          {/* Post-Action Expansion Surface */}
          <ExpansionSurface />
        </div>
      </div>
    </div>
  )
}
