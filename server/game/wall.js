const globals = require('./globals');
const Sprite = require('./sprite');
const Turf = require('./turf');

class Wall extends Turf
{
	varInit(data)
	{
		super.varInit(data);

		this.direction = globals.wall_directions.none;

		this.density = true;
		this.opacity = true;

		this.collisionMask = globals.collisionMasks.solid;
	}

	onMapLoad()
	{
		var TU = globals.tileMap.turfMap[globals.xy2coords(this.x, this.y - 1)];
		if(TU && TU.density)
		{
			TU.updateSprite();
		}
		var TR = globals.tileMap.turfMap[globals.xy2coords(this.x + 1, this.y)];
		if(TR && TR.density)
		{
			TR.updateSprite();
		}
		var TD = globals.tileMap.turfMap[globals.xy2coords(this.x, this.y + 1)];
		if(TD && TD.density)
		{
			TD.updateSprite();
		}
		var TL = globals.tileMap.turfMap[globals.xy2coords(this.x - 1, this.y)];
		if(TL && TL.density)
		{
			TL.updateSprite();
		}
		this.updateSprite();
	}

	updateSprite()
	{
		var TU = globals.tileMap.turfMap[globals.xy2coords(this.x, this.y - 1)];
		if(TU && TU.density)
		{
			this.direction = this.direction | globals.wall_directions.U;
		}
		var TR = globals.tileMap.turfMap[globals.xy2coords(this.x + 1, this.y)];
		if(TR && TR.density)
		{
			this.direction = this.direction | globals.wall_directions.R;
		}
		var TD = globals.tileMap.turfMap[globals.xy2coords(this.x, this.y + 1)];
		if(TD && TD.density)
		{
			this.direction = this.direction | globals.wall_directions.D;
		}
		var TL = globals.tileMap.turfMap[globals.xy2coords(this.x - 1, this.y)];
		if(TL && TL.density)
		{
			this.direction = this.direction | globals.wall_directions.L;
		}
	}
}

module.exports = Wall;
