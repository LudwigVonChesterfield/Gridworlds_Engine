const globals = require('./globals');
const Sprite = require('./sprite');
const Turf = require('./turf');

class Path extends Turf
{
	varInit(data)
	{
		super.varInit(data);

		this.delayMove = 200;

		var SO = {};
		SO[globals.directions.up] = new Sprite([{x:80, y:0, w:40, h:40}]);
		this.sprite = SO;
	}
}

module.exports = Path;
