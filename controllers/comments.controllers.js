const
{
    fetchCommentsByArticleID,
    insertCommentByArticleID
} = require("../models/comments.models");

const {
    fetchArticleByID
} = require("../models/articles.models");

/**@type {import("express").RequestHandler} */
module.exports.getCommentsByArticleID = async (req, res, next) => {
    const { article_id } = req.params;

    try
    {
        const article_comments = await Promise.all([fetchArticleByID(article_id), fetchCommentsByArticleID(article_id)])
        
        const article = article_comments[0];
        if (!article)
        {
            return next({statusCode: 404, msg: "Article not found"});
        }

        const comments = article_comments[1];
        res.status(200).send({comments});
    }
    catch(err)
    {
        next(err);
    }
}

/**@type {import("express").RequestHandler} */
module.exports.addCommentByArticleID = async (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;
    try
    {
        if (typeof username !== "string" || typeof body !== "string" || Number.isNaN(parseInt(article_id)))
        {
            const err = new Error("Bad request");
            err.statusCode = 400;
            throw err;
        }

        const comment = await insertCommentByArticleID(article_id, username, body);
        res.status(201).send({comment: comment.body});
    }
    catch(err)
    {
        next(err);
    }
}