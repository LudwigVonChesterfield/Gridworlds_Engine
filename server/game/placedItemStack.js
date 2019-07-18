const globals = require('./globals');

function PlacedItemStack(id, qty)
{
	this.type = id;
	this.qty = qty;
	this.x = 0;
	this.y = 0;
}
PlacedItemStack.prototype.placeAt = function(nx, ny)
{
	if(globals.mapTileData.map[globals.toIndex(this.x, this.y)].itemStack == this)
	{
		globals.mapTileData.map[globals.toIndex(this.x, this.y)].itemStack = null;
	}
	
	this.x = nx;
	this.y = ny;
	
	globals.mapTileData.map[globals.toIndex(nx, ny)].itemStack = this;
};

module.exports = PlacedItemStack;
