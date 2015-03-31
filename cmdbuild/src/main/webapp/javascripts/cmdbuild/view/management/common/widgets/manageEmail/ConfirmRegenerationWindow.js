(function() {

	Ext.define('CMDBuild.view.management.common.widgets.manageEmail.ConfirmRegenerationWindow', {
		extend: 'CMDBuild.core.PopupWindow',

		requires: [
			'CMDBuild.core.proxy.CMProxyConstants',
			'CMDBuild.model.widget.ManageEmail'
		],

		/**
		 * @cfg {CMDBuild.controller.management.common.widgets.manageEmail.ConfirmRegenerationWindow}
		 */
		delegate: undefined,

		/**
		 * @cfg {Number}
		 */
		defaultSizeW: 0.80,

		/**
		 * @cfg {Number}
		 */
		defaultSizeH: 0.50,

		/**
		 * @property {Ext.grid.Panel}
		 */
		grid: undefined,

		buttonAlign: 'center',
		closeAction: 'hide',
		layout: 'border',
		title: CMDBuild.Translation.confirmRegeneration,

		initComponent: function() {
			var me = this;

			this.grid = Ext.create('Ext.grid.Panel', {
				region: 'center',
				autoScroll: true,
				border: false,
				collapsible: false,
				frame: false,

				selModel: Ext.create('Ext.selection.CheckboxModel', {
					injectCheckbox: 'last'
				}),

				columns: [
					{
						text: CMDBuild.Translation.archivingDate,
						sortable: true,
						dataIndex: CMDBuild.core.proxy.CMProxyConstants.DATE,
						flex: 1
					},
					{
						text: CMDBuild.Translation.address,
						sortable: false,
						scope: this,
						renderer: this.addressRenderer,
						flex: 1
					},
					{
						text: CMDBuild.Translation.subject,
						sortable: false,
						dataIndex: CMDBuild.core.proxy.CMProxyConstants.SUBJECT,
						flex: 1
					},
					{
						sortable: false,
						scope: this,
						dataIndex: CMDBuild.core.proxy.CMProxyConstants.BODY,
						menuDisabled: true,
						hideable: false,
						renderer: 'stripTags',
						flex: 2
					}
				],

				plugins: [
					{
						ptype: 'rowexpander',
						rowBodyTpl: new Ext.XTemplate(
							'<p><b>Subject:</b> {subject}</p>',
							'<p><b>Content:</b> {body}</p>'
						)
					}
				],

				store: Ext.create('Ext.data.Store', {
					model: 'CMDBuild.model.widget.ManageEmail.email',
					data: []
				})
			});

			Ext.apply(this, {
				dockedItems: [
					{
						xtype: 'toolbar',
						dock: 'bottom',
						itemId: CMDBuild.core.proxy.CMProxyConstants.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.Confirm', {
								handler: function(button, e) {
									me.delegate.cmOn('onConfirmRegenerationWindowConfirmButtonClick');
								}
							})
						]
					}
				],
				items: [
					{
						xtype: 'component',
						region: 'north',
						style: 'padding: 10px;',
						html: CMDBuild.Translation.confirmRegenerationWindowText
					},
					this.grid
				]
			});

			this.callParent(arguments);

			// Resize window, smaller than default size
			this.height = this.height * this.defaultSizeH;
			this.width = this.width * this.defaultSizeW;
		},

		listeners: {
			hide: function(window, eOpts) {
				this.delegate.cmOn('onConfirmRegenerationWindowClearStore');
			},
			show: function(window, eOpts) {
				this.delegate.cmOn('onConfirmRegenerationWindowShow');
			}
		},

		// Column renderers
			/**
			 * @param {Mixed} value
			 * @param {Object} metaData
			 * @param {CMDBuild.model.widget.ManageEmail.email} record
			 *
			 * @return {String}
			 */
			addressRenderer: function(value, metadata, record) {
				if (this.delegate.gridDelegate.recordIsReceived(record)) {
					return record.get(CMDBuild.core.proxy.CMProxyConstants.FROM);
				} else {
					return record.get(CMDBuild.core.proxy.CMProxyConstants.TO);
				}
			}
	});

})();