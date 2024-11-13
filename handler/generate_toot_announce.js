const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');

/**
 * Handler send create a fake notification as if an Event Notification
 * event was created for sending the response toot
 */
async function handle({path,options,config,notification}) {
    try {
        const toot_fragment = options['toot'];

        if (! toot_fragment) {
            logger.error(`no toot found in options (skipping)`);
            return { path, options, success: true };
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

        const announce = makeAnnounce(originalNotification,toot_fragment,config);

        await addCache(announce, { original: originalNotification.id } , { name: process.env.CACHE_NAME });

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

function makeAnnounce(original,toot,config) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": generateId(),
        "type": "Announce",
        "published": generatePublished(),
        "actor": config['actor'],
        "context": original['object']['id'],
        "object": {
          "id": generateId(),
          "type": "Note",
          "content": toot
        },
        "target": original['actor']
    };
}

module.exports = { handle };