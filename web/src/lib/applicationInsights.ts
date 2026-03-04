import { ReactPlugin, useAppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { useRef } from 'react'
import { useAuthContext } from 'react-oauth2-code-pkce'

const connectionString = import.meta.env.VITE_APPINSIGHTS_CON_STRING || ''

export const reactPlugin = new ReactPlugin()
export const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString,
    enableAutoRouteTracking: false,
    maxBatchInterval: 0,
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
  const { tokenData } = useAuthContext()

  if (!connectionString || !tokenData) return
  if (!hasTrackedInitialPageView.current) {
    reactAppInsights.trackPageView({ isLoggedIn: true })
    reactAppInsights.trackEvent({ name: 'Main page load', properties: {} })
    hasTrackedInitialPageView.current = true
  }
}
