const globals = require('./globals');
const globalsServer = require('../utility/globalsServer');
const lookup = require('./lookup');

class TileMap
{
	constructor(w, h)
	{
		this.toLoad = [];

		this.w = w;
		this.h = h;

		this.turfMap = {};
		this.areaMap = {};
		this.roofMap = {};
		this.roofObjMap = {};

		this.defaultTurf = lookup.defaultTurf; // TO DO: Save these with the tileMap ?
		this.defaultArea = lookup.defaulArea;

		for(var y = 0; y < h; y++)
		{
			for(var x = 0; x < w; x++)
			{
				this.turfMap[globals.xy2coords(x, y)] = null;
				this.areaMap[globals.xy2coords(x, y)] = null
				this.roofMap[globals.xy2coords(x, y)] = null;
				this.roofObjMap[globals.xy2coords(x, y)] = null;
			}
		}
	}

	buildMapFromFileName(fileName)
	{
		for(var y = 0; y < this.h; y++)
		{
			for(var x = 0; x < this.w; x++)
			{
				this.turfMap[globals.xy2coords(x, y)] = new this.defaultTurf(null, {x: x, y: y}); // No check here, since defaultTurf must be not null.

				if(lookup.defaultArea)
				{
					this.areaMap[globals.xy2coords(x, y)] = new this.defaultArea(null, {x: x, y: y});
				}
			}
		}

		globalsServer.file2map(fileName, globalsServer.default_map_filePath);

		return true;
	}

	addRoofs(roofs)
	{
		for(var i in roofs)
		{
			var r = roofs[i];
			
			if(r.x < 0 || r.y < 0 || r.x >= this.w || r.y >= this.h || (r.x + r.w) > this.w || (r.y + r.h) > this.h || r.data.length !== (r.w * r.h))
			{
				continue;
			}
			
			for(var y = 0; y < r.h; y++)
			{
				for(var x = 0; x < r.w; x++)
				{
					this.roofObjMap[globals.xy2coords(r.x + x, r.y + y)] = r;
					new (globals.roofTypes[r.data[((y * r.w) + x)]])(null, {x: r.x + x, y: r.y + y});
				}
			}
		}
	}

	process()
	{
		/*
		Return true if something was processed, and so client need to update the picture.
		*/
		var retVal = false;

		for(var i = 0; i < this.toLoad.length; i++)
		{
			var A = this.toLoad[i];
			if(A.deleting)
			{
				this.toLoad.splice(i, 1);
				i -= 1;
				continue;
			}

			A.onMapLoad();
			this.toLoad.splice(i, 1);
			i -= 1;
			retVal = true;
			continue;
		}

		return retVal;
	}

	getMapData(options={})
	{
		var data = {};
		data["turfMap"] = {};
		data["areaMap"] = {};
		data["roofMap"] = {};
		data["roofObjMap"] = {};

		var coords = Object.keys(this.turfMap);
		for(var i = 0; i < coords.length; i++)
		{
			var coord = coords[i];
			if(this.turfMap[coord])
			{
				data["turfMap"][coord] = this.turfMap[coord].getMapData(options);
			}

			if(this.areaMap[coord])
			{
				data["areaMap"][coord] = this.areaMap[coord].getMapData(options);
			}
			else
			{
				data["areaMap"][coord] = null;
			}
			if(this.roofMap[coord])
			{
				data["roofMap"][coord] = this.roofMap[coord].getMapData(options);
			}
			else
			{
				data["roofMap"][coord] = null;
			}
			if(this.roofObjMap[coord])
			{
				data["roofObjMap"][coord] = this.roofObjMap[coord].getMapData(options);
			}
			else
			{
				data["roofObjMap"][coord] = null;
			}
		}

		return data;
	}

	loadMapData(data)
	{
		var coords = Object.keys(this.turfMap);
		for(var i = 0; i < coords.length; i++)
		{
			var coord = coords[i];

			this.turfMap[coord] = new lookup[data["turfMap"][coord]["type"]](this, data["turfMap"][coord]);

			if(data["areaMap"][coord])
			{
				this.areaMap[coord] = new lookup[data["areaMap"][coord]["type"]](this, data["areaMap"][coord]);
			}
			if(data["roofMap"][coord])
			{
				this.roofMap[coord] = new lookup[data["roofMap"][coord]["type"]](this, data["roofMap"][coord]);
			}
			if(data["roofObjMap"][coord])
			{
				this.roofObjMap[coord] = new lookup[data["roofObjMap"][coord]["type"]](this, data["roofObjMap"][coord]);
			}
		}
	}
}

module.exports = TileMap;
