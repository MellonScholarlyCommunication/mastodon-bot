const logger = require('ldn-inbox-server').getLogger();
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');
const { generateId , generatePublished } = require('ldn-inbox-server');
const { addCache } = require('eventlog-server');

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

        const mastodonView = makeView(mastodonAccount,config.actor,notification['actor']);

        // Cache a context document for the original request
        await addCache(mastodonView, { original: notification['id'] }, { name: process.env.CACHE_NAME });

        let researcherProfile;
        let verificationProfile;

        if (process.env.DEMO_PROFILE) {
            researcherProfile = process.env.DEMO_PROFILE;
            logger.warn(`DEMO_PROFILE found, faking profile ${researcherProfile}`);
        }
        else {
            logger.info(`searching rel=me at ${mastodonAccount}`);
            const relmes = await relMeLink(mastodonAccount);

            if (!relmes) {
                logger.error(`can not find rel=me for ${mastodonAccount}`);
                return { path, options, success: false }; 
            }

            researcherProfile = relmes.find( x => x.startsWith(process.env.WIKIJS_URL));
            verificationProfile = relmes.find( x => x.startsWith(process.env.VERIFICATION_URL));
        }

        if (! researcherProfile && verificationProfile) {
            logger.info(`trying to find researcher profile via ${verificationProfile}`);

            const jsonld = await jsonLDFetch(verificationProfile);

            if (jsonld) {
                researcherProfile = jsonld['primaryTopic']?.homepage;
            }
        }

        if (! researcherProfile) {
            logger.error(`can not find researcher profile for ${mastodonAccount}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`researcher profile: ${researcherProfile}`);
        }

        if (process.env.DEMO_PROFILE) {
            logger.warn(`DEMO_PROFILE found, link back checks will be ignored`);
        }
        else if (verificationProfile) {
            logger.info(`verification profile: ${verificationProfile}`);

            const verificationView = makeView(verificationProfile,config.actor,config.target);

            // Cache a context document for the original request
            await addCache(verificationView, { original: notification['id'] }, { name: process.env.CACHE_NAME });

            logger.info(`checking for rel=me at ${verificationProfile}`);

            if (await hasLinkBack(verificationProfile,mastodonAccount)) {
                logger.info(`verification profile has valid link back`);
            }
            else {
                logger.error(`verification profile does not have a link back`);
                return { path, options, success: false };
            }
        }
        else if (process.env.VERIFICATION && process.env.VERIFICATION === 'strict') {
            logger.error(`no verification profile found (strict)`);
            return { path, options, success: false };
        }
        else {
            logger.warn(`no verification profile found (skipping)`);
        }

        return { path, options, success: true };
    }
    catch(e) {
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

async function relMeLink(url) {
    try {
        const res = await fetch(url);

        if (! res.ok) {
            logger.error(`requesting ${url} failed ${res.status} - ${res.statusText}`);
            return null;
        }

        const relmes = [];
        const text = await res.text();
        const root = parse(text);
        let result = root.querySelectorAll(`link[rel=me]`);

        for (let i = 0 ; i < result.length ; i++) {
            relmes.push(result[i].getAttribute('href'));
        }

        result = root.querySelectorAll(`a[rel=me]`);

        for (let i = 0 ; i < result.length ; i++) {
            relmes.push(result[i].getAttribute('href'));
        }

        const answer = [...new Set(relmes)];
        return answer;
    }
    catch {
        logger.error(`relMeLink(${url}) failed`);
        logger.error(e);
        return null;
    }   
}

async function jsonLDFetch(url) {
    try {
        const res = await fetch(url);

        if (! res.ok) {
            logger.error(`requesting ${url} failed ${res.status} - ${res.statusText}`);
            return null;
        }

        const text = await res.text();
        const root = parse(text);
        let result = root.querySelector(`script[type=application/ld+json]`);

        if (result) {
            return JSON.parse(result.innerText);
        }
        else {
            return null;
        }
    }
    catch {
        logger.error(`jsonLDFetch(${url}) failed`);
        logger.error(e);
        return null;
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
        const result1 = root.querySelector(`a[rel=me][href=${mastodonAccount}]`);
        const result2 = root.querySelector(`link[rel=me][href=${mastodonAccount}]`);

        if (result1 || result2) {
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