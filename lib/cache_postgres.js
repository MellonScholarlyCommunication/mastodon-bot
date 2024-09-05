const logger = require('ldn-inbox-server').getLogger();
const postgres = require('postgres');

const CACHE_TABLE = "cache";

function connect() {
    return postgres({ 
        database: process.env.POSTGRES_DATABASE,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD
    });
}

async function initCache() {
    const sql = connect();
    await sql`
CREATE TABLE IF NOT EXISTS ${sql(CACHE_TABLE)} (
    id varchar(120) CONSTRAINT firstkey PRIMARY KEY,
    data TEXT ,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
    sql.end();
    return true;
}

async function addCache(notification) {
    if (! notification.id) {
        logger.error(`notification has no id?`);
        logger.error(notification);
        return null;
    }

    const sql = connect();

    const record = {
        id: notification.id ,
        data: JSON.stringify(notification)
    };

    await sql`
        INSERT INTO ${sql(CACHE_TABLE)} ${
            sql(record, 'id', 'data')
        } ON CONFLICT (id) DO UPDATE SET data = ${record.data};`;

    sql.end();

    return notification.id;
}

async function getCache(id) {
    const sql = connect();
    
    const result = await sql`
        SELECT * FROM ${sql(CACHE_TABLE)} WHERE id = ${id}
    `;

    let json;

    if (result.length > 0) {
        json = JSON.parse((result[0].data));
        json['updated'] = result[0].created;
    }

    sql.end();

    return json;
}

async function listCache() {
    const sql = connect();
    
    const result = await sql`
        SELECT * FROM ${sql(CACHE_TABLE)}
    `;

    const list = result.map( (entry) => { return entry.id });

    sql.end();

    return list;
}

async function removeCache(id) {
    const sql = connect();
    
    const result = await sql`
        DELETE FROM ${sql(CACHE_TABLE)} WHERE id = ${id} RETURNING *
    `;

    sql.end();

    return result.length === 1 ? true : false;
}

module.exports = { 
    initCache ,
    addCache ,
    getCache ,
    listCache ,
    removeCache 
};