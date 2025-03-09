const logger = require('ldn-inbox-server').getLogger();
const { verifyResearcher } = require('../lib/verifyResearcher');

/**
 * Handler restore the researcher profile
 */
async function handle({path,options,config,notification}) {
    try {
        logger.info('restoring researcher profile');
        const originalNotification = options['originalNotification'];

        // Try to resolve the mastodon profile and find the link to the
        // researcher profile
        const originalMastodonAccount = originalNotification['actor']['id'];

        if (! originalMastodonAccount) {
            logger.error(`can not find mastodon account in ${originalNotification.id}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`mastodon account: ${originalMastodonAccount}`);
        }

        const profiles = await verifyResearcher(originalMastodonAccount);

        if (! profiles) {
            logger.error(`cannot verify ${originalMastodonAccount}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`bonsai (again)! %s`,profiles);
        }

        options['researcherProfile'] = profiles.researcherProfile;

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };