const globals = require('./globals');

class Viewport
{
	constructor()
	{
		this.centerTile = [0, 0];
		this.screen     = [0, 0];
		this.startTile  = [0, 0];
		this.endTile    = [0, 0];
	}

	update(px, py)
	{
		var tile = [Math.floor(px / globals.tileW), Math.floor(py / globals.tileH)];

		this.centerTile[0] = tile[0];
		this.centerTile[1] = tile[1];

		this.startTile[0] = tile[0] - 1 - Math.ceil((this.screen[0] / 2) / globals.tileW);
		this.startTile[1] = tile[1] - 1 - Math.ceil((this.screen[1] / 2) / globals.tileH);

		if(this.startTile[0] < 0)
		{
			this.startTile[0] = 0;
		}
		if(this.startTile[1] < 0)
		{
			this.startTile[1] = 0;
		}

		this.endTile[0] = tile[0] + 1 + Math.ceil((this.screen[0] / 2) / globals.tileW);
		this.endTile[1] = tile[1] + 1 + Math.ceil((this.screen[1] / 2) / globals.tileH);

		if(this.endTile[0] >= globals.mapW)
		{
			this.endTile[0] = globals.mapW - 1;
		}
		if(this.endTile[1] >= globals.mapH)
		{
			this.endTile[1] = globals.mapH - 1;
		}
	}

	getVisibleCoords(direction)
	{
		var visibleCoords = [];

		if(direction === globals.directions.all)
		{
			for(var y = this.startTile[1]; y <= this.endTile[1]; y++)
			{
				for(var x = this.startTile[0]; x <= this.endTile[0]; x++)
				{
					visibleCoords.push([x, y]);
				}
			}
			return visibleCoords;
		}
		else
		{
			var x = this.centerTile[0];
			var y = this.centerTile[1];

			visibleCoords.push([x, y]);

			var add_dist_l = 0;
			var add_dist_r = 0;

			if(direction === globals.directions.up)
			{
				while(y > this.startTile[1])
				{
					y -= 1;
					add_dist_l += 1;
					add_dist_r += 1;

					for(var cur_x = x - add_dist_l; cur_x <= x + add_dist_r; cur_x++)
					{
						if(cur_x < this.startTile[0])
						{
							add_dist_l -= 1;
							continue;
						}
						if(cur_x > this.endTile[0])
						{
							add_dist_r -= 1;
							continue;
						}
						visibleCoords.push([cur_x, y]);
					}
				}
				return visibleCoords;
			}
			else if(direction === globals.directions.down)
			{
				while(y < this.endTile[1])
				{
					y += 1;
					add_dist_l += 1;
					add_dist_r += 1;

					for(var cur_x = x - add_dist_l; cur_x <= x + add_dist_r; cur_x++)
					{
						if(cur_x < this.startTile[0])
						{
							add_dist_l -= 1;
							continue;
						}
						if(cur_x > this.endTile[0])
						{
							add_dist_r -= 1;
							continue;
						}
						visibleCoords.push([cur_x, y]);
					}
				}
				return visibleCoords;
			}
			else if(direction === globals.directions.left)
			{
				while(x > this.startTile[0])
				{
					x -= 1;
					add_dist_l += 1;
					add_dist_r += 1;

					for(var cur_y = y - add_dist_l; cur_y <= y + add_dist_r; cur_y++)
					{
						if(cur_y < this.startTile[1])
						{
							add_dist_l -= 1;
							continue;
						}
						if(cur_y > this.endTile[1])
						{
							add_dist_r -= 1;
							continue;
						}
						visibleCoords.push([x, cur_y]);
					}
				}
				return visibleCoords;
			}
			else if(direction === globals.directions.right)
			{
				while(x < this.endTile[0])
				{
					x += 1;
					add_dist_l += 1;
					add_dist_r += 1;

					for(var cur_y = y - add_dist_l; cur_y <= y + add_dist_r; cur_y++)
					{
						if(cur_y < this.startTile[1])
						{
							add_dist_l -= 1;
							continue;
						}
						if(cur_y > this.endTile[1])
						{
							add_dist_r -= 1;
							continue;
						}
						visibleCoords.push([x, cur_y]);
					}
				}
				return visibleCoords;
			}
			return visibleCoords; // Failsafe in case we get some weird direction, at least show ourselves.
		}
	}
};

module.exports = Viewport;