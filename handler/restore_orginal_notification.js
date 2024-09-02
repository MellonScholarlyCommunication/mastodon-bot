const logger = require('ldn-inbox-server').getLogger();
const { getCache } = require('../lib/cache');

/**
 * Handler restore the original notification
 */
async function handle({path,options,config,notification}) {
    try {
        // Try to find the original toot for which metadata was requested
        const inReplyTo = notification['inReplyTo'];
        const cachedContent = getCache(inReplyTo);
 
        const originalId = cachedContent.original;
 
        if (! originalId) {
            logger.error(`can not find on original in context`);
            return { path, options, success: false };
        }
        else {
            logger.info(`original notification: ${originalId}`);
        }
 
        const originalNotification = getCache(originalId);
 
        if (! originalNotification) {
            logger.error('can not find original notification ${originalId}');
            return { path, options, success: false };
        }
        else {
            logger.info(`found ${originalId} in cache`);
        }

        // The originalNotification is the mastodon toot send to @claimbot (and turned into 
        // an EN)
        options['originalNotification'] = originalNotification;
        // The metadataLookupNotification is the offer that was send to the Zotero server
        options['metadataLookupNotification'] = cachedContent;

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };