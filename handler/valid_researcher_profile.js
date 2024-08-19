const logger = require('ldn-inbox-server').getLogger();
const { getResearcherProfile } = require('../lib/mastodon');

/**
 * Handler to check if actor has a valid researcher profile
 */
async function handle({path,options,config,notification}) {
    logger.info(`parsing notification ${path}`);
   
    try {
        // Try to resolve the mastodon profile and find the link to the
        // researcher profile
        const id = notification['id'];
        const mastodonAccount = notification['actor']['id'];

        if (! mastodonAccount) {
            logger.error(`can not find mastodon account in ${id}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`mastodon account: ${mastodonAccount}`);
        }

        const researcherProfile = await getResearcherProfile(mastodonAccount);

        if (! researcherProfile) {
            logger.error(`can not find researcher profile for ${mastodonAccount}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`researcher profile: ${researcherProfile}`);
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