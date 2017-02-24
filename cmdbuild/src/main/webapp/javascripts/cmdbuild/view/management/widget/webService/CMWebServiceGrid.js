(function() {

	Ext.define("CMDBuild.view.management.widget.webService.CMWebServiceGrid", {
		extend: "Ext.grid.Panel",

		initComponent: function() {
			this.bbar = [
				Ext.create('CMDBuild.view.common.field.grid.localSearch.LocalSearch', { grid: this })
			];

			this.callParent(arguments);
		}
	});

})();
