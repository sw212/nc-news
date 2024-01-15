const db = require("../db/connection");

module.exports.fetchTopics = () => {
    return db
        .query(`SELECT * FROM topics`)
        .then((result) => result.rows);
}