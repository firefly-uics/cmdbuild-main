(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.attachments.entryType.DisabledFeatures', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLONE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CREATE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.MODIFY, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.REMOVE, type: 'boolean' }
		]
	});

})();
