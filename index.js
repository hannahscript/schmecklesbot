require('dotenv').config();
const logger = require('./logger');
const Discord = require('discord.js');
const client = new Discord.Client();
const { CommandHandler } = require('./util/command-handler');
const { commandRegister, commandBalance, commandDebug, commandTransfer} = require('./commands');
const { db } = require('./db');
const Types = require('./util/types');

function setUpCommandHandler() {
    const handler = new CommandHandler(process.env.COMMAND_PREFIX);

    handler.register({
        name: 'register',
        handler: commandRegister
    });

    handler.register({
        name: 'balance',
        handler: commandBalance
    });

    handler.register({
        name: 'transfer',
        handler: commandTransfer,
        arguments: [
            {name: 'to', type: Types.Pattern(/<@(\d{18})>/)},
            {name: 'amount', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'debug',
        handler: commandDebug
    });

    return handler;
}

function setUpClient(cmdHandler) {
    client.on('ready', () => logger.info('Bot is ready'));

    client.on('message', msg => {
        cmdHandler.handle(msg);
    });
}

async function main() {
    const cmdHandler = setUpCommandHandler();
    setUpClient(cmdHandler);

    await db.authenticate();
    await db.sync();
    logger.info('Database is ready');

    client.login(process.env.CLIENT_TOKEN);
}

main();