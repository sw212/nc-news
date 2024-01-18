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

module.exports.insertTopic = (slug, description) => {
    const query = format(`\
        INSERT INTO topics
            (slug, description)
        VALUES
            (%L, %L)
        RETURNING *`, slug, description);

    return db
        .query(query)
        .then((result) => result.rows[0]);
}