(function () {

	Ext.define('CMDBuild.proxy.userAndGroup.group.tabs.Users', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.userAndGroup.group.UsersGrid'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreGroupsUser: function (parameters) {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.USER, {
				autoLoad: false,
				model: 'CMDBuild.model.userAndGroup.group.UsersGrid',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.group.user.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS,
						totalProperty: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.TOTAL
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.NAME, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.user.save });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters, true);
		}
	});

})();

