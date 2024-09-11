const logger = require('ldn-inbox-server').getLogger();
const { addCache } = require('eventlog-server');

/**
 * Store the notification in a cache database
 */
async function handle({path,options,config,notification}) {
    try {
        const originalNotification = options['originalNotification'];
        
        if (originalNotification) {
            await addCache(notification, { original: originalNotification['id'] });
        }
        else {
            await addCache(notification, {});
        }

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };