const fs = require('fs');

const globals = require('../game/globals');

var globalsServer = 
{
	default_map_fileName : "Default",
	default_map_filePath : "./saved_data/defaultMapData/",
	// {"ignore_types":["Character"],"ignore_sprites":true} is the default string you need to pass to see default behavior.
	default_saveMap_options : {"ignore_types" : ["Character"], "ignore_sprites" : true},
	default_saveMap_extension : ".txt",

	port : 8080,

	parseIP : function(input)
	{
		// Returns null if no IP is found.
		return null;
	},

	parseID : function(input)
	{
		// It is implied that this is client's Unique ID.
		// Returns null if no UUID is found.
		return input;
	},

	parseUniqueUsername : function(input)
	{
		// Returns null if no username is found.
		return null;
	}
}

var truncate = require("truncate-utf8-bytes");

var illegalRe = /[\/\?<>\\:\*\|":]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[\. ]+$/;

function sanitize(input, replacement)
{
	var sanitized = input
		.replace(illegalRe, replacement)
		.replace(controlRe, replacement)
		.replace(reservedRe, replacement)
		.replace(windowsReservedRe, replacement)
		.replace(windowsTrailingRe, replacement);
	return truncate(sanitized, 255);
}

globalsServer.sanitize_filename = function (input, options)
{
	var replacement = (options && options.replacement) || '';
	var output = sanitize(input, replacement);
	if (replacement === '')
	{
		return output;
	}
	return sanitize(output, '');
}

globalsServer.map2file = function(fileName, options={}, path='./saved_data/mapData/')
{
	/*
	Saves the entire game scene("map") to the file in /server/saved_data/mapData folder by given fileName.
	Options allows for some additional data saving, or ignoring some data.
	*/
	fileName = globalsServer.sanitize_filename(fileName);

	fs.writeFile(path + fileName + globalsServer.default_saveMap_extension, JSON.stringify(globals.tileMap.getMapData(options), null, 2), function(err)
	{
		if(err)
		{
			throw err;
		}
		console.log('Saved map to ' + fileName + '.');
	});
}

globalsServer.file2map = function(fileName, path='./saved_data/mapData/')
{
	fileName = globalsServer.sanitize_filename(fileName);

	path = path + fileName + globalsServer.default_saveMap_extension;

	if(fs.existsSync(path))
	{
		fs.readFile(path, 'utf8', function(err, data)
		{
			if(err)
			{
				throw err;
			}
			globals.tileMap.loadMapData(JSON.parse(data));
			console.log('Loaded map from ' + fileName + '.');
		});
	}
}

module.exports = globalsServer;
