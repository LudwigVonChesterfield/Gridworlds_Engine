const globals = require('./globals');
const Sprite = require('./sprite');
const Obj = require('./object');

class Conveyor_Borders extends Obj
{
	varInit(data)
	{
		super.varInit(data);

		this.anchored = true;

		var SO = {};
		SO[globals.directions.down] = new Sprite([{x:320, y:200, w:40, h:40}]);
		SO[globals.directions.up] = new Sprite([{x:320, y:200, w:40, h:40}]);
		SO[globals.directions.right] = new Sprite([{x:320, y:160, w:40, h:40}]);
		SO[globals.directions.left] = new Sprite([{x:320, y:160, w:40, h:40}]);
		this.sprite = SO;
	}
}

module.exports = Conveyor_Borders;
