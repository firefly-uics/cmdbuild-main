(function() {

	Ext.define('CMDBuild.view.management.report.ParametersWindow', {
		extend: 'CMDBuild.core.PopupWindow',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.report.Parameters}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.Panel}
		 */
		form: undefined,

		autoScroll: true,
		autoHeight: true,
		autoWidth: true,
		border: false,
		frame: false,
		layout: 'fit',

		title: CMDBuild.Translation.reportParameters,

		initComponent: function() {
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
							Ext.create('CMDBuild.core.buttons.text.Print', {
								scope: this,

								handler: function(button, e) {
									this.delegate.cmfg('onReportParametersWindowPrintButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function(button, e) {
									this.delegate.cmfg('onReportParametersWindowAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('Ext.form.Panel', {
						labelAlign: 'right',
						frame: true,
						border: false,

						layout: {
							type: 'vbox',
							align: 'stretch'
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();