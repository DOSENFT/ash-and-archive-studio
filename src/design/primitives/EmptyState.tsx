import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from './Button'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          'py-12 px-6',
          'max-w-sm mx-auto',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-forge-2" aria-hidden="true">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold font-display text-forge-0 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-forge-1 mb-6">{description}</p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

// Pre-composed empty states for common scenarios
export const EmptyStateNoData = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, 'title'> & { title?: string }
>(({ title = 'No data yet', ...props }, ref) => (
  <EmptyState
    ref={ref}
    title={title}
    icon={
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    }
    {...props}
  />
))

EmptyStateNoData.displayName = 'EmptyStateNoData'

export const EmptyStateNoResults = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, 'title'> & { title?: string; query?: string }
>(({ title, query, ...props }, ref) => (
  <EmptyState
    ref={ref}
    title={title || `No results${query ? ` for "${query}"` : ''}`}
    icon={
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    }
    {...props}
  />
))

EmptyStateNoResults.displayName = 'EmptyStateNoResults'
