const globals = require('./globals');
const Sprite = require('./sprite');
const Mob = require('./mob');

class Character extends Mob
{
	varInit(data)
	{
		super.varInit(data);

		this.density = true;

		this.collideMask = globals.collisionMasks.solid;
		this.collisionMask = globals.collisionMasks.solid;

		var SO = {};
		SO[globals.directions.up]		= new Sprite([{x : 240, y : 280, w : 40, h : 40}]);
		SO[globals.directions.right]	= new Sprite([{x : 280, y : 280, w : 40, h : 40}]);
		SO[globals.directions.down]	    = new Sprite([{x : 240, y : 320, w : 40, h : 40}]);
		SO[globals.directions.left]	    = new Sprite([{x : 280, y : 320, w : 40, h : 40}]);
		this.sprite = SO;
	}

	forcePlaceAt(newLoc)
	{
		super.forcePlaceAt(newLoc);
	}

	onLogout()
	{
		super.onLogout();
		this.destroy();
	}
}

module.exports = Character;
