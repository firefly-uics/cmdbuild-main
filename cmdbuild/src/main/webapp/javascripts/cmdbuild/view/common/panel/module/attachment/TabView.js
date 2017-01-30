(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.TabView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Tab}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.add.Add}
		 */
		buttonAdd: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.GridPanel}
		 */
		grid: undefined,

		border: false,
		cls: 'x-panel-body-default-framed',
		frame: false,
		itemId: 'formTabAttachment',
		layout: 'fit',
		title: CMDBuild.Translation.attachments,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							this.buttonAdd = Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
								text: CMDBuild.Translation.addAttachment,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentAddButtonClick');
								}
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',
						hidden: true,

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							this.buttonBack = Ext.create('CMDBuild.core.buttons.text.Back', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentBackButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.grid = Ext.create('CMDBuild.view.common.panel.module.attachment.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onPanelModuleAttachmentShow');
			}
		}
	});

})();
