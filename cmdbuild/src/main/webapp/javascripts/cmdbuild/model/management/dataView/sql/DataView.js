(function() {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.dataView.DataView', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILTER, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_CLASS_NAME, type: 'string' }, // DataView from filter specific property
			{ name: CMDBuild.core.constants.Proxy.SOURCE_FUNCTION, type: 'string' }, // DataView from function specific property
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' } // Managed values: FILTER, SQL
		]
	});

})();