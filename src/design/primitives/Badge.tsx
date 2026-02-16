import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'arcane'
  | 'ember'
  | 'verdant'
  | 'eldritch'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  children?: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-void-2 text-forge-1',
  info: 'bg-arcane/20 text-arcane',
  success: 'bg-verdant/20 text-verdant',
  warning: 'bg-ember/20 text-ember',
  error: 'bg-red-500/20 text-red-400',
  // Pillar colors
  arcane: 'bg-arcane/20 text-arcane',
  ember: 'bg-ember/20 text-ember',
  verdant: 'bg-verdant/20 text-verdant',
  eldritch: 'bg-eldritch/20 text-eldritch',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'rounded-full',
          'font-mono font-medium',
          'uppercase tracking-wide',
          // Variant and size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Dot badge for status indicators
export interface DotBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: 'online' | 'offline' | 'busy' | 'away'
  pulse?: boolean
}

const dotStatusStyles = {
  online: 'bg-verdant',
  offline: 'bg-forge-2',
  busy: 'bg-red-500',
  away: 'bg-ember',
}

export const DotBadge = forwardRef<HTMLSpanElement, DotBadgeProps>(
  ({ status = 'online', pulse = false, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'relative inline-flex h-2.5 w-2.5',
          className
        )}
        {...props}
      >
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              'animate-ping',
              dotStatusStyles[status]
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            dotStatusStyles[status]
          )}
        />
      </span>
    )
  }
)

DotBadge.displayName = 'DotBadge'
