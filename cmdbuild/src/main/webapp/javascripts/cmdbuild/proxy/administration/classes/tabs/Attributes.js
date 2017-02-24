(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.Attributes', {

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
		readAllEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entity.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTITY, parameters);
		}
	});

})();
