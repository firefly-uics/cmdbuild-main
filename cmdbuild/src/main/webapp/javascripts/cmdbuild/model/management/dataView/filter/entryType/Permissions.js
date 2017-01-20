(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.dataView.filter.entryType.Permissions', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CREATE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.DISABLED_FEATURES, type: 'auto', defaultValue: {} }, // CMDBuild.model.management.dataView.filter.entryType.DisabledFeatures
			{ name: CMDBuild.core.constants.Proxy.WRITE, type: 'boolean' }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? Ext.clone(data) : {};
			data[CMDBuild.core.constants.Proxy.DISABLED_FEATURES] = Ext.create(
				'CMDBuild.model.management.dataView.filter.entryType.DisabledFeatures',
				data[CMDBuild.core.constants.Proxy.DISABLED_FEATURES]
			);

			this.callParent(arguments);
		}
	});

})();
