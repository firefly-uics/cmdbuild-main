(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.management.classes.panel.form.tabs.domains.Grid
	 *
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.administration.workflow.tabs.domains.Grid', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'class1', type: 'string' },
			{ name: 'class2', type: 'string' },
			{ name: 'descrdir', type: 'string' },
			{ name: 'descrinv', type: 'string' },
			{ name: 'md', type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CARDINALITY, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID_DOMAIN, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.INHERITED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' }
		]
	});

})();
