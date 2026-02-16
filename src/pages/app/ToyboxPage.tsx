import { PageHeader } from '@/design/patterns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

// Toy card component
function ToyCard({
  name,
  type,
  quality,
  uses,
  tags,
}: {
  name: string
  type: string
  quality: number
  uses: number
  tags: string[]
}) {
  return (
    <Card variant="glass" padding="md" hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="eldritch">{type}</Badge>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  i < quality ? 'bg-eldritch' : 'bg-void-2'
                )}
              />
            ))}
          </div>
        </div>
        <CardTitle as="h3" className="text-lg mt-2">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono bg-void-2 text-forge-2 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-forge-2">Used {uses} times</span>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Toy stats overview
function ToyStats() {
  const stats = [
    { label: 'Total Toys', value: 89, icon: '🧩' },
    { label: 'NPCs', value: 45, icon: '👤' },
    { label: 'Encounters', value: 28, icon: '⚔️' },
    { label: 'Locations', value: 16, icon: '🏰' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} variant="glass" padding="md" hover>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold font-display text-eldritch">
                {stat.value}
              </p>
              <p className="text-xs font-mono text-forge-2 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Composition workbench teaser
function ComposerTeaser() {
  return (
    <Card variant="elevated" padding="lg" className="col-span-full">
      <CardHeader>
        <Badge variant="eldritch">Toy Composer</Badge>
        <CardTitle as="h2" className="mt-2">
          Create Reusable Content
        </CardTitle>
        <CardDescription>
          Build modular game elements that can be composed, remixed, and deployed across campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="eldritch">
            New NPC
          </Button>
          <Button variant="secondary">
            New Encounter
          </Button>
          <Button variant="secondary">
            New Location
          </Button>
          <Button variant="ghost">
            More Types →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent toys grid
function RecentToys() {
  const toys = [
    {
      name: 'Eldara the Wise',
      type: 'NPC',
      quality: 4,
      uses: 12,
      tags: ['mentor', 'mage', 'mysterious'],
    },
    {
      name: 'Goblin Ambush',
      type: 'Encounter',
      quality: 3,
      uses: 8,
      tags: ['combat', 'forest', 'tier-1'],
    },
    {
      name: 'The Rusty Anchor',
      type: 'Location',
      quality: 5,
      uses: 6,
      tags: ['tavern', 'social', 'coastal'],
    },
    {
      name: 'Captain Blackthorn',
      type: 'NPC',
      quality: 4,
      uses: 4,
      tags: ['villain', 'pirate', 'recurring'],
    },
    {
      name: 'Puzzle Chamber',
      type: 'Encounter',
      quality: 3,
      uses: 3,
      tags: ['puzzle', 'dungeon', 'magical'],
    },
    {
      name: 'The Whispering Woods',
      type: 'Location',
      quality: 4,
      uses: 5,
      tags: ['forest', 'fey', 'dangerous'],
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold font-display text-forge-0">
          Recent Toys
        </h2>
        <Button variant="ghost" size="sm">View Library →</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toys.map((toy) => (
          <ToyCard key={toy.name} {...toy} />
        ))}
      </div>
    </div>
  )
}

// Toy packs section
function ToyPacks() {
  const packs = [
    { name: 'Coastal Adventures', count: 12, color: 'from-blue-500 to-arcane' },
    { name: 'Urban Intrigue', count: 18, color: 'from-purple-500 to-eldritch' },
    { name: 'Dungeon Delves', count: 24, color: 'from-red-500 to-ember' },
  ]

  return (
    <Card variant="glass" padding="md">
      <CardHeader>
        <CardTitle as="h3" className="text-lg">Toy Packs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {packs.map((pack) => (
            <div
              key={pack.name}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'hover:bg-void-2/50 transition-colors cursor-pointer'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                pack.color
              )}>
                <span className="text-white font-bold">{pack.count}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-forge-0">{pack.name}</p>
                <p className="text-xs text-forge-2">{pack.count} toys</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-4">
          Manage Packs →
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ToyboxPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        badge={{ label: 'Toybox', variant: 'eldritch' }}
        title="The Toy Method"
        description="Build, collect, and compose reusable game elements for infinite remix potential."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost">
              Browse Library
            </Button>
            <Button variant="eldritch">
              New Toy
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <ToyStats />

      {/* Composer teaser */}
      <ComposerTeaser />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent toys */}
        <div className="lg:col-span-3">
          <RecentToys />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ToyPacks />

          {/* Quality guidelines placeholder */}
          <Card variant="outline" padding="md">
            <div className="text-center py-4">
              <div className="text-3xl mb-2">⭐</div>
              <h4 className="text-sm font-semibold text-forge-0 mb-1">Quality Scores</h4>
              <p className="text-xs text-forge-2">
                Learn what makes a 5-star toy
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
