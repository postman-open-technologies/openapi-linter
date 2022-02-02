resource storageAccount 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  name: '${take(replace(deployment().name, '-', ''), 10)}${uniqueString(resourceGroup().id)}'
  kind: 'StorageV2'
  location: resourceGroup().location
  sku: {
    name: 'Standard_LRS'
  }
}

resource blobStorage 'Microsoft.Storage/storageAccounts/blobServices@2021-06-01' = {
  parent: storageAccount
  name: 'default'
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2021-06-01' = {
  name: deployment().name
  parent: blobStorage
  properties: {
    publicAccess: 'Blob'
  }
}

