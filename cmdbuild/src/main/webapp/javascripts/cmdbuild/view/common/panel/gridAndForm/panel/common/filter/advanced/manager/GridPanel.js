(function () {

	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.gridAndForm.panel.common.filter.advanced.Manager'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		hideHeaders: true,
		menuDisabled: true,

		/**
		 * Action columns are disabled if record is marked as template
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						flex: 1,

						renderer: function (value, metadata, record, rowIndex, colIndex, store, view) {
							return record.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
						}
					},
					Ext.create('Ext.grid.column.Action', {
						align: 'center',
						width: 100,
						fixed: true,

						items: [
							Ext.create('CMDBuild.core.buttons.icon.Save', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.save,
								scope: this,

								isDisabled: function (grid, rowIndex, colIndex, item, record) {
									return (
										!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.ID))
										|| record.get(CMDBuild.core.constants.Proxy.TEMPLATE)
									);
								},

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerSaveButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.icon.modify.Modify', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.modify,
								scope: this,

								isDisabled: function (grid, rowIndex, colIndex, item, record) {
									return record.get(CMDBuild.core.constants.Proxy.TEMPLATE);
								},

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerModifyButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.icon.Clone', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.clone,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerCloneButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.icon.Remove', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.remove,
								scope: this,

								isDisabled: function (grid, rowIndex, colIndex, item, record) {
									return record.get(CMDBuild.core.constants.Proxy.TEMPLATE);
								},

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerRemoveButtonClick', record);
								}
							})
						]
					})
				],
				store: CMDBuild.proxy.common.panel.gridAndForm.panel.common.filter.advanced.Manager.getStoreUser()
			});

			this.callParent(arguments);
		},

		listeners: {
			beforecellclick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
				// FIX: stopSelection is bugged in ExtJs 4.2 (disable row selection on action column click)
				return cellIndex == 0;
			},
			select: function (grid, record, index, eOpts) {
				this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterSelect', record);
			}
		}
	});

})();
