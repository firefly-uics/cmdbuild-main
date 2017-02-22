(function () {

	Ext.define('CMDBuild.view.management.dataView.sql.panel.form.tabs.card.FormPanel', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions2'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.panel.form.tabs.card.Card}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel',
		frame: false,
		border: false,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		}
	});

})();
