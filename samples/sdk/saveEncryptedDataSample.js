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
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const _ = require('lodash');

const content = fs.readFileSync("../config.json");
const config = JSON.parse(content);

/**
 * provide certificates/key files to the config.
 */
config.mutualAuth.privateKey = fs.readFileSync(config.mutualAuth.privateKey);
config.mutualAuth.publicCert = fs.readFileSync(config.mutualAuth.publicCert);
config.payloadEncryption.publicKeyCert = fs.readFileSync(config.payloadEncryption.publicKeyCert);

const sdk = require('../../index');
sdk.configure(config);
const request = {
    acquisition_journey_type: "CARD_LANDING_PAGES",
    applicants: [
        {
            type: "basic",
            personal_info: {
                names: [
                    {
                        title: "Mr",
                        first: "Prefill",
                        last: "Service",
                        middle: "Encrypted",
                        prefix: "Agent",
                        suffix: "221",
                        language: "en"
                    }
                ],
                emails: [
                    {
                        type: "C",
                        email: "test@example.com"
                    }
                ],
                correspondence_preference: "email",
                birth_date: "19650701",
                phones: [
                    {
                        type: "H",
                        country_code: "44",
                        number: "2343323432",
                        extension: "007"
                    }
                ],
                addresses: [
                    {
                        type: "H",
                        line1: "100A Amex Street",
                        line2: "Marylebone",
                        line3: "",
                        line4: "",
                        region: "LONDON NW1",
                        postal_code: "20012",
                        city: "LONDON",
                        country: "UK",
                        language: "en",
                        stay_duration: "45"
                    }
                ]
            },
            business_info: {
                business_name: "Scotland Amex",
                business_id: "10089098",
                industry_type: "Investigation",
                annual_business_revenue: {},
                company_structure: "",
                number_of_employees: "",
                phones: [
                    {
                        type: "B",
                        country_code: "44",
                        number: "2343323432",
                        extension: "007"
                    }
                ],
                addresses: [
                    {
                        type: "B",
                        line1: "100A Amex Street",
                        line2: "Marylebone",
                        line3: "",
                        line4: "",
                        region: "LONDON NW1",
                        postal_code: "20012",
                        city: "LONDON",
                        country: "UK",
                        language: "en",
                        stay_duration: "45"
                    }
                ]
            },
            product_info: {
                product_type: "Card",
                product_id: "345",
                offer_id: "AFHDSKF8EW",
                loyalty_offer_id: "ADSFDSFFDSF",
                pct: "D34"
            }
        }],
    partner: {
        unique_id: "432432434",
        credit_line: "23233",
        account_number: "232132132131321"
    },
    context_info: {
        channel: "PT",
        sub_channel: "SPT"
    },
    authentication_info: {}
};

const headers = {
    message_type_id: 2001,  //message_type_id = 2001 - Encrypted payload
    request_id: uuidv1(),
    client_id: 'ASDFSD334235DDD' //client Id provided by Amex, not the client id used for authentication,
}

sdk.authentication.getBearerToken().then(resp => {
    console.log('OAuth Token Response: ', resp)
    if (resp.access_token) {
        sdk.setBearerToken(resp.access_token); // set access_token, you can cache this token until the expiry time provided in response
        return sdk.prefillService.saveEncryptedData(request, headers);
    }
}).then(response => {
    console.log('Prefill Response: ', response);
}).catch(e => {
    console.log('Error : ', e);
});
