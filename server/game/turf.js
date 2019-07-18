const globals = require('./globals');
const Atom = require('./atom');

class Turf extends Atom
{
	varInit(data)
	{
		this.x = 0;
		this.y = 0;

		this.plane = globals.planes.TURF_PLANE;

		this.delayMove = 0; // How much it takes for an Object to move through us.
	}

	onCreate(loc, data)
	{
		this.forcePlaceAt(data.x, data.y);
	}

	getArea()
	{
		return globals.tileMap.areaMap[globals.xy2coords(this.x, this.y)];
	}

	getTurf()
	{
		return this;
	}

	getRoof()
	{
		return globals.tileMap.roofMap[globals.xy2coords(this.x, this.y)];
	}

	forcePlaceAt(x, y)
	{
		var oldTurf = globals.coords2turf(x, y);

		this.x = x;
		this.y = y;

		globals.tileMap.turfMap[globals.xy2coords(x, y)] = this;

		/*
		First, we replaced them, then we delete them, so they pass contents onto us.
		*/
		if(oldTurf)
		{
			oldTurf.destroy();
		}
	}

	onDestroy()
	{
		var T = globals.coords2turf(this.x, this.y);
		if(T !== this)
		{
			/*
			Somebody carefully replaced us, move all our contents to them.
			*/
			if(!T) // Or we want to reset turf to default.
			{
				T = new globals.tileMap.defaultTurf(null, {x: this.x, y: this.y});
			}

			for(var i = this.contents.length - 1; i >= 0; i--)
			{
				var content = this.contents[i];
				content.forcePlaceAt(T);
			}

		}
		else
		{
			/*
			We were not carefully replaced, burn it all to hell!
			*/
			var newTurf = new globals.tileMap.defaultTurf(null, {x: this.x, y: this.y});

			for(var i = this.contents.length - 1; i >= 0; i--)
			{
				var content = this.contents[i];
				content.destroy();
			}
		}
	}

	onAddToVision(M)
	{
		/*
		Is called when mob M didn't see us, and now does.
		NB!: Is not called for tile the mob is standing on, ever.
		*/
	}

	/*
	NB!: Doesn't work atm.
	onRemoveFromVision(M)
	{
		/-
		Is called when mob M seen us before, but now doesn't.
		NB!: Is not called for tile the mob is standing on, ever.
		-/
		console.log("Removed: " + globals.xy2coords(this.x, this.y))
	}
	*/

	getMapData(options={})
	{
		var data = super.getMapData(options);

		data["x"] = this.x;
		data["y"] = this.y;

		data["delayMove"] = this.delayMove;

		return data;
	}

	setMapData(data)
	{
		this.x = data["x"];
		this.y = data["y"];

		this.delayMove = data["delayMove"];

		super.setMapData(data);
	}
}

module.exports = Turf;
