(function () {

	Ext.define('CMDBuild.view.management.dataView.filter.panel.grid.GridPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.grid.GridPanel',

		requires: ['CMDBuild.proxy.management.dataView.filter.panel.grid.Grid'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.grid.Grid}
		 */
		delegate: undefined,

		columns: [],
		lines: false,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.management.dataView.filter.panel.grid.Grid.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			columnhide: function (ct, column, eOpts) {
				this.delegate.cmfg('onDataViewFilterGridColumnChanged');
			},
			columnshow: function (ct, column, eOpts) {
				this.delegate.cmfg('onDataViewFilterGridColumnChanged');
			},
			itemdblclick: function (view, record, item, index, e, eOpts) {
				this.delegate.cmfg('onDataViewFilterRecordDoubleClick');
			},
			select: function (row, record, index, eOpts) {
				this.delegate.cmfg('dataViewFilterUiUpdate', {
					cardId: record.get(CMDBuild.core.constants.Proxy.ID),
					className: record.get(CMDBuild.core.constants.Proxy.CLASS_NAME),
					position: index
				});
			},
			sortchange: function (ct, column, direction, eOpts) {
				this.delegate.cmfg('onDataViewFilterGridSortChange');
			}
		}
	});

})();
