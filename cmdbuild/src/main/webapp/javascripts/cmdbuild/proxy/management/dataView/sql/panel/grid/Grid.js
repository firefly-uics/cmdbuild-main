(function () {

	Ext.define('CMDBuild.proxy.management.dataView.sql.panel.grid.Grid', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.management.dataView.sql.panel.grid.Record',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.proxy.management.dataView.sql.panel.grid.Reader'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CARD, {
				autoLoad: false,
				model: 'CMDBuild.model.management.dataView.sql.panel.grid.Record',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.card.getSqlCardList,
					reader: {
						type: 'sqlstore',
						root: CMDBuild.core.constants.Proxy.CARDS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					}
				}
			});
		}
	});

})();
