const db = require('./db');

async function get() {
    return await db.query(
        `SELECT id, refresh_token, access_token FROM config`
    );
}
async function post(data) {
    return await db.query(
        `INSERT INTO config (access_token, refresh_token) values (?, ?)`, [data.access_token, data.refresh_token]
    )
}

async function updateToken(data) {
    return await db.query(
        `UPDATE config set access_token = ?, refresh_token =?`, [data.access_token, data.refresh_token]
    )
}

module.exports = {
    get,
    post,
    updateToken
}