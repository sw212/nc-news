const
{
    fetchCommentsByArticleID,
    insertCommentByArticleID
} = require("../models/comments.models");

/**@type {import("express").RequestHandler} */
module.exports.getCommentsByArticleID = async (req, res, next) => {
    const { article_id } = req.params;

    try
    {
        const comments = await fetchCommentsByArticleID(article_id);

        if (!comments.length)
        {
            res.status(404).send({msg: "No article/comments found"});
        }
        else
        {
            res.status(200).send({comments});
        }
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