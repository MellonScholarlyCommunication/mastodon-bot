const logger = require('ldn-inbox-server').getLogger();
const { getAttachment } = require('mastodon-cli');
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

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

        const researcherProfile = await getAttachment(mastodonAccount,/resea.*con.*/i);

        if (! researcherProfile) {
            logger.error(`can not find researcher profile for ${mastodonAccount}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`researcher profile: ${researcherProfile}`);
        }

        if (! researcherProfile.startsWith(config['contributionsBase'])) {
            logger.error(`researcher profile does not match ${config['contributionsBase']}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`researcher profile has valid base url`);
        }

        if (await hasLinkBack(researcherProfile,mastodonAccount)) {
            logger.info(`research profile has valid link back`);
        }
        else {
            logger.error(`researcher profile does not have a link back`);
            return { path, options, success: false };
        }

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

async function hasLinkBack(researcherProfile,mastodonAccount) {
    try {
        const res = await fetch(researcherProfile);

        if (! res.ok) {
            logger.error(`requesting ${researcherProfile} failed ${res.status} - ${res.statusText}`);
            return false;
        }

        const text = await res.text();
        const root = parse(text);
        const result = root.querySelector(`a[rel=me][href=${mastodonAccount}]`);

        if (result) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (e) {
        logger.error(`hasLinkBack(${researcherProfile},${mastodonAccount}) failed`);
        logger.error(e);
        return false;
    }
}

module.exports = { handle };