const logger = require('ldn-inbox-server').getLogger();
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

async function verifyResearcher(userProfile) {
    let researcherProfile;
    let verificationProfile;

    if (process.env.DEMO_PROFILE) {
        researcherProfile = process.env.DEMO_PROFILE;
        logger.warn(`DEMO_PROFILE found, faking profile ${researcherProfile}`);
    }
    else {
        logger.info(`searching rel=me at ${userProfile}`);
        const relmes = await relMeLink(userProfile);
        
        if (!relmes) {
            logger.error(`can not find rel=me for ${userProfile}`);
            return { path, options, success: false }; 
        }
        else {
            logger.info(`found: ${relmes.join(';')}`);
        }

        researcherProfile = relmes.find( x => x.startsWith(process.env.WIKIJS_URL));

        if (!researcherProfile) {
            logger.error(`no rel=me match for ${process.env.WIKIJS_URL}`);
        }

        verificationProfile = relmes.find( x => x.startsWith(process.env.VERIFICATION_URL));

        if (!verificationProfile) {
            logger.error(`no rel=me match for ${process.env.VERIFICATION_URL}`);
        }
    }

    if (! researcherProfile && verificationProfile) {
        logger.info(`trying to find researcher profile via ${verificationProfile}`);

        const jsonld = await jsonLDFetch(verificationProfile);

        if (jsonld) {
            researcherProfile = jsonld['primaryTopic']?.homepage;
        }
    }

    if (! researcherProfile) {
        logger.error(`can not find researcher profile for ${userProfile}`);
        return null;
    }
    else {
        logger.info(`researcher profile: ${researcherProfile}`);
    }

    if (process.env.DEMO_PROFILE) {
        logger.warn(`DEMO_PROFILE found, link back checks will be ignored`);
    }
    else if (verificationProfile) {
        logger.info(`verification profile: ${verificationProfile}`);
        logger.info(`checking for rel=me at ${verificationProfile}`);

        if (await hasLinkBack(verificationProfile,userProfile)) {
            logger.info(`verification profile has valid link back`);
        }
        else {
            logger.error(`verification profile does not have a link back`);
            return null;
        }
    }
    else if (process.env.VERIFICATION && process.env.VERIFICATION === 'strict') {
        logger.error(`no verification profile found (strict)`);
        return null;
    }
    else {
        logger.warn(`no verification profile found (skipping)`);
    }

    return { researcherProfile , verificationProfile } ;
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
            const href = result[i].getAttribute('href');
            const absolute = (new URL(href,url)).href;
            relmes.push(absolute);
        }

        result = root.querySelectorAll(`a[rel=me]`);

        for (let i = 0 ; i < result.length ; i++) {
            const href = result[i].getAttribute('href');
            const absolute = (new URL(href,url)).href;
            relmes.push(absolute);
        }

        const answer = [...new Set(relmes)];
        return answer;
    }
    catch (e) {
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
    catch (e) {
        logger.error(`jsonLDFetch(${url}) failed`);
        logger.error(e);
        return null;
    }   
}

async function hasLinkBack(researcherProfile,userProfile) {
    try {
        const res = await fetch(researcherProfile);

        if (! res.ok) {
            logger.error(`requesting ${researcherProfile} failed ${res.status} - ${res.statusText}`);
            return false;
        }

        const text = await res.text();
        const root = parse(text);
        const result1 = root.querySelector(`a[rel=me][href=${userProfile}]`);
        const result2 = root.querySelector(`link[rel=me][href=${userProfile}]`);

        if (result1 || result2) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (e) {
        logger.error(`hasLinkBack(${researcherProfile},${userProfile}) failed`);
        logger.error(e);
        return false;
    }
}

module.exports = { verifyResearcher };