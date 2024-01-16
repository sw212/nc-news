const express = require("express");
const {
    getTopics
} = require("./controllers/topics.controllers");
const {
    getAPI
} = require("./controllers/api.controllers");
const {
    getArticles,
    getArticleByID,
    modifyVoteByArticleID,
} = require("./controllers/articles.controllers");
const {
    getCommentsByArticleID,
    addCommentByArticleID,
} = require("./controllers/comments.controllers");

const PORT = 3000;
const app = module.exports = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getAPI);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleByID);

app.patch("/api/articles/:article_id", modifyVoteByArticleID);

app.get("/api/articles/:article_id/comments", getCommentsByArticleID);

app.post("/api/articles/:article_id/comments", addCommentByArticleID);


app.use((err, req, res, next) => {
    let message = {msg: err.msg ?? "Bad request"};
    let statusCode = err.statusCode ?? 400;

    if (err.code === "23503")
    {
        statusCode  = 404;
        message.msg = "Not found";
    }

    res.status(statusCode).send(message);
});

app.use((req, res, next) => {
    res.status(404).send({msg: 'Not found'});
});

if (!module.parent)
{
    app.listen(PORT);
    console.log(`Server started on port=${PORT}`);
}