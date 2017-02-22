(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.workflow.StartActivity', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.STATUS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.WORKFLOW_ID, type: 'int', useNull: true }
		]
	});

})();
