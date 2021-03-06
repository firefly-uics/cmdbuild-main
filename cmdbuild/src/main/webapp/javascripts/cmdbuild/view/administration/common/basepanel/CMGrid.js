/**
 * @class CMDBuild.delegate.administration.common.basepanel.CMGridDelegate
 *
 * Respond to the events fired from the Grid
 */
Ext.define("CMDBuild.delegate.administration.common.basepanel.CMGridDelegate", {
	/**
	 *
	 * @param {CMDBuild.view.administration.common.basepanel.CMGrid} grid
	 * the grid that calls this method
	 * @param {Ext.data.Model} record
	 * the selected record
	 */
	onCMGridSelect: function(grid, record) {}
});

Ext.define("CMDBuild.view.administration.common.basepanel.CMGrid", {
	extend: "Ext.grid.Panel",

	// configuration
	gridConfigurator: null,
	withPagingBar: false,
	// configuration

	mixins: {
		delegable: "CMDBuild.core.CMDelegable"
	},

	constructor: function() {
		this.mixins.delegable.constructor.call(this,
				"CMDBuild.delegate.administration.common.basepanel.CMGridDelegate");

		this.callParent(arguments);
	},

	initComponent: function() {
		var me = this;

		this.columns = [];
		this.store =  new Ext.data.SimpleStore({
			fields: [],
			data: []
		});

		if (this.withPagingBar) {
			this.pagingBar = new Ext.toolbar.Paging({
				store: this.store,
				displayInfo: true,
				displayMsg: '{0} - {1} ' + CMDBuild.Translation.of + ' {2}',
				emptyMsg: CMDBuild.Translation.noTopicsToDisplay
			});

			this.bbar = this.pagingBar;
		}

		this.callParent(arguments);

		this.mon(this, "select", function(grid, record, options) {
			me.callDelegates("onCMGridSelect", [grid, record]);
		});
	},

	/**
	 *
	 * @param {CMDBuild.delegate.administration.common.basepanel.CMGridConfigurator} gridConfigurator
	 * configure the store and the columns of this grid asking for them to the
	 * given configurator
	 */
	configureGrid: function(gridConfigurator) {
		if (gridConfigurator) {
			var store = gridConfigurator.getStore();
			var columns = gridConfigurator.getColumns();
			this.reconfigure(store, columns);
			if (this.pagingBar) {
				this.pagingBar.bindStore(store);
			}
		}
	}
});