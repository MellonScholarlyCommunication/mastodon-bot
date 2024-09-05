#!/usr/bin/env node

const { program } = require('commander');
const cache = require('../lib/cache');
const fs = require('fs');
const chalk = require('chalk');

require('dotenv').config();

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
        for (let i = 0 ; i < file.length ; i++) {
            const json = file[i];
            const data = JSON.parse(fs.readFileSync(json, { encoding: 'utf-8'}));
            const result = await cache.addCache(data);
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
        const list = cache.listCache();
        for (let i = 0 ; i < list.length ; i++) {
            const result = await cache.removeCache(list[i]);
            console.log(`${list[i]} ${result}`);
        }
    });

program
    .command('summary')
    .action( async () => {
        const list = await cache.listCache();
        for (let i = 0 ; i < list.length ; i++) {
            const notification = await cache.getCache(list[i]);
            const id = notification.id;
            const type = notification.type;
            const actor = notification.actor.id;
            const object = notification.object.id;
            const updated = notification.updated;

            console.log(`${chalk.blue(id)} ${chalk.red(type)}`);
            console.log(` ${chalk.yellow('from')}: ${actor}`);
            console.log(` ${chalk.yellow('object')}: ${object}`);
            console.log(` ${chalk.yellow('updated')}: ${updated}`);
            console.log();
        }
    });

program.parse();
