const {
    fetchArticles,
    fetchArticleByID
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
            res.status(404).send({msg: "Article not found"});
        }
        else
        {
            res.status(200).send({article});
        }
    }
    catch(err)
    {
        next(err);
    }
}