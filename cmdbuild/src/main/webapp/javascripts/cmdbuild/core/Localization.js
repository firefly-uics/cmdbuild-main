(function() {

	Ext.define('CMDBuild.core.Localization', {

		requires: [
			'CMDBuild.core.proxy.CMProxyConstants',
			'CMDBuild.core.proxy.localizations.Localizations'
		],

		constructor: function() {
			if (!Ext.isEmpty(CMDBuild) && !Ext.isEmpty(CMDBuild.configuration)) {
				CMDBuild.configuration[CMDBuild.core.proxy.CMProxyConstants.LOCALIZATION] = Ext.create('CMDBuild.model.configuration.Localization'); // Localization configuration object

				var configurationObject = CMDBuild.configuration[CMDBuild.core.proxy.CMProxyConstants.LOCALIZATION]; // Shorthand

				CMDBuild.core.proxy.localizations.Localizations.getLanguages({
					scope: this,
					success: function(result, options, decodedResult) {
						// Build all languages array
						configurationObject.setLanguages(decodedResult.translations);

						// Get server language
						CMDBuild.core.proxy.localizations.Localizations.getCurrentLanguage({
							success: function(result, options, languageDecodedResult) {
								configurationObject.setCurrentLanguage(languageDecodedResult[CMDBuild.core.proxy.CMProxyConstants.LANGUAGE]);
							}
						});
					}
				});
			} else {
				_error('CMDBuild or CMDBuild.configuration objects are empty', this);
			}
		}
	});

})();