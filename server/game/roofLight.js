const globals = require('./globals');
const Sprite = require('./sprite');
const Roof = require('./roof');

class RoofLight extends Roof
{
	varInit(data)
	{
		super.varInit(data);

		var SO = {};
		SO[globals.directions.up] = new Sprite([{x:40,y:120,w:40,h:40}]);
		this.sprite = SO;
	}
}

module.exports = RoofLight;
