const globals = require('./globals');
const Sprite = require('./sprite');
const Turf = require('./turf');

class Solid extends Turf
{
	varInit(data)
	{
		super.varInit(data);

		this.density = true;
		this.opacity = true;

		this.collisionMask = globals.collisionMasks.solid;

		var SO = {};
		SO[globals.directions.up] = new Sprite([{x:0, y:0, w:40, h:40}]);
		this.sprite = SO;
	}
}

module.exports = Solid;
