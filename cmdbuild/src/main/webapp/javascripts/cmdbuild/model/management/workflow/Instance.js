(function () {

	Ext.require([
		'CMDBuild.core.configurations.DataFormat',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.management.workflow.Instance', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'rawData', type: 'auto', defaultValue: [] }, // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.BEGIN_DATE, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.USER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.WORKFLOW_ID, type: 'int', useNull: true }
		],

		/**
		 * Forward requests to value property
		 *
		 * @param {String} name
		 *
		 * @returns {Mixed}
		 *
		 * @override
		 */
		get: function (name) {
			if (name != CMDBuild.core.constants.Proxy.VALUES) {
				var values = this.get(CMDBuild.core.constants.Proxy.VALUES);

				if (Ext.Array.contains(Ext.Object.getKeys(values), name))
					return values[name];
			}

			return this.callParent(arguments);
		}
	});

})();
