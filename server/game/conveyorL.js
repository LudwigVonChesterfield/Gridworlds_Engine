const globals = require('./globals');
const Sprite = require('./sprite');
const Conveyor = require('./conveyor');

class ConveyorL extends Conveyor
{
	varInit(data)
	{
		super.varInit(data);

		this.direction = globals.directions.left;
	}
}

module.exports = ConveyorL;
