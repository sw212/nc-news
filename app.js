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
    removeCommentByID,
} = require("./controllers/comments.controllers");
const {
    psqlErrorHandler,
    errorHandler,
} = require("./error");

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

app.delete("/api/comments/:comment_id", removeCommentByID);


app.use(psqlErrorHandler);

app.use(errorHandler);

app.use((req, res, next) => {
    res.status(404).send({msg: 'Not found'});
});

if (!module.parent)
{
    app.listen(PORT);
    console.log(`Server started on port=${PORT}`);
}