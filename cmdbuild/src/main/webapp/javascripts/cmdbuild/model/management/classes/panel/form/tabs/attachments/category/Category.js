(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.attachments.category.Category', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.METADATA_GROUPS, type: 'auto', defaultValue: [] }, // CMDBuild.model.management.classes.panel.form.tabs.attachments.category.MetadataGroup
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' }
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

			// MetadataGroups setup
			var metadataGroupArray = [];

			if (Ext.isArray(data[CMDBuild.core.constants.Proxy.METADATA_GROUPS]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.METADATA_GROUPS]))
				Ext.Array.forEach(data[CMDBuild.core.constants.Proxy.METADATA_GROUPS], function (groupObject, i, allGroupObjects) {
					if (Ext.isObject(groupObject) && !Ext.Object.isEmpty(groupObject))
						metadataGroupArray.push(Ext.create('CMDBuild.model.management.classes.panel.form.tabs.attachments.category.MetadataGroup', groupObject));
				}, this);

			data[CMDBuild.core.constants.Proxy.METADATA_GROUPS] = metadataGroupArray;

			this.callParent(arguments);
		}
	});

})();
