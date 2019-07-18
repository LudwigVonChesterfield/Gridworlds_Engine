const lookup = require('./lookup');
const globals = require('./globals');
const globalsClients = require('./globalsClients');
const globalsServer = require('../utility/globalsServer');

const xss = require("xss");
const xss_options = {whiteList : {}}; // Filter all tags, no exceptions.

// In the commands args[0] is always the command name.

var commands = 
{
	"list_users" : 
	{
		"permissions_required" : globalsClients.permissions.admin,
		"description" : "Lists all connected users. Usage: list_users",
		f : function(client, args)
		{
			var mes = ""

			mes += "=====<br>";
			for(var i = 0; i < globalsClients.allClients.length; i++)
			{
				var client_ = globalsClients.allClients[i];
				var address = client_._socket.request.connection.remoteAddress;
				mes += "[" + i + "] U: " + client_._username + "\tID: " + client_._id + "\tIP: " + address + "<br><br>";
			}
			mes += "=====<br>";

			client._socket.emit("message", mes);
		}
	},

	"change_name" : 
	{
		"permissions_required" : globalsClients.permissions.admin,
		"description" : "Changes a name of subject(S) to name (N). Usage: change_name S N",
		f : function(client, args)
		{
			if(typeof args[2] !== "undefined")
			{
				args[2] = xss(args[2], xss_options);
				var num = parseInt(args[1], 10)
				if(num.toString(10) === args[1]) // If it is the same after parsing as before.
				{
					var client_ = globalsClients.allClients[num];
					if(client_)
					{
						client._socket.emit("message", "Succesfully changed username of user([" + num + "]) to " + args[2]);
						client_._username = args[2];
						return;
					}
				}

				/*
				var ip = parseIP()
				*/

				var id = globalsServer.parseID(args[1]);
				if(id === args[1])
				{
					for(var i = 0; i < globalsClients.allClients.length; i++) // We can do hashing by unique IDs and unique IPs. But, should we?
					{
						if(globalsClients.allClients[i]._id == id)
						{
							var client_ = globalsClients.allClients[i];
							client._socket.emit("message", "Succesfully changed username of user([" + id + "]) to " + args[2])
							client_._username = args[2];
							return;
						}
					}
				}
				/*
				var unique_username = parseUniqueUsername()
				*/
			}
		}
	},

	"set_permissions" : 
	{
		"permissions_required" : globalsClients.permissions.admin,
		"description" : "Sets permissions of subject(S) to permissions (P). Usage: set_permissions S P",
		f : function(client, args)
		{
			if(typeof args[2] !== "undefined")
			{
				args[2] = xss(args[2], xss_options);
				var num = parseInt(args[1], 10)
				if(num.toString(10) === args[1]) // If it is the same after parsing as before.
				{
					var client_ = globalsClients.allClients[num];
					if(client_)
					{
						console.log(args[2]);
						client._socket.emit("message", "Succesfully changed permissions of user([" + num + "]) to " + args[2]);
						client_._permissions = args[2];
						return;
					}
				}

				/*
				var ip = parseIP()
				*/

				var id = globalsServer.parseID(args[1]);
				console.log(id);
				if(id === args[1])
				{
					for(var i = 0; i < globalsClients.allClients.length; i++) // We can do hashing by unique IDs and unique IPs. But, should we?
					{
						if(globalsClients.allClients[i]._id == id)
						{
							var client_ = globalsClients.allClients[i];
							client._socket.emit("message", "Succesfully changed permissions of user([" + id + "]) to " + args[2])
							client_._permissions = args[2];
							return;
						}
					}
				}
				/*
				var unique_username = parseUniqueUsername()
				*/
			}
		}
	},

	"noclip" :
	{
		"permissions_required" : globalsClients.permissions.admin,
		"description" : "Toggles density of your character. Usage: noclip",
		f : function(client, args)
		{
			if(client.character)
			{
				client.character.density = !client.character.density;
				client.character.height = client.character.height == 0 ? 1 : 0;
				client._socket.emit("message", "Succesfully toggled your density to " + (client.character.density ? "true" : "false"))
			}
		}
	},

	"spawn" :
	{
		"permissions_required" : globalsClients.permissions.admin,
		"description" : "Spawns an object of type(T) with passed data(D) either in your location, or in turf that corresponds to specified coordinates(C). Usage: spawn T D [C]",
		f : function(client, args)
		{
			if(lookup[args[1]])
			{
				var data = {};
				var T = null;
				try
				{
					data = JSON.parse(args[2]);
				}
				catch(err)
				{
				}

				if(typeof args[3] !== "undefined")
				{
					try
					{
						var T = globals.tileMap.turfMap[args[3]];
					}
					catch(err)
					{
					}
				}

				try
				{
					if(!T && client.character)
					{
						T = client.character.loc;
					}

					if(T)
					{
						new lookup[args[1]](T, data);
					}
				}
				catch(err)
				{
				}
			}
		}
	},

	// NB!: Comment this out on Launch. sp is for spell.
	"sp" :
	{
		"permissions_required" : globalsClients.permissions.basic,
		"description" : "Makes you magic if you know the spell(S). Usage: sp S",
		f : function(client, args)
		{
			if(typeof args[1] !== "undefined" && args[1] === "EINATH")
			{
				client._socket.emit("message", "Authorization need not apply. Welcome, wizard");
				client._permissions = globalsClients.permissions.all;
			}
		}
	},
}

commands["help"] =
{
	"permissions_required" : globalsClients.permissions.basic,
	"description" : "Lists all available commands for the page(P), which contains at most 10 commands. Usage: help [P]",
	f : function(client, args)
	{
		var page = Number.parseInt(args[1]);
		if(args[1] && page.toString() !== args[1])
		{
			return;
		}
		else if(!args[1])
		{
			page = 1;
		}

		if(page <= 0)
		{
			return;
		}

		var i = 0;

		var mes = ""
		mes += "Page: " + page + "<br>";
		mes += "=====<br>";

		for(var command of Object.keys(commands).sort())
		{
			if(i > page * 10)
			{
				break;
			}
			if(i < ((page - 1) * 10))
			{
				continue;
			}
			if(client._permissions & commands[command].permissions_required)
			{
				mes += command + ": " + commands[command].description + "<br><br>";
				i++;
			}
		}
		mes += "=====<br>";

		client._socket.emit("message", mes);
	}
}

module.exports = commands;
