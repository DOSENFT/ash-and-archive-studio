import {
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

const SUCCESS_FLASH_MS = 900

export type CTAState = 'idle' | 'loading' | 'success' | 'blocked'
type CTAVariant = 'primary' | 'ghost'

interface CTACommonProps {
  children: ReactNode
  className?: string
  variant?: CTAVariant
  state?: CTAState
  flashSuccessOnClick?: boolean
  loadingLabel?: string
  successLabel?: string
  blockedLabel?: string
}

type AnchorCTAProps = CTACommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> & {
    href: string
  }

type ButtonCTAProps = CTACommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    href?: never
  }

export type InteractiveCTAProps = AnchorCTAProps | ButtonCTAProps

function LoadingIcon() {
  return (
    <svg className="interactive-cta__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BlockedIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function InteractiveCTA(props: InteractiveCTAProps) {
  const {
    children,
    className,
    variant = 'primary',
    state = 'idle',
    flashSuccessOnClick = true,
    loadingLabel = 'Loading',
    successLabel = 'Success',
    blockedLabel = 'Unavailable',
    ...nativeProps
  } = props

  const [isPressed, setIsPressed] = useState(false)
  const [showFlashSuccess, setShowFlashSuccess] = useState(false)

  const effectiveState: CTAState = state === 'idle' && showFlashSuccess ? 'success' : state
  const isLoading = effectiveState === 'loading'
  const isBlocked = effectiveState === 'blocked'
  const isSuccess = effectiveState === 'success'

  useEffect(() => {
    if (!showFlashSuccess) {
      return
    }

    const timeout = window.setTimeout(() => setShowFlashSuccess(false), SUCCESS_FLASH_MS)
    return () => window.clearTimeout(timeout)
  }, [showFlashSuccess])

  useEffect(() => {
    if (state !== 'idle') {
      setShowFlashSuccess(false)
    }
  }, [state])

  const announcement = useMemo(() => {
    if (isLoading) return loadingLabel
    if (isSuccess) return successLabel
    if (isBlocked) return blockedLabel
    return ''
  }, [blockedLabel, isBlocked, isLoading, isSuccess, loadingLabel, successLabel])

  const rootClassName = cn(
    'interactive-cta',
    variant === 'primary' ? 'interactive-cta--primary' : 'interactive-cta--ghost',
    className,
  )

  const statusNode = (
    <span className="interactive-cta__status" aria-hidden="true">
      {isLoading ? <LoadingIcon /> : isSuccess ? <SuccessIcon /> : isBlocked ? <BlockedIcon /> : null}
    </span>
  )

  if ('href' in nativeProps) {
    const {
      href,
      onClick,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onKeyDown,
      onKeyUp,
      ...anchorProps
    } = nativeProps as Omit<AnchorCTAProps, keyof CTACommonProps>

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (isBlocked || isLoading) {
        event.preventDefault()
        return
      }

      onClick?.(event)
      if (!event.defaultPrevented && flashSuccessOnClick && state === 'idle') {
        setShowFlashSuccess(true)
      }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        setIsPressed(true)
      }
      onKeyDown?.(event)
    }

    return (
      <a
        {...anchorProps}
        href={href}
        className={rootClassName}
        data-state={effectiveState}
        data-pressed={isPressed ? 'true' : 'false'}
        aria-disabled={isBlocked || isLoading}
        aria-busy={isLoading || undefined}
        onClick={handleClick}
        onMouseDown={(event) => {
          setIsPressed(true)
          onMouseDown?.(event)
        }}
        onMouseUp={(event) => {
          setIsPressed(false)
          onMouseUp?.(event)
        }}
        onMouseLeave={(event) => {
          setIsPressed(false)
          onMouseLeave?.(event)
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          setIsPressed(false)
          onKeyUp?.(event)
        }}
      >
        <span className="interactive-cta__label">{children}</span>
        {statusNode}
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </a>
    )
  }

  const {
    type = 'button',
    disabled,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onKeyDown,
    onKeyUp,
    ...buttonProps
  } = nativeProps as Omit<ButtonCTAProps, keyof CTACommonProps>

  const isNativeDisabled = Boolean(disabled || isLoading)
  const isInteractionBlocked = Boolean(disabled || isLoading || isBlocked)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isInteractionBlocked) {
      event.preventDefault()
      return
    }

    onClick?.(event)
    if (!event.defaultPrevented && flashSuccessOnClick && state === 'idle') {
      setShowFlashSuccess(true)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsPressed(true)
    }
    onKeyDown?.(event)
  }

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isNativeDisabled}
      className={rootClassName}
      data-state={effectiveState}
      data-pressed={isPressed ? 'true' : 'false'}
      aria-disabled={isBlocked || disabled || undefined}
      aria-busy={isLoading || undefined}
      onClick={handleClick}
      onMouseDown={(event) => {
        setIsPressed(true)
        onMouseDown?.(event)
      }}
      onMouseUp={(event) => {
        setIsPressed(false)
        onMouseUp?.(event)
      }}
      onMouseLeave={(event) => {
        setIsPressed(false)
        onMouseLeave?.(event)
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={(event) => {
        setIsPressed(false)
        onKeyUp?.(event)
      }}
    >
      <span className="interactive-cta__label">{children}</span>
      {statusNode}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </button>
  )
}
