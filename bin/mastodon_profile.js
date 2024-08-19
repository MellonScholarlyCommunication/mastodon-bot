#!/usr/bin/env node

const path = require('path');
const mastodon = require('../lib/mastodon');

const account = process.argv[2];

if (! account) {
    console.error(`usage: ${path.basename(process.argv[1])} account`);
    process.exit(1);
}

main();

async function main() {
    const profile = await mastodon.getProfile(account);
    console.log(profile);
    const researcherProfile = await mastodon.getResearcherProfile(account);
    
    if (researcherProfile) {
        console.log(`=> ${researcherProfile}`);
    }
    else {
        console.log(`=> no researcher profile found`);
    }
}