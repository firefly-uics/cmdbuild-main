(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.CMActivityInstance
	 */
	Ext.define('CMDBuild.model.management.workflow.Instance', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'rawData', type: 'auto', defaultValue: [] }, // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.CLASS_ID, type: 'int', useNull: true }, // TODO: rename
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} }
		]
	});

})();
