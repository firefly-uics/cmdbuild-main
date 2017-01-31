(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.WindowView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Window}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.FormPanel}
		 */
		form: undefined,

		baseTitle: CMDBuild.Translation.attachment, // TODO: manage title (Attachment - ITEM_DESCRIPTION)
		closeAction: 'hide',
		dimensionsMode: 'percentage',
		layout: 'fit',
		overflowY: 'auto',

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
									this.delegate.cmfg('onPanelModuleAttachmentGridAddButtonClick'); // TODO
								}
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Close', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentWindowAddAbortButtonClick'); // TODO
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

//		listeners: {
//			show: function (panel, eOpts) {
//				this.delegate.cmfg('onPanelModuleAttachmentShow'); // TODO: remove
//			}
//		}
	});

})();
