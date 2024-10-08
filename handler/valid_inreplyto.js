const logger = require('ldn-inbox-server').getLogger();
const { getCache } = require('eventlog-server');

/**
 * Handler to check if the inreply to contains a known notification
 */
async function handle({path,options,config,notification}) {
    try {
        const inReplyTo = notification['inReplyTo'];

        if (! inReplyTo) {
            logger.error(`no inReply found in notification`);
            return { path, options, success: false };
        }

        const cached = await getCache(inReplyTo,{ name: process.env.CACHE_NAME });

        if (cached) {
            logger.info(`found a cached copy of ${inReplyTo}`);
            return { path, options, success: true };
        }
        else {
            logger.error(`did not find a cached copy of ${inReplyTo}`);
            return { path, options, success: false };
        }
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };