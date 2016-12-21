(function () {

	/**
	 * Applied attributes translations:
	 * 	- Base params
	 * 		Description -> description
	 * 		Id -> id
	 * 		IdClass -> classId
	 * 		IdClass_value -> classDescription
	 */
	Ext.define('CMDBuild.proxy.management.dataView.filter.panel.grid.Reader', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.classstore',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @param {Object} rowObject
		 *
		 * @returns {Object} rowNewObject
		 *
		 * @private
		 */
		buildRecord: function (rowObject) {
			if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)) {
				var customPropertiesObject = {},
					rowNewObject = {};

				Ext.Object.each(rowObject, function (key, value, myself) {
					customPropertiesObject
				}, this);

				// Base attributes
				rowNewObject[CMDBuild.core.constants.Proxy.BEGIN_DATE] = rowObject[CMDBuild.core.constants.Proxy.BEGIN_DATE];
				rowNewObject[CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION] = rowObject['IdClass_value'];
				rowNewObject[CMDBuild.core.constants.Proxy.CLASS_ID] = rowObject['IdClass'];
				rowNewObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = rowObject[CMDBuild.core.constants.Proxy.CLASS_NAME];
				rowNewObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = rowObject['Description'];
				rowNewObject[CMDBuild.core.constants.Proxy.ID] = rowObject['Id'];
				rowNewObject[CMDBuild.core.constants.Proxy.USER] = rowObject[CMDBuild.core.constants.Proxy.USER];
				rowNewObject[CMDBuild.core.constants.Proxy.VALUES] = {};

				// Custom attributes
				rowNewObject[CMDBuild.core.constants.Proxy.VALUES] = rowObject;

				return rowNewObject;
			}
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Ext.data.ResultSet}
		 *
		 * @override
		 */
		readRecords: function (data) {
			var structure = [];

			if (Ext.isArray(data[CMDBuild.core.constants.Proxy.ROWS]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.ROWS]))
				Ext.Array.each(data[CMDBuild.core.constants.Proxy.ROWS], function (rowObject, i, allRowObjects) {
					structure.push(this.buildRecord(rowObject));
				}, this);

			Ext.apply(data, { rows: structure }); // Override row property with custom ones

			return this.callParent(arguments);
		}
	});

})();
