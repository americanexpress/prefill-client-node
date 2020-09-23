/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
const sdk = require('../../index');
const jose = require('node-jose');
const httpclient = require('../../lib/client/http-client');
const { PrefillRequestValidationError, PayloadEncryptionError } = require('../../lib/errors');



jest.mock('../../lib/client/http-client');
jest.mock('node-jose');


beforeAll(() => {
    sdk.configure({
        rootUrl: 'example.com',
        authentication: {
            bearerToken: 'token',
            clientKey: 'key',
            clientSecret: 'secret'
        },
        mutualAuth: {
            privateKey: 'privateKey',
            publicCert: 'publicCert'
        },
        httpProxy: {
            isEnabled: true,
            host: 'host',
            port: 'port'
        },
        payloadEncryption: {
            publicKeyCert: ''
        }
    });
});


beforeEach(() => {
    jest.clearAllMocks();
});

test('can instantiate sdk with configs', () => {
    expect(typeof (sdk)).toBe('object');
    expect(sdk).toHaveProperty('authentication');
    expect(sdk).toHaveProperty('prefillService');
});


const headerParams = {
    user_consent_status: true,
    user_consent_timestamp: 53535325,
    message_type_id: 1001,
    request_id: 'dfsfsdfs',
    client_id: 'ASDFSD334235DDD'
};


const request = {
    acquisition_journey_type: "CARD_LANDING_PAGES",
    applicants: [
        {
            type: "basic",
            personal_info: {
                names: [
                    {
                        title: "Mr",
                        first: "TestPrefill",
                        last: "Holmes",
                        middle: "H",
                        prefix: "Agent",
                        suffix: "221",
                        language: "en"
                    }
                ]
            }
        }]
};

const response = {
    "prefill_info": {
        "applicant_request_token": "eyJhbGciOiJSUzI1NiJ9",
        "applicant_request_token_expires_in": "3600000"
    }
}

test('should return a token', () => {
    httpclient.callService.mockReturnValueOnce(Promise.resolve(response));
    return sdk.prefillService.saveData(request, headerParams).then(resp => {
        expect(resp).toBe(response);
        expect(httpclient.callService).toHaveBeenCalledTimes(1);
        expect(httpclient.callService.mock.calls[0][0]).toBe('/acquisition/digital/v1/applications_prefillinfo');
        expect(httpclient.callService.mock.calls[0][1]).toBe('POST');
        const headers = httpclient.callService.mock.calls[0][2];
        expect(headers['X-AMEX-API-KEY']).toBe('key');
        expect(headers['Authorization']).toBe('Bearer token');
        expect(headers['content-type']).toBe('application/json');
        expect(headers['user_consent_status']).toBe(true);
        expect(headers['message_type_id']).toBe(1001);
        expect(headers['request_id']).toBe('dfsfsdfs');
    });
});


test('should return validation exception if headers are empty', () => {
    try {
        sdk.prefillService.saveEncryptedData(request, {})
    } catch (e) {
        expect(e).toBeInstanceOf(PrefillRequestValidationError);
    }
});


test('should return payload Encryption error if encryption fails', () => {

    sdk.configure({
        rootUrl: 'https://example.com',
        authentication: {
            bearerToken: 'token',
            clientKey: 'key',
            clientSecret: 'secret'
        },
        payloadEncryption: {
            publicKeyCert: 'fsdsd'
        }
    });
    jose.JWK.createKeyStore.mockImplementation(() => {
        return {
            add: () => {
                return Promise.resolve('key');
            }
        };
    });
    jose.JWE.createEncrypt.mockImplementation(() => {
        throw Error('error');
    });
    expect(sdk.prefillService.saveEncryptedData(request, headerParams)).rejects.toEqual(new PayloadEncryptionError("Error: error"));
});

test('should return success response', () => {
    sdk.configure({
        rootUrl: 'example.com',
        authentication: {
            bearerToken: 'token',
            clientKey: 'key',
            clientSecret: 'secret'
        },
        payloadEncryption: {
            publicKeyCert: 'fsdsd'
        }
    });
    jose.JWK.createKeyStore.mockImplementation(() => {
        return {
            add: () => {
                return Promise.resolve('key');
            }
        };
    });
    jose.JWE.createEncrypt.mockImplementation(() => {
        return {
            update: () => {
                return {
                    final: () => {
                        return "encrypted text";
                    }
                }
            }
        }
    });
    httpclient.callService.mockReturnValueOnce(Promise.resolve(response));
    return sdk.prefillService.saveData(request, headerParams).then(resp => {
        expect(resp).toBe(response);
    });
});