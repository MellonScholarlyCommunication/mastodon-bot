const logger = require('ldn-inbox-server').getLogger();
const { fetchOriginal } = require('ldn-inbox-server');
const Cite = require('citation-js');

/**
 * Handler create a html citation from the service result
 */
async function handle({path,options,config,notification}) {
    try {
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

        options['htmlCitation'] = htmlCitation;

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        return { path, options, success: false };
    }
}

module.exports = { handle };