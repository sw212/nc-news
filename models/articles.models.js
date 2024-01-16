const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchArticles = () => {
    const query = `\
    SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments) as comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY created_at DESC`;

    return db
        .query(query)
        .then((result) => {
            result.rows.forEach((row) => {
                row.comment_count = parseInt(row.comment_count, 10);
            });

            return result.rows;
        });
        
}

module.exports.fetchArticleByID = (article_id) => {
    const query = format(`
        SELECT * FROM articles
        WHERE article_id = %L;`, article_id);

    return db
        .query(query)
        .then((result) => result.rows[0]);
}

module.exports.updateVoteByArticleID = (article_id, value) => {
    const query = format(`\
        UPDATE articles
        SET
            votes = %L
        WHERE
            article_id = %L
        RETURNING *`, value, article_id);

    return db
        .query(query)
        .then((result) => result.rows[0]);
}