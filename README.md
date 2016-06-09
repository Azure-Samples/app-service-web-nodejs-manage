---
services: app-service
platforms: node.js
author: allclark
---

# Manage Azure websites with Node.js

This sample demonstrates how to manage your Azure websites using a node.js client.

**On this page**

- [Run this sample](#run)
- [What does index.js do?](#sample)
    - [Create a hosting plan](#create-hosting-plan)
    - [Create a website](#create-website)
    - [List websites](#list-websites)
    - [Get website details](#details)
    - [Update a website](#update)

<a id="run"></a>
## Run this sample

1. If you don't already have it, [get node.js](https://nodejs.org).

1. Clone the repository.

    ```
    git clone https://github.com:Azure-Samples/app-service-web-nodejs-manage.git
    ```

1. Install the dependencies.

    ```
    cd app-service-web-nodejs-manage
    npm install
    npm install async ms-rest-azure
    ```

1. Create an Azure service principal either through
    [Azure CLI](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal-cli/),
    [PowerShell](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal/)
    or [the portal](https://azure.microsoft.com/en-us/documentation/articles/resource-group-create-service-principal-portal/).

1. Set the following environment variables using the information from the service principle that you created.

    ```
    export AZURE_SUBSCRIPION_ID={your subscription id}
    export CLIENT_ID={your client id}
    export APPLICATION_SECRET={your client secret}
    export DOMAIN={your tenant id as a guid OR the domain name of your org <contosocorp.com>}
    ```

    > [AZURE.NOTE] On Windows, use `set` instead of `export`.

1. Run the sample.

    ```
    node index.js
    ```

1. To clean up after index.js, run the cleanup script.

    ```
    node cleanup.js <resourceGroupName> <websiteName>
    ```

<a id="sample"></a>
## What does index.js do?

The sample creates, lists and updates a website.
It starts by logging in using your service principal.

```javascript
_validateEnvironmentVariables();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceClient, webSiteClient;
//Sample Config
var randomIds = {};
var location = 'westus';
var resourceGroupName = _generateRandomId('testrg', randomIds);
var hostingPlanName = _generateRandomId('plan', randomIds);
var webSiteName = _generateRandomId('testweb', randomIds);
var expectedServerFarmId;

///////////////////////////////////////
//Entrypoint for the sample script   //
///////////////////////////////////////

msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
  if (err) return console.log(err);
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  webSiteClient = new WebSiteManagement(credentials, subscriptionId);
```

The sample then sets up a resource group in which it will create the website.

```
function createResourceGroup(callback) {
  var groupParameters = { location: location, tags: { sampletag: 'sampleValue' } };
  console.log('\nCreating resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
}
```

<a id="create-hosting-plan"></a>
### Create a hosting plan

To create a website, you need a hosting plan. Here's how to create one.

```javascript
var planParameters = {
  serverFarmWithRichSkuName: hostingPlanName,
  location: location,
  sku: {
    name: 'S1',
    capacity: 1,
    tier: 'Standard'
  }  
};
webSiteClient.serverFarms.createOrUpdateServerFarm(resourceGroupName, hostingPlanName, planParameters, callback);
```

<a id="create-website"></a>
### Create a website

```javascript
var parameters = {
  location: location,
  serverFarmId: expectedServerFarmId
};
webSiteClient.sites.createOrUpdateSite(resourceGroupName, webSiteName, parameters, callback);
```

<a id="list-websites"></a>
### List websites in the resourcegroup

```javascript
webSiteClient.sites.getSites(resourceGroupName, callback);
```

<a id="details"></a>
### Get details for the given website

```javascript
webSiteClient.sites.getSite(resourceGroupName, webSiteName, callback);
```

<a id="update"></a>
### Update site config(number of workers and phpversion) for the website

```javascript
var siteConfig = {
  location: location,
  serverFarmId: expectedServerFarmId,
  numberOfWorkers: 2,
  phpVersion: '5.5'
};
webSiteClient.sites.createOrUpdateSiteConfig(resourceGroupName, webSiteName, siteConfig, callback);
```

## More information
Please refer to [Azure SDK for Node](https://github.com/Azure/azure-sdk-for-node) for more information.
