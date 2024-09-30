const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');

/**
 * Handler to create a fake notification 
 */
async function handle({path,options,config,notification}) {
    try {
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

        logger.info(`Creating Announce to ${config.actor.id}`);

        const announce = makeAnnounce(originalNotification,researcherProfile,config);

        await addCache(announce, { original: originalNotification.id }, { name: process.env.CACHE_NAME });

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

function makeAnnounce(original,researcherProfile,config) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": generateId(),
        "type": "Announce",
        "published": generatePublished(),
        "actor": config['actor'],
        "context": original['object']['id'],
        "object": {
          "id": researcherProfile ,
          "type": "WebPage"
        },
        "target": config['target']
    };
}

module.exports = { handle };