(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.Domains', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.management.classes.panel.form.tabs.domains.Grid'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.DOMAIN, {
				autoLoad: false,
				model: 'CMDBuild.model.management.classes.panel.form.tabs.domains.Grid',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.domain.readAllByClass,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.DOMAINS
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
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
		readAllEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entity.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTITY, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		remove: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.domain.remove });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DOMAIN, parameters, true);
		}
	});

})();
