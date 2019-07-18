const keyEvent2JSON = (e) =>
{
	var keyEvent = {};
	for(var key in e)
	{
		// We can't pass object references.
		if(typeof e[key] === 'object' && e[key] !== null)
		{
			continue;
		}
		keyEvent[key] = e[key];
	}
	return JSON.stringify(keyEvent);
}

const writeEvent = (text) => {
	// <ul> element.
	const parent = document.querySelector('#events');

	// <li> element appending to the <ul> abovve.
	const el = document.createElement('li');
	el.innerHTML = text;

	var updateScroll = false;

	// Scroll so the newest message is visible, unless client themselves scrolled up. 10 is const IMPORTANT_MAGICAL_SCROLLBAR_CONSTANT = 10; in disguise.
	// It's actually the message padding pixel height.
	if(parent.scrollTop + parent.clientHeight + el.scrollHeight + 10 >= parent.scrollHeight)
	{
		updateScroll = true;
	}

	parent.appendChild(el);

	if(updateScroll)
	{
		parent.scrollTop = parent.scrollHeight;
	}
};

const onFormSubmitted = (e) => {
	e.preventDefault();

	const input = document.querySelector('#chat');
	const text = input.value;

	if(text == "")
	{
		writeEvent("Your message is empty.")
		return;
	}

	if(text.length > 256)
	{
		writeEvent("Your message is too long.")
		return;
	}

	input.value = '';

	sock.emit('message', text);
};

writeEvent('Welcome to Gridworlds Multiplayer.');

const sock = io();

sock.on('message', (text) => {
	writeEvent(text);
});

window.addEventListener("keydown", (e) =>
{
	var keyEvent = keyEvent2JSON(e);
	sock.emit('keyDown', keyEvent);
});

window.addEventListener("keyup", (e) =>
{
	var keyEvent = keyEvent2JSON(e);
	sock.emit('keyUp', keyEvent);
});

var ctx = null;

var worldSprites = [], inventorySprites = [];

var viewport =
{
	screen : [0, 0],
	offset : [0, 0]
};

var globals =
{
	tileW : 40,
	tileH : 40
};

var gameTime = 0;

var viewportSet = false;

var tileset = null, tilesetURL = "./src/tileset.png", tilesetLoaded = false;

window.onload = function()
{
	ctx = document.getElementById('game').getContext("2d");
	ctx.font = "bold 10pt sans-serif";

	var width = document.getElementById('game').width;
	var height = document.getElementById('game').height;

	viewport.screen[0] = width;
	viewport.screen[1] = height;
	viewport.offset = [Math.floor(viewport.screen[0] / 2), Math.floor(viewport.screen[1] / 2)];

	tileset = new Image();
	tileset.onerror = function()
	{
		ctx = null;
		alert("Failed loading tileset.");
	};
	tileset.onload = function()
	{
		tilesetLoaded = true;
	};
	tileset.src = tilesetURL;

	sock.on('confirmSetViewport', function(l)
	{
		viewportSet = true;
	})

	sock.on('syncServerTime', function(t)
	{
		gameTime = t;
	});

	sock.on('updateWorld', function(SP)
	{
		processWorldSpritePackage(SP);
	});

	sock.on('updateInventory', function(SP)
	{
		processInventorySpritePackage(SP);
	});

	requestAnimationFrame(drawGame);
};

function drawGame()
{
	if(ctx == null)
	{
		return;
	}

	if(!tilesetLoaded)
	{
		requestAnimationFrame(drawGame);
		return;
	}

	var width = document.getElementById('game').width;
	var height = document.getElementById('game').height;

	if(!viewportSet)
	{
		sock.emit('setViewport', width, height);
	}

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, viewport.screen[0], viewport.screen[1]);

	/* Here we draw the world. */

	viewport.offset = [Math.floor((viewport.screen[0] / 2) - worldSprites.x), Math.floor((viewport.screen[1] / 2) - worldSprites.y)];

	if(worldSprites.d != null)
	{
		// The sign is reverted in diff since we need to deduct character's position, not add it.
		if(worldSprites.toX !== worldSprites.x)
		{
			var diff = (globals.tileW / worldSprites.d) * (gameTime - worldSprites.t);
			viewport.offset[0] += (worldSprites.toX < worldSprites.x ? diff : -diff);
		}
		if(worldSprites.toY !== worldSprites.y)
		{
			var diff = (globals.tileH / worldSprites.d) * (gameTime - worldSprites.t);
			viewport.offset[1] += (worldSprites.toY < worldSprites.y ? diff : -diff);
		}

		viewport.offset[0] = Math.round(viewport.offset[0]);
		viewport.offset[1] = Math.round(viewport.offset[1]);
	}

	for(var plane in worldSprites)
	{
		for(var layer in worldSprites[plane])
		{
			for(var i = 0; i < worldSprites[plane][layer].length; i++)
			{
				let sp = worldSprites[plane][layer][i];
				drawFromSpriteObject(sp);
			}
		}
	}

	/*
	ctx.textAlign = "right";
	
	for(var i = 0; i < player.inventory.spaces; i++)
	{
		ctx.fillStyle = "#ddccaa";
		ctx.fillRect(10 + (i * 50), 350,
			40, 40);
		
		if(typeof player.inventory.stacks[i] != 'undefined')
		{
			var it = globals.itemTypes[player.inventory.stacks[i].type];
			
			it.sprite.draw(gameTime,
				10 + (i * 50) + it.offset[0],
				350 + it.offset[1]);
			
			if(player.inventory.stacks[i].qty>1)
			{
				ctx.fillStyle = "#000000";
				ctx.fillText("" + player.inventory.stacks[i].qty,
					10 + (i*50) + 38,
					350 + 38);
			}
		}
	}
	*/

	requestAnimationFrame(drawGame);
}

function drawFromSpriteObject(SO)
{
	var frameIdx = 0;
	var t = gameTime;
	
	if(!SO.loop && SO.animated && t >= SO.duration)
	{
		frameIdx = (SO.frames.length - 1);
	}
	else if(SO.animated)
	{
		t = t % SO.duration;
		var totalD = 0;
		
		for(var i in SO.frames)
		{
			totalD += SO.frames[i].d;
			frameIdx = i;
			
			if(t <= totalD)
			{
				break;
			}
		}
	}
	
	var offset = (typeof SO.frames[frameIdx].offset == 'undefined' ? [0, 0] : SO.frames[frameIdx].offset);
	offset[0] += viewport.offset[0];
	offset[1] += viewport.offset[1];

	var position_off = [SO.x, SO.y];

	if(SO.t != null)
	{
		if(SO.toX != null && SO.x !== SO.toX)
		{
			var diff = (globals.tileW / SO.d) * (t - SO.t);
			position_off[0] += (SO.toX < SO.x ? -diff : diff);
		}
		if(SO.toY != null && SO.y !== SO.toY)
		{
			var diff = (globals.tileH / SO.d) * (t - SO.t);
			position_off[1] += (SO.toY < SO.y ? -diff : diff);
		}

		position_off[0] = Math.round(position_off[0]);
		position_off[1] = Math.round(position_off[1]);
	}

	ctx.drawImage(tileset,
		SO.frames[frameIdx].x, SO.frames[frameIdx].y,
		SO.frames[frameIdx].w, SO.frames[frameIdx].h,
		position_off[0] + offset[0], position_off[1] + offset[1],
		SO.frames[frameIdx].w, SO.frames[frameIdx].h);
}

function processWorldSpritePackage(SP)
{
	var spritePackage = JSON.parse(SP);
	worldSprites = spritePackage;
}

function processInventorySpritePackage(SP)
{

}

document
	.querySelector('#chat-form')
	.addEventListener('submit', onFormSubmitted);
