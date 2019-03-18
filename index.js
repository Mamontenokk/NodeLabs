'use strict'; 

const http = require('http');
const net = require('net');
const url = require('url')


const server = http.createServer((request, response) =>{
	console.log(request.url);

	const ReqUrl = request.url;
	const Result = ReqUrl.includes('//') ?
		url.parse(ReqUrl) : url.parse('//' + ReqUrl, false, true);

	response.writeHead(200, {'Content-Type': 'text/html'});
	if(Result.protocol==='http:') {
		//response.addTrailers({'Dadadu': 'asdjasdj'})
		//response.setHeader('asdasd', 'qasdasdasd');
		http.get(request.url, (resp) =>{
		resp.pipe(response);
		}).on('error', (err)=>{
			console.log('Error' + err.message);
		});
	}

});


server.on('connect', (request, socket) =>{
	const ReqUrl = request.url;
	const Result = ReqUrl.includes('//') ?
		url.parse(ReqUrl) : url.parse('//' + ReqUrl, false, true);

	const Connection = net.connect(Result.port || 443, Result.hostname, () => {
		// tell the client that the connection is established
		socket.write('HTTP/' + request.httpVersion + ' 200 OK\r\n\r\n', 'UTF-8', () => {
			// creating pipes in both ends
			Connection.on('error', (err) => {
				console.log('Error' + err.message);
			});
			Connection.pipe(socket);
			socket.pipe(Connection);
		});
		socket.on('error', (err) => {
			console.log('Error' + err.message);
		});
	});
});
server.listen(5001);