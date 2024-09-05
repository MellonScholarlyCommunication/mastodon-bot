const logger = require('ldn-inbox-server').getLogger();
const fs = require('fs');
const md5 = require('md5');

const STORE = "./data/cache";

function initCache() {
    return true;
}

function addCache(notification) {
    if (! fs.existsSync(STORE)) {
        fs.mkdirSync(STORE, { recursive: true });
    }

    if (! notification.id) {
        logger.error(`notification has no id?`);
        logger.error(notification);
        return null;
    }

    const text = JSON.stringify(notification,null,2);
    const hash = md5(notification.id);

    const path = `${STORE}/${hash}.jsonld`;

    logger.info(`creating cache ${path}`);
    fs.writeFileSync(path, text);

    return notification.id;
}

function listCache() {
    const results = [];
    const files = fs.readdirSync(STORE);
    
    for (let i = 0 ; i < files.length ; i++) {
        const name = files[i];
        if (! name.endsWith('.jsonld')) continue;
        const path = `${STORE}/${name}`;
        const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf8'}));
        results.push(data['id']);
    } 

    return results;
}

function getCache(id) {
    const files = fs.readdirSync(STORE);
    
    for (let i = 0 ; i < files.length ; i++) {
        const name = files[i];
        if (! name.endsWith('.jsonld')) continue;
        const path = `${STORE}/${name}`;
        const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf8'}));
        if (data['id'] === id) {
            return data;
        }  
    } 

    return null;
}

function removeCache(id) {
    const files = fs.readdirSync(STORE);
    let count = 0;

    for (let i = 0 ; i < files.length ; i++) {
        const name = files[i];
        if (! name.endsWith('.jsonld')) continue;
        const path = `${STORE}/${name}`;
        const data = JSON.parse(fs.readFileSync(path, { encoding: 'utf8'}));
        if (data['id'] === id) {
            fs.unlinkSync(path);
            count++;
        }  
    } 

    return count > 0 ? true : false;
}

module.exports = { 
    initCache ,
    addCache ,
    getCache ,
    listCache ,
    removeCache 
};