(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.FormPanel', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Add}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsMetadata}
		 */
		containerFieldsMetadata: undefined,

		border: false,
		encoding: 'multipart/form-data',
		fileUpload: true,
		frame: false,
		monitorValid: true,

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
				items: [
					this.containerFieldsCommon = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsCommon', { delegate: this.delegate }),
					this.containerFieldsMetadata = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsMetadata', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
