const globals = require('./globals');
const Movable = require('./movable');
const Viewport = require('./viewport');

class Mob extends Movable
{
	varInit(data)
	{
		super.varInit(data);

		this.plane = globals.planes.MOB_PLANE;

		this.vision_previous_tick = {}; // An array that contains coords which were in our vision previous tick.
		this.vision_current_tick = {}; // These array contain elements such as "(x:y)" = true.

		this._client = null;
		this.viewport = new Viewport();
	}

	get client()
	{
		return this._client;
	}

	set client(newClient)
	{
		this._client = newClient;
	}

	onLogin(client)
	{
		this.client = client;
	}

	onLogout()
	{
		this.client = null;
	}

	onDestroy()
	{
		if(this.client)
		{
			this.client._character = null;
			this.onLogout();
		}

		super.onDestroy();
	}

	filterInSight(coordsList)
	{
		var toReturn = [];

		this.vision_previous_tick = {};
		for(var attribute in this.vision_current_tick)
		{
			this.vision_previous_tick[attribute] = true;
		}
		this.vision_current_tick = {};

		var alreadyRemoved = {}; // So we don't remove more than once.
		var alreadyOpaque = {}; // We already know these obstruct view, don't check them twice.
		var alreadyNotOpaque = {}; // We already checked them, don't check twice.

		// We always see the turf under us, so there's no need to check. Ever.
		toReturn.push([this.tileFrom[0], this.tileFrom[1]]);
		for(var i = 0; i < coordsList.length; i++)
		{
			var el = coordsList[i];
			if(this.tileFrom[0] === el[0] && this.tileFrom[1] === el[1])
			{
				coordsList.splice(i, 1);
				break;
			}
		}
		this.vision_current_tick[globals.xy2coords(this.tileFrom[0], this.tileFrom[1])] = true;
		if(typeof this.vision_previous_tick[globals.xy2coords(this.tileFrom[0], this.tileFrom[1])] === "undefined")
		{
			globals.coords2turf(this.tileFrom[0], this.tileFrom[1]).onAddToVision(this);
		}

		search_while_loop:
			while(true)
			{
				if(coordsList.length === 0)
				{
					return toReturn;
				}
				var coord = coordsList[coordsList.length - 1];
				var line_of_sight = true;

				var lineCoords = globals.getCoordsOnLine(this.tileFrom[0], this.tileFrom[1], coord[0], coord[1], true); // The true means we don't get the first turf(the one under us.)
				lineCoords_loop:
					for(var i = 0; i < lineCoords.length; i++)
					{	
						if(!line_of_sight)
						{
							/*
							if(this.vision_previous_tick[globals.xy2coords(x, y)])
							{
								globals.coords2turf(x, y).onRemoveFromVision(this);
							}
							*/
							break lineCoords_loop;
						}

						var lineCoord = lineCoords[i];
						var x = lineCoord[0];
						var y = lineCoord[1];

						if(alreadyNotOpaque[globals.xy2coords(x, y)])
						{
							continue lineCoords_loop;
						}
						if(alreadyOpaque[globals.xy2coords(x, y)])
						{
							break lineCoords_loop;
						}

						toReturn.push([x, y]);

						this.vision_current_tick[globals.xy2coords(x, y)] = true;
						if(typeof this.vision_previous_tick[globals.xy2coords(x, y)] == "undefined")
						{
							globals.coords2turf(x, y).onAddToVision(this);
						}

						var T = globals.coords2turf(x, y);
						if(T.isOpaque())
						{
							line_of_sight = false;
						}
						else
						{
							lineCoords_contents_loop:
								for(var j = 0; j < T.contents.length; j++)
								{
									var O = T.contents[j];
									if(O.isOpaque())
									{
										line_of_sight = false;
										break lineCoords_contents_loop;
									}
								}
						}
						if(line_of_sight)
						{
							alreadyNotOpaque[globals.xy2coords(x, y)] = true;
						}
						else
						{
							alreadyOpaque[globals.xy2coords(x, y)] = true;
						}
					}

				removal_list_loop:
					for(var i = 0; i < lineCoords.length; i++)
					{
						var el = lineCoords[i];
						if(alreadyRemoved[globals.xy2coords(el[0], el[1])])
						{
							continue removal_list_loop;
						}
						removal_loop:
							for(var j = 0; j < coordsList.length; j++)
							{
								var c_el = coordsList[j];
								if(el[0] === c_el[0] && el[1] === c_el[1])
								{
									alreadyRemoved[globals.xy2coords(el[0], el[1])] = true;
									coordsList.splice(j, 1);
									break removal_loop;
								}
							}
					}
			}
	}
}

module.exports = Mob;
