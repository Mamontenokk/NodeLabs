'use static';

const Telegraf  = require('telegraf');
const {getSchedule} = require('./parser.js');

const bot = new Telegraf('842567190:AAEPGv31awfyefzLVOyxE1Ye2LqVve6KFxU');

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Print in your group name to get your schedule'));
bot.hears(/\s*[А-ЯІа-яі]{1,40}\s*-\s*[А-ЯІа-яі]{1,40}\s*/, (ctx) => getSchedule(ctx.message.text)
    .then(result=>{result.forEach(page=>{ctx.reply(page)})})
    .catch(()=>ctx.reply('Ooopsie. Someone made an ooopsie')));
bot.launch();

/*bot.telegram.setWebhook('https://nodelabs-kpi-exam.mamontenok.now.sh');

module.exports = bot.webhookCallback('/');*/
