'use strict';

const bot = require('./Bot.js');


bot.telegram.setWebhook('https://nodelabs-kpi-schedule-bot.mamontenok.now.sh');

module.exports = bot.webhookCallback('/');