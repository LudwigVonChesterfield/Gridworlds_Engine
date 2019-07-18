const globals = require('./globals');
const Atom = require('./atom');

class Roof extends Atom
{
	varInit(data)
	{
		this.x = 0;
		this.y = 0;

		this.plane = globals.planes.ROOF_PLANE;
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
		return globals.tileMap.turfMap[globals.xy2coords(this.x, this.y)];
	}

	getRoof()
	{
		return this;
	}

	forcePlaceAt(x, y)
	{
		if(globals.tileMap.roofMap[globals.xy2coords(x, y)])
		{
			globals.tileMap.roofMap[globals.xy2coords(x, y)].destroy();
		}
		this.x = x;
		this.y = y;

		globals.tileMap.roofMap[globals.xy2coords(x, y)] = this;
	}

	onDestroy()
	{
		globals.tileMap.roofMap[globals.xy2coords(this.x, this.y)] = null;

		for(content in this.contents)
		{
			content.loc = null;
		}
	}

	getMapData(options={})
	{
		var data = super.getMapData(options);

		data["x"] = this.x;
		data["y"] = this.y;

		return data;
	}

	setMapData(data)
	{
		this.x = data["x"];
		this.y = data["y"];

		super.setMapData(data);
	}
}

module.exports = Roof;
