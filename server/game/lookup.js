const TileWhite = require('./tileWhite');
const TileGrey = require('./tileGrey');
const TileBlack = require('./tileBlack');
const FloorWhite = require('./floorWhite');
const FloorGrey = require('./floorGrey');
const FloorBlack = require('./floorBlack');

const WallWhite = require('./wallWhite');
const WallGrey = require('./wallGrey');
const WallBlack = require('./wallBlack');

const ConveyorU = require('./conveyorU');
const ConveyorD = require('./conveyorD');
const ConveyorL = require('./conveyorL');
const ConveyorR = require('./conveyorR');
const Cube = require('./cube');
const Conveyor_Borders = require('./conveyor_borders');

const Character = require('./character');

const RoofLight = require('./roofLight');
const RoofDark = require('./RoofDark');

lookup =
{
	/*
	Defaults.
	*/
	defaultArea : null,
	defaultTurf : TileWhite, // Can't be null. Please never set to null.
	// defaultRoof : null // Roofs are created as roofobjects, one by one they make no sense.

	/*
	Non-solid turfs - floors.
	*/
	"TileWhite" : TileWhite,
	"TileGrey" : TileGrey,
	"TileBlack" : TileBlack,
	"FloorWhite" : FloorWhite,
	"FloorGrey" : FloorGrey,
	"FloorBlack" : FloorBlack,

	/*
	Solid turfs - walls.
	*/
	"WallWhite" : WallWhite,
	"WallGrey" : WallGrey,
	"WallBlack" : WallBlack,

	/*
	Objects.
	*/
	"ConveyorU" : ConveyorU,
	"ConveyorD" : ConveyorD,
	"ConveyorL" : ConveyorL,
	"ConveyorR" : ConveyorR,
	"Cube" : Cube,
	"Conveyor_Borders" : Conveyor_Borders,

	/*
	Mobs.
	*/
	"Character" : Character,

	/*
	Roofs.
	*/
	"RoofLight" : RoofLight,
	"RoofDark" : RoofDark
}

module.exports = lookup;