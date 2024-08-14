const logger = require('ldn-inbox-server').getLogger();
const fetch = require('node-fetch');

async function getProfile(account) {
    logger.debug(`fetching ${account}`);

    try {
        const response = await fetch(account , {
            method: 'GET',
            headers: {
                'Accept': 'application/activity+json'
            }
        });

        if (response.ok) {
            return await response.json();
        }
        else {
            logger.error(`failed (${response.status}) : ${response.statusText}`)
            return null;
        }
    }
    catch (e) {
        logger.error(e);
        return null;
    }
}

async function getResearcherProfile(account) {
    const profile = await getProfile(account);

    if (!profile) {
        return null;
    }

    if (! profile['attachment']) {
        return null;

    }

    const hits = profile['attachment'].filter( (item) => {
        if (item['name'].match(/researcher\s*profile/i)) {
            return true;
        }
        else {
            return false;
        }
    }).map( (item) => {
        return item['value'].replaceAll(/<[^>]+>/g,'')
    });

    if (hits) {
        return hits[0];
    }
    else {
        return null;
    }
}

module.exports = { 
    getProfile,
    getResearcherProfile
};