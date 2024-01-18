module.exports.psqlErrorHandler = (err, req, res, next) => {
    if (err.code === "42703")
    {
        // undefined_column
        const message = {msg: err.message.replace(/\"/g, '\'') ?? "Bad request"};
        res.status(400).send(message);
    }
    else if (err.code === "23505")
    {
        // 	unique_violation
        res.status(409).send({msg: "Entry already exists"});
    }
    // else if (err.code === "23503")
    // {
    //     // foreign_key_violation
    //     res.status(404).send({msg: "Not found"});
    // }
    else
    {
        next(err);
    }
}

module.exports.errorHandler = (err, req, res, next) => {
    let message = {msg: err.msg ?? "Bad request"};
    let statusCode = err.statusCode ?? 400;

    res.status(statusCode).send(message);
}