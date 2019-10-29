/*
 * Custom util to access our dummy database, represented by a db JSON file.
 */

const path = require('path');
const fs = require('fs');

const dbLocation = path.resolve(__dirname, '../database/db.json');

const getContent = (() =>
    JSON.parse(fs.readFileSync(dbLocation, 'utf8'))
);

const writeContent = (content =>
    fs.writeFileSync(dbLocation, JSON.stringify(content, null, 4), 'utf8')
);


module.exports = {
    getContent,
    writeContent
};
