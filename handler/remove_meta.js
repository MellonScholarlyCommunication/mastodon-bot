const logger = require('ldn-inbox-server').getLogger();
const fs = require('fs');
const fsPath = require('path');

/**
 * Handler to lookup an artifact url against Zotero and store the
 * result as a service result file 
 */
async function handle({path,options,config}) {
    logger.info(`parsing notification ${path}`);
   
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