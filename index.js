'use strict'; 

const https = require('https');
const http = require('http');

//const options = {
//	key: fs.readFileSync('bad.key'),
//	cert: fs.readFileSync('bad.pem')
//};


const server = http.createServer((request, response) =>{
	console.log(request.url.split(':')[0]);
	if(request.url.split(':')[0]==='http') {
		http.get(request.url, (resp) =>{
		resp.pipe(response);
		}).on('error', (err)=>{
			console.log('Error' + err.message);
		});
	}
	if(request.url.split(':')[0]==='https') {
		console.log(1);
		https.get(request.url, (resp) => {
		resp.pipe(response);
		}).on('error', (err)=>{
			console.log('Error' + err.message);
		});
	}
});

server.listen(5001);