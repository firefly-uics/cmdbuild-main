(function() {

	Ext.define('CMDBuild.view.administration.configuration.WorkflowPanel', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.proxy.Constants'],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.Workflow}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.ux.form.XCheckbox}
		 */
		enabledCheckBox: undefined,

		bodyCls: 'cmgraypanel',
		border: false,
		frame: false,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align:'stretch'
		},

		fieldDefaults: {
			labelAlign: 'left',
			labelWidth: CMDBuild.CFG_LABEL_WIDTH,
			maxWidth: CMDBuild.CFG_MEDIUM_FIELD_WIDTH
		},

		initComponent: function() {
			this.enabledCheckBox = Ext.create('Ext.ux.form.XCheckbox', {
				name: CMDBuild.core.proxy.Constants.ENABLED,
				fieldLabel: CMDBuild.Translation.enabled
			});

			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.proxy.Constants.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function(button, e) {
									this.delegate.cmfg('onConfigurationWorkflowSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function(button, e) {
									this.delegate.cmfg('onConfigurationWorkflowAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.general,
						autoHeight: true,
						defaultType: 'textfield',

						layout: {
							type: 'vbox',
							align:'stretch'
						},

						items: [
							this.enabledCheckBox,
							{
								fieldLabel: CMDBuild.Translation.serverUrl,
								name: 'endpoint',
								allowBlank: false,
								maxWidth: CMDBuild.CFG_BIG_FIELD_WIDTH
							}
						]
					}),
					Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.credentials,
						autoHeight: true,
						defaultType: 'textfield',

						layout: {
							type: 'vbox',
							align:'stretch'
						},

						items: [
							{
								fieldLabel: CMDBuild.Translation.username,
								name: CMDBuild.core.proxy.Constants.USER,
								allowBlank: false
							},
							{
								fieldLabel: CMDBuild.Translation.password,
								name: CMDBuild.core.proxy.Constants.PASSWORD,
								allowBlank: false,
								inputType: 'password'
							},
							{
								fieldLabel: CMDBuild.Translation.engineName,
								name: CMDBuild.core.proxy.Constants.ENGINE,
								allowBlank: false,
								disabled: true
							},
							{
								fieldLabel: CMDBuild.Translation.scope,
								name: CMDBuild.core.proxy.Constants.SCOPE,
								allowBlank: true,
								disabled: true
							}
						]
					})
				]
			});

			this.callParent(arguments);
		},

		/**
		 * @param {Object} saveDataObject
		 *
		 * @override
		 */
		afterSubmit: function(saveDataObject) {
			CMDBuild.Config.workflow.enabled = this.enabledCheckBox.getValue();

			if (CMDBuild.Config.workflow.enabled) {
				_CMMainViewportController.enableAccordionByName('process');
			} else {
				_CMMainViewportController.disableAccordionByName('process');
			}
		}
	});

})();