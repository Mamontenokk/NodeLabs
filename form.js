'use static';

const querystring = require('querystring');
const https = require('https');

function getStationsValues(startStation, endStation){
    return getStations(startStation)
        .then(result=>{
            return getFirstStationValue(result);
        }).then(fromStation => {

            return getStations(endStation)
                .then(result=>{
                    return new Promise(resolve=> {
                        resolve([fromStation, getFirstStationValue(result)]);
                    })
                })
        })
}

function getStations(name) {
    return new Promise((resolve,reject)=> {
        https.get(`https://www.uz.gov.ua/passengers/timetable/suggest-station/?q=${querystring.escape(name)}`, resp => {
            let data = '';
            resp.on('data', chunk => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(data);
            });
            resp.on('error', error=>{
                reject(error)
            })
        });
    });
}

function getFirstStationValue(stations){
    const firstStation = stations.split(', ')[0];
    return firstStation.split('~')[1].replace('"','').replace(' ]','');
}

const getUrl = function getUrl(fromStation, toStation){
    return getStationsValues(fromStation, toStation).then(result=>{
        const options={
            from_station: result[0],
            to_station: result[1],
            select_time: 2,
            time_from: 0,
            time_to: 24,
            by_route: 'Пошук'
        };
        return new Promise(resolve=> {
            resolve('https://www.uz.gov.ua/passengers/timetable/?' + querystring.encode(options))
        })
    });
};

module.exports = {getUrl};