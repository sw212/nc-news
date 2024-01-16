const db = require("../db/connection");

module.exports.fetchUsers = () => {
    const query = `\
        SELECT username, name, avatar_url FROM users`;

    return db
        .query(query)
        .then((result) => result.rows);
}