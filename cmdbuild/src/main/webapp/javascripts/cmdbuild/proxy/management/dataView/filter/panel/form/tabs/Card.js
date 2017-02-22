(function () {

	Ext.define('CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		// Lock/Unlock methods
			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			lock: function (parameters) {
				parameters = Ext.isEmpty(parameters) ? {} : parameters;

				Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.lock });

				CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			unlock: function (parameters) {
				parameters = Ext.isEmpty(parameters) ? {} : parameters;

				Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.unlock });

				CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
			},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		remove: function (parameters) {
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
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
		}
	});

})();
