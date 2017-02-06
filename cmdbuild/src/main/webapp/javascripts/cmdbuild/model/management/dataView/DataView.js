(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.dataView.DataView', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILTER, type: 'auto', defaultValue: {} }, // CMDBuild.model.common.Filter
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_FUNCTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string', convert: toLowerCase } // Managed values: 'filter', 'sql'
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME] = data[CMDBuild.core.constants.Proxy.SOURCE_CLASS_NAME] || data[CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME];

			if (Ext.isString(data[CMDBuild.core.constants.Proxy.FILTER]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.FILTER])) {
				var filterObject = {};
				filterObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.decode(data[CMDBuild.core.constants.Proxy.FILTER]);
				filterObject[CMDBuild.core.constants.Proxy.DEFAULT] = true;

				data[CMDBuild.core.constants.Proxy.FILTER] = Ext.create('CMDBuild.model.common.Filter', filterObject);
			}

			this.callParent(arguments);
		},

		/**
		 * Override to permits multilevel get with a single function
		 *
		 * @param {Array or String} property
		 *
		 * @returns {Mixed or null}
		 *
		 * @override
		 */
		get: function (property) {
			if (Ext.isArray(property) && !Ext.isEmpty(property)) {
				var returnValue = this;

				Ext.Array.forEach(property, function (propertyName, i, allPropertyNames) {
					if (Ext.isObject(returnValue) && !Ext.Object.isEmpty(returnValue))
						if (Ext.isFunction(returnValue.get)) { // Ext.data.Model manage
							returnValue = returnValue.get(propertyName);
						} else if (!Ext.isEmpty(returnValue[propertyName])) { // Simple object manage
							returnValue = returnValue[propertyName];
						} else { // Not found
							returnValue = null;
						}
				}, this);

				return returnValue;
			}

			return this.callParent(arguments);
		}
	});

	/**
	 * @param {String} value
	 * @param {Object} record
	 *
	 * @returns {String}
	 *
	 * @private
	 */
	function toLowerCase(value, record) {
		return value.toLowerCase();
	}

})();
