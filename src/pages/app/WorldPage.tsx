import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/design/patterns'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const ARCANE = { primary: '#3dd2ff', glow: 'rgba(61,210,255,0.4)', bg: 'rgba(61,210,255,0.08)' }

// Animated counter
function AnimatedCounter({ value }: { value: number }) {
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
      const p = Math.min((ts - start) / 800, 1)
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value, inView, prefersReducedMotion])

  return <span ref={ref}>{display}</span>
}

// Canon health indicator
function CanonHealth() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const health = {
    score: 94,
    conflicts: 2,
    orphans: 5,
    lastUpdated: '2 hours ago',
  }
  const circ = 2 * Math.PI * 42

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
    >
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        {/* Subtle glow */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${ARCANE.bg} 0%, transparent 70%)` }}
        />

        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="arcane">Canon Status</Badge>
            <span className="text-xs font-mono text-forge-2">Updated {health.lastUpdated}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            {/* Health score ring */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-void-2" />
                <motion.circle
                  cx="48" cy="48" r="42" fill="none" stroke="url(#canonGrad)" strokeWidth="6" strokeLinecap="round"
                  initial={{ strokeDashoffset: circ }}
                  animate={inView ? { strokeDashoffset: circ - (health.score / 100) * circ } : {}}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                  style={{ strokeDasharray: circ }}
                />
                <defs>
                  <linearGradient id="canonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3dd2ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold font-display text-arcane">
                  <AnimatedCounter value={health.score} />%
                </span>
              </div>
            </div>

            {/* Issues breakdown */}
            <div className="flex-1 space-y-3">
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                <span className="text-sm text-forge-1">Conflicts</span>
                <Badge variant={health.conflicts > 0 ? 'warning' : 'success'}>
                  {health.conflicts}
                </Badge>
              </motion.div>
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 }}
              >
                <span className="text-sm text-forge-1">Orphaned Nodes</span>
                <Badge variant={health.orphans > 0 ? 'warning' : 'success'}>
                  {health.orphans}
                </Badge>
              </motion.div>
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View Details →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// World entity quick stats
function WorldStats() {
  const stats = [
    { label: 'Locations', value: 47, icon: '🗺️' },
    { label: 'NPCs', value: 156, icon: '👥' },
    { label: 'Factions', value: 12, icon: '⚔️' },
    { label: 'Artifacts', value: 34, icon: '✨' },
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
                <p className="text-2xl font-bold font-display text-arcane">
                  <AnimatedCounter value={stat.value} />
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

// Recent world activity
function RecentWorldActivity() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const activities = [
    { type: 'location', name: 'The Sunken Citadel', action: 'Created', time: '1h ago' },
    { type: 'npc', name: 'Lord Vareth', action: 'Updated', time: '3h ago' },
    { type: 'faction', name: 'The Iron Council', action: 'Linked', time: '5h ago' },
    { type: 'location', name: 'Thornwall Keep', action: 'Updated', time: '1d ago' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
    >
      <Card variant="glass" padding="md">
        <CardHeader>
          <CardTitle as="h3" className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-void-2/50 transition-colors cursor-pointer group"
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.35 + i * 0.08 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-lg bg-arcane/20 flex items-center justify-center text-arcane group-hover:bg-arcane/30 transition-colors">
                  {activity.type === 'location' && '🗺️'}
                  {activity.type === 'npc' && '👤'}
                  {activity.type === 'faction' && '⚔️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-forge-0 truncate group-hover:text-arcane transition-colors">{activity.name}</p>
                  <p className="text-xs text-forge-2">{activity.action} • {activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Quick create actions
function QuickCreate() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const options = [
    { label: 'Location', icon: '🗺️' },
    { label: 'NPC', icon: '👤' },
    { label: 'Faction', icon: '⚔️' },
    { label: 'Event', icon: '📜' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
    >
      <Card variant="glass" padding="md">
        <CardHeader>
          <CardTitle as="h3" className="text-lg">Quick Create</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option, i) => (
              <motion.button
                key={option.label}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg',
                  'bg-void-2 hover:bg-arcane/10 hover:border-arcane/30',
                  'border border-transparent',
                  'text-sm text-forge-1 hover:text-forge-0',
                  'transition-all duration-[180ms]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane'
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function WorldPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInView = useInView(mapRef, { once: true })

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <PageHeader
          badge={{ label: 'World Building', variant: 'arcane' }}
          title="World Builder"
          description="Craft and maintain your campaign world with interconnected lore and canon integrity."
          actions={
            <div className="flex gap-2">
              <Button variant="ghost">
                View Canon Board
              </Button>
              <Button variant="primary">
                <span>Open Atlas</span>
                <motion.span
                  className="ml-1.5"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🗺️
                </motion.span>
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* World stats */}
      <WorldStats />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canon health - spans 2 columns */}
        <div className="lg:col-span-2">
          <CanonHealth />
        </div>

        {/* Quick create */}
        <QuickCreate />

        {/* Recent activity */}
        <RecentWorldActivity />

        {/* Map placeholder */}
        <motion.div
          ref={mapRef}
          initial={{ opacity: 0, y: 20 }}
          animate={mapInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
          className="lg:col-span-2"
        >
          <Card variant="outline" padding="none" className="min-h-[300px] hover:border-arcane/30 transition-colors group">
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <motion.div
                className="text-5xl mb-4"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🗺️
              </motion.div>
              <h3 className="text-xl font-semibold text-forge-0 mb-2 group-hover:text-arcane transition-colors">World Atlas</h3>
              <p className="text-forge-2 mb-4">
                Interactive map canvas coming soon
              </p>
              <Button variant="ghost" className="group-hover:text-arcane transition-colors">
                Explore Placeholder →
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
