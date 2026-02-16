import { forwardRef, type HTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  error?: Error | string | null
  onRetry?: () => void
  showDetails?: boolean
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = 'Something went wrong',
      message = 'An unexpected error occurred. Please try again.',
      error,
      onRetry,
      showDetails = true,
      className,
      ...props
    },
    ref
  ) => {
    const [detailsOpen, setDetailsOpen] = useState(false)
    const errorMessage = error instanceof Error ? error.message : error

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          'py-12 px-6',
          'max-w-md mx-auto',
          className
        )}
        role="alert"
        {...props}
      >
        {/* Error icon */}
        <div className="mb-4 text-red-400" aria-hidden="true">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold font-display text-forge-0 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-forge-1 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Try again
            </Button>
          )}
          {showDetails && errorMessage && (
            <Button
              variant="ghost"
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              {detailsOpen ? 'Hide details' : 'Show details'}
            </Button>
          )}
        </div>

        {/* Technical details (collapsible) */}
        {showDetails && errorMessage && detailsOpen && (
          <div
            className={cn(
              'mt-6 w-full',
              'bg-void-2 rounded-lg p-4',
              'text-left overflow-auto',
              'max-h-48'
            )}
          >
            <p className="text-xs font-mono text-forge-2 mb-1">Error details:</p>
            <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap break-words">
              {errorMessage}
            </pre>
            {error instanceof Error && error.stack && (
              <>
                <p className="text-xs font-mono text-forge-2 mt-3 mb-1">Stack trace:</p>
                <pre className="text-xs font-mono text-forge-2 whitespace-pre-wrap break-words">
                  {error.stack}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    )
  }
)

ErrorState.displayName = 'ErrorState'

// Network error variant
export const NetworkError = forwardRef<
  HTMLDivElement,
  Omit<ErrorStateProps, 'title' | 'message'>
>((props, ref) => (
  <ErrorState
    ref={ref}
    title="Connection error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    {...props}
  />
))

NetworkError.displayName = 'NetworkError'

// 404 variant
export const NotFoundError = forwardRef<
  HTMLDivElement,
  Omit<ErrorStateProps, 'title' | 'message'> & { resourceName?: string }
>(({ resourceName = 'page', ...props }, ref) => (
  <ErrorState
    ref={ref}
    title={`${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} not found`}
    message={`The ${resourceName} you're looking for doesn't exist or has been moved.`}
    showDetails={false}
    {...props}
  />
))

NotFoundError.displayName = 'NotFoundError'
