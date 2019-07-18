const globals = require('./globals');
const Sprite = require('./sprite');
const Obj = require('./object');

class Cube extends Obj
{
	varInit(data)
	{
		super.varInit(data);

		this.layer = globals.layers.CUBE_LAYER;

		this.density = true;

		this.collideMask = globals.collisionMasks.solid;
		this.collisionMask = globals.collisionMasks.solid;

		var SO = {};
		SO[globals.directions.up] = new Sprite([{x:320, y:40, w:40, h:40}]);
		this.sprite = SO;
	}
}

module.exports = Cube;
