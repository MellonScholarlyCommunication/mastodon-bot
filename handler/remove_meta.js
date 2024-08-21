const logger = require('ldn-inbox-server').getLogger();
const fs = require('fs');
const fsPath = require('path');

/**
 * Handler to remove the notificatin .meta file
 */
async function handle({path,options,config}) {
    const meta = `${path}.meta`;

    try {
        if (fs.existsSync(meta)) {
            logger.info(`removing ${meta}`);
            fs.unlinkSync(meta);
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