#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const Cite = require('citation-js');

const file = process.argv[2];

if (! file) {
    console.error(`usage: ${path.basename(process.argv[1])} file`);
    process.exit(1);
}

let data = fs.readFileSync(file,{ encoding: 'utf8'});
let example = new Cite(data);
let output = example.format('bibliography', {
    format: 'html',
    template: 'apa',
    lang: 'en-US'
});

console.log(output);