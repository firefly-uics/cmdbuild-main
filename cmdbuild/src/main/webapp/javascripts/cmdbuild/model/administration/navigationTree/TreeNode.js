(function() {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.navigationTree.TreeNode', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DOMAIN, type: 'auto', defaultValue: {} }, // CMDBuild.model.administration.navigationTree.Domain
			{ name: CMDBuild.core.constants.Proxy.ENABLE_RECURSION, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ENTRY_TYPE, type: 'auto', defaultValue: {} }, // CMDBuild.model.administration.navigationTree.Class
			{ name: CMDBuild.core.constants.Proxy.FILTER, type: 'string' }
		]
	});

})();
