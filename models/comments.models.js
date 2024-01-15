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

module.exports.insertCommentByArticleID = (article_id, username, body) => {
    const query = format(`\
        INSERT INTO comments
            (body, article_id, author)
        VALUES
            (%L, %L, %L)
        RETURNING *`, body, article_id, username);
    
    return db
        .query(query)
        .then((result) => result.rows[0]);
}