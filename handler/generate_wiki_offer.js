const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');

/**
 * Handler to create a fake notification 
 */
async function handle({path,options,config,notification}) {
    try {
        const htmlCitation = options['htmlCitation'];

        if (! htmlCitation) {
            logger.error(`no htmlCitation found in options`);
            return { path, options, success: false };
        }

        const researcherProfile = options['researcherProfile'];

        if (! researcherProfile) {
            logger.error(`no researcherProfile found in options`);
            return { path, options, success: false };
        }

        const originalNotification = options['originalNotification'];

        if (! originalNotification) {
            logger.error(`no originalNotification found in options`);
            return { path, options, success: false };
        }

        logger.info(`Creating Offer to ${config.actor.id}`);

        const offer = makeOffer(htmlCitation,researcherProfile,config);

        await addCache(offer, { original: originalNotification.id }, { name: process.env.CACHE_NAME });

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

function makeOffer(htmlCitation,researcherProfile,config) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": generateId(),
        "type": "Offer",
        "published": generatePublished(),
        "actor": config['actor'],
        "context": researcherProfile,
        "object": {
          "id": generateId(),
          "content": htmlCitation ,
          "type": "Note"
        },
        "target": config['target']
    };
}

module.exports = { handle };