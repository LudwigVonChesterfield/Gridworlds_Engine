const globals = require('./globals');
const Sprite = require('./sprite');
const Wall = require('./wall');

class WallGrey extends Wall
{
	varInit(data)
	{
		super.varInit(data);

		this.density = true;
		this.opacity = true;

		this.collisionMask = globals.collisionMasks.solid;

		var SO = {};
		SO[globals.wall_directions.none] = new Sprite([{x:80, y:40, w:40, h:40}]);
		SO[globals.wall_directions.U] = new Sprite([{x:40, y:200, w:40, h:40}]);
		SO[globals.wall_directions.R] = new Sprite([{x:0, y:280, w:40, h:40}]);
		SO[globals.wall_directions.D] = new Sprite([{x:40, y:120, w:40, h:40}]);
		SO[globals.wall_directions.L] = new Sprite([{x:80, y:280, w:40, h:40}]);
		SO[globals.wall_directions.UR] = new Sprite([{x:120, y:80, w:40, h:40}]);
		SO[globals.wall_directions.UD] = new Sprite([{x:40, y:160, w:40, h:40}]);
		SO[globals.wall_directions.UL] = new Sprite([{x:200, y:200, w:40, h:40}]);
		SO[globals.wall_directions.URD] = new Sprite([{x:120, y:160, w:40, h:40}]);
		SO[globals.wall_directions.ULR] = new Sprite([{x:160, y:2000, w:40, h:40}]);
		SO[globals.wall_directions.UDL] = new Sprite([{x:200, y:160, w:40, h:40}]);
		SO[globals.wall_directions.RD] = new Sprite([{x:120, y:120, w:40, h:40}]);
		SO[globals.wall_directions.RL] = new Sprite([{x:40, y:280, w:40, h:40}]);
		SO[globals.wall_directions.RDL] = new Sprite([{x:160, y:120, w:40, h:40}]);
		SO[globals.wall_directions.DL] = new Sprite([{x:200, y:120, w:40, h:40}]);
		SO[globals.wall_directions.URDL] = new Sprite([{x:40, y:160, w:40, h:40}]);

		this.sprite = SO;
	}
}

module.exports = WallGrey;
