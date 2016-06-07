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

1. [Create a service principal](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal-cli/).

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

## Workflow of this sample
 
1. Login interactively
2. Create a resource group 
3. Create a hosting plan
4. Create a website
5. List websites in the resourcegroup
6. Get details for the given website
7. Update site config(number of workers and phpversion) for the website

## Cleanup
- Please run the script from the same command prompt/terminal as the environment variables defined in the above step would be set. If not then please set them before running the cleanup script.

```
node cleanup.js <resourceGroupName> <websiteName>
```

## More information
Please refer to [Azure SDK for Node](https://github.com/Azure/azure-sdk-for-node) for more information.
