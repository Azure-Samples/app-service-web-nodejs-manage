/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

var util = require('util');
var async = require('async');
var msRestAzure = require('ms-rest-azure');
var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
var WebSiteManagement = require('azure-arm-website');

_validateEnvironmentVariables();
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
//Entrypoint for the vm-sample script//
///////////////////////////////////////

msRestAzure.interactiveLogin(function (err, credentials) {
  if (err) return console.log(err);
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  webSiteClient = new WebSiteManagement(credentials, subscriptionId);
  // Work flow of this sample:
  // 1. create a resource group 
  // 2. create a hosting plan
  // 3. create a website
  // 4. list websites in a resourcegroup
  // 5. get details for a given website
  // 6. update site config(number of workers and phpversion) for a website
  // 7. delete a website
  // 8. delete the resource group
  
  async.series([
    function (callback) {
      //Setup
      createResourceGroup(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    },
    function (callback) {
      //Task 1
      createHostingPlan(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        expectedServerFarmId = result.id;
        callback(null, result);
      });
    },
    function (callback) {
      //Task 2
      createWebSite(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    },
    function (callback) {
      //Task 3
      listWebsites(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nWebsites in subscription %s : \n%s',
            subscriptionId, util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 4
      getWebSite(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nWeb site details: \n%s',
            util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 5
      updateWebisteConfig(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nWeb site details: \n%s',
            util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 6
      deleteWebSite(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    }
  ], 
  // Once above operations finish, cleanup and exit.
  function (err, results) {
    if (err) {
      console.log(util.format('\n??????Error occurred in one of the operations.\n%s', 
          util.inspect(err, { depth: null })));
    } else {
      console.log(util.format('\n######All the operations have completed successfully. '));
    }
    //Cleanup
    deleteResourceGroup(function (err, result, request, response) {
      console.log('\n###### Exit ######')
      process.exit();
    });
  });
});


// Helper functions
function createResourceGroup(callback) {
  var groupParameters = { location: location, tags: { sampletag: 'sampleValue' } };
  console.log('\nCreating resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
}

function createHostingPlan(callback) {
  var planParameters = {
    serverFarmWithRichSkuName: hostingPlanName,
    location: location,
    sku: {
      name: 'S1',
      capacity: 1,
      tier: 'Standard'
    }  
  };
  console.log('\nCreating hosting plan: ' + hostingPlanName + ' with parameters:\n' + util.inspect(planParameters));
  return webSiteClient.serverFarms.createOrUpdateServerFarm(resourceGroupName, hostingPlanName, planParameters, callback);
}

function createWebSite(callback) {
  var parameters = {
    location: location,
    serverFarmId: expectedServerFarmId
  };
  console.log('\nCreating web site: ' + webSiteName + ' with parameters:\n' + util.inspect(parameters));
  return webSiteClient.sites.createOrUpdateSite(resourceGroupName, webSiteName, parameters, callback);
}

function listWebsites(callback) {
  console.log('\nListing websites in the resourceGroup : ' + resourceGroupName);
  return webSiteClient.sites.getSites(resourceGroupName, callback);
}

function getWebSite(callback) {
  console.log('\nGetting info of website: ' + webSiteName);
  return webSiteClient.sites.getSite(resourceGroupName, webSiteName, callback);
}

function updateWebisteConfig(callback) {
  var siteConfig = {
    location: location,
    serverFarmId: expectedServerFarmId,
    numberOfWorkers: 2,
    phpVersion: '5.5'
  };
  console.log('\nUpdating config for website : ' + webSiteName + ' with parameters:\n' + util.inspect(siteConfig));
  return webSiteClient.sites.createOrUpdateSiteConfig(resourceGroupName, webSiteName, siteConfig, callback);
}

function deleteWebSite(callback) {
  console.log('\nDeleting web site : ' + webSiteName);
  return webSiteClient.sites.deleteSite(resourceGroupName, webSiteName, callback);
}

function deleteResourceGroup(callback) {
  console.log('\nDeleting resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.deleteMethod(resourceGroupName, callback);
}

function _validateEnvironmentVariables() {
  var envs = [];
  if (!process.env['AZURE_SUBSCRIPTION_ID']) envs.push('AZURE_SUBSCRIPTION_ID');
  if (envs.length > 0) {
    throw new Error(util.format('please set/export the following environment variables: %s', envs.toString()));
  }
}

function _generateRandomId(prefix, exsitIds) {
  var newNumber;
  while (true) {
    newNumber = prefix + Math.floor(Math.random() * 10000);
    if (!exsitIds || !(newNumber in exsitIds)) {
      break;
    }
  }
  return newNumber;
}