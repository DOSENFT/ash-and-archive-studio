import { PageHeader } from '@/design/patterns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/design/primitives'
import { cn } from '@/lib/utils'

// Settings section component
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card variant="glass" padding="lg">
      <CardHeader>
        <CardTitle as="h3" className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

// Toggle switch component
function Toggle({
  label,
  description,
  checked = false,
  onChange,
}: {
  label: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-forge-0 group-hover:text-arcane transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-xs text-forge-2 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-[180ms]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-void-0',
          checked ? 'bg-arcane' : 'bg-void-2'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white',
            'transition-transform duration-[180ms]',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  )
}

// Settings nav item
function SettingsNavItem({
  icon,
  label,
  active = false,
}: {
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg',
        'text-sm text-left transition-colors duration-[180ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane',
        active
          ? 'bg-arcane/10 text-arcane font-medium'
          : 'text-forge-1 hover:bg-void-2 hover:text-forge-0'
      )}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export default function SettingsPage() {
  const navItems = [
    { icon: '👤', label: 'Profile', active: true },
    { icon: '🔒', label: 'Privacy & Security' },
    { icon: '🎨', label: 'Appearance' },
    { icon: '🔔', label: 'Notifications' },
    { icon: '📤', label: 'Data & Export' },
    { icon: '💳', label: 'Billing' },
    { icon: '🔗', label: 'Integrations' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account, preferences, and application settings."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card variant="glass" padding="sm" className="h-fit">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SettingsNavItem key={item.label} {...item} />
            ))}
          </nav>
        </Card>

        {/* Settings content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile section */}
          <SettingsSection
            title="Profile"
            description="Manage your public profile and personal information."
          >
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-eldritch to-arcane flex items-center justify-center">
                  <span className="text-white font-bold text-xl">DM</span>
                </div>
                <div>
                  <Button variant="secondary" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>

              {/* Name input placeholder */}
              <div>
                <label className="block text-sm font-medium text-forge-0 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Dungeon Master"
                  className={cn(
                    'w-full px-4 py-2 rounded-lg',
                    'bg-void-2 border border-white/10',
                    'text-forge-0 placeholder:text-forge-2',
                    'focus:outline-none focus:border-arcane focus:ring-1 focus:ring-arcane/50'
                  )}
                />
              </div>

              {/* Email placeholder */}
              <div>
                <label className="block text-sm font-medium text-forge-0 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="dm@example.com"
                  disabled
                  className={cn(
                    'w-full px-4 py-2 rounded-lg',
                    'bg-void-2/50 border border-white/5',
                    'text-forge-2 cursor-not-allowed'
                  )}
                />
                <p className="text-xs text-forge-2 mt-1">
                  Contact support to change your email
                </p>
              </div>
            </div>
          </SettingsSection>

          {/* Appearance section */}
          <SettingsSection
            title="Appearance"
            description="Customize how Ash & Archive looks for you."
          >
            <div className="divide-y divide-white/5">
              <Toggle
                label="Ember Particles"
                description="Show ambient ember particles in the background"
                checked={true}
              />
              <Toggle
                label="Reduced Motion"
                description="Minimize animations for accessibility"
                checked={false}
              />
              <Toggle
                label="High Contrast"
                description="Increase contrast for better readability"
                checked={false}
              />
            </div>
          </SettingsSection>

          {/* Privacy section */}
          <SettingsSection
            title="Privacy & Security"
            description="Control your data and account security."
          >
            <div className="divide-y divide-white/5">
              <Toggle
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                checked={false}
              />
              <Toggle
                label="Analytics"
                description="Help us improve by sharing anonymous usage data"
                checked={true}
              />
              <Toggle
                label="Marketing Emails"
                description="Receive updates about new features and tips"
                checked={false}
              />
            </div>
          </SettingsSection>

          {/* Danger zone */}
          <Card variant="outline" padding="lg" className="border-red-500/30">
            <CardHeader>
              <CardTitle as="h3" className="text-lg text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account and data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="secondary">
                  Export All Data
                </Button>
                <Button variant="danger">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
