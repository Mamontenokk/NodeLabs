'use strict';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const request = require('request');
const http = require('http');
const https = require('https');
const Telegraf = require('telegraf');

const url = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';

function getWeekData (id, document) {
    if(document.getElementById(id) === null){
        throw "Error";
    } else if (document.getElementById(id).getElementsByTagName('tr') === null){
        throw "Error";
    }
    return document.getElementById(id).getElementsByTagName('tr');
}

function getRowData (document) {
       if (document.getElementsByTagName('td') === null)
       {
           throw "Error";
       }
       return document.getElementsByTagName('td');
}

function parseText(data) {
    return new Promise(resolve=>{
        const dom = new JSDOM(data);
        const document = dom.window.document;

        const first = getWeekData('ctl00_MainContent_FirstScheduleTable', document);
        const second = getWeekData('ctl00_MainContent_SecondScheduleTable', document);

        const week = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        };

        let firstWeek = {};
        let secondWeek = {};

        for(let row in first){
            if(row>0 && row<6) {

                const firstRow = getRowData(first[row]);
                const secondRow = getRowData(second[row]);

                for (const day of Object.keys(week)){
                    if (firstWeek[week[day]] === undefined) {
                        firstWeek[week[day]] = [];
                        secondWeek[week[day]] = [];
                    }
                    try {
                        let temp = {};
                        const firstLength = firstRow[day].getElementsByTagName('a').length;
                        const secondLength = secondRow[day].getElementsByTagName('a').length;

                        temp.number = row;
                        temp.name = firstRow[day].getElementsByTagName('a')[0].innerHTML;
                        temp.teacher = firstRow[day].getElementsByTagName('a')[1].innerHTML;
                        temp.classroom = firstRow[day].getElementsByTagName('a')[firstLength-1].innerHTML;
                        firstWeek[week[day]].push(temp);

                        temp.name = secondRow[day].getElementsByTagName('a')[0].innerHTML;
                        temp.teacher = secondRow[day].getElementsByTagName('a')[1].innerHTML;
                        temp.classroom = secondRow[day].getElementsByTagName('a')[secondLength-1].innerHTML;
                        secondWeek[week[day]].push(temp);
                    }
                    catch(err){
                        //
                    }
                }
            }
        }
        const result = '=================\nFIRST WEEK\n=================\n\n' +formatData(firstWeek)+
            '\n=================\nSECOND WEEK\n=================\n\n' + formatData(secondWeek);
        resolve(result);
    })
}

function formatData(data) {
    let result = '';
    const days = Object.keys(data);
    for (const day of days){
        result += '--------------------\n' + day +'\n--------------------\n\n';
        for(const lesson in data[day]){
            result += data[day][lesson].number + '.' + data[day][lesson].name + '\n';
            result += 'Teacher: ' + data[day][lesson].teacher + '\n';
            result += 'Classroom: ' + data[day][lesson].classroom + '\n\n' ;
        }
    }
    return result;
}

const getGroupUrl = function getGroupUrl(url, group) {
    return JSDOM.fromURL(url).then(dom => {
        const document = dom.window.document;
        const formElement = document.getElementById('aspnetForm');
        const hiddenInputs = formElement.querySelectorAll('input[type="hidden"');

        const form = {
            ctl00$MainContent$ctl00$txtboxGroup: group,
            ctl00$MainContent$ctl00$btnShowSchedule: "Розклад занять"
        };

        [...hiddenInputs].forEach(elem =>{
            form[elem.name] = elem.value;
        });

        return new Promise(resolve=>{
            request.post({
                url: url,
                form: form
            }, (err, res)=>{
                resolve(`http://rozklad.kpi.ua${res.headers.location}`)
            });
        });
    });
};

function httpGet(url){
    return new Promise((resolve, reject)=>{
        let data = '';
        http.get(url, (res) =>{
            res.on('data', (chunk)=>{
                data+=chunk;
            });
            res.on('end', ()=>{
                resolve(data);
            });
        }).on('error', (err)=>{
            console.log('Error', err);
            reject("Error");
        });
    })
}

const parse = function parse(group){
    return getGroupUrl(url, group).then(groupUrl=>{
            return httpGet(groupUrl)
        },
        error=>{
            throw (error)
        }).then(result=> {
            return parseText(result)
        },
        error=>{
            throw (error)
        })
};

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Print in your group name to get your schedule'));
bot.hears(/^[А-ЯІа-яі]{2}-[1-9а-яі]{2,5}$/, (ctx) => parse(ctx.message.text)
    .then(result=>{ctx.reply(result)})
    .catch(()=>ctx.reply('Ooopsie. Someone made an ooopsie')));
bot.hears('hi', (ctx) => ctx.reply('HONOR TO UKRAINE'));

bot.telegram.setWebhook('https://nodelabs-kpi-schedule-bot.mamontenok.now.sh');

module.exports = bot.webhookCallback('/');

/*http.createServer(bot.webhookCallback('/secret-path'))
    .listen(80);*/
