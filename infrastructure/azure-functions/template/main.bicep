targetScope =  'subscription'

module rg 'resource-group.bicep' = {
  name: '${deployment().name}-rg'
  scope: subscription()
  params: {
    name: deployment().name
    location: deployment().location
  }
}

module func 'function-app.bicep' = {
  name: deployment().name
  scope: resourceGroup(deployment().name)
  dependsOn:[
    rg
  ]
}
