const {
    fetchTopics,
    insertTopic,
} = require("../models/topics.model");

/**@type {import("express").RequestHandler} */
module.exports.getTopics = async (req, res, next) => {
    try
    {
        const topics = await fetchTopics();
        res.status(200).send({topics});
    }
    catch(err)
    {
        next(err);
    }
}

/**@type {import("express").RequestHandler} */
module.exports.addTopic = async (req, res, next) => {
    const { slug, description = "" } = req.body;

    if (typeof slug !== "string" || typeof description !== "string")
    {
        next({statusCode: 400, msg: "Bad request"});
    }

    try
    {
        const topic = await insertTopic(slug, description);
        res.status(201).send({topic});
    }
    catch(err)
    {
        next(err);
    }
}