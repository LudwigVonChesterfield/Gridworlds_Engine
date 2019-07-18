const globals = require('./globals');
const Sprite = require('./sprite');
const Turf = require('./turf');

class Grass extends Turf
{
	varInit(data)
	{
		super.varInit(data);

		this.delayMove = 400;

		var SO = {};
		SO[globals.directions.up] = new Sprite([{x:40, y:0, w:40, h:40}]);
		this.sprite = SO;
	}
}

module.exports = Grass;
