const globals = require('./globals');
const Sprite = require('./sprite');

class Atom
{
	constructor(loc, data={})
	{
		this.created = false;
		this.mapLoaded = false;
		this.deleting = false;

		this.movable = false;

		this.anchored = true; // Technically it never can be not anchored anyway, but we'll keep it here.
		this.density = false;
		this.opacity = false;

		this.screen_x = 0;
		this.screen_y = 0;
		this.direction = globals.directions.up;

		this.height = 0;
		this.collisionMask = globals.collisionMasks.none; // What collides into us.

		this.plane = 0; // Plane is dominant over layer.
		this.layer = 0;
		this._sprites = {};

		this.loc = null;
		this.contents = [];

		this.varInit(data);

		if(data["mapData"])
		{
			this.setMapData(data);
		}
		else
		{
			globals.last_uid_number += 1;
			this.uid_number = globals.last_uid_number.toString();
		}

		this.onCreate(loc, data);
		this.created = true;

		globals.tileMap.toLoad.push(this);
	}

	varInit(data)
	{
		/*
		Here we initialize additional variables.
		*/
		if(data["direction"])
		{
			this.direction = data["direction"];
		}
	}

	get client()
	{
		// Only mobs can have client.
		return null;
	}

	set client(newClient)
	{
		// Only mobs can have client.
	}

	get sprite()
	{
		return this._sprites[this.direction];
	}

	set sprite(SO)
	{
		if(Object.keys(SO).length == 1)
		{
			var dir_keys = [globals.directions.up, globals.directions.left, globals.directions.down, globals.directions.right];
			for(var i = 0; i < dir_keys.length; i++)
			{
				var dir = dir_keys[i];
				this._sprites[dir] = SO[globals.directions.up];
			}
		}
		else if(Object.keys(SO).length == 2)
		{
			this._sprites[globals.directions.up] = SO[globals.directions.up];
			this._sprites[globals.directions.left] = SO[globals.directions.up];
			this._sprites[globals.directions.down] = SO[globals.directions.down];
			this._sprites[globals.directions.right] = SO[globals.directions.down];
		}
		else
		{
			var dir_keys = Object.keys(SO);
			for(var i = 0; i < dir_keys.length; i++)
			{
				var dir = dir_keys[i];
				this._sprites[dir] = SO[dir];
			}
		}
	}

	updateSprite()
	{
	}

	onCreate(loc, data)
	{
		/*
		Is called when object is done creating it's vars.
		*/
		this.forcePlaceAt(loc);
	}

	onMapLoad()
	{
		/*
		Is called only after map is instantinated.
		*/
	}

	isOpaque()
	{
		return this.opacity;
	}

	forcePlaceAt(newLoc)
	{
		/*
		Is called to forcefully place us into newLoc.
		*/
		if(this.loc)
		{
			this.loc.contents.splice(this.loc.contents.indexOf(this), 1);
		}
		this.loc = newLoc;
		newLoc.contents.push(this);
	}

	tryPlaceAt(newLoc, t)
	{
		/*
		Is called to attempt to place us, with all the checks, into newLoc.
		*/
		if(!this.loc.onExit())
		{
			this.onExited();
		}
		if(!newLoc.onEnter(this))
		{
			this.onEntered(newLoc);
		}
		this.forcePlaceAt(newLoc);

		var newLoc_contents = newLoc.getContentsExcept(this);

		for(var i = newLoc_contents.length - 1; i >= 0; i--)
		{
			var O = newLoc_contents[i];
			if(this.checkCollide(O))
			{
				if(this.tileTo[0] === O.tileTo[0] && this.tileTo[1] === O.tileTo[1])
				{
					if(O.onBump(newLoc, this, t))
					{
						this.onBumped(newLoc, O, t);
						return true; // We bumped into O and did a thing that moved us. All other bumps are prevented.
					}
					this.onBumped(newLoc, O, t);
				}
			}
		}

		for(var i = newLoc_contents.length - 1; i >= 0; i--)
		{
			var O = newLoc_contents[i];
			if(!O.onCross(newLoc, this, t))
			{
				this.onCrossed(newLoc, O, t);
			}

		}

		return true;
	}

	onCrossed(newLoc, O, t)
	{
		/*
		Is called when we enter newLoc and cross O.
		*/
	}

	onCross(newLoc, crossee, t)
	{
		/*
		Is called when crossee enters newLoc and crosses us(this).
		Return true to prevent onCrossed calls.
		*/
		return false;
	}

	onBumped(newLoc, O, t)
	{
		/*
		Is called when we enter newLoc and bump into O after check_collision.
		*/
	}

	onBump(newLoc, bumpee, t)
	{
		/*
		Is called when bumpee enters newLoc and bumps into us(this) after check_collision.
		Return true to prevent any other onBumps(Light things return false to not prevent bumps).
		*/
		return false;
	}

	tryEnter(newLoc, t)
	{
		/*
		Is called when we try to enter newLoc.
		*/
		var newLocArea = newLoc.getArea();
		if(!newLoc.canEnter(this) || (newLocArea && !newLocArea.canEnter(this)))
		{
			return false;
		}
		if(!this.canTryEnter(newLoc) || (newLocArea && !this.canTryEnter(newLocArea)))
		{
			return false;
		}
		return true;
	}

	canTryEnter(newLoc)
	{
		/*
		Is called to check if we can try to enter newLoc.
		*/
		return true;
	}

	canEnter(enteree)
	{
		/*
		Is called to check if enteree can enter us.
		*/
		return true;
	}

	onEntered(newLoc)
	{
		/*
		Is called when we enter newLoc.
		*/
	}

	onEnter(enteree)
	{
		/*
		Is called when enteree enters us.
		Return TRUE to prevent onEntered call for enteree.
		*/
		return false;
	}

	tryExit()
	{
		/*
		Is called when we try to exit our current loc.
		*/
		var locArea = this.loc.getArea();
		if(!this.loc.canExit(this) || (locArea && !locArea.canExit(this)))
		{
			return false;
		}
		if(!this.canTryExit() || (locArea && !this.canTryExit(locArea)))
		{
			return false;
		}
		return true;
	}

	canTryExit()
	{
		/*
		Is called to check whether we can leave our current loc.
		*/
		return true;
	}

	canExit(exitee)
	{
		/*
		Is called to check whether exitee can leave us.
		*/
		return true;
	}

	onExited()
	{
		/*
		Is called when we are exited our current location.
		*/
	}

	onExit(enteree)
	{
		/*
		Is called when exitee exits us.
		Return TRUE to prevent onExited call for enteree.
		*/
		return false;
	}

	tryCollide(newLoc, t, dir, r_level=1)
	{
		/*
		Is called to check if we collide into anything in newLoc.
		Return null if no collisions happened.
		Return Atom reference to Atom you collided with otherwise.
		*/
		var canCollideWith = newLoc.generateColliders(this);
		var collided_with = null;

		for(var i = 0; i < canCollideWith.length; i++)
		{
			var collidee = canCollideWith[i];
			if(this.checkCollide(collidee))
			{
				if(!collidee.canResolveCollision(this, t, dir, r_level) && !this.canResolveCollide(collidee, t, dir, r_level))
				{
					collided_with = collidee;
					break;
				}
			}
		}
		return collided_with;
	}

	getContentsExcept(exception)
	{
		var retVal = [].concat(this.contents);
		for(var i = 0; i < retVal.length; i++)
		{
			if(retVal[i] === exception)
			{
				retVal.splice(i, 1);
				return retVal;
			}
		}
		return retVal;
	}

	generateColliders(collidee)
	{
		/*
		Is called to get all Atom references collidee can collide into when trying to Enter us.
		*/
		var retVal = [this].concat(this.contents);
		for(var i = 0; i < retVal.length; i++)
		{
			if(retVal[i] === collidee)
			{
				retVal.splice(i, 1);
				return retVal;
			}
		}
		return retVal;
	}

	checkCollide(collidee)
	{
		/*
		Is called to check whether we collide into collidee.
		Return TRUE if collision occured.
		*/
		return false;
	}

	canResolveCollide(collidee, t, dir, r_level=1)
	{
		/*
		Is called when we are attempting to move through something, but we collided into it.
		If you return TRUE, you can succesfully move past, despite the collision.
		*/
		return false;
	}

	canResolveCollision(collided, t, dir, r_level=1)
	{
		/*
		Is called when something collided into us and we are trying to resolve the collision.
		If you return TRUE, collided will move past.
		*/
		return false;
	}

	resolveCollide(collidee, t, r_level=1)
	{
		/*
		Is called after we moved into turf and determined that we will collide with something before.
		r_level is how many layers of resolvement we are dealing with. As in, us pushing something pushing something i 2 r_levels.
		*/
	}

	resolveCollision(collided, t, r_level=1)
	{
		/*
		Is called after collided moved into our turf and was determined to collide with us.
		r_level is how many layers of resolvement we are dealing with. As in, us pushing something pushing something i 2 r_levels.
		*/
	}

	processMovableMovement(AM, t)
	{
		/*
		OLD: Is called in Movable's processMovement(). Here we forcefully move, etc. return TRUE to prevent mob's controlled movement.
		AM - is the thing that needs processing.

		NB!: The "return TRUE" part doesn't work at the moment.

		NEW: Return TRUE to block all other processMovableMovement statements on this turf.
		*/
		return false;
	}

	getArea()
	{
		return null;
	}

	getTurf()
	{
		return null;
	}

	getRoof()
	{
		return null;
	}

	genSpritePackage(t)
	{
		var p_x = (this.x * globals.tileW);
		var p_y = (this.y * globals.tileH);

		return this.sprite.genSpritePackage(p_x, p_y, null, null, null, null);
	}

	destroy()
	{
		/*
		Is called to delete us.
		*/
		if(!this.deleting)
		{
			this.deleting = true;
			this.onDestroy();
		}
	}

	onDestroy()
	{
		/*
		I called to clear up all the references to us.
		*/
		if(this.loc)
		{
			this.loc.contents.splice(this.loc.contents.indexOf(this), 1);
		}

		for(var i = this.contents.length - 1; i >= 0; i--)
		{
			var content = this.contents[i];
			content.destroy();
			content.loc = null;
		}
	}

	getMapData(options={})
	{
		var data = {};

		data["mapData"] = true; // Determines whether this is data we gain on mapload, or just data passed to us on creation.

		data["type"] = this.constructor.name;
		data["uid_number"] = this.uid_number;

		data["anchored"] = this.anchored;
		data["density"] = this.density;
		data["opacity"] = this.opacity;

		data["screen_x"] = this.screen_x;
		data["screen_y"] = this.screen_y;

		data["direction"] = this.direction;

		data["height"] = this.height;
		data["collisionMask"] = this.collisionMask;

		data["plane"] = this.plane;
		data["layer"] = this.layer;

		if(options["ignore_sprites"] != "undefined")
		{
			data["_sprites"] = {};
			var sprite_dirs = Object.keys(this._sprites);
			for(var i = 0; i < sprite_dirs.length; i++)
			{
				var sprite_dir = sprite_dirs[i];
				data["_sprites"][sprite_dir] = this._sprites[sprite_dir].frames;
			}
		}

		data["contents"] = [];
		content_saving:
			for(var i = 0; i < this.contents.length; i++)
			{
				var O = this.contents[i];

				if(options["ignore_types"])
				{
					options_type_check:
						for(var j = 0; j < options["ignore_types"].length; j++)
						{
							if(O.constructor.name.toString() === options["ignore_types"][i])
							{
								continue content_saving;
							}
						}
				}

				var O_data = O.getMapData(options);
				if(O_data)
				{
					data["contents"].push(O_data);
				}
			}

		return data;
	}

	setMapData(data)
	{
		this.anchored = data["anchored"];
		this.density = data["density"];
		this.opacity = data["opacity"];

		this.screen_x = data["screen_x"];
		this.screen_y = data["screen_y"];

		this.height = data["height"];
		this.collisionMask = data["collisionMask"];

		this.plane = data["plane"];
		this.layer = data["layer"];

		if(data["_sprites"] != "undefined")
		{
			var sprite_dirs = Object.keys(data["_sprites"]);
			for(var i = 0; i < sprite_dirs.length; i++)
			{
				var sprite_dir = sprite_dirs[i];
				this._sprites[sprite_dir] = new Sprite(data["_sprites"][sprite_dir]);
			}
		}

		for(var i = 0; i < data["contents"].length; i++)
		{
			let lookup = require('./lookup'); // Since lookup requires us already knowing what an Atom is.

			var OD = data["contents"][i];
			var O = new lookup[OD["type"]](this, OD);
		}
	}

	/*
	getMapData()
	{
		var data = super.getMapData();
		return data;
	}

	setMapData(data)
	{
		super.setMapData(data);
	}
	*/
}

module.exports = Atom;
