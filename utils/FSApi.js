/* Custom utility to perform GET request to the FastSpring API
 * https://docs.fastspring.com/integrating-with-fastspring/fastspring-api
 */
const request = require('request-promise');
const errors = require('request-promise/errors');

/* These credentials point to the fastspringexamples store. To
 * To put to your personal store, you'll need replace with your own credentials
 * https://docs.fastspring.com/integrating-with-fastspring/fastspring-api#FastSpringAPI-accessing
 */
const FS_CREDENTIALS = {
    username: 'GIDFDMBCQDGZO_CSAQBRCG',
    password: 'Nazed1GISuaVRSdQR2UHhw',
};

const get = (params) => {
    let uri = 'https://api.fastspring.com';
    if (params) {
        uri = `${uri}${params}`;
    }

    const options = {
        uri,
        method: 'GET',
        auth: {
            user: FS_CREDENTIALS.username,
            pass: FS_CREDENTIALS.password
        },
        json: true
    };
    return request(options)
        .catch(errors.StatusCodeError, (reason) => {
            // The server responded with a status codes other than 2xx.
            if (reason.statusCode === 400) {
                return { error: 'Order not found' };
            }
            return { error: 'Problems accessing API' };
        });
};

module.exports = { get };
