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
    const profile = await mastodon.getResearcherProfile(account);
    console.log(profile);
}