const globals = require('./globals');
const Sprite = require('./sprite');
const Conveyor = require('./conveyor');

class ConveyorU extends Conveyor
{
	varInit(data)
	{
		super.varInit(data);

		this.direction = globals.directions.up;
	}
}

module.exports = ConveyorU;
