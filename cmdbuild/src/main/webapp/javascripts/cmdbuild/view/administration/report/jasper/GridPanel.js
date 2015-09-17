(function() {

	Ext.define('CMDBuild.view.administration.report.jasper.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.Message',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.proxy.report.Jasper'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.report.Jasper}
		 */
		delegate: undefined,

		border: false,
		frame: false,

		initComponent: function() {
			var store = CMDBuild.core.proxy.report.Jasper.getStore();

			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Paging', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						store: store,
						displayInfo: true,
						displayMsg: '{0} - {1} ' + CMDBuild.Translation.common.display_topic_of + ' {2}',
						emptyMsg: CMDBuild.Translation.common.display_topic_none
					})
				],
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.TITLE,
						text: CMDBuild.Translation.name,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						flex: 1
					},
					Ext.create('Ext.grid.column.Action', {
						text: CMDBuild.Translation.report,
						align: 'center',
						width: 60,
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						items: [
							Ext.create('CMDBuild.core.buttons.fileTypes.Sql', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.sql,
								scope: this,

								handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onReportsJasperGenerateSqlButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.fileTypes.Zip', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.zip,
								scope: this,

								handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onReportsJasperGenerateZipButtonClick', record);
								}
							})
						]
					})
				],
				store: store
			});

			this.callParent(arguments);
		},

		listeners: {
			itemdblclick: function(grid, record, item, index, e, eOpts) {
				this.delegate.cmfg('onReportsJasperItemDoubleClick');
			},

			select: function(row, record, index) {
				this.delegate.cmfg('onReportsJasperRowSelected');
			},

			// Event to load store on view display and first row selection as CMDbuild standard
			viewready: function(panel, eOpts) {
				this.getStore().load({
					scope: this,
					callback: function(records, operation, success) {
						if (success) {
							if (!this.getSelectionModel().hasSelection())
								this.getSelectionModel().select(0, true);
						} else {
							CMDBuild.core.Message.error(null, {
								text: CMDBuild.Translation.errors.unknown_error,
								detail: operation.error
							});
						}
					}
				});
			}
		}
	});

})();