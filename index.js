/* Entry point to our app */

const express = require('express');

// Custom Utils
const FSApi = require('./utils/FSApi');
const DBdriver = require('./utils/DBdriver');

// Initialize express with needed middlewares
const app = express();
app.use(express.json()); // Process JSON
app.use(express.static('public')); // Serve static files from 'public' folder


/* POST /processor
 * Processes order.completed FastSpring webhook to add buyer's account information
 * to database.
 *
 * @param {Object} - order.completed event https://docs.fastspring.com/integrating-with-fastspring/webhooks/order-completed
 * @returns {number} - Acknowledge event with 200 HTTP status code
 */
app.post('/processor', (req, res) => {
    try {
        // Check that request contains an events object
        if (req.body && Array.isArray(req.body.events)) {
            req.body.events.forEach((event) => {
                // Only process order.completed events
                // Check that the order was successfully completed
                if (event.type === 'order.completed' && event.data.completed) {
                    // Get FastSpring assigned accountId
                    const accountId = event.data.account;
                    // Let's check that this user is not already in our database
                    const dbContent = DBdriver.getContent();
                    if (Object.keys(dbContent).indexOf(accountId) < 0) {
                        // Add new user to our database file
                        dbContent[accountId] = event.data.customer;
                        DBdriver.writeContent(dbContent);
                    }
                }
            });
        }
    } catch (err) {
        console.log('An error has occurred while processing webhook: ', err.message);
    } finally {
        // Always make sure to acknowledge event
        res.sendStatus(200);
    }
});


/* GET /checkorder/:orderId
 * Check an order using the FastSpring API to retrieve buyer's information. Redirect to setPassword or account
 * page depending on whether the buyer already has a password in our site.
 *
 * @param {String} - orderId
 * @returns {Object} - Redirect user to new page based on its password
 */
app.get('/checkorder/:orderId', async (req, res) => {
    try {
        // Get orderId from request params
        const { orderId } = req.params;
        if (!orderId) {
            throw new Error('No order Id found in request');
        }

        // Retrieve order from FastSpring API
        const order = await FSApi.get(`/orders/${orderId}`);
        if (order.error) {
            throw new Error(order.error);
        }

        // Check in database if buyer is in our database
        const accountId = order.account;
        const dbContent = DBdriver.getContent();
        if (!dbContent[accountId]) {
            throw new Error('User not found');
        }
        // User exists, check whether user has already set a password
        if (dbContent[accountId].password) {
            // User is already registered, redirect to his account
            return res.json({ success: true, redirect: `/account.html?accountId=${accountId}` });
        }
        // User does not have a password yet
        // Redirect to password page
        return res.json({ success: true, redirect: `/password.html?accountId=${accountId}` });
    } catch (err) {
        console.log('An error has occurred while checking order: ', err.message);
        res.json({ success: false, error: err.message });
    }
});


/* POST /setPassword
 * Set password to a buyer based on the given accountId
 *
 * @param {String} - accountId
 * @param {String} - password
 * @returns {Object} - Redirect user to account page
 */
app.post('/setPassword', (req, res) => {
    try {
        // Make sure accountId and password are in the request
        if (!(req.body && req.body.accountId && req.body.password)) {
            throw new Error('Email or password params not found in request');
        }
        // Check that the accountId exists in database
        const { accountId, password } = req.body;
        const dbContent = DBdriver.getContent();
        if (!dbContent[accountId]) {
            throw new Error('User not found');
        }
        // Save password in database
        dbContent[accountId].password = password;
        DBdriver.writeContent(dbContent);

        // Redirect to account page
        return res.json({ success: true, redirect: `/account.html?accountId=${accountId}` });
    } catch (err) {
        console.log('An error has occurred setting the password: ', err.message);
        res.json({ success: false, error: err.message });
    }
});


/* POST /getAccount
 * Get account details if user is already registered. Otherwise, redirect them to
 * previous pages to complete their account.
 *
 * @param {String} - accountId
 * @returns {Object} - account information
 */
app.post('/getAccount', (req, res) => {
    try {
        // Make sure accountId is in the request
        if (!(req.body && req.body.accountId)) {
            return res.json({
                success: false,
                error: 'User not found. Please create one by purchasing a new item',
                redirect: '/store.html'
            });
        }
        // Check that the accountId exists in database
        const { accountId } = req.body;
        const dbContent = DBdriver.getContent();
        if (!dbContent[accountId]) {
            return res.json({
                success: false,
                error: 'User not found. Please create one by purchasing a new item',
                redirect: '/store.html'
            });
        }
        const account = dbContent[accountId];
        // User exists, check if it has set its password
        if (!account.password) {
            // User hasn't provided password yet, redirect to password page
            return res.json({
                success: false,
                error: 'Please complete your account providing a password',
                redirect: `/password.html?accountId=${accountId}`
            });
        }

        // Offer account information to users
        return res.json({ success: true, account });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// Custom function to clear
app.get('/clearDB', function(req, res) {
    try {
        const fs = require('fs');
        const dbLocation = '/tmp/db.json';
        if (fs.existsSync(dbLocation)) {
            // Empty temporary database
            fs.writeFileSync(dbLocation, '{}', 'utf8');
        }
    } catch (err) {
        console.log('Problems deleting DB ', err.message);
    } finally {
        // Always make sure to acknowledge event
        res.sendStatus(200);
    }
});

/* GET *
 * Add this last route to redirect to store.html page by default.
 */
app.get('*', function(req, res) {
    res.redirect('/store.html');
});


// Start listening in port 8080
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`App succesfully listening on port ${port}!`));
