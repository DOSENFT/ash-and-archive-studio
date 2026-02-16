import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CardVariant = 'glass' | 'solid' | 'outline' | 'elevated'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
  selected?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  glass: `
    bg-void-1/80 backdrop-blur-md
    border border-white/10
  `,
  solid: `
    bg-void-1
    border border-void-2
  `,
  outline: `
    bg-transparent
    border border-white/10
  `,
  elevated: `
    bg-void-2/90 backdrop-blur-lg
    border border-white/5
    shadow-lg
  `,
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-12',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      hover = false,
      selected = false,
      padding = 'md',
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-2xl',
          'transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          // Variant
          variantStyles[variant],
          // Padding
          paddingStyles[padding],
          // Hover effect
          hover && [
            'hover:-translate-y-0.5',
            'hover:shadow-[0_0_30px_rgba(61,210,255,0.2)]',
            'hover:border-white/20',
            'cursor-pointer',
          ],
          // Selected state
          selected && [
            'border-arcane',
            'shadow-[0_0_30px_rgba(61,210,255,0.3)]',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card subcomponents for structured content
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children?: ReactNode
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', children, className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-2xl font-semibold font-display text-forge-0',
        'leading-snug tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
)

CardTitle.displayName = 'CardTitle'

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-forge-1 text-base', className)}
      {...props}
    >
      {children}
    </p>
  )
)

CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'
