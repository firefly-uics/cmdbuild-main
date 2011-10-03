(function() {
	TestCase("testCMDomainModel", {
		setUp: function() {},
		tearDown: function() {},
		"test buildFromJSON": function() {
			var domain = CMDBuild.core.model.CMDomainModel.buildFromJSON(getJSONDomain());
		}
	});
	
	function getJSONDomain() {
		return {
			class1id : 1585805,
			priv_write : true,
			inherited : false,
			classType : "class",
			priv_create : true,
			class2id : 1586051,
			meta : {
				"runtime.username" : "admin",
				"runtime.groupname" : "SuperUser",
				"runtime.privileges" : "WRITE"
			},
			idDomain : 1585882,
			class1 : "Dipendente",
			md : false,
			description : "Assegnazione",
			class2 : "Posto di lavoro",
			name : "Assegnazione",
			descrdir : "utilizza",
			descrinv : "utilizzato da",
			active : true,
			origName : "Assegnazione",
			cardinality : "N:N"
		};
	}
})();