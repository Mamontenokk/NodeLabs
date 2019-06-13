'use strict';

const { JSDOM } = require('jsdom');
const { getUrl } = require('./form.js');

const labels = {
    0: 'Train number',
    1: 'Route',
    2: 'Periodicity',
    3: 'Departure station',
    4: 'Arrival time to d',
    5: 'Departure time from d',
    6: 'Arrival station',
    7: 'Arrival time to a',
    8: 'Departure time from a'
};

function parse(fromStation, toStation){
    return getUrl(fromStation, toStation).then(url=>{
        return JSDOM.fromURL(url).then(dom=>{
            const document = dom.window.document;
            const table = document.getElementById('cpn-timetable').querySelector('tbody');
            const rows = table.querySelectorAll('tr');
            const schedule = [];
            rows.forEach(row=>{
                schedule.push(getRowData(row))
            });
            return new Promise(resolve=>{
                resolve(schedule);
            })
        })
    })
}

function getRowData(row){
    const object = {};
    row.querySelectorAll('td').forEach((elem, index)=>{
        object[labels[index]] = elem.textContent;
    });
    return object
}

function formatSchedule(schedule){
    let resultString = '';
    schedule.forEach((train, index)=>{
        resultString += `\n${index+1}.\n`;
        Object.keys(train).forEach(key=>{
            resultString += `${key} : ${train[key]} \n`
        })
    });
    return resultString;
}

const getSchedule = function getSchedule(inputMessage){ // inputMessage is a string, that has next form: city, city
    const fromStation = inputMessage.split(',')[0];
    const toStation = inputMessage.split(',')[1].trim();
    return parse(fromStation, toStation).then(result=>{
        return new Promise(resolve=>{
            resolve(formatSchedule(result))
        })
    })
};

module.exports = { getSchedule };