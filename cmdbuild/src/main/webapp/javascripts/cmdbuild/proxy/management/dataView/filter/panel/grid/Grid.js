(function () {

	Ext.define('CMDBuild.proxy.management.dataView.filter.panel.grid.Grid', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.management.dataView.filter.panel.grid.Record',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.proxy.management.dataView.filter.panel.grid.Reader'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CARD, {
				autoLoad: false,
				model: 'CMDBuild.model.management.dataView.filter.panel.grid.Record',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.card.readAll,
					reader: {
						type: 'classstore',
						root: CMDBuild.core.constants.Proxy.ROWS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					}
				}
			});
		},

		/**
		 * Get the position on the DB of the required card, considering the sorting and current filter applied on the grid
		 *
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readPosition: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.getPosition });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		}
	});

})();
