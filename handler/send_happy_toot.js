const logger = require('ldn-inbox-server').getLogger();
const { sendNotification } = require('mastodon-cli');

/**
 * Handler send a happy toot to the original sender
 */
async function handle({path,options,config,notification}) {
    logger.info(`parsing notification ${path}`);
   
    try {
        const originalNotification = options['originalNotification'];
        const researcherProfile = options['researcherProfile'];

        if (! originalNotification) {
            logger.error(`no originalNotification found in options`);
            return { path, options, success: false };
        }

        if (! researcherProfile) {
            logger.error(`no researcherProfile found in options`);
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

        const account = `@${matches[2]}@${matches[1]}`;

        logger.info(`Sending happy toot to ${account}`);

        const toot = `${account} I updated your researcher contributions ${researcherProfile} :)`;

        await sendNotification(process.env.MASTODON_URL,toot, {
            token: process.env.MASTODON_ACCESS_TOKEN
        });

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };