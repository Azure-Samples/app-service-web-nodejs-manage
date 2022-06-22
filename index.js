/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

var util = require('util');
var async = require('async');
const { ClientSecretCredential } = require('@azure/identity');
var { ResourceManagementClient } = require('@azure/arm-resources');
var { WebSiteManagementClient } = require('@azure/arm-appservice');

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

try{
  const credentials = new ClientSecretCredential(domain,clientId,secret);
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  webSiteClient = new WebSiteManagementClient(credentials, subscriptionId);
  // Work flow of this sample:
  // 1. create a resource group 
  // 2. create a hosting plan
  // 3. create a website
  // 4. list websites in a resourcegroup
  // 5. get details for a given website
  // 6. update site config(number of workers and phpversion) for a website
  
  async.series([
    async function (callback) {
      //Setup
      try{
        const result = await createResourceGroup();
        callback(null, result);
      }catch(err){
        return callback(err);
      }
    },
    async function (callback) {
      //Task 1
      try{
        const result = await createHostingPlan();
        expectedServerFarmId = result.id;
        callback(null, result);
      }catch(err){
        return callback(err);
      }
    },
    async function (callback) {
      //Task 2
      try{
        const result = await createWebSite();
        callback(null, result);
      }catch(err){
        return callback(err);
      }
    },
    function (callback) {
      //Task 3
      try{
        const result = listWebsites();
        console.log(util.format('\nWebsites in subscription %s : \n%s',
            subscriptionId, util.inspect(result, { depth: null })));
        callback(null, result);
      }catch(err){
        return callback(err);
      }
    },
    async function (callback) {
      //Task 4
      try{
        const result = await getWebSite();
        console.log(util.format('\nWeb site details: \n%s',
            util.inspect(result, { depth: null })));
        callback(null, result);
      }catch(err){
        return callback(err);
      }
    },
    async function (callback) {
      //Task 5
      try{
        const result = await updateWebisteConfig();
        console.log(util.format('\nWeb site details: \n%s',
            util.inspect(result, { depth: null })));
        callback(null, result);
      }catch(err){
        return callback(err);
      }
    }
  ], 
  // Once above operations finish, cleanup and exit.
  function (err, results) {
    if (err) {
      console.log(util.format('\n??????Error occurred in one of the operations.\n%s', 
          util.inspect(err, { depth: null })));
    } else {
      console.log(util.format('\n######You can browse the website at: https://%s.', results[4].enabledHostNames[0]));
    }
    console.log('\n###### Exit ######');
    console.log(util.format('Please execute the following script for cleanup:\nnode cleanup.js %s %s', resourceGroupName, webSiteName));
    process.exit();
  });
}catch(err){
    console.log(err)
}

// Helper functions
async function createResourceGroup() {
  var groupParameters = { location: location, tags: { sampletag: 'sampleValue' } };
  console.log('\nCreating resource group: ' + resourceGroupName);
  return await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters);
}

async function createHostingPlan() {
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
  return await webSiteClient.appServicePlans.beginCreateOrUpdateAndWait(resourceGroupName, hostingPlanName, planParameters);
}

async function createWebSite() {
  var parameters = {
    location: location,
    serverFarmId: expectedServerFarmId
  };
  console.log('\nCreating web site: ' + webSiteName + ' with parameters:\n' + util.inspect(parameters));
  return await webSiteClient.webApps.beginCreateOrUpdateAndWait(resourceGroupName, webSiteName, parameters);
}

function listWebsites() {
  console.log('\nListing websites in the resourceGroup : ' + resourceGroupName);
  return webSiteClient.webApps.listByResourceGroup(resourceGroupName);
}

async function getWebSite() {
  console.log('\nGetting info of website: ' + webSiteName);
  return await webSiteClient.webApps.get(resourceGroupName, webSiteName);
}

async function updateWebisteConfig() {
  var siteConfig = {
    location: location,
    serverFarmId: expectedServerFarmId,
    numberOfWorkers: 2,
    phpVersion: '5.5'
  };
  console.log('\nUpdating config for website : ' + webSiteName + ' with parameters:\n' + util.inspect(siteConfig));
  return await webSiteClient.webApps.updateConfiguration(resourceGroupName, webSiteName, siteConfig);
}

async function deleteWebSite() {
  console.log('\nDeleting web site : ' + webSiteName);
  return webSiteClient.webApps.delete(resourceGroupName, webSiteName);
}

async function deleteResourceGroup() {
  console.log('\nDeleting resource group: ' + resourceGroupName);
  return await resourceClient.resourceGroups.beginDeleteAndWait(resourceGroupName);
}

function _validateEnvironmentVariables() {
  var envs = [];
  if (!process.env['CLIENT_ID']) envs.push('CLIENT_ID');
  if (!process.env['DOMAIN']) envs.push('DOMAIN');
  if (!process.env['APPLICATION_SECRET']) envs.push('APPLICATION_SECRET');
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
