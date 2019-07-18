const globalsClients = require('./game/globalsClients');
const globalsServer = require('./utility/globalsServer');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');



const app = express();

const clientPath = __dirname + '/../client';
console.log('Serving static from ' + clientPath);

app.use(express.static(clientPath));



const server = http.createServer(app);

server.on('error', (err) => {
	console.error('Server error: ', err);
});

server.listen(globalsServer.port, () => {
	console.log("RPS started on " + globalsServer.port);
});



const Game = require('./game/game');

var game = new Game();

/*
Length of a tick in milliseconds. The denominator is your desired framerate.
e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
*/
var tickLengthMs = 1000 / 20

/*
gameLoop related variables
*/
// timestamp of each loop
var previousTick = Date.now()
// number of times gameLoop gets called
var actualTicks = 0

var gameLoop = function()
{
	var now = Date.now()

	actualTicks++
	if(previousTick + tickLengthMs <= now)
	{
		var delta = (now - previousTick) / 1000
		previousTick = now

		game.process(delta)

		// console.log('delta', delta, '(target: ' + tickLengthMs +' ms)', 'node ticks', actualTicks)
		actualTicks = 0
	}

	if(Date.now() - previousTick < tickLengthMs - 16)
	{
		setTimeout(gameLoop)
	}
	else
	{
		setImmediate(gameLoop)
	}
}

gameLoop();



const io = socketio(server);
const Client = require("./game/client");

io.on('connection', (sock) => {
	if(globalsClients.connections >= globalsClients.maxConnections)
	{
		sock.emit('message', "Server is overloaded with connections(" + globalsClients.connections + "/" + globalsClients.maxConnections + "), you have been disconnected.");
		var address = sock.request.connection.remoteAddress;
		console.log('Denied connection to user(' + globalsClients.connections + '/' + globalsClients.maxConnections + ')' + ' on: ' + address + ". Reason: Server overcrowded");
		sock.disconnect();
	}
	else
	{
		let sockClient = new Client(sock, io, game.gameTime);
	}
});



const readline = require('readline');
const commands = require('./utility/commands');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
	var args = input.split(" ");
	var command = args[0];

	if(commands[command] && typeof commands[command].f == "function")
	{
		commands[command].f(args);
	};
});
