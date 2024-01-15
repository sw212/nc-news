const {
    fetchTopics
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