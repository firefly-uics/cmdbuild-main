(function () {

	Ext.define('CMDBuild.controller.common.field.display.Reference', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.field.display.Reference'
		],

		/**
		 * @cfg {Mixed}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldDisplayReferenceDecodeValue'
		],

		/**
		 * @property {CMDBuild.view.common.field.display.Reference}
		 */
		view: undefined,

		/**
		 * Transforms string card's id value to object with card's description
		 *
		 * @param {String or Object} value
		 *
		 * @returns {Object or null}
		 */
		fieldDisplayReferenceDecodeValue: function (value) {
			// Error handling
				if (!Ext.isString(this.view.targetClassName) || Ext.isEmpty(this.view.targetClassName))
					return _error('onFieldDisplayReferenceValueSet(): unmanaged targetClassName property', this, this.view.targetClassName);
			// END: Error handling

			switch (Ext.typeOf(value)) {
				case 'string': {
					if (!Ext.isEmpty(value) && !isNaN(value)) {
						var params = {};
						params[CMDBuild.core.constants.Proxy.CARD_ID] = value;
						params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.view.targetClassName;

						CMDBuild.proxy.common.field.display.Reference.read({
							params: params,
							scope: this,
							success: function (response, options, decodedResponse) {
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CARD];

								if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
									var decodedValue = {};
									decodedValue[CMDBuild.core.constants.Proxy.DESCRIPTION] = decodedResponse['Description'];
									decodedValue[CMDBuild.core.constants.Proxy.ID] = decodedResponse['Id'];

									this.view.setValue(decodedValue);
								} else {
									_error('onFieldDisplayReferenceValueSet(): unmanaged response', this, decodedResponse);
								}
							}
						});
					}
				} break;

				case 'object':
					return Ext.isEmpty(value[CMDBuild.core.constants.Proxy.DESCRIPTION]) ? null : value[CMDBuild.core.constants.Proxy.DESCRIPTION];

				default:
					return null;
			}
		}
	});

})();
