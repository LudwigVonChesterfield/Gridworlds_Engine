var globalsClients =
{
	connections : 0,
	maxConnections : 20,

	permissions :
	{
		none : 0,
		basic : 1,
		admin : 2,
		build : 4,
		all : 7
	},

	allClients : [],
	// clientsByIP : {},

	posUsernames : [
	                "1-Rover-1", "AM", "Alpha 5", "Asimov", "B-2", "B.O.B", "Bender", "C-3PO", "Cassandra One", "Cell",
	                "Computer", "Data", "Decimus", "Dee Model", "Deep Thought", "Dot Matrix", "E-Man", "ED-209", "Erasmus",
	                "FRIEND COMPUTER", "Faith", "Fi", "Futura", "G2", "George", "GLaDOS", "H.E.L.P.E.R.", "HAL 9000", "Ironhide",
	                "Johnny 5", "K-9", "KITT", "L-76", "L-Ron", "LUH 3417", "Louie", "MARK13", "Marvin", "Master Control Program",
	                "Mechagodzilla", "Megatron", "Metalhead", "NCH", "Necron-99", "OMM 0910", "Optimus", "Orange v 3.5",
	                "Project 2501", "R2-D2", "Revelation", "Ro-Man", "Robbie", "S.A.M.", "S.H.O.C.K.", "S.H.R.O.U.D.",
	                "S.O.P.H.I.E.", "SEN 5241", "SHODAN", "Soundwave", "T-1000", "T-800", "T-850", "THX 1138", "Terminus", "Tidy",
	                "Tobor", "ULTRABOT", "Uniblab", "V.I.N. CENT", "Voltes V", "W1k1", "Wikipedia", "Windows X", "X-5", "XR", "Yod",
	                "Z-1", "Z-2", "Z-3", "Zord"
	                ]
}

/*
globalsClients.permissionGroups =
{
	all : [admin, build]
}
*/

module.exports = globalsClients;
