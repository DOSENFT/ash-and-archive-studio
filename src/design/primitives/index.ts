/**
 * Ash & Archive Design System — Primitive Components
 *
 * Core UI building blocks with consistent styling.
 * Import from '@/design/primitives' for component access.
 */

export { Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card'
export type { CardProps, CardVariant } from './Card'

export { Badge, DotBadge } from './Badge'
export type { BadgeProps, BadgeVariant, DotBadgeProps } from './Badge'

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
} from './Skeleton'
export type { SkeletonProps, SkeletonTextProps, SkeletonCardProps } from './Skeleton'

export { EmptyState, EmptyStateNoData, EmptyStateNoResults } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { ErrorState, NetworkError, NotFoundError } from './ErrorState'
export type { ErrorStateProps } from './ErrorState'
