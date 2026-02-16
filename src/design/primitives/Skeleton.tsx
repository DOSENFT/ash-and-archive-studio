import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'card'
  width?: string | number
  height?: string | number
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'line', width, height, className, style, ...props }, ref) => {
    const variantStyles = {
      line: 'h-4 rounded',
      circle: 'rounded-full',
      card: 'rounded-2xl',
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base skeleton styles
          'bg-void-2',
          'animate-pulse',
          // Shimmer effect via gradient
          'relative overflow-hidden',
          "after:absolute after:inset-0",
          "after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent",
          "after:animate-[shimmer_1.5s_linear_infinite]",
          // Variant
          variantStyles[variant],
          className
        )}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Text skeleton for paragraph placeholders
export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number
  lastLineWidth?: string
}

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, lastLineWidth = '60%', className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="line"
            style={{
              width: i === lines - 1 ? lastLineWidth : '100%',
            }}
          />
        ))}
      </div>
    )
  }
)

SkeletonText.displayName = 'SkeletonText'

// Card skeleton for placeholder cards
export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean
  lines?: number
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ hasImage = true, lines = 3, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-void-1/80 backdrop-blur-md border border-white/10',
          'rounded-2xl p-6',
          'space-y-4',
          className
        )}
        {...props}
      >
        {hasImage && (
          <Skeleton variant="card" className="w-full h-32" />
        )}
        <div className="space-y-2">
          <Skeleton variant="line" className="w-3/4 h-6" />
          <SkeletonText lines={lines} />
        </div>
      </div>
    )
  }
)

SkeletonCard.displayName = 'SkeletonCard'

// Avatar skeleton
export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        variant="circle"
        className={cn(avatarSizes[size], className)}
        {...props}
      />
    )
  }
)

SkeletonAvatar.displayName = 'SkeletonAvatar'
