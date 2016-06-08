# app-service-web-nodejs-manage

This sample demonstrates how to manage your webapps using a node.js client

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
    npm install azync
    npm install ms-rest-azure
    ```

1. Create an Azure service principal either through
[Azure CLI](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal-cli/),
[PowerShell](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal/)
or [the portal](https://azure.microsoft.com/en-us/documentation/articles/resource-group-create-service-principal-portal/).

1. Set the following environment variables using the information from the service principle that you created.

    ```
    export AZURE_SUBSCRIPION_ID=abc-123-345
    export CLIENT_ID=def-456-897
	export APPLICATION_SECRET=password
	export DOMAIN=<tenant id as a guid> OR the domain name of your org <contosocorp.com>
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

## What does index.js do?

The sample 

### Create a resource group 
### Create a hosting plan
### Create a website
### List websites in the resourcegroup
### Get details for the given website
### Update site config(number of workers and phpversion) for the website

## More information
Please refer to [Azure SDK for Node](https://github.com/Azure/azure-sdk-for-node) for more information.
