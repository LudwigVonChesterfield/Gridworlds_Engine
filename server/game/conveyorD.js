const globals = require('./globals');
const Sprite = require('./sprite');
const Conveyor = require('./conveyor');

class ConveyorD extends Conveyor
{
	varInit(data)
	{
		super.varInit(data);

		this.direction = globals.directions.down;
	}
}

module.exports = ConveyorD;
