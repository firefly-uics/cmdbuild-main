(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsMetadata', {
		extend: 'Ext.container.Container',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Modify}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-blue-panel',
		frame: false,
		hidden: true,

		layout: {
			type: 'vbox',
			align: 'stretch'
		}
	});

})();
