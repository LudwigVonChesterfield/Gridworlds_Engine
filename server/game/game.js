const globals = require('./globals');
const globalsClients = require('./globalsClients');
const globalsServer = require('../utility/globalsServer');

const TileWhite = require('./tileWhite');
const TileGrey = require('./tileGrey');
const TileBlack = require('./tileBlack');
const FloorWhite = require('./floorWhite');
const FloorGrey = require('./floorGrey');
const FloorBlack = require('./floorBlack');
const WallWhite = require('./wallWhite');
const WallGrey = require('./wallGrey');
const WallBlack = require('./wallBlack');
const ConveyorU = require('./conveyorU');
const ConveyorD = require('./conveyorD');
const ConveyorL = require('./conveyorL');
const ConveyorR = require('./conveyorR');

const RoofLight = require('./roofLight');
const RoofDark = require('./RoofDark')

const Cube = require('./cube');

const floorSolid = 0;
const floorPath = 1;
const floorWater = 2;
const floorIce = 3;
const floorConveyorU = 4;
const floorConveyorD = 5;
const floorConveyorL = 6;
const floorConveyorR = 7;
const floorGrass = 8;

const Sprite = require('./sprite');
const Viewport = require('./viewport');
const Client = require('./client');
const TileMap = require('./tileMap');

class Game
{
	constructor()
	{
		/*
		var roofList = [
			{ x:5, y:3, w:4, h:7, data: [
				0, 0, 1, 1,
				0, 0, 1, 1,
				0, 0, 1, 1,
				0, 0, 1, 1,
				0, 0, 1, 1,
				0, 0, 1, 1,
				0, 0, 1, 1
			]},
			{ x:15, y:5, w:5, h:4, data: [
				0, 0, 1, 1, 1,
				0, 0, 1, 1, 1,
				0, 0, 1, 1, 1,
				0, 0, 1, 1, 1
			]},
			{ x:14, y:9, w:6, h:7, data: [
				0, 0, 0, 1, 1, 1,
				0, 0, 0, 1, 1, 1,
				0, 0, 0, 1, 1, 1,
				0, 0, 0, 1, 1, 1,
				0, 0, 0, 1, 1, 1,
				0, 0, 0, 1, 1, 1,
				0, 0, 0, 1, 1, 1
			]}
		];
		*/
		var roofList = [];

		globals.tileTypes =
		{
			0 : FloorWhite,
			1 : FloorGrey,
			2 : FloorBlack,
			3 : TileWhite,
			4 : TileGrey,
			5 : TileBlack,
			6 : WallWhite,
			7 : WallGrey,
			8 : WallBlack,
		}

		globals.roofTypes =
		{
			0 : RoofLight,
			1 : RoofDark
		}

		globals.tileMap = new TileMap(globals.mapW, globals.mapH);

		this.currentSecond = 0;
		this.frameCount = 0;
		this.framesLastSecond = 0;
		this.lastFrameTime = 0;

		this.gameTime = 0;

		this.currentSpeed = 0;

		globals.tileMap.buildMapFromFileName(globalsServer.default_map_fileName);
		globals.tileMap.addRoofs(roofList);

		/*
		new Cube(globals.tileMap.turfMap[globals.xy2coords(5, 5)]);

		new ConveyorD(globals.coords2turf(1, 1));
		new ConveyorD(globals.coords2turf(1, 2));
		new ConveyorD(globals.coords2turf(1, 3));
		new ConveyorR(globals.coords2turf(1, 4));
		*/
	}

	process(delta)
	{
		var currentFrameTime = Date.now();
		var timeElapsed = currentFrameTime - this.lastFrameTime;
		this.gameTime += Math.floor(timeElapsed * globals.gameSpeeds[this.currentSpeed].mult);

		var sec = Math.floor(currentFrameTime / 1000);
		if(sec != this.currentSecond)
		{
			this.currentSecond = sec;
			this.framesLastSecond = this.frameCount;
			this.frameCount = 1;
		}
		else
		{
			this.frameCount++;
		}

		var updateAll = false;

		if(globals.gameSpeeds[this.currentSpeed].mult != 0)
		{
			if(globals.tileMap.process(this.gameTime))
			{
				updateAll = true;
			}

			for(var i = 0; i < globals.allMovables.length; i++)
			{
				let O = globals.allMovables[i];

				if(O.client)
				{
					if(O.client.processMovement(this.gameTime))
					{
						// processMovement returns true if player changed position, we need to immediatley send them new info to draw.
						O.client.updateViewport();
						updateAll = true;
					}
				}
				else
				{
					if(O.processMovement(this.gameTime))
					{
						// processMovement returns true if something changed position, we need to immediatley send everyone new info to draw.
						updateAll = true;
					}
				}
			}
		}

		/*
		// A piece of client code that can be used to determine FPS. If it is ever required.

		ctx.textAlign = "left";

		ctx.fillStyle = "#ff0000";
		ctx.fillText("FPS: " + framesLastSecond, 10, 20);
		ctx.fillText("Game speed: " + globals.gameSpeeds[currentSpeed].name, 10, 40);
		*/

		this.lastFrameTime = currentFrameTime;

		for(var i = 0; i < globalsClients.allClients.length; i++)
		{
			let client = globalsClients.allClients[i];

			client.gameTime = this.gameTime;
			if(updateAll)
			{
				client.updateWorld();
			}

			client._socket.emit('syncServerTime', this.gameTime);
		}
	}

	/*
	_sendToPlayer(playerIndex, msg)
	{
		this._players[playerIndex].emit('message', msg);
	}

	_sendToPlayers(msg)
	{
		this._players.forEach((player) => {
			player.emit('message', msg);
		});
	}
	*/
}



module.exports = Game;