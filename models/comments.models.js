const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchCommentsByArticleID = (article_id, limit, page) => {
    limit = Number(limit);
    page  = Number(page);
    if (Number.isNaN(limit) || Number.isNaN(page))
    {
        throw {statusCode: 400, msg: "Bad request"};
    }
    const offset = (page - 1) * limit;

    const query = format(`\
        SELECT * FROM comments
        WHERE article_id = %L
        ORDER BY created_at DESC
        LIMIT %L OFFSET %L`, article_id, limit, offset);
    
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

module.exports.deleteCommentByID = (comment_id) => {
    const query = format(`\
        DELETE FROM comments
        WHERE comment_id = %L
        RETURNING *`, comment_id);
    
    return db
        .query(query)
        .then((result) => result.rows[0]);
}

module.exports.deleteCommentsByArticleID = (article_id) => {
    const query = format(`\
        DELETE FROM comments
        WHERE article_id = %L
        RETURNING *`, article_id);
    
    return db
        .query(query)
        .then((result) => result.rows[0]);
}


module.exports.incrementVoteByCommentID = (comment_id, value) => {
    const query = format(`\
        UPDATE comments
        SET
            votes = votes + %L
        WHERE
            comment_id = %L
        RETURNING *`, value, comment_id);
    
    return db
        .query(query)
        .then((result) => result.rows[0]);
}