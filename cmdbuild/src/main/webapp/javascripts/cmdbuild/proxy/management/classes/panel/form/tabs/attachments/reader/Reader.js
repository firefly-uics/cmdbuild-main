(function () {

	/**
	 * Applied attributes translations:
	 * 	- Category -> category
	 *  - Author -> user
	 *  - CreationDate -> creationDate
	 *  - Description -> description
	 *  - Filename -> fileName
	 *  - Metadata -> metadata
	 *  - ModificationDate -> modificationDate
	 *  - Version -> version
	 */
	Ext.define('CMDBuild.proxy.management.classes.panel.form.tabs.attachments.reader.Reader', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.attachmentsstore',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @param {Object} rowObject
		 *
		 * @returns {Object} rowObject
		 *
		 * @private
		 */
		buildRow: function (rowObject) {
			if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)) {
				rowObject[CMDBuild.core.constants.Proxy.CATEGORY] = rowObject['Category'];
				rowObject[CMDBuild.core.constants.Proxy.CREATION_DATE] = rowObject['CreationDate'];
				rowObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = rowObject['Description'];
				rowObject[CMDBuild.core.constants.Proxy.FILE_NAME] = rowObject['Filename'];
				rowObject[CMDBuild.core.constants.Proxy.METADATA] = rowObject['Metadata'];
				rowObject[CMDBuild.core.constants.Proxy.MODIFICATION_DATE] = rowObject['ModificationDate'];
				rowObject[CMDBuild.core.constants.Proxy.USER] = rowObject['Author'];
				rowObject[CMDBuild.core.constants.Proxy.VERSION] = rowObject['Version'];
				rowObject[CMDBuild.core.constants.Proxy.VERSIONABLE] = rowObject['Versionable'];
			}

			return rowObject;
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Ext.data.ResultSet}
		 *
		 * @override
		 */
		readRecords: function (data) {
			data = data[this.root];

			var structure = [];

			if (Ext.isArray(data) && !Ext.isEmpty(data))
				Ext.Array.forEach(data, function (rowObject, i, allRowObjects) {
					if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject))
						structure.push(this.buildRow(rowObject));
				}, this);

			return this.callParent([structure]);
		}
	});

})();
