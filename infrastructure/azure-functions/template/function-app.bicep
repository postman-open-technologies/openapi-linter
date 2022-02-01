resource storageAccount 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  name: '${take(replace(deployment().name, '-', ''), 10)}${uniqueString(resourceGroup().id)}'
  kind: 'StorageV2'
  location: resourceGroup().location
  sku: {
    name: 'Standard_LRS'
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: deployment().name
  kind: 'web'
  location: resourceGroup().location
  properties:{
    Application_Type: 'web'
  }
}

resource functionApp 'Microsoft.Web/sites@2021-02-01' = {
  name: deployment().name
  location: resourceGroup().location
  kind: 'functionapp'
  properties:{
    siteConfig:{
      appSettings:[
        {
            name: 'AzureWebJobsStorage'
            value: 'DefaultEndpointsProtocol=https;EndpointSuffix=${environment()};AccountName=${storageAccount.name};AccountKey=${storageAccount.id}'
        }
        {
          name: 'FUNCTION_WORKERS_RUNTIME'
          value: 'node'
        }
        {
          name: 'FUNCTION_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~14'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
    }
  }
}
