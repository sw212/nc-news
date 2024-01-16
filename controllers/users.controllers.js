const {
    fetchUsers
} = require("../models/users.models");

/**@type {import("express").RequestHandler} */
module.exports.getUsers = async (req, res, next) => {
    try
    {
        const users = await fetchUsers();
        res.status(200).send({users});
    }
    catch(err)
    {
        next(err);
    }
}