import { useEffect } from 'react'

interface InteractionProfilerOptions {
  sampleMs?: number
  frameBudgetMs?: number
  label?: string
}

interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number
}

export function useInteractionProfiler({
  sampleMs = 6000,
  frameBudgetMs = 20,
  label = 'Landing interactions',
}: InteractionProfilerOptions = {}) {
  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    let rafId = 0
    const frameTimes: number[] = []
    let previousFrame = performance.now()
    const startTime = previousFrame

    const tick = (now: number) => {
      frameTimes.push(now - previousFrame)
      previousFrame = now

      if (now - startTime < sampleMs) {
        rafId = window.requestAnimationFrame(tick)
        return
      }

      const averageFrameMs =
        frameTimes.length > 0 ? frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length : 0
      const overBudgetFrames = frameTimes.filter((value) => value > frameBudgetMs).length
      const overBudgetPercent = frameTimes.length > 0 ? (overBudgetFrames / frameTimes.length) * 100 : 0
      const nav = navigator as NavigatorWithDeviceMemory
      const isMidTier = (nav.deviceMemory ?? 8) <= 8

      const summary = {
        label,
        sampleMs,
        averageFrameMs: Number(averageFrameMs.toFixed(2)),
        overBudgetPercent: Number(overBudgetPercent.toFixed(1)),
        frameBudgetMs,
        deviceClass: isMidTier ? 'mid-tier-or-lower' : 'high-tier',
      }

      if (overBudgetPercent > 12 || averageFrameMs > 17.5) {
        console.warn('[interaction-profile] Performance pressure detected', summary)
        return
      }

      console.info('[interaction-profile] Profile within target', summary)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [frameBudgetMs, label, sampleMs])
}
