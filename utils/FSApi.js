/* Custom utility to perform GET request to the FastSpring API
 * https://docs.fastspring.com/integrating-with-fastspring/fastspring-api
 */
const request = require('request-promise');

/* This credentials point to the fastspringexamples store. To
 * To put to your personal store, you'll need replace with your own credentials
 * https://docs.fastspring.com/integrating-with-fastspring/fastspring-api#FastSpringAPI-accessing
 */
const FS_CREDENTIALS = {
    username: 'NHOLARM9RPSQFRANIDPLZG',
    password: 'gJ16aUlHSgqAo4BPuKHS6g',
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
    return request(options).catch((err) => {
        console.log('Request error ', err.message);
        throw err;
    });
};

module.exports = { get };
