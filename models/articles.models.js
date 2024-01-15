const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchArticleByID = (article_id) => {
    const query = format(`
        SELECT * FROM articles
        WHERE article_id = %L;`, article_id);

    return db
        .query(query)
        .then((result) => result.rows[0]);
}