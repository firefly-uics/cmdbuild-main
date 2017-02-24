(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.dataView.sql.panel.grid.Record', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} }
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
