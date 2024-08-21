const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('../lib/cache');
const md5 = require('md5');
const fs = require('fs');

/**
 * Handler to request a metadata lookup from a (remote) metadata server
 */
async function handle({path,options,config,notification}) {
    try {
        const object_id = notification['object']['id'];
        const url = notification['object']['url'];

        if (!url) {
            return { path, options, success: true };
        } 

        for (let i = 0 ; i < url.length ; i++) {
            const url_href = url[i]['href'];

            const offer = makeOffer(url_href,config);
            const offerStr = JSON.stringify(offer,null,2);

            const outboxFile = options['outbox'] + '/' + md5(offerStr) + '.jsonld';

            logger.info(`storing Offer to ${outboxFile}`);
    
            fs.writeFileSync(outboxFile,offerStr);

            // Cache a context document for the original request
            addCache({
                "id": offer['id'] ,
                "createdFor": notification['id']
            });
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