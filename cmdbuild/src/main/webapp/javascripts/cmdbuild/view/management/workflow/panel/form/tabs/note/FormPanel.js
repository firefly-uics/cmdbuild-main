(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.note.FormPanel', {
		extend: 'Ext.form.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.Note}
		 */
		delegate: undefined,

		cls: 'cmdb-border-bottom',
		border: false,
		frame: false,
		layout: 'fit',
		overflowY: 'auto'
	});

})();
