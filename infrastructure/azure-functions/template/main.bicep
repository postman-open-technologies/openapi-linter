resource storageAccount 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  name: '${take(replace(deployment().name, '-', ''), 10)}${uniqueString(resourceGroup().id)}'
  kind: 'StorageV2'
  location: resourceGroup().location
  sku: {
    name: 'Standard_LRS'
  }
}

/*
resource blobStorage 'Microsoft.Storage/storageAccounts/blobServices@2021-06-01' = {
  parent: storageAccount
  name: 'default'
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2021-06-01' = {
  name: deployment().name
  parent: blobStorage
}
*/

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
  kind: 'functionapp,linux'
  properties: {
    reserved: true
    siteConfig: {
      linuxFxVersion: 'node|14'
      appSettings: [
        {
            name: 'AzureWebJobsStorage'
            value: 'DefaultEndpointsProtocol=https;EndpointSuffix=${environment().suffixes.storage};AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value}'
        }
        {
          name: 'FUNCTION_WORKERS_RUNTIME'
          value: 'node'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
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
