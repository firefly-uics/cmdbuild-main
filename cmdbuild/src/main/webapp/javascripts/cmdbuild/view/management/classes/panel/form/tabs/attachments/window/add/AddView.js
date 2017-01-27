(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.AddView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Add}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.FormPanel}
		 */
		form: undefined,

		closeAction: 'hide',
		dimensionsMode: 'percentage',
		overflowY: 'auto',
		title: CMDBuild.Translation.addAttachment,

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
									this.delegate.cmfg('onClassesFormTabAttachmentsWindowAddConfirmButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesFormTabAttachmentsWindowAddAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
