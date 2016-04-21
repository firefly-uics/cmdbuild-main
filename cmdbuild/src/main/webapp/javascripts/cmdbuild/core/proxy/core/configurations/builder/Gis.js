(function () {

	Ext.define('CMDBuild.core.proxy.core.configurations.builder.Gis', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.proxy.Index'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;
			parameters.params = Ext.isEmpty(parameters.params) ? {} : parameters.params;
			parameters.params[CMDBuild.core.constants.Proxy.NAME] = 'gis';

			Ext.apply(parameters, { url: CMDBuild.core.proxy.Index.configuration.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CONFIGURATION, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readTreeNavigation: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.core.proxy.Index.gis.readTreeNavigation });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters);
		}
	});

})();
