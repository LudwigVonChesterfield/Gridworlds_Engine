const Stack = require('./stack');

function Inventory(s)
{
	this.spaces		= s;
	this.stacks		= [];
}
Inventory.prototype.addItems = function(id, qty)
{
	for(var i = 0; i < this.spaces; i++)
	{
		if(this.stacks.length <= i)
		{
			var maxHere = (qty > itemTypes[id].maxStack ? itemTypes[id].maxStack : qty);
			this.stacks.push(new Stack(id, maxHere));
			
			qty -= maxHere;
		}
		else if(this.stacks[i].type == id && this.stacks[i].qty < itemTypes[id].maxStack)
		{
			var maxHere = (itemTypes[id].maxStack - this.stacks[i].qty);
			if(maxHere > qty)
			{
				maxHere = qty;
			}
			
			this.stacks[i].qty += maxHere;
			qty -= maxHere;
		}
		
		if(qty == 0)
		{
			return 0;
		}
	}
	
	return qty;
};

module.exports = Stack;
