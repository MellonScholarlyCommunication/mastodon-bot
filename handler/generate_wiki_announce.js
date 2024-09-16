const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');

/**
 * Handler send creata a fake notification as if an Event Notification
 * event was created for sending the response toot
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

        const actor = originalNotification.actor?.id;

        if (! actor) {
            logger.error(`no actor.id found in originalNotification`);
            return { path, options, success: false };
        }

        const matches = actor.match(/https?:\/\/([^\/]+).*@(.*)/);

        if (! (matches && matches.length === 3)) {
            logger.error(`actor ${actor} can't be parsed`);
            return { path, options, success: false };
        }

        logger.info(`Creating Announce to ${actor}`);

        const announce = makeAnnounce(originalNotification,researcherProfile,config);

        await addCache(announce, { original: originalNotification.id });

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
        "object": {
          "id": researcherProfile ,
          "type": "WebPage"
        },
        "target": config['target']
    };
}

module.exports = { handle };