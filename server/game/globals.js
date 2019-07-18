const Sprite = require('./sprite')

const _tileW = 40;
const _tileH = 40;
const _mapW = 20;
const _mapH = 20;

const collisionNone = 0;
const collisionSolid = 1;

const floorSolid = 0;
const floorPath = 1;
const floorWater = 2;
const floorIce = 3;
const floorConveyorU = 4;
const floorConveyorD = 5;
const floorConveyorL = 6;
const floorConveyorR = 7;
const floorGrass = 8;

var globals =
{
	last_uid_number : 0,

	allMovables : [],

	tileW : _tileW,
	tileH : _tileH,
	mapW : _mapW,
	mapH : _mapH,

	planes : 
	{
		TURF_PLANE : 0,
		OBJECT_PLANE : 1,
		MOB_PLANE : 2,
		ROOF_PLANE : 3,
		AREA_PLANE : 4
	},

	layers :
	{
		CONVEYOR_LAYER : 0,
		CUBE_LAYER : 1
	},

	wall_directions :
	{
		// U - up, R - right, D - down, L - left, we write down where we have a neighbor.
		none : 0,
		U : 1,
		R : 2,
		D : 4,
		L : 8,
		UR : 3,
		UD : 5,
		UL : 9,
		URD : 7,
		ULR : 11, // Messed the order here since URL is a keyword.
		UDL : 13,
		RD : 6,
		RL : 10,
		RDL : 14,
		DL : 12,
		URDL : 15
	},

	directions :
	{
		none    : 0,
		up		: 1,
		right	: 2,
		down	: 4,
		left	: 8,
		up_right : 3,
		up_left : 9,
		down_right : 6,
		down_left : 12,
		all : 15
	},

	collisionMasks :
	{
		none		: 0,
		solid		: 1
	},

	gameSpeeds :
	[
		{name:"Normal", mult:1},
		{name:"Slow", mult:0.3},
		{name:"Fast", mult:3},
		{name:"Paused", mult:0}
	],

	turfMap :
	{
	},

	roofMap :
	{
	},

	areaMap :
	{
	},

	removeElementFromList : function(list, element)
	{
		for(var i = 0; i < list.length; i++)
		{ 
   			if(list[i] === elemnt)
   			{
     			list.splice(i, 1); 
   			}
		}
	},

	removeElementsFromList : function(list, elements)
	{
		for(var i = 0; i < elements.length; i++)
		{
			var el = elements[i];
			for(var j = 0; j < list.length; j++)
			{
				if(list[i] === el)
				{
					console.log("Removing " + el);
					list.splice(i, 1);
				}
			}
		}
	},

	xy2coords : function(x, y)
	{
		return "(" + x + ":" + y + ")";
	},

	coords2xy : function(coords)
	{
		let retVal = coords.split(":");
		retVal[0] = Number.toInteger(retVal[0].substring(1, retVal[0].length));
		retVal[1] = Number.toInteger(retVal[1].substring(0, retVal[1].length - 1));
		return retVal;
	},

	add2package : function(package, A, sprite)
	{
		if(package[A.plane])
		{
			if(package[A.plane][A.layer])
			{
				package[A.plane][A.layer].push(sprite);
			}
			else
			{
				package[A.plane][A.layer] = [sprite];
			}
		}
		else
		{
			package[A.plane] = {};
			package[A.plane][A.layer] = [sprite];
		}
	},

	getCoordsOnLine : function(x0, y0, x1, y1, ignoreFirst)
	{
		var coordsList = [];
		// console.log("INPUT: " + x0 + ", " + y0 + "; " + x1 + ", " + y1);

		var deltaX = Math.abs(x1 - x0);
		var signX = (x0 < x1) ? 1 : -1;
		var deltaY = Math.abs(y1 - y0);
		var signY = (y0 < y1) ? 1 : -1;

		var error = deltaX - deltaY;

		var x = x0;
		var y = y0;

		if(!ignoreFirst)
		{
			coordsList.push([x, y]);
		}

		while(true)
		{
			if(x === x1 && y === y1)
			{
				return coordsList;
			}
			var error2 = 2 * error;
			if(error2 > -deltaY)
			{
				error -= deltaY;
				x += signX;
			}
			if(error2 < deltaX)
			{
				error += deltaX;
				y += signY;
			}

			coordsList.push([x, y]);
		}
	}
}

globals.getOppositeDir = function(d)
{
	switch(d)
	{
		case globals.directions.up:
			return globals.directions.down;
		case globals.directions.down:
			return globals.directions.up;
		case globals.directions.left:
			return globals.directions.right;
		default:
			return globals.directions.left;
	}
}

globals.coords2turf = function(x, y)
{
	return globals.tileMap.turfMap[globals.xy2coords(x, y)];
}

module.exports = globals;