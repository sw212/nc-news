const {
    fetchArticles,
    fetchArticleByID,
    updateVoteByArticleID
} = require("../models/articles.models");

/**@type {import("express").RequestHandler} */
module.exports.getArticles = async (req, res, next) => {   
    try
    {
        const articles = await fetchArticles();
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

        if (!article)
        {
            return next({statusCode:404, msg: "Article not found"});
        }

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