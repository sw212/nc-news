const {
    fetchAPI
} = require("../models/api.models");

/**@type {import("express").RequestHandler} */
module.exports.getAPI = async (req, res, next) => {
    try
    {
        const api = await fetchAPI();
        res.status(200).send({api: api});
    }
    catch(err)
    {
        next(err);
    }
}
