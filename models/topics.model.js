const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchTopics = () => {
    return db
        .query(`SELECT * FROM topics`)
        .then((result) => result.rows);
}

module.exports.checkTopicExists = (topic) => {
    const query = format(`\
        SELECT * FROM topics
        WHERE slug = %L`, topic);
    return db
        .query(query)
        .then((result) => !!result.rows.length);
}