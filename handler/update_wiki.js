const logger = require('ldn-inbox-server').getLogger();
const fs = require('fs');
const fsPath = require('path');
const Cite = require('citation-js');
const { fetchOriginal } = require('ldn-inbox-server');
const { getCache } = require('../lib/cache');
const { getResearcherProfile } = require('../lib/mastodon');

/**
 * Handler to update wiki.js with new data
 */
async function handle({path,options,config,notification}) {
    logger.info(`parsing notification ${path}`);
   
    try {
        const inReplyTo = notification['inReplyTo'];
        const cachedContent = getCache(inReplyTo);

        const originalId = cachedContent.createdFor;

        if (! originalId) {
            logger.error(`can not find a createdFor in context`);
            return { path, options, success: false };
        }
        else {
            logger.info(`original notification: ${originalId}`);
        }

        const originalNotification = getCache(originalId);

        if (! originalNotification) {
            logger.error('can not find original notification ${originalId}');
            return { path, options, success: false };
        }
        else {
            logger.info(`found ${originalId} in cache`);
        }

        const originalMastodonAccount = originalNotification['actor']['id'];

        if (! originalMastodonAccount) {
            logger.error(`can not find mastodon account in ${originalId}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`mastodon account: ${originalMastodonAccount}`);
        }

        const researcherProfile = await getResearcherProfile(originalMastodonAccount);

        if (! researcherProfile) {
            logger.error(`can not find researcher profile for ${originalMastodonAccount}`);
            return { path, options, success: false };
        }
        else {
            logger.info(`researcher profile: ${researcherProfile}`);
        }

        const serviceResultId = notification['object']['id'];

        if (! serviceResultId) {
            logger.error(`notification has no object.id?!`);
            return { path, options, success: false };
        }
        else {
            logger.info(`service result: ${serviceResultId}`);
        }

        const serviceResult = await fetchOriginal(serviceResultId);

        if (! serviceResult) {
            logger.error(`can not fetch service result`);
            return { path, options, success: false };
        }
        else {
            logger.info(`fetched service result`);
        }

        logger.debug(serviceResult);

        const citation = new Cite(serviceResult);
        const htmlCitation = citation.format('bibliography', {
                format: 'html',
                template: 'apa',
                lang: 'en-US'
        });
    
        if (! htmlCitation || htmlCitation.length == 0) {
            logger.error(`can not convert service result into a html citation`);
            return { path, options, success: false };
        }
        else {
            logger.info(`converted the service result into a html citation`);
        }

        logger.debug(htmlCitation);

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };