import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/design/patterns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const VERDANT = { primary: '#39d98a', glow: 'rgba(57,217,138,0.4)', bg: 'rgba(57,217,138,0.08)' }

// Animated counter for metrics
function AnimatedCounter({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()
  const numValue = typeof value === 'string' ? parseInt(value) || 0 : value

  useEffect(() => {
    if (!inView || typeof value === 'string') { setDisplay(numValue); return }
    if (prefersReducedMotion) { setDisplay(numValue); return }
    let start: number, frame: number
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 800, 1)
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * numValue))
      if (p < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value, numValue, inView, prefersReducedMotion])

  return <span ref={ref}>{typeof value === 'string' && isNaN(parseInt(value)) ? value : display}{suffix}</span>
}

// Training path card component
function PathCard({
  title,
  description,
  progress,
  modules,
  status,
  index = 0,
}: {
  title: string
  description: string
  progress: number
  modules: number
  status: 'locked' | 'active' | 'completed'
  index?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [isHovered, setIsHovered] = useState(false)

  const statusStyles = {
    locked: 'opacity-50 cursor-not-allowed',
    active: '',
    completed: 'border-verdant/30',
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: EASE }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        variant="glass"
        padding="lg"
        hover={status !== 'locked'}
        className={cn(statusStyles[status], 'relative overflow-hidden')}
      >
        {/* Edge glow for active card */}
        {status === 'active' && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: `0 0 20px ${VERDANT.glow}, inset 0 0 12px ${VERDANT.bg}` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.6 : 0.2 }}
            transition={{ duration: 0.2 }}
          />
        )}

        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant={status === 'completed' ? 'success' : status === 'active' ? 'verdant' : 'default'}>
              {status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : 'Locked'}
            </Badge>
            <span className="text-sm font-mono text-forge-2">{modules} modules</span>
          </div>
          <CardTitle as="h3" className="mt-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-forge-2">Progress</span>
              <span className="text-sm font-mono text-verdant">{progress}%</span>
            </div>
            <div className="h-2 bg-void-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-verdant/50 to-verdant rounded-full"
                initial={{ width: 0 }}
                animate={inView ? { width: `${progress}%` } : {}}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: EASE }}
              />
            </div>
          </div>

          <Button
            variant={status === 'locked' ? 'secondary' : 'primary'}
            size="sm"
            disabled={status === 'locked'}
            className="w-full"
          >
            {status === 'completed' ? 'Review' : status === 'active' ? 'Continue' : 'Unlock'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Current assignment widget
function CurrentAssignment() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
    >
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        {/* Subtle glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${VERDANT.bg} 0%, transparent 70%)` }}
        />

        <CardHeader>
          <Badge variant="verdant">Current Assignment</Badge>
          <CardTitle as="h2" className="mt-2">
            Voice Modulation Mastery
          </CardTitle>
          <CardDescription>
            Practice shifting between character voices with emotional depth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-forge-2">Module Progress</span>
                <span className="text-sm font-mono text-verdant">3/5 exercises</span>
              </div>
              <div className="h-1.5 bg-void-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-verdant rounded-full"
                  initial={{ width: 0 }}
                  animate={inView ? { width: '60%' } : {}}
                  transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
                />
              </div>
            </div>
            <Button variant="primary" size="sm">
              <span>Continue</span>
              <motion.span
                className="ml-1"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                →
              </motion.span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Stats overview
function StatsOverview() {
  const stats = [
    { label: 'Exercises Completed', value: 156, suffix: '', icon: '✓' },
    { label: 'Practice Hours', value: 48, suffix: 'h', icon: '⏱' },
    { label: 'Current Streak', value: 12, suffix: ' days', icon: '🔥' },
    { label: 'Certificates', value: 3, suffix: '', icon: '📜' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: EASE }}
        >
          <Card variant="glass" padding="md" hover className="group">
            <div className="flex items-center gap-3">
              <motion.div
                className="text-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {stat.icon}
              </motion.div>
              <div>
                <p className="text-2xl font-bold font-display text-verdant">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs font-mono text-forge-2 uppercase tracking-wide group-hover:text-forge-1 transition-colors">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default function AcademyPage() {
  const paths = [
    {
      title: 'Foundation Track',
      description: 'Master the fundamentals of game mastery, from session prep to pacing.',
      progress: 100,
      modules: 8,
      status: 'completed' as const,
    },
    {
      title: 'Voice & Character',
      description: 'Develop your vocal range and bring NPCs to life with distinct voices.',
      progress: 60,
      modules: 12,
      status: 'active' as const,
    },
    {
      title: 'Improvisation',
      description: 'Think on your feet and adapt to unexpected player choices.',
      progress: 0,
      modules: 10,
      status: 'locked' as const,
    },
    {
      title: 'Advanced Storytelling',
      description: 'Craft compelling narratives with emotional resonance.',
      progress: 0,
      modules: 15,
      status: 'locked' as const,
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <PageHeader
          badge={{ label: 'Training', variant: 'verdant' }}
          title="DM Training Academy"
          description="Level up your game mastery through structured training paths and deliberate practice."
          actions={
            <Button variant="primary">
              <span>Start Daily Drill</span>
              <motion.span
                className="ml-1.5"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔥
              </motion.span>
            </Button>
          }
        />
      </motion.div>

      {/* Stats overview */}
      <StatsOverview />

      {/* Current assignment */}
      <CurrentAssignment />

      {/* Training paths */}
      <div>
        <motion.h2
          className="text-xl font-semibold font-display text-forge-0 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Training Paths
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path, index) => (
            <PathCard key={path.title} {...path} index={index} />
          ))}
        </div>
      </div>

      {/* Placeholder for transcript */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
      >
        <Card variant="outline" padding="lg" className="group hover:border-verdant/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-forge-0">Your Transcript</h3>
              <p className="text-sm text-forge-2">View your complete training history and credentials</p>
            </div>
            <Button variant="ghost" className="group-hover:text-verdant transition-colors">
              View Transcript →
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
