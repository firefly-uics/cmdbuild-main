(function () {

	Ext.define('CMDBuild.view.management.dataView.sql.panel.grid.GridPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.grid.GridPanel',

		requires: ['CMDBuild.proxy.management.dataView.sql.panel.grid.Grid'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.panel.grid.Grid}
		 */
		delegate: undefined,

		columns: [],

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.management.dataView.sql.panel.grid.Grid.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			columnhide: function (ct, column, eOpts) {
				this.delegate.cmfg('onDataViewSqlGridColumnChanged');
			},
			columnshow: function (ct, column, eOpts) {
				this.delegate.cmfg('onDataViewSqlGridColumnChanged');
			},
			select: function (row, record, index, eOpts) {
				this.delegate.cmfg('onDataViewSqlGridRecordSelect', record);
			},
			sortchange: function (ct, column, direction, eOpts) {
				this.delegate.cmfg('onDataViewSqlGridSortChange');
			}
		}
	});

})();
