// Mock data for the Dashboard
// This will be replaced with real API data in Phase 2

export interface PrepTask {
  id: string
  text: string
  completed: boolean
}

export interface PlotThread {
  id: string
  name: string
  status: 'active' | 'resolved' | 'dormant'
}

export interface Skill {
  name: string
  progress: number
  color: string
  icon: string
}

export interface Achievement {
  id: string
  name: string
  tier: 'bronze' | 'silver' | 'gold'
  description: string
  unlockedAt: Date
}

export interface TrainingModule {
  id: string
  name: string
  pillar: 'voice' | 'improv' | 'worldbuilding' | 'storytelling'
  duration: string
}

export interface WorldActivity {
  id: string
  type: 'npc' | 'location' | 'item' | 'lore'
  name: string
  action: 'created' | 'edited'
  timestamp: Date
  thumbnail?: string
}

export interface Toy {
  id: string
  name: string
  type: 'npc' | 'location' | 'encounter' | 'item' | 'lore'
  icon: string
  campaign?: string
}

export interface Session {
  id: string
  name: string
  date: Date
  campaign: string
  campaignId: string
  rating?: number
  notes?: string
}

export interface Campaign {
  id: string
  name: string
  artUrl: string
  currentArc: string
  stats: {
    sessions: number
    npcs: number
    locations: number
    players: number
  }
  plotThreads: PlotThread[]
}

export interface User {
  name: string
  avatar: string
  tier: 'ember' | 'forge' | 'archive'
  trainingStreak: number
}

export interface NextSession {
  id: string
  campaignId: string
  campaignName: string
  date: Date
  players: string[]
  prepProgress: number
}

export interface Training {
  currentStreak: number
  skills: Skill[]
  nextModule: TrainingModule
  recentAchievements: Achievement[]
}

export interface DashboardData {
  user: User
  nextSession: NextSession | null
  activeCampaign: Campaign | null
  training: Training
  worldActivity: WorldActivity[]
  recentToys: Toy[]
  prepTasks: PrepTask[]
  recentSessions: Session[]
}

// Calculate days until session
export function getDaysUntilSession(sessionDate: Date): number {
  const now = new Date()
  const diffTime = sessionDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get session proximity status
export function getSessionProximity(sessionDate: Date): 'distant' | 'approaching' | 'imminent' | 'today' | 'past' {
  const days = getDaysUntilSession(sessionDate)
  if (days < 0) return 'past'
  if (days === 0) return 'today'
  if (days === 1) return 'imminent'
  if (days <= 6) return 'approaching'
  return 'distant'
}

// Generate mock data
export function getMockDashboardData(): DashboardData {
  const now = new Date()
  const nextSessionDate = new Date(now)
  nextSessionDate.setDate(now.getDate() + 3) // 3 days from now
  nextSessionDate.setHours(19, 0, 0, 0) // 7 PM

  return {
    user: {
      name: 'Archivist Marcus',
      avatar: '/avatars/default.png',
      tier: 'forge',
      trainingStreak: 7,
    },
    nextSession: {
      id: 'session-next',
      campaignId: 'campaign-1',
      campaignName: 'The Shattered Crown',
      date: nextSessionDate,
      players: ['Elena', 'Marcus', 'Sofia', 'James'],
      prepProgress: 65,
    },
    activeCampaign: {
      id: 'campaign-1',
      name: 'The Shattered Crown',
      artUrl: '/campaigns/shattered-crown.jpg',
      currentArc: 'The Siege of Ironhaven',
      stats: {
        sessions: 24,
        npcs: 47,
        locations: 18,
        players: 4,
      },
      plotThreads: [
        { id: 'plot-1', name: "The King's Betrayal", status: 'active' },
        { id: 'plot-2', name: 'Lost Heir of Valdris', status: 'active' },
        { id: 'plot-3', name: 'The Dragon Pact', status: 'dormant' },
        { id: 'plot-4', name: 'Thieves Guild Alliance', status: 'resolved' },
      ],
    },
    training: {
      currentStreak: 7,
      skills: [
        { name: 'Voice Acting', progress: 72, color: 'arcane', icon: 'microphone' },
        { name: 'Improvisation', progress: 58, color: 'ember', icon: 'lightning' },
        { name: 'World Building', progress: 85, color: 'verdant', icon: 'globe' },
        { name: 'Storytelling', progress: 64, color: 'eldritch', icon: 'book' },
      ],
      nextModule: {
        id: 'module-voice-5',
        name: 'Accent Mastery: Dwarven Dialects',
        pillar: 'voice',
        duration: '15 min',
      },
      recentAchievements: [
        {
          id: 'ach-1',
          name: 'Voice Virtuoso',
          tier: 'gold',
          description: 'Complete all voice acting fundamentals',
          unlockedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'ach-2',
          name: 'Week Warrior',
          tier: 'silver',
          description: 'Maintain a 7-day training streak',
          unlockedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'ach-3',
          name: 'World Weaver',
          tier: 'bronze',
          description: 'Create your first interconnected world',
          unlockedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    worldActivity: [
      {
        id: 'activity-1',
        type: 'npc',
        name: 'Captain Thorne Blackwood',
        action: 'created',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'activity-2',
        type: 'location',
        name: 'The Sunken Temple',
        action: 'edited',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        id: 'activity-3',
        type: 'item',
        name: 'Blade of the Fallen Star',
        action: 'created',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
      {
        id: 'activity-4',
        type: 'lore',
        name: 'The War of Three Kings',
        action: 'edited',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'activity-5',
        type: 'npc',
        name: 'Lady Meridia Sunweaver',
        action: 'created',
        timestamp: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      },
      {
        id: 'activity-6',
        type: 'location',
        name: 'Ironhaven Market District',
        action: 'edited',
        timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
    ],
    recentToys: [
      { id: 'toy-1', name: 'Random NPC Generator', type: 'npc', icon: 'users' },
      { id: 'toy-2', name: 'Tavern Builder', type: 'location', icon: 'home' },
      { id: 'toy-3', name: 'Encounter Roller', type: 'encounter', icon: 'sword' },
      { id: 'toy-4', name: 'Loot Table', type: 'item', icon: 'chest' },
      { id: 'toy-5', name: 'Name Generator', type: 'npc', icon: 'scroll' },
    ],
    prepTasks: [
      { id: 'prep-1', text: 'Review last session notes', completed: true },
      { id: 'prep-2', text: 'Finalize NPC motivations for Ironhaven', completed: true },
      { id: 'prep-3', text: 'Prepare combat encounter for the docks', completed: false },
      { id: 'prep-4', text: 'Create handout for the mysterious letter', completed: false },
      { id: 'prep-5', text: 'Practice Thorne\'s voice', completed: false },
    ],
    recentSessions: [
      {
        id: 'session-1',
        name: 'The Docks at Midnight',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        campaign: 'The Shattered Crown',
        campaignId: 'campaign-1',
        rating: 4,
      },
      {
        id: 'session-2',
        name: 'Whispers in the Market',
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        campaign: 'The Shattered Crown',
        campaignId: 'campaign-1',
        rating: 5,
      },
      {
        id: 'session-3',
        name: 'The Council Convenes',
        date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        campaign: 'The Shattered Crown',
        campaignId: 'campaign-1',
        rating: 4,
      },
      {
        id: 'session-4',
        name: 'Arrival at Ironhaven',
        date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        campaign: 'The Shattered Crown',
        campaignId: 'campaign-1',
        rating: 5,
      },
      {
        id: 'session-5',
        name: 'The Road North',
        date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        campaign: 'The Shattered Crown',
        campaignId: 'campaign-1',
        rating: 3,
      },
    ],
  }
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

// Format session date for countdown
export function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
