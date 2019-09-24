require('dotenv').config();
const logger = require('./logger');
const Discord = require('discord.js');
const client = new Discord.Client();
const { CommandHandler } = require('./util/command-handler');
const { commandRegister, commandBalance, commandDebug, commandTransfer} = require('./commands');
const { db } = require('./db');

function setUpCommandHandler() {
    const cmdHandler = new CommandHandler(process.env.COMMAND_PREFIX);
    cmdHandler.addCommand('register', commandRegister);
    cmdHandler.addCommand('balance', commandBalance);
    cmdHandler.addCommand('transfer', commandTransfer);
    cmdHandler.addCommand('debug', commandDebug);

    return cmdHandler;
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