const fs = require("fs/promises");

module.exports.fetchAPI = () => {
    return fs.readFile("endpoints.json", "utf-8");
}