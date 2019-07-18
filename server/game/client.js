const globals = require('./globals');
const globalsClients = require('./globalsClients');
const Character = require('./character');
const xss = require("xss");
const xss_options = {whiteList : {}}; // Filter all tags, no exceptions.

const client_commands = require('./client_commands');

class Client
{
	constructor(sock, io, gameTime)
	{
		// A socket we have created for this Client.
		this._socket = sock;
		this._id = sock.id;
		// Placeholder until authentication system.
		this._username = globalsClients.posUsernames[Math.floor(Math.random() * globalsClients.posUsernames.length)];

		// A mob this Client is controlling currently.
		this._character = null;
		// List of keys that are currently down.
		this._keysDown = {};

		this.minNextMessageDelay = 1000; // A delay of 1 second.
		this.nextMessageDelay = this.minNextMessageDelay; // Increased if Client is spamming. At first is a 1 second delay.
		this.nextMessage = Date.now() + this.nextMessageDelay;

		this.nextMoveDelay = 200;
		this.nextMoveAttempt = Date.now() + this.nextMoveDelay;

		// Helps us know what's permitted and what's not.
		this._permissions = globalsClients.permissions.basic;
		this.gameTime = gameTime;

		let cl = this;

		sock.on('keyDown', function(keyEvent) {
			if(typeof keyEvent !== "string") // || keyEvent instanceof String is not required, since we are never sending a String object.
			{
				// Highly concerning, client was trying to do something invalid.
				return;
			}

			keyEvent = JSON.parse(keyEvent);

			if(!Number.isInteger(keyEvent.keyCode))
			{
				// Highly concerning, client is trying to trick us. Perhaps should get punished?
				return;
			}

			cl._keysDown[keyEvent.keyCode] = true;
			cl.onKeyDown(keyEvent);
		});

		sock.on('keyUp', function(keyEvent) {
			if(typeof keyEvent !== "string")
			{
				// Highly concerning, client was trying to do something invalid.
				return;
			}

			keyEvent = JSON.parse(keyEvent);

			if(!Number.isInteger(keyEvent.keyCode))
			{
				// Highly concerning, client is trying to trick us. Perhaps should get punished?
				return
			}

			cl._keysDown[keyEvent.keyCode] = false;
			cl.onKeyUp(keyEvent);
		});

		sock.on('setViewport', function(width, height)
		{
			cl._character.viewport.screen = [width, height];
			cl.updateViewport();
			cl.updateWorld();
			sock.emit('confirmSetViewport');
		});

		sock.on('message', (text) => {
			if(cl.nextMessage >= Date.now())
			{
				sock.emit('message', "You must wait between messages. (" + Math.round((cl.nextMessage - Date.now()) * 0.001) + "s).");
				cl.nextMessageDelay *= 2;

				if(cl.nextMessageDelay > cl.minNextMessageDelay * 64)
				{
					// This client is behaving badly.
					sock.emit('message', "You are kicked for chat abuse.");
					var address = cl._socket.request.connection.remoteAddress;
					console.log('Kicked  user(' + globalsClients.connections + '/' + globalsClients.maxConnections + ')' + ' on: ' + address + '. Reason: Chat abuse');
					sock.disconnect();
				}
				return;
			}
			if(text === "")
			{
				sock.emit('message', "The message was empty.");
				cl.nextMessageDelay *= 2;

				if(cl.nextMessageDelay > cl.minNextMessageDelay * 64)
				{
					// This client is behaving badly.
					sock.emit('message', "You are kicked for chat abuse.");
					var address = cl._socket.request.connection.remoteAddress;
					console.log('Kicked  user(' + globalsClients.connections + '/' + globalsClients.maxConnections + ')' + ' on: ' + address + '. Reason: Chat abuse');
					sock.disconnect();
				}
				return;
			}
			if(text.length > 256)
			{
				sock.emit('message', "The message was too long, and will be truncated.");
				cl.nextMessageDelay *= 2;
				text = text.substring(0, 256);

				if(cl.nextMessageDelay > cl.minNextMessageDelay * 64)
				{
					// This client is behaving badly.
					sock.emit('message', "You are kicked for chat abuse.");
					var address = cl._socket.request.connection.remoteAddress;
					console.log('Kicked  user(' + globalsClients.connections + '/' + globalsClients.maxConnections + ')' + ' on: ' + address + '. Reason: Chat abuse');
					sock.disconnect();
					return;
				}
			}

			if(cl.nextMessageDelay > cl.minNextMessageDelay)
			{
				cl.nextMessageDelay = Math.max(cl.nextMessageDelay * 0.5, cl.minNextMessageDelay);
			}
			cl.nextMessage = Date.now() + cl.nextMessageDelay;

			if(text.charAt(0) == '/')
			{
				text = text.substr(1);

				var args = text.split(" ");
				var command = args[0];

				if(client_commands[command] && typeof client_commands[command].f == "function")
				{
					if(cl._permissions & client_commands[command].permissions_required)
					{
						client_commands[command].f(cl, args);
					}
					else
					{
						cl._socket.emit("message", "<font color='red'>Not enough permissions.</font>")
					}
				};
			}
			else
			{
				io.emit('message', "<b>" + cl._username + "</b>" + ": " + xss(text, xss_options));
				// io.emit('message', "<b>" + cl._username + "</b>" + ": " + text);
			}
		});

		sock.on('disconnect', function()
		{
			cl.onDisconnect();
		});

		this.onConnect();
	}

	get character()
	{
		return this._character;
	}

	set character(char)
	{
		if(this._character)
		{
			this._character.onLogout();
		}
		this._character = char;
		char.onLogin(this);
	}

	onConnect()
	{
		globalsClients.connections += 1;

		var address = this._socket.request.connection.remoteAddress;
  		console.log('A new user(' + this._username + ') has connected(' + globalsClients.connections + '/' + globalsClients.maxConnections + ')' + ' on: ' + address);

  		globalsClients.allClients.push(this);

  		/*
  		if(globalsClients.clientsByIP[address])
  		{
  			globalsClients.clientsByIP[address].push(this);
  		}
  		else
  		{
  			globalsClients.clientsByIP[address] = [this];
  		}
  		*/

  		var T = globals.tileMap.turfMap[globals.xy2coords(3, 3)];
  		this.character = new Character(T);

  		for(var i = 0; i < globalsClients.allClients.length; i++)
		{ 
			var client = globalsClients.allClients[i];
			if(client === this)
			{
				continue;
			}
   			client.updateWorld();
		}
	}

	onDisconnect()
	{
		for(var i = 0; i < globalsClients.allClients.length; i++)
		{ 
   			if(globalsClients.allClients[i] === this)
   			{
     			globalsClients.allClients.splice(i, 1); 
   			}
		}

		if(this.character)
		{
			this.character.destroy();
		}

		/*
		var address = this._socket.request.connection.remoteAddress;
		for(var i = 0; i < globalsClients.clientsByIP[address].length; i++)
		{
			if(globalsClients.clientsByIP[address][i] === this)
			{
				globalsClients.clientsByIP[address].splice(i, 1);
			}
		}
		*/

		for(var i = 0; i < globalsClients.allClients.length; i++)
		{ 
   			globalsClients.allClients[i].updateWorld();
		}

		globalsClients.connections -= 1;
		console.log('A user(' + this._username + ') has disconnected(' + globalsClients.connections + '/' + globalsClients.maxConnections + ')');
	}

	onKeyDown(keyEvent)
	{
	}

	onKeyUp(e)
	{
	}

	processMovement(gameTime)
	{
		var retVal = false;
		if(this._character)
		{
			retVal = this.character.processMovement(gameTime);
			if(!retVal && this.character.tileFrom[0] === this.character.tileTo[0] && this.character.tileFrom[1] === this.character.tileTo[1])
			{
				if(this.nextMoveAttempt < Date.now())
				{
					if(this._keysDown[38] && this._character.canMoveUp(gameTime))
					{
						this.character.moveUp(gameTime);
						this.nextMoveAttempt = Date.now() + this.nextMoveDelay;
						retVal = true;
					}
					else if(this._keysDown[40] && this._character.canMoveDown(gameTime))
					{
						this.character.moveDown(gameTime);
						this.nextMoveAttempt = Date.now() + this.nextMoveDelay;
						retVal = true;
					}
					else if(this._keysDown[37] && this._character.canMoveLeft(gameTime))
					{
						this.character.moveLeft(gameTime);
						this.nextMoveAttempt = Date.now() + this.nextMoveDelay;
						retVal = true;
					}
					else if(this._keysDown[39] && this._character.canMoveRight(gameTime))
					{
						this.character.moveRight(gameTime);
						this.nextMoveAttempt = Date.now() + this.nextMoveDelay;
						retVal = true;
					}
				}
				/*
				if(this._keysDown[80] && this._character)
				{
					console.log("P PRESSED")
					for(var x = this.character.tileFrom[0] - 1; x < this.character.tileFrom[0] + 1; x++)
					{
						for(var y = this.character.tileFrom[1] - 1; y < this.character.tileFrom[1] + 1; y++)
						{
							var T = globals.tileMap.turfMap[globals.xy2coords(x, y)];
							for(var i = 0; i < T.contents.length; i++)
							{
								var O = T.contents[i];
								if(O != this && !O.anchored)
								{
									console.log("GOTCHA")
									this.character.pulling_movable = O;
								}
							}
						}
					}
					if(this._character.pickUp())
					{
						this.updateInventory(gameTime);
					}
					retVal = true;
				}
				*/
			}
		}
		return retVal;
	}

	updateViewport()
	{
		if(this.character)
		{
			this.character.viewport.update(this.character.position[0] + (this.character.dimensions[0] / 2),
				                            this.character.position[1] + (this.character.dimensions[1] / 2));
		}
	}

	updateWorld()
	{
		var gameTime = this.gameTime;

		if(this.character)
		{
			var spritePackage = {};

			spritePackage.x = this.character.position[0];
			spritePackage.y = this.character.position[1];

			if(this.character.tileFrom[0] !== this.character.tileTo[0] || this.character.tileFrom[1] !== this.character.tileTo[1])
			{
				var T = globals.coords2turf(this.character.tileFrom[0], this.character.tileFrom[1]);
				var new_T = globals.coords2turf(this.character.tileTo[0], this.character.tileTo[1]);

				spritePackage.toX = this.character.next_position[0];
				spritePackage.toY = this.character.next_position[1];

				spritePackage.d = this.character.getMoveDelay(T, new_T);
				spritePackage.t = this.character.timeMoved;
			}

			var playerRoofFrom = globals.tileMap.roofObjMap[globals.xy2coords(this.character.tileFrom[0], this.character.tileFrom[1])];
			var playerRoofTo = globals.tileMap.roofObjMap[globals.xy2coords(this.character.tileTo[0], this.character.tileTo[1])];

			var viewport = this.character.viewport;
			// var coordsList = this.character.filterInSight(viewport.getVisibleCoords(this.character.direction));
			var coordsList = this.character.filterInSight(viewport.getVisibleCoords(globals.directions.all));

			for(var i = 0; i < coordsList.length; i++)
			{
				var coords = coordsList[i];
				var x = coords[0];
				var y = coords[1];

				var T = globals.coords2turf(x, y);
				/*
				if(T == null)
				{
					console.log('Faulty tile at: ' + x + ", " + y);
					continue;
				}
				*/

				var thisRoofObj = globals.tileMap.roofObjMap[globals.xy2coords(x, y)];
				if(thisRoofObj && thisRoofObj !== playerRoofFrom && thisRoofObj !== playerRoofTo)
				{
					var thisRoof = globals.tileMap.roofMap[globals.xy2coords(x, y)];
					globals.add2package(spritePackage, thisRoof, thisRoof.genSpritePackage(gameTime));
				}
				else
				{
					globals.add2package(spritePackage, T, T.genSpritePackage(gameTime));

					for(var j = 0; j < T.contents.length; j++)
					{
						var O = T.contents[j];
						globals.add2package(spritePackage, O, O.genSpritePackage(gameTime));

					}
				}
			}

			this._socket.emit('updateWorld', JSON.stringify(spritePackage));
		}
	}

	updateInventory()
	{

	}
}

module.exports = Client;
