/*
 * Custom util to access our dummy database, represented by a db JSON file.
 */

const path = require('path');
const fs = require('fs');

const dbLocation = path.resolve(__dirname, '../database/db.json'); 

const checkFileExist = () => {
    if (!fs.existsSync(dbLocation)) {
        // File doesn't exist, create it with an empty JSON object
        fs.writeFileSync(dbLocation, '{}', 'utf8');
    }
};

const getContent = () => {
    checkFileExist();
    return JSON.parse(fs.readFileSync(dbLocation, 'utf8'));
};

const writeContent = (content) => {
    checkFileExist();
    fs.writeFileSync(dbLocation, JSON.stringify(content, null, 4), 'utf8');
};


module.exports = {
    getContent,
    writeContent
};
