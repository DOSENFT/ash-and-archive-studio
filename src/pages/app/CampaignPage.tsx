import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/design/patterns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const EMBER = { primary: '#f4b545', glow: 'rgba(244,181,69,0.4)', bg: 'rgba(244,181,69,0.08)' }

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

// Active campaign card
function ActiveCampaign() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const stats = [
    { label: 'Sessions', value: 24 },
    { label: 'Players', value: 5 },
    { label: 'Active Threads', value: 8 },
    { label: 'Arc', value: 'Act II', isText: true },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
      className="col-span-full"
    >
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        {/* Subtle ember glow */}
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${EMBER.bg} 0%, transparent 70%)` }}
        />

        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="ember">Active Campaign</Badge>
            <Button variant="ghost" size="sm">
              Switch Campaign
            </Button>
          </div>
          <CardTitle as="h2" className="mt-2">
            The Thornwall Chronicles
          </CardTitle>
          <CardDescription>
            A dark fantasy campaign set in the war-torn realm of Valdris, where ancient evils stir beneath crumbling kingdoms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <p className="text-xs font-mono text-forge-2 uppercase mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-ember">
                  {stat.isText ? stat.value : <AnimatedCounter value={stat.value as number} />}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Next session prep card
function NextSessionPrep() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [isHovered, setIsHovered] = useState(false)
  const tasks = [
    { label: 'Review last session notes', done: true },
    { label: 'Prepare NPC motivations', done: true },
    { label: 'Set up encounter maps', done: false },
    { label: 'Write opening narration', done: false },
  ]

  const completedCount = tasks.filter(t => t.done).length

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card variant="glass" padding="lg" className="relative overflow-hidden">
        {/* Edge glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 20px ${EMBER.glow}, inset 0 0 12px ${EMBER.bg}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0.15 }}
          transition={{ duration: 0.2 }}
        />

        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="ember">Session 25</Badge>
            <span className="text-sm font-mono text-forge-2">In 2 days</span>
          </div>
          <CardTitle as="h3" className="text-lg mt-2">The Siege Begins</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Prep progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-forge-2">Prep Progress</span>
              <span className="text-sm font-mono text-ember">
                {completedCount}/{tasks.length}
              </span>
            </div>
            <div className="h-2 bg-void-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ember/50 to-ember rounded-full"
                initial={{ width: 0 }}
                animate={inView ? { width: `${(completedCount / tasks.length) * 100}%` } : {}}
                transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
              />
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <motion.label
                key={i}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                  'hover:bg-void-2/50 transition-colors'
                )}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.35 + i * 0.06 }}
                whileHover={{ x: 2 }}
              >
                <div className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                  task.done
                    ? 'bg-ember border-ember text-void-0'
                    : 'border-forge-2 hover:border-ember/50'
                )}>
                  {task.done && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={cn(
                  'text-sm',
                  task.done ? 'text-forge-2 line-through' : 'text-forge-0'
                )}>
                  {task.label}
                </span>
              </motion.label>
            ))}
          </div>

          <Button variant="ember" size="sm" className="w-full mt-4">
            <span>Open Runbook</span>
            <motion.span
              className="ml-1"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              →
            </motion.span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Plot threads overview
function PlotThreads() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const threads = [
    { name: 'The Missing Prince', status: 'active', heat: 'hot' },
    { name: 'The Dragon Cult', status: 'active', heat: 'warm' },
    { name: 'Merchant Guild Corruption', status: 'dormant', heat: 'cold' },
    { name: 'The Ancient Prophecy', status: 'active', heat: 'warm' },
  ]

  const heatColors = {
    hot: 'bg-red-500',
    warm: 'bg-ember',
    cold: 'bg-arcane/50',
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
    >
      <Card variant="glass" padding="lg">
        <CardHeader>
          <CardTitle as="h3" className="text-lg">Active Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threads.map((thread, i) => (
              <motion.div
                key={i}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg group',
                  'bg-void-2/50 hover:bg-void-2 transition-colors cursor-pointer'
                )}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className={cn('w-2 h-2 rounded-full', heatColors[thread.heat as keyof typeof heatColors])}
                  animate={thread.heat === 'hot' ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <span className="flex-1 text-sm text-forge-0 group-hover:text-ember transition-colors">{thread.name}</span>
                <Badge variant={thread.status === 'dormant' ? 'default' : 'ember'} size="sm">
                  {thread.status}
                </Badge>
              </motion.div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4">
            Manage Threads →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Session history
function SessionHistory() {
  const sessions = [
    { number: 24, title: 'The Council\'s Decision', date: '3 days ago' },
    { number: 23, title: 'Into the Underdark', date: '1 week ago' },
    { number: 22, title: 'The Merchant\'s Secret', date: '2 weeks ago' },
  ]

  return (
    <Card variant="glass" padding="md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="text-lg">Recent Sessions</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.number}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'hover:bg-void-2/50 transition-colors cursor-pointer'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                <span className="text-sm font-bold text-ember">#{session.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-forge-0 truncate">{session.title}</p>
                <p className="text-xs text-forge-2">{session.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CampaignPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        badge={{ label: 'Campaign', variant: 'ember' }}
        title="Campaign Director"
        description="Plan sessions, track plot threads, and orchestrate your ongoing campaign."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost">
              Story Spine
            </Button>
            <Button variant="ember">
              Session Director
            </Button>
          </div>
        }
      />

      {/* Active campaign */}
      <ActiveCampaign />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next session prep */}
        <NextSessionPrep />

        {/* Plot threads */}
        <PlotThreads />

        {/* Session history */}
        <SessionHistory />

        {/* Story spine placeholder */}
        <Card variant="outline" padding="lg">
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-semibold text-forge-0 mb-2">Story Spine</h3>
            <p className="text-sm text-forge-2">
              3-act structure visualization coming soon
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
