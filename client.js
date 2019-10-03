const logger = require('./logger');
const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => logger.info('Bot is ready'));

module.exports = client;