require('dotenv').config();
const logger = require('./logger');
const client = require('./client');
const { CommandHandler } = require('./util/command-handler');
const Command = require('./commands');
const { db } = require('./db');
const Types = require('./util/types');

function setUpCommandHandler() {
    const handler = new CommandHandler(process.env.COMMAND_PREFIX);

    handler.register({
        name: 'register',
        handler: Command.register
    });

    handler.register({
        name: 'balance',
        handler: Command.balance
    });

    handler.register({
        name: 'transfer',
        handler: Command.transfer,
        arguments: [
            {name: 'to', type: Types.DiscordMention()},
            {name: 'amount', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'payday',
        handler: Command.payday,
        arguments: [
            {name: 'to', type: Types.DiscordMention()},
            {name: 'amount', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'info',
        handler: Command.info,
        arguments: [
            {name: 'bet', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'bet',
        handler: Command.bet,
        arguments: [
            {name: 'challenged', type: Types.DiscordMention()},
            {name: 'judge', type: Types.DiscordMention()},
            {name: 'details', type: Types.Text(1, 250)},
            {name: 'amount', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'accept',
        handler: Command.accept,
        arguments: [
            {name: 'bet', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'reject',
        handler: Command.reject,
        arguments: [
            {name: 'bet', type: Types.Integer}
        ]
    });

    handler.register({
        name: 'judge',
        handler: Command.judge,
        arguments: [
            {name: 'bet', type: Types.Integer},
            {name: 'winner', type: Types.DiscordMention()},
        ]
    });

    handler.register({
        name: 'forceAccept',
        handler: Command.forceAccept,
        arguments: [
            {name: 'bet', type: Types.Integer},
            {name: 'acceptingUser', type: Types.DiscordMention()}
        ]
    });

    handler.register({
        name: 'forceRegister',
        handler: Command.forceRegister,
        arguments: [
            {name: 'newUser', type: Types.DiscordMention()}
        ]
    });

    handler.register({
        name: 'debug',
        handler: Command.debug
    });

    return handler;
}

function setUpClient(cmdHandler) {
    client.on('message', async msg => {
        try {
            await cmdHandler.handle(msg);
        } catch(err) {
            logger.error(err);
        }
        
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