const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchArticles = (topic) => {
    let filter = "WHERE 1=1 "
    const filterArgs = [];

    if (topic)
    {
        filter += "AND articles.topic = %L ";
        filterArgs.push(topic);
    }

    const query = format(`\
    SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        CAST(COUNT(comments) AS INTEGER) as comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    ${filter}
    GROUP BY articles.article_id
    ORDER BY created_at DESC`, ...filterArgs);

    return db
        .query(query)
        .then((result) => result.rows);       
}

module.exports.fetchArticleByID = (article_id) => {
    const query = format(`
        SELECT articles.*, CAST(COUNT(comments) AS INTEGER) as comment_count FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = %L
        GROUP BY articles.article_id;`, article_id);

    return db
        .query(query)
        .then((result) => {
            if (!result.rows[0])
            {
                throw {statusCode: 404, msg: "Article not found"};
            }
            
            return result.rows[0];
        });
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