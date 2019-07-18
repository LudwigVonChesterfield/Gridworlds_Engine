const globals = require('./globals');
const Movable = require('./movable');

class Obj extends Movable
{
	varInit(data)
	{
		super.varInit(data);

		this.plane = globals.planes.OBJECT_PLANE;
	}
}

module.exports = Obj;
