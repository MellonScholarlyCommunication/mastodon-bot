#!/usr/bin/env node

const { program } = require('commander');
const cache = require('../lib/cache');
const fs = require('fs');
const chalk = require('chalk');

const logger = require('ldn-inbox-server').getLogger();

program
    .name('cache_admin.js');

program
    .command('list')
    .action( async () => {
        const result = await cache.listCache();
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
        file.forEach( (json) => {
            const data = JSON.parse(fs.readFileSync(json, { encoding: 'utf-8'}));
            const result = cache.addCache(data);
            console.log(result);
        });
    });

program
    .command('remove')
    .argument('<id>','cache identifier')
    .action( async (id) => {
        const result = cache.removeCache(id)
        console.log(result);
    });

program
    .command('remove-all')
    .action( async () => {
        const list = cache.listCache();
        for (let i = 0 ; i < list.length ; i++) {
            const result = cache.removeCache(list[i]);
            console.log(`${list[i]} ${result}`);
        }
    });

program
    .command('summary')
    .action( async () => {
        const list = cache.listCache();
        for (let i = 0 ; i < list.length ; i++) {
            const notification = cache.getCache(list[i]);
            let id = notification.id;
            let type = notification.type;
            let actor = notification.actor.id;
            let object = notification.object.id;

            console.log(`${chalk.blue(id)} ${chalk.red(type)}`);
            console.log(` ${chalk.yellow('from')}: ${actor}`);
            console.log(` ${chalk.yellow('object')}: ${object}`);
            console.log();
        }
    });

program.parse();
