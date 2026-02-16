import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from '../primitives/Badge'

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  badge?: {
    label: string
    variant?: BadgeVariant
  }
  title: string
  description?: string
  actions?: ReactNode
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ badge, title, description, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'py-6 border-b border-white/5',
          className
        )}
        {...props}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            {badge && (
              <Badge variant={badge.variant || 'default'} className="mb-2">
                {badge.label}
              </Badge>
            )}
            <h1 className="text-3xl font-bold font-display text-forge-0 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-forge-1 mt-2 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'
