import { useState, useEffect, useCallback } from 'react'

export type SessionProximity = 'distant' | 'approaching' | 'imminent' | 'today' | 'past' | 'none'

export interface SessionProximityState {
  proximity: SessionProximity
  daysUntil: number
  hoursUntil: number
  minutesUntil: number
  message: string
  glowColor: string
  isUrgent: boolean
}

export function useSessionProximity(sessionDate: Date | null): SessionProximityState {
  const calculateState = useCallback((): SessionProximityState => {
    if (!sessionDate) {
      return {
        proximity: 'none',
        daysUntil: -1,
        hoursUntil: -1,
        minutesUntil: -1,
        message: 'No session scheduled',
        glowColor: 'forge-2',
        isUrgent: false,
      }
    }

    const now = new Date()
    const diffMs = sessionDate.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffMs < 0) {
      return {
        proximity: 'past',
        daysUntil: diffDays,
        hoursUntil: diffHours,
        minutesUntil: diffMins,
        message: 'Session completed',
        glowColor: 'forge-2',
        isUrgent: false,
      }
    }

    if (diffDays === 0 || (diffHours < 24 && diffHours >= 0)) {
      return {
        proximity: 'today',
        daysUntil: 0,
        hoursUntil: diffHours,
        minutesUntil: diffMins,
        message: 'SHOWTIME',
        glowColor: 'ember',
        isUrgent: true,
      }
    }

    if (diffDays === 1) {
      return {
        proximity: 'imminent',
        daysUntil: 1,
        hoursUntil: diffHours,
        minutesUntil: diffMins,
        message: 'Final Preparations',
        glowColor: 'ember',
        isUrgent: true,
      }
    }

    if (diffDays <= 6) {
      return {
        proximity: 'approaching',
        daysUntil: diffDays,
        hoursUntil: diffHours,
        minutesUntil: diffMins,
        message: 'Preparation Phase',
        glowColor: 'ember',
        isUrgent: false,
      }
    }

    return {
      proximity: 'distant',
      daysUntil: diffDays,
      hoursUntil: diffHours,
      minutesUntil: diffMins,
      message: 'Time to Build',
      glowColor: 'arcane',
      isUrgent: false,
    }
  }, [sessionDate])

  const [state, setState] = useState<SessionProximityState>(calculateState)

  useEffect(() => {
    setState(calculateState())

    // Update every minute for accurate countdown
    const interval = setInterval(() => {
      setState(calculateState())
    }, 60000)

    return () => clearInterval(interval)
  }, [calculateState])

  return state
}
