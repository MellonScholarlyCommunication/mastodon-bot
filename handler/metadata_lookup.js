const logger = require('ldn-inbox-server').getLogger();
const { parseAsJSON , generateId , generatePublished } = require('ldn-inbox-server');
const md5 = require('md5');
const fs = require('fs');

/**
 * Handler to request a metadata lookup from a (remote) metadata server
 */
async function handle({path,options,config}) {
    logger.info(`parsing notification ${path}`);
    
    try {
        const notification = parseAsJSON(path);

        const object_id = notification['object']['id'];
        const url = notification['object']['url'];

        if (!url) {
            return { path, options, success: true };
        } 

        for (let i = 0 ; i < url.length ; i++) {
            const url_href = url[i]['href'];

            const offer = JSON.stringify(makeOffer(url_href,config),null,2);

            const outboxFile = options['outbox'] + '/' + md5(offer) + '.jsonld';

            logger.info(`storing Offer to ${outboxFile}`);
    
            fs.writeFileSync(outboxFile,offer);
        }

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

function makeOffer(url,config) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": generateId(),
        "type": "Offer",
        "published": generatePublished(),
        "actor": config['actor'],
        "object": {
          "id": url,
          "type": "Document"
        },
        "target": config['target']
    };
}

module.exports = { handle };