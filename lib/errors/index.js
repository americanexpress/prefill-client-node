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

'use strict';

/**
 * PrefillError is the base for other specific errors from Prefill API
 */
class PrefillError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}


/**
 * PrefillAuthenticationError is raised when invalid API Key or Secret is
 * sent to the API
 */
class PrefillAuthenticationError extends PrefillError { }

/**
 * PrefillRequestValidationError is raised when the request is not valid
 */
class PrefillRequestValidationError extends PrefillError {
  constructor(fields) {
    super('request validation failed');
    this.fields = fields || {};
  }
}

/**
 * NocertificateWasSentError is raised when no certificates were sent while
 * making the API call for Mutual authentication
 */
class NoCertificateWasSentError extends PrefillError { }

/**
 * PrefillResourceNotFoundError will be raised when the given token isn't found in the cache
 */
class PrefillResourceNotFoundError extends PrefillError { }

/**
 * PrefillAPIError is a generic type of error, It will be raised when there is
 * an Internal server error or any other error which is not covered by any of 
 * the named errors.
 */
class PrefillAPIError extends PrefillError { }

/**
 * PayloadEncryptionError is a generic type of error for Encryption errors, 
 * It will be raised when there is an Exception raised at the Payload encryption
 */
class PayloadEncryptionError extends PrefillError { }


module.exports = {
  PrefillAuthenticationError: PrefillAuthenticationError,
  PrefillRequestValidationError: PrefillRequestValidationError,
  NoCertificateWasSentError,
  PrefillResourceNotFoundError: PrefillResourceNotFoundError,
  PrefillAPIError: PrefillAPIError,
  PayloadEncryptionError,
  PrefillError: PrefillError
};