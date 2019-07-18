const globals = require('./globals');
const Sprite = require('./sprite');
const Conveyor = require('./conveyor');

class ConveyorR extends Conveyor
{
	varInit(data)
	{
		super.varInit(data);

		this.direction = globals.directions.right;
	}
}

module.exports = ConveyorR;
