(function() {

	/**
	 * @deprecated CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.CardGridPanel
	 */
	Ext.define('CMDBuild.view.common.field.filter.advanced.window.panels.relations.CardGridPanel', {
		extend: 'CMDBuild.view.management.common.CMCardGrid',

		/**
		 * @cfg {CMDBuild.controller.common.field.filter.advanced.window.panels.relations.Relations}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		multiSelect: true,
		selType: 'checkboxmodel'
	});

})();