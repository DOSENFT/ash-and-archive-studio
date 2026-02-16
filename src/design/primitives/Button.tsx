import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ember' | 'eldritch' | 'verdant'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-arcane text-void-0
    hover:shadow-[0_0_30px_rgba(61,210,255,0.4)]
    active:shadow-[0_0_30px_rgba(61,210,255,0.5)]
    disabled:bg-arcane/50
  `,
  secondary: `
    bg-void-2 text-forge-0 border border-white/10
    hover:bg-void-2/80 hover:border-white/20
    active:bg-void-1
    disabled:bg-void-2/50 disabled:text-forge-2
  `,
  ghost: `
    bg-transparent text-arcane
    hover:bg-arcane/10
    active:bg-arcane/20
    disabled:text-arcane/50
  `,
  danger: `
    bg-red-500 text-white
    hover:bg-red-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]
    active:bg-red-700
    disabled:bg-red-500/50
  `,
  ember: `
    bg-ember text-void-0
    hover:shadow-[0_0_30px_rgba(244,181,69,0.4)]
    active:shadow-[0_0_30px_rgba(244,181,69,0.5)]
    disabled:bg-ember/50
  `,
  eldritch: `
    bg-eldritch text-white
    hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]
    active:shadow-[0_0_30px_rgba(139,92,246,0.5)]
    disabled:bg-eldritch/50
  `,
  verdant: `
    bg-verdant text-void-0
    hover:shadow-[0_0_30px_rgba(57,217,138,0.4)]
    active:shadow-[0_0_30px_rgba(57,217,138,0.5)]
    disabled:bg-verdant/50
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-semibold font-display',
          'rounded-xl',
          'transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          // Focus ring
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-void-0',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Variant and size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {loading ? 'Loading...' : children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'
