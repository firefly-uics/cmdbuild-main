(function () {

	Ext.define('CMDBuild.view.management.dataView.filter.panel.form.FormPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined
	});

})();
