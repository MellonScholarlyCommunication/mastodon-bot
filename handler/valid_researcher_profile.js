const logger = require('ldn-inbox-server').getLogger();
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');
const { verifyResearcher } = require('../lib/verifyResearcher');

/**
 * Handler to check if actor has a valid researcher profile
 */
async function handle({path,options,config,notification}) {
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

        // Simulate a Mastodon View notification
        const mastodonView = makeView(mastodonAccount,config.actor,notification['actor']);
        await addCache(mastodonView, { original: notification['id'] }, { name: process.env.CACHE_NAME });

        const profiles = await verifyResearcher(mastodonAccount);
       
        if (!profiles) {
            logger.error(`cannot verify ${mastodonAccount}`);
            return { path, options, success: false }; 
        }
        else {
            logger.info(`bonsai! %s`,profiles);
        }

        // Simulate a Verification View notification
        const verificationView = makeView(profiles.verificationProfile,config.actor,config.target);
        await addCache(verificationView, { original: notification['id'] }, { name: process.env.CACHE_NAME });

        return { path, options, success: true };
    }
    catch (e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

function makeView(url,actor,target) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": generateId(),
        "type": "View",
        "published": generatePublished(),
        "actor": actor,
        "object": {
          "id": url,
          "type": "Document"
        },
        "target": target
    };
}

module.exports = { handle };
