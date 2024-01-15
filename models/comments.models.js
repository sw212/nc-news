const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchCommentsByArticleID = (article_id) => {
    const query = format(`\
        SELECT * FROM comments
        WHERE article_id = %L
        ORDER BY created_at ASC`, article_id);
    
    return db
        .query(query)
        .then((result) => result.rows);
}