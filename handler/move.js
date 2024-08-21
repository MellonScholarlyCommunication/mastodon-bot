const logger = require('ldn-inbox-server').getLogger();
const fs = require('fs');
const fsPath = require('path');

/**
 * Handler to move a notification to another folder
 */
async function handle({path,options,config,notification}) {
    try {
        if (! config.to && fs.existsSync(config.to)) {
            logger.error(`no .to option in config`);
            return { path, options, success: false };
        }

        const data = fs.readFileSync(path, { encoding: 'utf-8' });
        
        const name = fsPath.basename(path);

        const outboxFile = config.to + '/' + name;

        logger.info(`storing ${notification.type} to ${outboxFile}`);

        fs.writeFileSync(outboxFile,data);

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };