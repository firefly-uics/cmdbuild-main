(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.modify.FormPanel', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Modify}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsMetadata}
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
					this.containerFieldsCommon = Ext.create('CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsCommon', { delegate: this.delegate }),
					this.containerFieldsMetadata = Ext.create('CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsMetadata', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
