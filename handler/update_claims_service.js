const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');
const md5 = require('md5');
const fs = require('fs');

/**
 * Handler to update Claim Service Node with the Event Log tra
 */
async function handle({path,options,config,notification}) {
    try {
        logger.info('restoring mastodon artifact');
        const originalNotification = options['originalNotification'];

        if (! process.env.EVENTLOG_TRACE_URL) {
            logger.error(`no EVENTLOG_TRACE_URL set`);
            return { path, options, success: false };
        }

        const url_href = process.env.EVENTLOG_TRACE_URL + originalNotification.id;

        logger.info(`generating announce to claim ${url_href}`);
        
        const announce = makeAnnounce(url_href,config);
        const announceStr = JSON.stringify(announce,null,2);

        const outboxFile = options['outbox'] + '/' + md5(announceStr) + '.jsonld';

        logger.info(`storing announce to ${outboxFile}`);
    
        fs.writeFileSync(outboxFile,announceStr);

        // Cache a context document for the original request
        await addCache(announce, { original: originalNotification.id }, { name: process.env.CACHE_NAME });

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

function makeAnnounce(url,config) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": generateId(),
        "type": "Announce",
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