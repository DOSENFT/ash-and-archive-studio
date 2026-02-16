export type AnalyticsEventName =
  | 'home_cta_impression'
  | 'home_cta_click'
  | 'home_cta_completion'

export interface AnalyticsPayload {
  ctaId: 'open_world_builder' | 'open_campaign_builder'
  placement: 'dashboard_home'
  [key: string]: string | number | boolean | undefined
}

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload) {
  const analyticsEvent = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    const windowWithDataLayer = window as Window & { dataLayer?: Array<Record<string, unknown>> }
    windowWithDataLayer.dataLayer = windowWithDataLayer.dataLayer ?? []
    windowWithDataLayer.dataLayer.push(analyticsEvent)
  }

  console.info('[analytics]', analyticsEvent)
}
