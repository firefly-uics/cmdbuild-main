(function() {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.configurations.DataFormat',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments'
		],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.Attachments}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.Modify}
		 */
		buttonActionModify: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.Remove}
		 */
		buttonActionRemove: undefined,

		border: false,
		cls: 'cmdb-border-bottom',
		disableSelection: true,
		frame: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it

		viewConfig: {
			loadMask: true,
			stripeRows: true
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				features: [
					{
						ftype: 'groupingsummary',
						groupHeaderTpl: '{name} ({rows.length} {[values.rows.length > 1 ? CMDBuild.Translation.attachments : CMDBuild.Translation.attachment]})',
						hideGroupedHeader: true
					}
				],
				columns: [
					Ext.create('Ext.grid.column.Date', {
						dataIndex: CMDBuild.core.constants.Proxy.CREATION_DATE,
						format: CMDBuild.core.configurations.DataFormat.getDateTime(),
						text: CMDBuild.Translation.beginDate,
						sortable: true,
						width: 140
					}),
					Ext.create('Ext.grid.column.Date', {
						dataIndex: CMDBuild.core.constants.Proxy.MODIFICATION_DATE,
						format: CMDBuild.core.configurations.DataFormat.getDateTime(),
						text: CMDBuild.Translation.modificationDate,
						sortable: true,
						width: 140
					}),
					{
						dataIndex: CMDBuild.core.constants.Proxy.USER,
						text: CMDBuild.Translation.author,
						sortable: true,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.VERSION,
						text: CMDBuild.Translation.version,
						sortable: true,
						width: 70
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.FILE_NAME,
						text: CMDBuild.Translation.fileName,
						sortable: true,
						flex: 4
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						sortable: true,
						flex: 6
					},
					Ext.create('Ext.grid.column.Action', {
						align: 'center',
						width: 100,
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						items: [
							Ext.create('CMDBuild.core.buttons.iconized.Download', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.download,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onClassesFormTabAttachmentsDownloadButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Versions', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.versions,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onClassesFormTabAttachmentsVersionsButtonClick', record);
								},

								isDisabled: function (view, rowIndex, colIndex, item, record) {
									return !record.get(CMDBuild.core.constants.Proxy.VERSIONABLE);
								}
							}),
							this.buttonActionModify = Ext.create('CMDBuild.core.buttons.iconized.Modify', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.modify,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onClassesFormTabAttachmentsModifyButtonClick', record);
								},

								isDisabled: function (view, rowIndex, colIndex, item, record) {
									return !this.delegate.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', [
										CMDBuild.core.constants.Proxy.PERMISSIONS,
										CMDBuild.core.constants.Proxy.WRITE
									]);
								}
							}),
							this.buttonActionRemove = Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.remove,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onClassesFormTabAttachmentsRemoveButtonClick', record);
								},

								isDisabled: function (view, rowIndex, colIndex, item, record) {
									return !this.delegate.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', [
										CMDBuild.core.constants.Proxy.PERMISSIONS,
										CMDBuild.core.constants.Proxy.WRITE
									]);
								}
							})
						]
					})
				],
				store: CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.getStore()
			});

			this.callParent(arguments);
		}
	});

})();
