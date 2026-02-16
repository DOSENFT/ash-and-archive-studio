import { forwardRef, type HTMLAttributes, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, separator, className, ...props }, ref) => {
    const defaultSeparator = (
      <svg
        className="w-4 h-4 text-forge-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5l7 7-7 7"
        />
      </svg>
    )

    return (
      <nav
        ref={ref}
        className={cn('flex items-center', className)}
        aria-label="Breadcrumb"
        {...props}
      >
        <ol className="flex items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <Fragment key={item.label}>
                <li className="flex items-center">
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className={cn(
                        'text-sm text-forge-2 hover:text-forge-0',
                        'transition-colors duration-[180ms]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane',
                        'focus-visible:ring-offset-2 focus-visible:ring-offset-void-0',
                        'rounded'
                      )}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'text-sm',
                        isLast ? 'text-forge-0 font-medium' : 'text-forge-2'
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
                {!isLast && (
                  <li className="flex items-center" aria-hidden="true">
                    {separator || defaultSeparator}
                  </li>
                )}
              </Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumbs.displayName = 'Breadcrumbs'
