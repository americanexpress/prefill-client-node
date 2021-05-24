# Prefill Service Node SDK
This JavaScript SDK implementation allows Amex partners to integrate seamlessly to the Amex Prefill Service
and reduces complexity out of the coding service layer integration to Prefill API. It assumes you have already set up your credentials with American Express and have your certs prepared. 

Amex Prefill Service provides the capability to pre-populate application submission data. The Amex partner 
pushes an applicant's information to the Prefill API prior to launching the card application. 
The Amex partner will receive a Prefill Token in return, which can be passed during the card application 
journey to redeem the applicant's data.

## Table of Contents

- [Documentation](#documentation)    
- [Installation](#installation)
- [Compatibility](#compatibility)
- [Configuration](#configuring-sdk)
- [Authentication](#authentication)
- [Business Functions](#business-functions)
    - [Save Data](#SaveData)
    - [Save Encrypted Data](#SaveEncryptedData)
- [Error Handling](#error-handling)
- [Samples](#Running-Samples)
- [Open Source Contribution](#Contributing)
- [License](#license)
- [Code of Conduct](#code-of-conduct)


<br/>

## Installation

```sh
	npm install @americanexpress/prefill-client-node
```
<br/>

## Compatibility

prefill-client-node sdk will support Node Version 6 or higher and NPM version 3.8.6 or higher.

- On newer version of Node you can use `async/await` instead of promises (all the below examples in the sdk will be using Promises)
- On older version of Node you can use either callbacks or promises, all the SDK functions will have an optional parameter to support call back.

Sample for call back support :

```js
var prefillclient = require('@americanexpress/prefill-client-node');
var config = {}
prefillclient.configure(config);

prefillclient.prefillService.saveData(request, headers, function (err, response) {
    if(err) {
        //handle error
    }
    else {
        //display token
    }
})


```


<br/>

## Configuring SDK

SDK needs to be configured with OAuth, Mutual Auth and Payload encryption configurations. below is the sample configuration snippet.

```js
const fs = require('fs');
const prefillclient = require('@americanexpress/prefill-client-node');
const config = {
    //-- required, based on the environment(test, production) it will change, Amex will provide the root URls
    rootUrl: 'api.qa2s.americanexpress.com', 
    /**
     *OAuth configuration  
     */
    authentication: {
        //optional -- if you have an active bearerToken, you can set this property and skip authentication call.
        bearerToken: '',
        //--required, OAuth key, will be provided by American Express.
        clientKey: '',
        //--required, OAuth Secret, will be provided by American Express.
        clientSecret: ''
    },
    /**
     * 2-way SSL(Mutual Auth) configuration
     */
    mutualAuth: {
        //--required, Client needs to provide file  private key file in .pem format
        privateKey: fs.readFileSync(''),
        // --required, Client needs to provide their public key file
        publicCert: fs.readFileSync('') 
    },
    /**
     * Support for calling APIs over internet 
     */
    httpProxy: {
        //false, if it is not needed.
        isEnabled: false, 
        // host, can support both http and https 
        host: '',
        // port, port number for the proxy 
        port: '' 
    },
    /**
     * JWE encryption
     */
    payloadEncryption: {
        //required if payload Encryption is enabled, publicKey.pem file will be provided by American Express 
        publicKeyCert: fs.readFileSync('')
    }
}

prefillclient.configure(config);

```

<br/>

## Authentication

Amex Global Prefill Service uses token based authentication. The following examples demonstrates how to genereate bearer tokens using the SDK

```js
prefillclient.authentication.getBearerToken().then(resp => {
    //success response
    prefillclient.setBearerToken(resp.access_token); //set the bearertoken for further api calls 
})

```
Sample Resposne : 

```js
{
  scope: 'default',
  status: 'approved',
  expires_in: '3599', // token expirty in seconds, you can cache the token for the amount of time specified.
  token_type: 'BearerToken',
  access_token: 'access_token_example'
}

```
Note : you can skip this call if you have an active Token in your cache. if you have an active token, you can just set the bearerToken in config under authentication or call `setBearerToken('access_token')` method to update the config.



<br/>

## SaveData

Request body and API mandatory fields can be found at [API Specifications](https://developer.americanexpress.com/products/card-application-prefill/resources#readme).

```js
const headers = {
    user_consent_status: true,
    user_consent_timestamp: new Date(),
    message_type_id: 1001, // value will be provided by Amex
    request_id: '', //unique Id
    client_id: 'ASDFSD334235DDD' // Unique client id will be provided by Amex,
}

const request = {
    //see samples for a sample body
}

return prefillclient.prefillService.saveData(request, headers).then(resp => {
    //successful response
});

```

This will return a request token, you can find more information on response at [reference guide](https://developer.americanexpress.com/products/card-application-prefill/resources#readme).

<br/>

<br/>

## SaveEncryptedData

Request body and API mandatory fields can be found at [API Specifications](https://developer.americanexpress.com/products/card-application-prefill/resources#readme).

```js
const headers = {
    user_consent_status: true,
    user_consent_timestamp: new Date(),
    message_type_id: 2001, // value will be provided by Amex
    request_id: '', //unique Id
    client_id: 'ASDFSD334235DDD' // Unique client id will be provided by Amex,
}

const request = {
    //see samples for a sample body
}

return prefillclient.prefillService.saveEncryptedData(request, headers).then(resp => {
    //successful response
});

```

This will return a request token, you can find more information on response at [reference guide](https://developer.americanexpress.com/products/card-application-prefill/resources#readme).

<br/>

## Error Handling

In case of exceptions encountered while calling American Express APIs, SDK will throw Errors. For example if all the required fields are not sent, SDK will throw an error object with name `PrefillRequestValidationError`. 

if callback function is provided, error will be sent back as the first argument of the callback function.

```js 
prefillclient.prefillService.get(saveData, headers, function (err, result) {
    if(err){
        // handle exception
    }
});
```
if callback function is not provided, SDK will reject Promise

```js

prefillclient.prefillService.get(request, headers).then(res => {
//success 
}).catch(err => {
    err.name // err.name will give the name of error thrown -- example: PrefillAuthenticationError
    //handle exception 
});

```

Possible exceptions : 
```js
- PrefillAuthenticationError // Authentication errors with the API -- example : invalid API Key or Secret is sent to the API

- PrefillRequestValidationError // Request Validation Error -- request or configs provided to the SDK are invalid, you can see more info in error.fields for the fields that failed validations.

- PrefillAPIError // is a generic type of error, It will be raised when there is an Internal server error or any other error which is not covered by any of the named errors.

- PayloadEncryptionError // PayloadEncryptionError is a generic type of error for Encryption errors. It will be raised when there is an Exception raised at the Payload encryption. More information will be present in the error message.

```

<br/>

## Running Samples 
Instructions for Running Samples are in the [sample directory](/samples).

<br/>

## Contributing

We welcome Your interest in the American Express Open Source Community on Github. Any Contributor to
any Open Source Project managed by the American Express Open Source Community must accept and sign
an Agreement indicating agreement to the terms below. Except for the rights granted in this 
Agreement to American Express and to recipients of software distributed by American Express, You
reserve all right, title, and interest, if any, in and to Your Contributions. Please
[fill out the Agreement](https://cla-assistant.io/americanexpress/prefill-client-node).

<br/>

## License

Any contributions made under this project will be governed by the
[Apache License 2.0](./LICENSE.txt).


<br/>

## Code of Conduct

This project adheres to the [American Express Community Guidelines](./CODE_OF_CONDUCT.md). By
participating, you are expected to honor these guidelines.