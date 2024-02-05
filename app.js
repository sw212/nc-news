const cors = require('cors');
const express = require("express");

const Router  = express.Router;
const {
    getTopics,
    addTopic,
} = require("./controllers/topics.controllers");
const {
    getAPI
} = require("./controllers/api.controllers");
const {
    getArticles,
    getArticleByID,
    modifyVoteByArticleID,
    addArticle,
    removeArticleByID,
} = require("./controllers/articles.controllers");
const {
    getCommentsByArticleID,
    addCommentByArticleID,
    removeCommentByID,
    modifyVoteByCommentID,
} = require("./controllers/comments.controllers");
const {
    getUsers,
    getUser,
} = require("./controllers/users.controllers");
const {
    psqlErrorHandler,
    errorHandler,
} = require("./error");

const PORT = 3000;
const app = module.exports = express();

app.use(cors());

app.use(express.json());

app.get("/api", getAPI);

app.get("/api/topics", getTopics);
app.post("/api/topics", addTopic);

app.get("/api/articles", getArticles);
app.post("/api/articles", addArticle);

app.get("/api/articles/:article_id", getArticleByID);
app.patch("/api/articles/:article_id", modifyVoteByArticleID);
app.delete("/api/articles/:article_id", removeArticleByID);

app.get("/api/articles/:article_id/comments", getCommentsByArticleID);
app.post("/api/articles/:article_id/comments", addCommentByArticleID);

app.delete("/api/comments/:comment_id", removeCommentByID);
app.patch("/api/comments/:comment_id", modifyVoteByCommentID);

app.get("/api/users", getUsers);

app.get("/api/users/:username", getUser)


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