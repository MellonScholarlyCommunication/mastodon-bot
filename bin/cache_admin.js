#!/usr/bin/env node

const { program } = require('commander');
const cache = require('../lib/cache');
const fs = require('fs');
const chalk = require('chalk');

require('dotenv').config({path:`${__dirname}/../.env`});

program
    .name('cache_admin.js');

program
    .command('init')
    .action( async() => {
        const result = await cache.initCache();
        console.log(result);
    });

program
    .command('list')
    .argument('[queryPath]','query')
    .argument('[contextPath]','query')
    .action( async (queryPath,contextPath) => {
        const result = await cache.listCache(queryPath,contextPath);
        console.log(result);
    });

program
    .command('get')
    .argument('<id>','cache identifier')
    .action( async (id) => {
        const result = await cache.getCache(id);
        console.log(JSON.stringify(result,null,2));
    });

program
    .command('add')
    .argument('<file...>','json notification')
    .action( async (file) => {
        for (let i = 0 ; i < file.length ; i++) {
            const json = file[i];
            const data = JSON.parse(fs.readFileSync(json, { encoding: 'utf-8'}));
            const context = {};
            if (data.original) {
                // Hack to inject an original in the data for test purposes...
                context['original'] = data.original;
            }
            const result = await cache.addCache(data,context);
            console.log(result);
        }
    });

program
    .command('remove')
    .argument('<id>','cache identifier')
    .action( async (id) => {
        const result = await cache.removeCache(id)
        console.log(result);
    });

program
    .command('remove-all')
    .action( async () => {
        const list = await cache.listCache();
        for (let i = 0 ; i < list.length ; i++) {
            const result = await cache.removeCache(list[i]);
            console.log(`${list[i]} ${result}`);
        }
    });

program
    .command('summary')
    .argument('[id]', 'for this identifier')
    .action( async (id) => {
        if (id) {
            await summaryFor(id);
        
            const list = await cache.listCache('',`original=${id}`);
            for (let i = 0 ; i < list.length ; i++) {
                await summaryFor(list[i],2);
            }
        }
        else {
            const list = await cache.listCache();
            for (let i = 0 ; i < list.length ; i++) {
                await summaryFor(list[i]);
            }
        }
    });

program.parse();

async function summaryFor(thisId,spacing = 0) {

    const notification = await cache.getCache(thisId);
    const context = await cache.getCacheContext(thisId);

    if (! (notification && context)) {
        return;
    }
    
    const id = notification.id;
    const type = notification.type;
    const actor = notification.actor.id;
    const object = notification.object.id;
    const updated = context.updated;

    let sp = ' '.repeat(spacing); 
    
    console.log(`${sp}${chalk.blue(id)} ${chalk.red(type)}`);
    console.log(`${sp} ${chalk.yellow('from')}: ${actor}`);
    console.log(`${sp} ${chalk.yellow('object')}: ${object}`);
    console.log(`${sp} ${chalk.yellow('updated')}: ${updated}`);
    
    if (context.original) {
        console.log(`${sp} ${chalk.yellow('original')}: ${chalk.blue(context.original)}`);
    }

    console.log();
}
