const express = require("express");
const {
    getTopics
} = require("./controllers/topics.controllers");

const PORT = 3000;
const app = module.exports = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.use((err, req, res, next) => {
    const msg = {msg: "Bad request"};
    const statusCode = err.statusCode ?? 400;

    res.status(statusCode).send(msg);
});

app.use((req, res, next) => {
    res.status(404).send({msg: 'Not found'});
});

if (!module.parent)
{
    app.listen(PORT);
    console.log(`Server started on port=${PORT}`);
}