(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.FormPanel', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Modify}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ContainerFieldsMetadata}
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
					this.containerFieldsCommon = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ContainerFieldsCommon', { delegate: this.delegate }),
					this.containerFieldsMetadata = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ContainerFieldsMetadata', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
