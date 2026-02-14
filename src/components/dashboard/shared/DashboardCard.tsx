import { ReactNode } from 'react'

interface DashboardCardProps {
  children: ReactNode
  depth?: 1 | 2 | 3
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  onClick?: () => void
  ariaLabel?: string
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
}

export default function DashboardCard({
  children,
  depth = 2,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
  ariaLabel,
}: DashboardCardProps) {
  const depthClass = `card-depth-${depth}`
  const hoverClass = hoverable
    ? 'transition-all duration-base ease-forge hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
    : ''

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      className={`${depthClass} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  )
}
