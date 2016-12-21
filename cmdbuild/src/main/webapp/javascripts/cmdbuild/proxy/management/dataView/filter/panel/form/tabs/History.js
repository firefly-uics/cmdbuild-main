(function () {

	Ext.define('CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.HISTORY, {
				autoLoad: false,
				model: 'CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.history.classes.card.read,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS
					},
					extraParams: { // Avoid to send limit, page and start parameters in server calls
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.BEGIN_DATE, direction: 'DESC' }
				]
			});
		},

		/**
		 * @property {Object} parameters
		 *
		 * @returns {Void}
		 */
		readHistoric: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.history.classes.card.readHistoric });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.HISTORY, parameters);
		},

		/**
		 * @property {Object} parameters
		 *
		 * @returns {Void}
		 */
		readHistoricRelation: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.history.classes.card.readHistoricRelation });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.HISTORY, parameters);
		},

		/**
		 * @property {Object} parameters
		 *
		 * @returns {Void}
		 */
		readRelations: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.history.classes.card.readRelations });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.HISTORY, parameters);
		}
	});

})();
