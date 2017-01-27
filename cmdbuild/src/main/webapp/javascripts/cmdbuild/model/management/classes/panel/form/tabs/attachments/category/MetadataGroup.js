(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.attachments.category.MetadataGroup', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.METADATA, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' }
		]
	});

})();
