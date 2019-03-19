'use strict';

const http = require('http');
const net = require('net');
const url = require('url');


const server = http.createServer((request, response) =>{
	console.log(request.url);
	//parse URL
	const ReqUrl = request.url;
	const Result = ReqUrl.includes('//') ?
		url.parse(ReqUrl) : url.parse('//' + ReqUrl, false, true);

	response.writeHead(200, {'Content-Type': 'text/html'});
	//Request to HTTP
	if(Result.protocol==='http:') {
		http.get(request.url, (resp) =>{
		resp.pipe(response);
		//error handling
		}).on('error', (err)=>{
			console.log('Error' + err.message);
		});
	}

});


server.on('connect', (request, socket) =>{
	//parse URL
	const ReqUrl = request.url;
	const Result = ReqUrl.includes('//') ?
		url.parse(ReqUrl) : url.parse('//' + ReqUrl, false, true);

	const Connection = net.connect(Result.port || 443, Result.hostname, () => {
		// tell the client that the connection is established
		socket.write('HTTP/' + request.httpVersion + ' 200 OK\r\n\r\n', 'UTF-8', () => {
			//error handling
			Connection.on('error', (err) => {
				console.log('Error' + err.message);
			});
			// creating pipes in both ends
			Connection.pipe(socket);
			socket.pipe(Connection);
		});
		//error handling
		socket.on('error', (err) => {
			console.log('Error' + err.message);
		});
	});
});
server.listen(5001);