(function () {

	/**
	 * Applied attributes translations:
	 * 	text -> description
	 */
	Ext.define('CMDBuild.proxy.administration.navigationTree.ReaderClass', {
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
				var rowNewObject = {};

				// Base attributes
				rowNewObject[CMDBuild.core.constants.Proxy.NAME] = rowObject[CMDBuild.core.constants.Proxy.NAME];
				rowNewObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = rowObject[CMDBuild.core.constants.Proxy.TEXT];
				rowNewObject[CMDBuild.core.constants.Proxy.ID] = rowObject[CMDBuild.core.constants.Proxy.ID];
				rowNewObject[CMDBuild.core.constants.Proxy.TABLE_TYPE] = rowObject[CMDBuild.core.constants.Proxy.TABLE_TYPE];

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
