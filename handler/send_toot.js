const logger = require('ldn-inbox-server').getLogger();
const { sendNotification } = require('mastodon-cli');

/**
 * Handler send a toot to the original sender
 */
async function handle({path,options,config,notification}) {
    try {
        const toot_fragment = options['toot'];

        if (! toot_fragment) {
            logger.error(`no toot found in options`);
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

        const account = `@${matches[2]}@${matches[1]}`;

        const toot = `${account} ${toot_fragment}`;

        logger.info(`Sending toot : ${toot}`);

        if (process.env.DEMO_MODE) {
            logger.info(`**demo mode** I will not do anything`);
            return { path, options, success: true }; 
        }
        else {
            await sendNotification(process.env.MASTODON_URL,toot, {
                token: process.env.MASTODON_ACCESS_TOKEN,
                visibility: 'unlisted'
            });
            return { path, options, success: true };
        }
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };