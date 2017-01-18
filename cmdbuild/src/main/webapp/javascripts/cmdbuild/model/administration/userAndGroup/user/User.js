(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.userAndGroup.user.User', { // FIXME: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'defaultgroup', type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.EMAIL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.PRIVILEGED, type: 'boolean', defaultValue: false },
			{ name: CMDBuild.core.constants.Proxy.SERVICE, type: 'boolean', defaultValue: false }
		]
	});

})();
