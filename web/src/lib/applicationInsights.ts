import { ReactPlugin, useAppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { useRef } from 'react'

const connectionString = import.meta.env.VITE_APPINSIGHTS_CON_STRING || ''

export const reactPlugin = new ReactPlugin()
export const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString,
    enableAutoRouteTracking: false,
    maxBatchInterval: 0,
    // 'unload' is deprecated and blocked by the browser's Permissions Policy; the SDK still flushes on pagehide/visibilitychange
    disablePageUnloadEvents: ['unload'],
    extensions: [reactPlugin],
  },
})

if (connectionString) {
  appInsights.loadAppInsights()
} else {
  console.error('Application Insights connection string is not defined')
}

export function useAppInsights() {
  const hasTrackedInitialPageView = useRef(false)
  const reactAppInsights = useAppInsightsContext()

  if (!hasTrackedInitialPageView.current) {
    reactAppInsights.trackPageView({ isLoggedIn: true })
    reactAppInsights.trackEvent({ name: 'Main page load', properties: {} })
    hasTrackedInitialPageView.current = true
  }
}
