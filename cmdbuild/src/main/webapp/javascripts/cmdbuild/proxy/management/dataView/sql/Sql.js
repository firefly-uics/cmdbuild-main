(function () {

	Ext.define('CMDBuild.proxy.management.dataView.sql.Sql', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.core.Utils',
			'CMDBuild.model.dataView.sql.GridStore',
			'CMDBuild.model.dataView.sql.Function'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.UNCACHED, {
				autoLoad: true,
				fields: parameters.fields || [],
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.card.getSqlCardList,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.CARDS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					},
					extraParams: parameters.extraParams || {}
				}
			});
		}
	});

})();
