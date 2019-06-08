'use static'

const Telegraf  = require('telegraf');
const parse = require('./parser.js')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Print in your group name to get your schedule'));
bot.hears(/^[А-ЯІа-яі]{2}-[1-9а-яі]{2,5}$/, (ctx) => parse(ctx.message.text)
    .then(result=>{ctx.reply(result)})
    .catch(()=>ctx.reply('Ooopsie. Someone made an ooopsie')));
bot.hears('hi', (ctx) => ctx.reply('HONOR TO UKRAINE'));


