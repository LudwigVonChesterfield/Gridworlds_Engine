const globals = require('./globals');
const Sprite = require('./sprite');
const Obj = require('./object');

class Conveyor extends Obj
{
	varInit(data)
	{
		super.varInit(data);

		this.anchored = true;

		this.layer = globals.layers.CONVEYOR_LAYER;

		var SO = {};
		SO[globals.directions.down] = new Sprite([{x:240, y:0, w:40, h:40}, {x:240, y:40, w:40, h:40}, {x:240, y:80, w:40, h:40},
			                                    {x:240, y:120, w:40, h:40}, {x:240, y:160, w:40, h:40}, {x:240, y:200, w:40, h:40},
			                                    {x:240, y:240, w:40, h:40}]);
		SO[globals.directions.up] = new Sprite([{x:240, y:240, w:40, h:40}, {x:240, y:200, w:40, h:40}, {x:240, y:160, w:40, h:40},
			                                    {x:240, y:120, w:40, h:40}, {x:240, y:80, w:40, h:40}, {x:240, y:40, w:40, h:40},
			                                    {x:240, y:0, w:40, h:40}]);
		SO[globals.directions.right] = new Sprite([{x:280, y:0, w:40, h:40}, {x:280, y:40, w:40, h:40}, {x:280, y:80, w:40, h:40},
			                                    {x:280, y:120, w:40, h:40}, {x:280, y:160, w:40, h:40}, {x:280, y:200, w:40, h:40},
			                                    {x:280, y:240, w:40, h:40}]);
		SO[globals.directions.left] = new Sprite([{x:280, y:240, w:40, h:40}, {x:280, y:200, w:40, h:40}, {x:280, y:160, w:40, h:40},
			                                    {x:280, y:120, w:40, h:40}, {x:280, y:80, w:40, h:40}, {x:280, y:40, w:40, h:40},
			                                    {x:280, y:0, w:40, h:40}]);
		this.sprite = SO;
	}

	processMovableMovement(AM, t)
	{
		if(AM.canMoveDirection(this.direction, t))
		{
			AM.moveDirection(this.direction, t);
			return true;
		}
		return false;
	}
}

module.exports = Conveyor;
