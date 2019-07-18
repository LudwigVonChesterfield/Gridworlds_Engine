const globals = require('./globals');
const globalsServer = require('../utility/globalsServer');
const lookup = require('./lookup');
const tileMap = require('./tileMap');

class World
{
	constructor()
	{
		/*
		World contains "verses" - layered or not tileMap arrays.
		tileMap_verses = {"verse_name" : {"0" : tileMap, "1" : tileMap}}
		If tileMaps are layered it means they are part of the same thing, you can drop from the higher tileMap onto the lower, it'll be like a ceiling-floor relation.
		*/
		this.tileMap_verses = {};
	}

	createVerse(verse_name, verse_layers)
	{

	}

	buildMapFromFileName(fileName)
	{
		globalsServer.file2map(fileName, globalsServer.default_map_filePath);

		return true;
	}

	getMapData(options={})
	{
		var data = {};

		return data;
	}

	loadMapData(data)
	{

	}
}

module.exports = TileMap;
