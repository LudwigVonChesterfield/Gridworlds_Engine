const globalsClients = require('../game/globalsClients');
const globalsServer = require('./globalsServer');

const xss = require('xss');
const xss_options = {whiteList : {}}; // Filter all tags, no exceptions.

// In the commands args[0] is always the command name.

var commands = 
{
	"list_users" : 
	{
		"description" : "Lists all connected users. Usage: list_users",
		f : function(args)
		{
			for(var i = 0; i < globalsClients.allClients.length; i++)
			{
				var client = globalsClients.allClients[i];
				var address = client._socket.request.connection.remoteAddress;
				console.log("[" + i + "] U: " + client._username + "\tID: " + client._id + "\tIP: " + address)
			}
		}
	},

	"change_name" : 
	{
		"description" : "Changes a name of subject(S) to name (N). Usage: change_name S N",
		f : function(args)
		{
			if(typeof args[2] !== "undefined")
			{
				args[2] = xss(args[2], xss_options);
				var num = parseInt(args[1], 10)
				if(num.toString(10) === args[1]) // If it is the same after parsing as before.
				{
					var client = globalsClients.allClients[num];
					if(client)
					{
						console.log(args[2]);
						console.log("Succesfully changed username of user([" + num + "]) to " + args[2]);
						client._username = args[2];
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
							var client = globalsClients.allClients[i];
							console.log("Succesfully changed username of user([" + id + "]) to " + args[2])
							client._username = args[2];
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
		"description" : "Sets permissions of subject(S) to permissions (P). Usage: set_permissions S P",
		f : function(args)
		{
			if(typeof args[2] !== "undefined")
			{
				args[2] = xss(args[2], xss_options);
				var num = parseInt(args[1], 10)
				if(num.toString(10) === args[1]) // If it is the same after parsing as before.
				{
					var client = globalsClients.allClients[num];
					if(client)
					{
						console.log(args[2]);
						console.log("Succesfully changed permissions of user([" + num + "]) to " + args[2]);
						client._permissions = args[2];
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
							var client = globalsClients.allClients[i];
							console.log("Succesfully changed permissions of user([" + id + "]) to " + args[2])
							client._permissions = args[2];
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

	"save_map" : 
	{
		"description" : "Saves the map to a file with a given file name(F), with options(O). Usage: save_map F [O]",
		f : function(args)
		{
			if(typeof args[1] !== "undefined")
			{
				var options = globalsServer.default_saveMap_options;
				if(typeof args[2] !== "undefined")
				{
					try
					{
						options = JSON.parse(args[2]);
					}
					catch(err)
					{
					}
				}
				if(typeof options == "object")
				{
					globalsServer.map2file(args[1], options);
				}
			}
		}
	},

	"load_map" : 
	{
		"description" : "Loads the map from a file with a given file name(F). Usage: load_map F",
		f : function(args)
		{
			if(typeof args[1] !== "undefined")
			{
				globalsServer.file2map(args[1]);
			}
		}
	}
}

commands["help"] =
{
	"description" : "Lists all available commands for the page(P), which contains at most 10 commands. Usage: help [P]",
	f : function(args)
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
		console.log("Page: " + page);
		console.log("=====");

		for(var command of Object.keys(commands).sort())
		{
			i++;
			if(i > page * 10)
			{
				break;
			}
			if(i < ((page - 1) * 10))
			{
				continue;
			}
			console.log(command + ": " + commands[command].description);
		}
		console.log("=====");
	}
}

module.exports = commands;
