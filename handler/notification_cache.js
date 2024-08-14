const logger = require('ldn-inbox-server').getLogger();
const { parseAsJSON } = require('ldn-inbox-server');
const { addCache } = require('../lib/cache');

/**
 * Store the notification in a cache database
 */
async function handle({path,options,config,notification}) {
    logger.info(`parsing notification ${path}`);
    
    try {
        addCache(notification);

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };