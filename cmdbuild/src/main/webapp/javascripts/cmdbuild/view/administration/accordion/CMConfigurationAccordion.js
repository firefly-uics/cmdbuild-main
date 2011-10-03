(function() {

	var tr = CMDBuild.Translation.administration.setup;

	Ext.define("CMDBuild.view.administraton.accordion.CMConfigurationAccordion", {
		extend: "CMDBuild.view.common.CMBaseAccordion",
		title: tr.setupTitle,
		cmName: "setup",
		hideMode: "offsets",

		constructor: function(){
			this.callParent(arguments);
			this.updateStore();
		},

		updateStore: function() {
			var root = this.store.getRootNode();
			root.removeAll();
			root.appendChild([{
				text: tr.cmdbuild.menuTitle,
				leaf : true,
				cmName: "modsetupcmdbuild"
			},{
				text: tr.workflow.menuTitle,
				leaf : true,
				cmName: 'modsetupworkflow'
			},{
				text: tr.workflow.email.title,
				leaf : true,
				cmName: 'modsetupemail'
			},{
				text: tr.graph.menuTitle,
				leaf : true,
				cmName: 'modsetupgraph'
			},{
				text: tr.dms.menuTitle, 
				leaf : true,
				cmName: 'modsetupalfresco'
			},{
				text: tr.gis.title, 
				leaf : true,
				cmName: 'modsetupgis'
			},{
				text: tr.server.menuTitle, 
				leaf: true,
				cmName: 'modsetupserver'
			}]);
		}

	});

})();