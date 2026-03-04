import { ReactPlugin, useAppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
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

let hasTrackedInitialPageView = false
export function useAppInsights() {
  const appInsights = useAppInsightsContext()
  const { tokenData } = useAuthContext()

  if (!connectionString || !tokenData) return
  if (!hasTrackedInitialPageView) {
    appInsights.trackPageView({ isLoggedIn: true })
    appInsights.trackEvent({ name: 'Main page load', properties: {} })
    hasTrackedInitialPageView = true
  }
}
