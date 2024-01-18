const {
    fetchArticles,
    fetchArticleByID,
    updateVoteByArticleID,
    insertArticle,
    deleteArticleByID,
} = require("../models/articles.models");
const {
    checkTopicExists
} = require("../models/topics.model");
const {
    checkUserExists
} = require("../models/users.models");
const {
    deleteCommentsByArticleID,
} = require("../models/comments.models");

/**@type {import("express").RequestHandler} */
module.exports.getArticles = async (req, res, next) => {
    let { topic, sort_by, order, limit = "10", p = "1" } = req.query;

    sort_by = sort_by ?? "created_at";
    order   = order ? order.toUpperCase() : "DESC";

    try
    {
        const [articles, topicExists] = await Promise.all([fetchArticles(topic, sort_by, order, limit, p), checkTopicExists(topic)]);

        if (topic && !topicExists)
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

/**@type {import("express").RequestHandler} */
module.exports.addArticle = async (req, res, next) => {
    const article = req.body;

    const required_keys = ["author", "title", "body", "topic"];
    for (let i = 0; i < required_keys.length; i++)
    {
        if (typeof article[required_keys[i]] !== "string")
        {
            return next({statusCode:400, msg: "Bad request"});
        }
    }

    const optional_keys = ["article_img_url"];
    for (let i = 0; i < optional_keys.length; i++)
    {
        if  (article[optional_keys[i]] && typeof article[optional_keys[i]] !== "string")
        {
            return next({statusCode:400, msg: "Bad request"});
        }
    }

    try
    {
        const [userExits, topicExists] = await Promise.all([checkUserExists(article.author), checkTopicExists(article.topic)]);

        if (!userExits)
        {
            return next({statusCode:404, msg: "Author not found"});
        }

        if (!topicExists)
        {
            return next({statusCode:404, msg: "Topic not found"});
        }

        const newArticle = await insertArticle(article);

        res.status(201).send({article: {...newArticle, comment_count: 0}});
    }
    catch(err)
    {
        next(err);
    }
}

/**@type {import("express").RequestHandler} */
module.exports.removeArticleByID = async (req, res, next) => {
    const { article_id } = req.params;
    
    try
    {
        const comments = await deleteCommentsByArticleID(article_id);
        const article = await deleteArticleByID(article_id);
        
        if (!article)
        {
            return next({statusCode: 404, msg: "Article not found"});
        }
        
        res.status(204).send();
    }
    catch(err)
    {
        next(err);
    }
}
