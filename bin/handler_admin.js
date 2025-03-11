#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const fsPath = require('path');
const { parseConfig } = require('ldn-inbox-server');

const log4js = require('log4js');
const logger = log4js.getLogger();

log4js.configure({
    appenders: {
      stderr: { type: 'stderr' }
    },
    categories: {
      default: { appenders: ['stderr'], level: process.env.LOG4JS ?? 'INFO' }
    }
});

program
    .name('handler_admin');

program
    .command('load')
    .argument('<handler>','Mastodon handler')
    .action( async(handler) => {
        const pkg = await dynamic_handler(handler,null);
        console.log(pkg);
    }); 

program
    .command('exec') 
    .option('--options <file>','Options file',null)
    .option('--config <file>','Config file',null)
    .argument('<handler>','Mastodon handler')
    .argument('<path>','Notification')
    .action( async(handler,path,opts) => {
        await test_handler(handler,path,opts);
    }); 

program
    .command('manifest') 
    .argument('<path>','Manifest path')
    .action( async(path) => {
        const manifest = JSON.parse(fs.readFileSync(path,'utf-8'));
        const handler = manifest.handler;
        const dir = fsPath.dirname(path);

        let notification;
        const opts = {};

        if (fs.existsSync(`${dir}/config.json`)) {
            opts['config'] = `${dir}/config.json`;
        }

        if (fs.existsSync(`${dir}/options.json`)) {
            opts['options'] = `${dir}/options.json`;
        }

        if (fs.existsSync(`${dir}/notification.jsonld`)) {
            notification = `${dir}/notification.jsonld`;
        }

        await test_handler(handler,notification,opts);
    }); 

program.parse();

async function test_handler(handler,path,opts) {
    const pkg = await dynamic_handler(handler,null);
    let config = { null: null}; 
    let options = { null: null};

    if (! fs.existsSync(path)) {
        logger.error(`no such file ${path}`);
        process.exit(2);
    }

    const notification = JSON.parse(fs.readFileSync(path,'utf-8'));

    if (opts.options) {
        options = JSON.parse(fs.readFileSync(opts.options,'utf-8'));
    }

    if (opts.config) {
        config = parseConfig(opts.config);
    }

    const result = await pkg.handle({path,options,config,notification});

    logger.info(result);

    if (result.success) {
        console.log(`👍 (${result.success}) ${handler}`);
        process.exitCode = 0;
    }
    else {
        console.log(`👎 (${result.succes}) ${handler}`);
        process.exitCode = 3;
    }
}

function dynamic_handler(handler,fallback) {
    if (handler) {
        if (typeof handler === 'function') {
            logger.debug(`handler is explicit`);
            return handler;
        }
        else {
            const handler_base = 'node_modules/ldn-inbox-server/handler';
            handler = handler.replaceAll(/@handler/g,fsPath.resolve(handler_base));
            const abs_handler = fsPath.resolve(handler);
            logger.debug(`trying dynamic load of ${handler} -> ${abs_handler}`);
            delete require.cache[abs_handler];
            const pkg = require(abs_handler);
            return pkg;
        }
    }
    else {
        logger.debug(`using fallback handler`);
        return fallback;
    }
}