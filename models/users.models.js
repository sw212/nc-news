const db = require("../db/connection");
const format = require("pg-format");

module.exports.fetchUsers = () => {
    const query = `\
        SELECT username, name, avatar_url FROM users`;

    return db
        .query(query)
        .then((result) => result.rows);
}

module.exports.fetchUser = (username) => {
    const query = format(`\
        SELECT username, name, avatar_url FROM users
        WHERE username = %L`, username);

    return db
        .query(query)
        .then((result) => result.rows[0]);
}

module.exports.checkUserExists = (username) => {
    const query = format(`\
        SELECT username, name, avatar_url FROM users
        WHERE username = %L`, username);

    return db
        .query(query)
        .then((result) => !!result.rows.length);
}