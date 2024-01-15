const fs = require("fs/promises");

module.exports.fetchAPI = async () => {
    const endpoints = await fs.readFile("endpoints.json", "utf-8");
    const result = JSON.parse(endpoints);
    return result;
}