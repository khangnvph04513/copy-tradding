const env = process.env;

const config = {
    db: {
        /* don't expose password or any sensitive info, done only for demo */
        host: env.DB_HOST || '127.0.0.1',
        user: env.DB_USER || 'root',
        password: env.DB_PASSWORD || '1234',
        database: env.DB_NAME || 'copy_trade',
    }
};


module.exports = config;