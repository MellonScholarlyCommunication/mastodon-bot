#!/usr/bin/env node

const { program } = require('commander');

const path = require('path');
const fs = require('fs');
const Cite = require('citation-js');

const file = process.argv[2];

program
  .name('citation_demo.js')
  .option('-s,--style <style>', 'output style','apa')
  .argument('<file>','input file')
  .action( (file,opts) => {
    let data = fs.readFileSync(file,{ encoding: 'utf8'});
    let example = new Cite(data);
    let output = example.format('bibliography', {
        format: 'html',
        template: opts.style,
        lang: 'en-US'
    });
    
    console.log(output);
  });

program.parse();