const globals = require('./globals');
const Sprite = require('./sprite');
const Turf = require('./turf');

class Water extends Turf
{
	varInit(data)
	{
		super.varInit(data);

		this.density = true;
		this.opacity = false;

		this.collisionMask = globals.collisionMasks.solid;

		var SO = {};
		SO[globals.directions.up] = new Sprite([{x:160,y:0,w:40,h:40,d:200}, {x:200,y:0,w:40,h:40,d:200},
		                                        {x:160,y:40,w:40,h:40,d:200}, {x:200,y:40,w:40,h:40,d:200},
					                            {x:160,y:40,w:40,h:40,d:200}, {x:200,y:0,w:40,h:40,d:200}
									   		   ]);
		this.sprite = SO;
	}
}

module.exports = Water;
