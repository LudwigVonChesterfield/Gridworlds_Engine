const globals = require('./globals');
const Atom = require('./atom');

class Movable extends Atom
{
	varInit(data)
	{
		if(data["direction"])
		{
			this.direction = data["direction"];
		}

		this.collideMask = globals.collisionMasks.none; // What we collide into.

		this.anchored = false; // Can we actually move?

		this.tileFrom	 = [1, 1];   // Where we are at the moment on the map.
		this.tileTo		 = [1, 1];   // Where we are moving to on the map.
		this.timeMoved	 = 0;        // How long are we moving for.
		this.dimensions	 = [40, 40]; // How big are we.

		this.position = [0, 0];
		this.next_position = [0, 0];

		this.pulling_movable = null; // A link to a movable we are pulling.
	}

	onCreate(loc, data)
	{
		var T = loc.getTurf();

		this.tileFrom = [T.x, T.y];
		this.tileTo = [T.x, T.y];

		globals.allMovables.push(this);

		super.onCreate(loc, data);
	}

	forcePlaceAt(newLoc)
	{
		super.forcePlaceAt(newLoc);

		var T = newLoc.getTurf();
		var p_x = ((globals.tileW * T.x) + ((globals.tileW - this.dimensions[0]) / 2));
		var p_y = ((globals.tileH * T.y) + ((globals.tileH - this.dimensions[1]) / 2));

		this.position = [p_x, p_y];
		this.next_position = [p_x, p_y];
		this.tileFrom[0] = T.x;
		this.tileFrom[1] = T.y;
	}

	getArea()
	{
		return this.loc.getArea();
	}

	getTurf()
	{
		return this.loc.getTurf();
	}

	getRoof()
	{
		return this.loc.getRoof();
	}

	checkCollide(collidee)
	{
		return this.density && collidee.density && (this.collideMask & collidee.collisionMask);
	}

	canResolveCollision(collided, t, dir, r_level=1)
	{
		/*
		If something is bumping into us, check if we can be pushed in the required direction, and try to oblige.
		If you got pushed - allow them to go.
		*/
		if(!this.anchored && r_level > 0)
		{
			return this.canMoveDirection(dir, t, r_level - 1);
		}
		return false;
	}

	resolveCollision(collided, t, r_level=1)
	{
		if(this.canMoveDirection(collided.direction, t, r_level))
		{
			this.moveDirection(collided.direction, t, r_level);
		}
	}

	onBump(newLoc, bumpee, t)
	{
		if(this.canMoveDirection(bumpee.direction, t))
		{
			this.moveDirection(bumpee.direction, t)
			return true;
		}
		return false;
	}

	isAnimatedMoving(t)
	{
		var target_turf = globals.coords2turf(this.tileTo[0], this.tileTo[1]);
		var current_turf = globals.coords2turf(this.tileFrom[0], this.tileFrom[1]);

		return (t - this.timeMoved) >= this.getMoveDelay(current_turf, target_turf);
	}

	isStandingStill()
	{
		return this.tileFrom[0] === this.tileTo[0] && this.tileFrom[1] === this.tileTo[1];
	}

	processMovement(t)
	{
		var target_turf = globals.coords2turf(this.tileTo[0], this.tileTo[1]);

		if(this.isStandingStill())
		{
			// NB!: this.height solution is temporary!!!
			if(!this.anchored && this.height <= 0)
			{
				var retVal = target_turf.processMovableMovement(this, t);
				if(!retVal)
				{
					var target_turf_contents = target_turf.getContentsExcept(this);

					for(var i = 0; i < target_turf_contents.length; i++)
					{
						var O = target_turf_contents[i];
						if(O.processMovableMovement(this, t))
						{
							retVal = true;
							break;
						}
					}
				}
			}

			return retVal;
		}

		var current_turf = globals.coords2turf(this.tileFrom[0], this.tileFrom[1]);

		if((t - this.timeMoved) >= this.getMoveDelay(current_turf, target_turf))
		{
			this.tryPlaceAt(target_turf, t);
			return true;
		}

		return false;
	}

	canMoveTo(x, y, t, dir, r_level)
	{
		if(x < 0 || x >= globals.mapW || y < 0 || y >= globals.mapH || this.anchored)
		{
			return false;
		}

		var T = globals.coords2turf(x, y);

		return this.tryExit() && this.tryEnter(T) && !this.tryCollide(T, t, dir, r_level);
	}

	canMoveUp(t, r_level=1)
	{
		return this.canMoveTo(this.tileFrom[0], this.tileFrom[1] - 1, t, globals.directions.up, r_level);
	}

	canMoveDown(t, r_level=1)
	{
		return this.canMoveTo(this.tileFrom[0], this.tileFrom[1] + 1, t, globals.directions.down, r_level);
	}

	canMoveLeft(t, r_level=1)
	{
		return this.canMoveTo(this.tileFrom[0] - 1, this.tileFrom[1], t, globals.directions.left, r_level);
	}

	canMoveRight(t, r_level=1)
	{
		return this.canMoveTo(this.tileFrom[0] + 1, this.tileFrom[1], t, globals.directions.right, r_level);
	}

	canMoveDirection(d, t, r_level=1)
	{
		switch(d)
		{
			case globals.directions.up:
				return this.canMoveUp(t, r_level);
			case globals.directions.down:
				return this.canMoveDown(t, r_level);
			case globals.directions.left:
				return this.canMoveLeft(t, r_level);
			default:
				return this.canMoveRight(t, r_level);
		}
	}

	moveTo(dx, dy, t, r_level=1)
	{
		this.tileTo[0] = this.tileFrom + dx;
		this.tileTo[1] = this.tileFrom + dy;
		this.timeMoved = t;

		var new_T = globals.coords2turf(this.tileTo[0], this.tileTo[1]);

		this.next_position = [((globals.tileW * new_T.x) + ((globals.tileW - this.dimensions[0]) / 2)), ((globals.tileH * new_T.y) + ((globals.tileH - this.dimensions[1]) / 2))];
		this.onMoveStart(globals.coords2turf(this.tileTo[0], this.tileTo[1]), t, r_level);
	}

	moveLeft(t, r_level=1)
	{
		this.direction = globals.directions.left;
		this.moveTo(-1, 0, t, r_level);
	}	

	moveRight(t, r_level=1)
	{
		this.direction = globals.directions.right;
		this.moveTo(1, 0, t, r_level);
	}

	moveUp(t, r_level=1)
	{
		this.direction = globals.directions.up;
		this.moveTo(-1, 0, t, r_level);
	}

	moveDown(t, r_level=1)
	{
		this.direction = globals.directions.down;
		this.moveTo(1, 0, t, r_level)
	}

	moveDirection(d, t, r_level=1)
	{
		switch(d)
		{
			case globals.directions.up:
				return this.moveUp(t, r_level);
			case globals.directions.down:
				return this.moveDown(t, r_level);
			case globals.directions.left:
				return this.moveLeft(t, r_level);
			default:
				return this.moveRight(t, r_level);
		}
	}

	onMoveStart(newLoc, t, r_level=1)
	{
		/*
		Is called when we are on our way to newLoc.
		*/
		if(r_level > 0)
		{
			var colliders = newLoc.generateColliders(this);
			for(var i = 0; i < colliders.length; i++)
			{
				var O = colliders[i];
				if(this.checkCollide(O))
				{
					O.resolveCollision(this, t, r_level - 1);
					this.resolveCollide(O, t, r_level - 1);
				}
			}
		}

		/*
		if(this.pulling_movable)
		{
			if(Math.abs(this.pulling_movable.tileFrom[0] - this.tileFrom[0]) > 1 || Math.abs(this.pulling_movable.tileFrom[1] - this.tileFrom[1]) > 1)
			{
				this.pulling_movable = null;
			}
			else if(this.pulling_movable.canMoveDirection(this.direction))
			{
				this.pulling_movable.moveDirection(this.direction);
			}
		}
		*/
	}

	getMoveDelay(oldLoc, newLoc)
	{
		/*
		oldLod and newLoc are expected to be turfs, or supporting of moveDelay.
		*/
		return oldLoc.delayMove + newLoc.delayMove;
	}

	pickUp()
	{
		if(this.tileTo[0] !== this.tileFrom[0] || this.tileTo[1] !== this.tileFrom[1])
		{
			return false;
		}

		/*
		var is = globals.mapTileData.map[globals.toIndex(this.tileFrom[0], this.tileFrom[1])].itemStack;
		
		if(is != null)
		{
			var remains = this.inventory.addItems(is.type, is.qty);

			if(remains)
			{
				is.qty = remains;
			}
			else
			{
				globals.mapTileData.map[globals.toIndex(this.tileFrom[0], this.tileFrom[1])].itemStack = null;
			}

			return true; // Something was picked up.
		}
		
		return false; // Nothing was picked up.
		*/
	}

	genSpritePackage(t)
	{
		var T = globals.coords2turf(this.tileFrom[0], this.tileFrom[1]);
		var new_T = globals.coords2turf(this.tileTo[0], this.tileTo[1]);

		return this.sprite.genSpritePackage(this.position[0], this.position[1], this.next_position[0], this.next_position[1], this.timeMoved, this.getMoveDelay(T, new_T));
	}

	onDestroy()
	{
		for(var i = 0; i < globals.allMovables.length; i++)
		{
			if(globals.allMovables[i] === this)
			{
				globals.allMovables.splice(i, 1);
			}
		}

		super.onDestroy();
	}

	getMapData(options={})
	{
		var data = super.getMapData(options);

		data["collideMask"] = this.collideMask;

		data["tileFrom"] = this.tileFrom;
		data["tileTo"] = this.tileTo;
		data["timeMoved"] = this.timeMoved;
		data["dimensions"] = this.dimensions;
		data["position"] = this.position;
		data["next_position"] = this.next_position;

		return data;
	}

	setMapData(data)
	{
		this.collideMask = data["collideMask"];

		this.tileFrom = data["tileFrom"];
		this.tileTo = data["tileTo"];
		this.timeMoved = data["timeMoved"];
		this.dimensions = data["dimensions"];
		this.position = data["position"];
		if(data["next_position"] != null)
		{
			this.next_position = data["next_position"];
		}

		super.setMapData(data);
	}
}

module.exports = Movable;
