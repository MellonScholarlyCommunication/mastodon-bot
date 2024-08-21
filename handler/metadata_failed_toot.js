const logger = require('ldn-inbox-server').getLogger();

/**
 * Handler send a toot to the original sender
 */
async function handle({path,options,config,notification}) {
    try {
        const outgoingNotification = options['outgoingNotification'];

        if (! outgoingNotification) {
            logger.error(`no outgoingNotification found in context`);
            return { path, options, success: false };
        }

        const object = outgoingNotification.object?.id;

        if (! object) {
            logger.error(`no object.id found in outgoingNotification`);
            return { path, options, success: false }; 
        }

        options['toot'] = `aah..I failed to find metadata for ${object} :/`;

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };