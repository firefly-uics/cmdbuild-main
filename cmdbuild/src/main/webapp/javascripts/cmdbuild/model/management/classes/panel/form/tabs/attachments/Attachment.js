(function () {

	Ext.require([
		'CMDBuild.core.configurations.DataFormat',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CATEGORY, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CREATION_DATE, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.METADATA, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.MODIFICATION_DATE, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.USER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VERSION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VERSIONABLE, type: 'boolean' }
		]
	});

})();
