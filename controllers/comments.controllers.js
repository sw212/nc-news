const
{
    fetchCommentsByArticleID
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