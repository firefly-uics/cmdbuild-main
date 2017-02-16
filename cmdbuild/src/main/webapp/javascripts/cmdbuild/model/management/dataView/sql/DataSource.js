(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.constants.Server'
	]);

	Ext.define('CMDBuild.model.management.dataView.sql.DataSource', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.INPUT, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.OUTPUT, type: 'auto', defaultValue: [] }
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

			// Input property setup
			var formattedInputArray = [];

			if (Ext.isArray(data[CMDBuild.core.constants.Proxy.INPUT]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.INPUT]))
				Ext.Array.forEach(data[CMDBuild.core.constants.Proxy.INPUT], function (propertyObject, i, allPropertyObjects) {
					if (Ext.isObject(propertyObject) && !Ext.Object.isEmpty(propertyObject)) {
						// Definition fixes to be valid
						propertyObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = propertyObject[CMDBuild.core.constants.Proxy.NAME];
						propertyObject[CMDBuild.core.constants.Proxy.LENGTH] = CMDBuild.core.constants.Server.getMaxInteger();

						formattedInputArray.push(Ext.create('CMDBuild.model.common.attributes.Attribute', propertyObject));
					}
				}, this);

			data[CMDBuild.core.constants.Proxy.INPUT] = formattedInputArray;

			// Output property setup
			var formattedOutputArray = [];

			if (Ext.isArray(data[CMDBuild.core.constants.Proxy.OUTPUT]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.OUTPUT]))
				Ext.Array.forEach(data[CMDBuild.core.constants.Proxy.OUTPUT], function (propertyObject, i, allPropertyObjects) {
					if (Ext.isObject(propertyObject) && !Ext.Object.isEmpty(propertyObject)) {
						// Definition fixes to be valid
						propertyObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = propertyObject[CMDBuild.core.constants.Proxy.NAME];
						propertyObject[CMDBuild.core.constants.Proxy.LENGTH] = CMDBuild.core.constants.Server.getMaxInteger();

						formattedOutputArray.push(Ext.create('CMDBuild.model.common.attributes.Attribute', propertyObject));
					}
				}, this);

			data[CMDBuild.core.constants.Proxy.OUTPUT] = formattedOutputArray;

			this.callParent(arguments);
		}
	});

})();
