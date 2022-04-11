/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

var util = require('util');
const { DefaultAzureCredential } = require('@azure/identity');
var { ResourceManagementClient } = require('@azure/arm-resources');
var { WebSiteManagementClient } = require('@azure/arm-appservice');

_validateEnvironmentVariables();
_validateParameters();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceGroupName = process.argv[2];
var websiteName = process.argv[3];
var resourceClient, websiteClient;

async function deleteWebSite() {
  try{
    console.log('\nDeleting web site : ' + websiteName);
    await websiteClient.webApps.delete(resourceGroupName, websiteName);
    console.log('Successfully deleted the website: ' + websiteName);
  }catch(err){
    console.log('Error occured in deleting the website: ' + websiteName + '\n' + util.inspect(err, { depth: null }));
  }
}

async function deleteResourceGroup() {
  try{
    console.log('\nDeleting the resource group can take few minutes, so please be patient :).');
    console.log('\nDeleting resource group: ' + resourceGroupName);
    await resourceClient.resourceGroups.beginDeleteAndWait(resourceGroupName);
    console.log('Successfully deleted the resourcegroup: ' + resourceGroupName);
  }catch(err){
    console.log('Error occured in deleting the resource group: ' + resourceGroupName + '\n' + util.inspect(err, { depth: null }));
  }
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

function _validateParameters() {
  if (!process.argv[2] || !process.argv[3]) {
    throw new Error('Please provide the resource group and the website name by executing the script as follows: "node cleanup.js <resourceGroupName> <websiteName>".');
  }
}

//Entrypoint of the cleanup script
async function main(){
  const credentials = new DefaultAzureCredential();
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  websiteClient = new WebSiteManagementClient(credentials, subscriptionId);
  await deleteWebSite();
  await deleteResourceGroup();
}
main().catch((err)=>{
  console.log(err)
})

