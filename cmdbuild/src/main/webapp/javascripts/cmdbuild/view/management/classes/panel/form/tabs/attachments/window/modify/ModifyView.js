(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ModifyView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Modify}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.FormPanel}
		 */
		form: undefined,

		closeAction: 'hide',
		dimensionsMode: 'percentage',
		overflowY: 'auto',
		title: CMDBuild.Translation.modifyAttachment,

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
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
							Ext.create('CMDBuild.core.buttons.text.Confirm', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesFormTabAttachmentsWindowModifyConfirmButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesFormTabAttachmentsWindowModifyAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
