const {
    fetchUsers,
    fetchUser
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

/**@type {import("express").RequestHandler} */
module.exports.getUser = async (req, res, next) => {
    const { username } = req.params;
    try
    {
        const user = await fetchUser(username);

        if (!user)
        {
            return res.status(404).send({msg: "User not found"});
        }

        res.status(200).send({user});
    }
    catch(err)
    {
        next(err);
    }
}