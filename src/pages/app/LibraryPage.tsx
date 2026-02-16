import { PageHeader } from '@/design/patterns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

// Library category card
function CategoryCard({
  title,
  description,
  count,
  icon,
  color,
}: {
  title: string
  description: string
  count: number
  icon: string
  color: string
}) {
  return (
    <Card variant="glass" padding="lg" hover>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            color
          )}>
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle as="h3" className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <Badge variant="default">{count}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" size="sm" className="w-full">
          Browse →
        </Button>
      </CardContent>
    </Card>
  )
}

// Recent uploads
function RecentUploads() {
  const uploads = [
    { name: 'world_map_v3.png', type: 'Image', size: '2.4 MB', date: '2h ago' },
    { name: 'session_24_recap.md', type: 'Document', size: '12 KB', date: '1d ago' },
    { name: 'thornwall_battlemap.jpg', type: 'Image', size: '4.1 MB', date: '3d ago' },
    { name: 'npc_voice_notes.mp3', type: 'Audio', size: '8.2 MB', date: '1w ago' },
  ]

  const typeIcons = {
    Image: '🖼️',
    Document: '📄',
    Audio: '🎵',
    Video: '🎬',
  }

  return (
    <Card variant="glass" padding="md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="text-lg">Recent Uploads</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {uploads.map((file, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'hover:bg-void-2/50 transition-colors cursor-pointer'
              )}
            >
              <div className="text-xl">
                {typeIcons[file.type as keyof typeof typeIcons]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-forge-0 truncate">{file.name}</p>
                <p className="text-xs text-forge-2">{file.size} • {file.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Storage usage
function StorageUsage() {
  const used = 234
  const total = 500
  const percentage = (used / total) * 100

  return (
    <Card variant="glass" padding="md">
      <CardHeader>
        <CardTitle as="h3" className="text-lg">Storage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-forge-1">{used} MB used</span>
            <span className="text-sm text-forge-2">{total} MB total</span>
          </div>
          <div className="h-2 bg-void-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-arcane to-eldritch rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-forge-2">
            {total - used} MB available
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Template gallery placeholder
function TemplateGallery() {
  const templates = [
    { name: 'One-Shot Adventure', category: 'Campaign', uses: 156 },
    { name: 'Session Zero Checklist', category: 'Prep', uses: 89 },
    { name: 'NPC Quick Sheet', category: 'Character', uses: 234 },
  ]

  return (
    <Card variant="glass" padding="md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3" className="text-lg">Popular Templates</CardTitle>
          <Button variant="ghost" size="sm">Browse All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {templates.map((template, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                'hover:bg-void-2/50 transition-colors cursor-pointer'
              )}
            >
              <div>
                <p className="text-sm text-forge-0">{template.name}</p>
                <p className="text-xs text-forge-2">{template.category}</p>
              </div>
              <span className="text-xs font-mono text-forge-2">
                {template.uses} uses
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LibraryPage() {
  const categories = [
    {
      title: 'Campaign Templates',
      description: 'Ready-to-use campaign frameworks and structures',
      count: 24,
      icon: '📚',
      color: 'bg-ember/20',
    },
    {
      title: 'Maps & Battlemaps',
      description: 'Visual assets for exploration and combat',
      count: 47,
      icon: '🗺️',
      color: 'bg-arcane/20',
    },
    {
      title: 'Handouts',
      description: 'Player-facing documents and props',
      count: 32,
      icon: '📜',
      color: 'bg-verdant/20',
    },
    {
      title: 'Audio & Music',
      description: 'Ambiance, soundtracks, and sound effects',
      count: 18,
      icon: '🎵',
      color: 'bg-eldritch/20',
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Library"
        description="Store and organize your campaign assets, templates, and resources."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost">
              Import
            </Button>
            <Button variant="primary">
              Upload Asset
            </Button>
          </div>
        }
      />

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold font-display text-forge-0 mb-4">
          Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent uploads */}
        <div className="lg:col-span-2">
          <RecentUploads />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StorageUsage />
          <TemplateGallery />
        </div>
      </div>
    </div>
  )
}
