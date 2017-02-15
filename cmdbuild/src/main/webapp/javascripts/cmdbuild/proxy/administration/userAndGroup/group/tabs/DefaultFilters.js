(function () {

	Ext.define('CMDBuild.proxy.administration.userAndGroup.group.tabs.DefaultFilters', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.administration.userAndGroup.group.defaultFilters.Filter'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreClassFilters: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.FILTER, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.group.defaultFilters.Filter',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.filter.group.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.FILTERS
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.defaults.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DEFAULT_FILTER, parameters);
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
		readAllGroupFilters: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.defaults.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DEFAULT_FILTER, parameters, true);
		}
	});

})();
