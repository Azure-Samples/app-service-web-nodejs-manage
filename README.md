# app-service-web-nodejs-manage
This sample demonstrates how to manage your webapps using a node.js client

## Running this sample

Please set the environment variable: `set AZURE_SUBSCRIPION_ID=abc-123-345`.

### Cloning the repo

```
git clone git@github.com:Azure-Samples/app-service-web-nodejs-manage.git
cd app-service-web-nodejs-manage
npm install
set AZURE_SUBSCRIPION_ID=abc-123-345
node index.js
```
### From npm

```
npm install app-service-web-nodejs-manage
set AZURE_SUBSCRIPION_ID=abc-123-345
node node_modules/app-service-web-nodejs-manage/index.js
```

## Sample Workflow
 
1. Login interactively
2. Create a resource group 
3. Create a hosting plan
4. Create a website
5. List websites in the resourcegroup
6. Get details for the given website
7. Update site config(number of workers and phpversion) for the website
8. Delete the website
9. Delete the resource group

## More information
Please refer to [Azure SDK for Node](https://github.com/Azure/azure-sdk-for-node) for more information.