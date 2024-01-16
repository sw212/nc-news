module.exports.psqlErrorHandler = (err, req, res, next) => {
    if (err.code === "23503")
    {
        res.status(404).send({msg: "Not found"});
    }
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