const globals = require('./globals');
const Atom = require('./atom');

class Area extends Atom
{
	varInit(data)
	{
		this.x = 0;
		this.y = 0;

		this.plane = globals.planes.AREA_PLANE;
	}

	onCreate(loc, data)
	{
		this.forcePlaceAt(data.x, data.y);
	}

	getArea()
	{
		return this;
	}

	forcePlaceAt(x, y)
	{
		this.x = x;
		this.y = y;

		globals.tileMap.areaMap[globals.xy2coords(x, y)] = this;
	}

	onDestroy()
	{
		globals.tileMap.areaMap[globals.xy2coords(this.x, this.y)] = new globals.tileMap.defaultArea(null, {x: this.x, y: this.y});
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

module.exports = Area;
