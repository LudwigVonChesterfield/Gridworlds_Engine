function Sprite(data)
{
	this.animated	= data.length > 1;
	this.frameCount	= data.length;
	this.duration	= 0;
	this.loop		= true;
	
	if(data.length > 1)
	{
		for(var i in data)
		{
			if(typeof data[i].d == 'undefined')
			{
				data[i].d = 100;
			}
			this.duration += data[i].d;
			
			if(typeof data[i].loop != 'undefined')
			{
				this.loop = data[i].loop ? true : false;
			}
		}
	}
	
	this.frames		= data;
}
Sprite.prototype.genSpritePackage = function(x, y, toX, toY, t, d)
{
	/*
	toX, toY, dimX, dimY are related to movables, where
	toX, toY is where the movable is moving to.
	t is the timeMoved of movable(when it started moving).
	We don't need to send them all over the bottleneck(socket) if object is static.
	d is moveDelay, see above.
	*/
	var frameIdx = 0;
	var spritePackage = {};
	spritePackage.animated = this.animated;
	spritePackage.frameCount = this.frameCount;
	spritePackage.duration = this.duration;
	spritePackage.loop = this.loop;
	spritePackage.frames = this.frames;

	spritePackage.x = x;
	spritePackage.y = y;

	if(toX != null && x !== toX)
	{
		spritePackage.toX = toX;
		spritePackage.t = t;
		spritePackage.d = d;
	}
	if(toY != null && y !== toY)
	{
		spritePackage.toY = toY;
		spritePackage.t = t;
		spritePackage.d = d;
	}

	return spritePackage;
};

module.exports = Sprite;