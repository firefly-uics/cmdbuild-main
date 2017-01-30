(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.add.ContainerFieldsMetadata', {
		extend: 'Ext.container.Container',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Add}
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
