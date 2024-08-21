const logger = require('ldn-inbox-server').getLogger();
const { getAttachment } = require('mastodon-cli');

/**
 * Handler restore the researcher profile
 */
async function handle({path,options,config,notification}) {
    try {
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

        const researcherProfile = await getAttachment(originalMastodonAccount,/resea.*con.*/i);

        if (! researcherProfile) {
            logger.error(`can not find researcher profile for ${originalMastodonAccount}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`researcher profile: ${researcherProfile}`);
        }

        options['researcherProfile'] = researcherProfile;

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };