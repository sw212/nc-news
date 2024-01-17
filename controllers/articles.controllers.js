const {
    fetchArticles,
    fetchArticleByID,
    updateVoteByArticleID
} = require("../models/articles.models");
const {
    checkTopicExists
} = require("../models/topics.model");

/**@type {import("express").RequestHandler} */
module.exports.getArticles = async (req, res, next) => {
    const { topic } = req.query;

    try
    {
        const articles_topic = await Promise.all([fetchArticles(topic), checkTopicExists(topic)]);
        const articles    = articles_topic[0];
        const topicExists = articles_topic[1];

        if (!articles.length && !topicExists)
        {
            return next({statusCode: 404, msg: "Not found"});
        }

        res.status(200).send({articles});
    }
    catch(err)
    {
        next(err);
    }
}

/**@type {import("express").RequestHandler} */
module.exports.getArticleByID = async (req, res, next) => {
    const { article_id } = req.params;
    
    try
    {
        const article = await fetchArticleByID(article_id);

        res.status(200).send({article});
    }
    catch(err)
    {
        next(err);
    }
}

/**@type {import("express").RequestHandler} */
module.exports.modifyVoteByArticleID = async (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    try
    {
        const article = await fetchArticleByID(article_id);
        if (!article)
        {
            return next({statusCode:404, msg: "Article not found"});
        }

        const votes = article.votes + inc_votes;
        const updatedArticle = await updateVoteByArticleID(article_id, votes);

        res.status(200).send({article: updatedArticle});
    }
    catch(err)
    {
        next(err);
    }

}