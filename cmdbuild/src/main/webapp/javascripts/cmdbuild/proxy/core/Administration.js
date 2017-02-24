(function () {

	Ext.define('CMDBuild.proxy.core.Administration', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllDashboards: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.dashboard.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DASHBOARD, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllDomains: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.domain.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DOMAIN, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entryType.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTRY_TYPE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllGroups: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllLookupTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.lookup.type.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.LOOKUP_TYPE, parameters);
		}
	});

})();
