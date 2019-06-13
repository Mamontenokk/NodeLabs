'use static';

const Telegraf  = require('telegraf');
const {getSchedule} = require('./parser.js');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Print in your group name to get your schedule'));
bot.hears(/^[А-ЯІа-яі\s]{1,40},[А-ЯІа-яі\s]{1,40}$/, (ctx) => getSchedule(ctx.message.text)
    .then(result=>{ctx.reply(result)})
    .catch(()=>ctx.reply('Ooopsie. Someone made an ooopsie')));

bot.telegram.setWebhook('https://nodelabs-kpi-exam.mamontenok.now.sh');

module.exports = bot.webhookCallback('/');
