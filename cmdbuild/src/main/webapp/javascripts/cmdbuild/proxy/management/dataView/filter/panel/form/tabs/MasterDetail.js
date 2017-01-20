(function () {

	Ext.define('CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail', {

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
		readAllClasses: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.getAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readForeignKeyTargetingClass: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.foreignKeyTargetClass });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		removeCard: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;
			parameters['important'] = true;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.remove });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		removeDetail: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.relation.removeDetail });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.RELATION, parameters, true);
		}
	});

})();
