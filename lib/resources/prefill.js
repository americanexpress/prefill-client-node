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
"use strict";
const httpclient = require('../client/http-client');
const jose = require('node-jose');
const utils = require('../utils');
const validations = require('../utils/validations');
const config = require('../config');
const { PayloadEncryptionError, PrefillRequestValidationError } = require('../errors');


/**
 * Implementation for pushing Prefill Data to American Express
 * @param {Object} body - required - as per the contract 
 * @param {Object} headerParams  - required - Params required to call the service.
 * The accepted parameters are :
 *     	- message_type_id - will be shared by amex
 *     	- request_id - unique id for tracking
 * 		- client_id - client Id provided by Amex different from the client Id configured in config
 * 		- bearer_token - bearer token from the Authentication call 
 */
function saveData(body, headerParams) {
	const errors = validations.validateHeaders(body, headerParams);
	if (!utils.isEmpty(errors)) {
		throw new new PrefillRequestValidationError(errors);
	}
	return httpclient.callService('/acquisition/digital/v1/applications_prefillinfo', 'POST', utils.createHeaders(headerParams), JSON.stringify(body));
}

/**
 * Implementation for pushing Prefill Data to American Express (Encrypted Data)
 * @param {Object} body - required - as per the contract
 * @param {Object} headerParams  - required - Params required to call the service.
 * The accepted parameters are :
 *     	- message_type_id - will be shared by amex
 *     	- request_id - unique id for tracking
 * 		- client_id - client Id provided by Amex different from the client Id configured in config
 * 		- bearer_token - bearer token from the Authentication call
 */
function saveEncryptedData(body, headerParams) {
	const errors = validations.validateHeaders(body, headerParams);
	if (!utils.isEmpty(errors)) {
		throw new PrefillRequestValidationError(errors);
	}
	const bufferedRequest = Buffer.from(JSON.stringify(body));
	let keystore = jose.JWK.createKeyStore();
	return keystore.add(config.payloadEncryption.publicKeyCert, 'pem').then(key => {
		return jose.JWE.createEncrypt({ format: 'compact' }, key).update(bufferedRequest).final()
	}).catch(e => {
		throw new PayloadEncryptionError(e);
	}).then(encrypted => {
		return httpclient.callService('/acquisition/digital/v1/applications_prefillinfo', 'POST', utils.createHeaders(headerParams), JSON.stringify({
			'user_info':encrypted
		}));
	});
}

module.exports = {
	saveData,
	saveEncryptedData
}