const logger = require('ldn-inbox-server').getLogger();
const fs = require('fs');
const fsPath = require('path');
const Cite = require('citation-js');
const { resolvePage , getPage, contentInserter, updatePage } = require('wikijs-cli');
const { fetchOriginal } = require('ldn-inbox-server');
const { getCache } = require('../lib/cache');
const { getAttachment } = require('mastodon-cli');

/**
 * Handler to update wiki.js with new data
 */
async function handle({path,options,config,notification}) {
    logger.info(`parsing notification ${path}`);
   
    try {
        // Try to find the original toot for which metadata was requested
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

        // Try to resolve the mastodon profile and find the link to the
        // researcher profile
        const originalMastodonAccount = originalNotification['actor']['id'];

        if (! originalMastodonAccount) {
            logger.error(`can not find mastodon account in ${originalId}`);
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

        // Try to find the metadata service result (this should be a CSL json file)
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

        // Try to turn this CSL json into a HTML citaton in the apa format
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

        // Try to update the old Wiki.js researcher profile with the updated citation
        const wiki_url = process.env.WIKIJS_URL;
        const wiki_acess_token = process.env.WIKIJS_ACCESS_TOKEN;

        const resolvedPage = await resolvePage(researcherProfile, {
            url: wiki_url ,
            token: wiki_acess_token
        });

        if (! resolvedPage ) {
            logger.error(`failed to resolve ${researcherProfile} at wiki.js`);
            return { path, options, success: false };
        }
        else {
            logger.info(`resolved ${researcherProfile} to be wiki.js page ${resolvedPage.id}`);
        }

        const currentPage = await getPage(resolvedPage.id, {
            url: wiki_url ,
            token: wiki_acess_token 
        });

        if (! currentPage) {
            logger.error(`failed to fetch page ${resolvedPage.id} at wiki.js`);
            return { path, options, success: false };
        }
        else {
            logger.info(`fetched page ${resolvedPage.id}`);
        }

        const currentContent = currentPage.content;

        logger.debug(`currentContent`);
        logger.debug(currentContent);
        logger.debug(`htmlCitation`);
        logger.debug(htmlCitation);

        const updatedContent = await contentInserter(currentContent, htmlCitation, {
            tag: "mastodon-bot",
            overwrite: false,
            similarity: 0.9,
            similarityNormalization: 'html'
        });

        if (updatedContent) {
            logger.info(`content needs to be updated`);
            logger.debug(updatedContent);
        }
        else {
            logger.info(`content seems similar, no update needed`);
            return { path, options, success: true }; 
        }

        // Pass on some important results to the next handler in line :P
        options['originalNotification'] = originalNotification;
        options['researcherProfile'] = researcherProfile;
        // -------------------------------------------------------------

        if (process.env.DEMO_MODE) {
            logger.info(`**demo mode** I will not do anything`);
            return { path, options, success: true }; 
        }

        const newPage = await updatePage(currentPage.id , {
            content: updatedContent
        }, {
            url: wiki_url ,
            token: wiki_acess_token
        });

        if (! newPage) {
            logger.error(`failed to update ${currentPage.id} at wiki.js`);
            return { path, options, success: false };
        }
        else {
            logger.info(`updated page ${currentPage.id} at wiki.js`);
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