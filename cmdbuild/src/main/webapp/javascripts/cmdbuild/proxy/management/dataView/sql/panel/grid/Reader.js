(function () {

	Ext.define('CMDBuild.proxy.management.dataView.sql.panel.grid.Reader', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.sqlstore',

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
				var rowNewObject = {};

				// Base attributes
				rowNewObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = rowObject[CMDBuild.core.constants.Proxy.CLASS_NAME];
				rowNewObject[CMDBuild.core.constants.Proxy.VALUES] = {};

				// Custom attributes
				rowNewObject[CMDBuild.core.constants.Proxy.VALUES] = rowObject;

				return rowNewObject;
			}

			return null;
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

			if (Ext.isArray(data[this.root]) && !Ext.isEmpty(data[this.root]))
				Ext.Array.forEach(data[this.root], function (rowObject, i, allRowObjects) {
					structure.push(this.buildRecord(rowObject));
				}, this);

			var decodedItems = {};
			decodedItems[this.root] = Ext.Array.clean(structure);

			Ext.apply(data, decodedItems); // Override row property with custom ones

			return this.callParent(arguments);
		}
	});

})();
