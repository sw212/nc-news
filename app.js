const express = require("express");

const PORT = 3000;
const app = module.exports = express();

app.use(express.json());


if (!module.parent)
{
    app.listen(PORT);
    console.log(`Server started on port=${PORT}`);
}