@description('Specifies the location for resources.')
param location string = 'norwayeast'
@allowed(['dev', 'test', 'prod'])
param environment string

@maxValue(730)
param logRetentionDays int


resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: 'lcm-${environment}-logWorkspace'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource appInsight 'Microsoft.Insights/components@2020-02-02' = {
  name: 'lcm-${environment}-logs'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    Request_Source: 'rest'
    RetentionInDays: logRetentionDays
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}
