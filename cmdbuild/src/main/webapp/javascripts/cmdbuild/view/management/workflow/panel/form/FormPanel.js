(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.FormPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		delegate: undefined,

		layout: 'border'
	});

})();
