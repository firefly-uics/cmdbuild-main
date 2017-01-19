(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', {
		extend: 'Ext.data.Model',

		/**
		 * Property used by advanced filter class to check if model is compatible
		 *
		 * @cfg {Boolean}
		 */
		isFilterAdvancedCompatible: true,

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CONFIGURATION, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.DEFAULT, type: 'boolean' }, // Flag used to mark filter as default for subject entryType
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENTRY_TYPE, type: 'string' }, // Entry type name
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TEMPLATE, type: 'boolean' } // Filter is marked as template if it's defined in administration side
		],

		/**
		 * @param {Array} destinationContainer
		 * @param {Array or Object} item
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		extractSimpleObjects: function (destinationContainer, item) {
			// Error handling
				if (!Ext.isArray(destinationContainer))
					return _error('extractSimpleObjects(): unmanaged destinationContainer parameter', this, destinationContainer);
			// END: Error handling

			if (Ext.isObject(item) && !Ext.Object.isEmpty(item)) {
				if (!Ext.isEmpty(item.and))
					return this.extractSimpleObjects(destinationContainer, item.and);

				if (!Ext.isEmpty(item.or))
					return this.extractSimpleObjects(destinationContainer, item.or);

				if (!Ext.isEmpty(item.simple))
					return destinationContainer.push(item.simple);
			} else if (Ext.isArray(item) && !Ext.isEmpty(item)) {
				Ext.Array.forEach(item, function (filterObject, i, allFilterObjects) {
					this.extractSimpleObjects(destinationContainer, filterObject);
				}, this);
			}
		},

		/**
		 * Recursive method to find all filter parameters with parameterType
		 *
		 * @param {Object} configuration
		 * @param {String} parameterType
		 * @param {Array} parameters
		 * @param {Boolean} onlyWithEmptyValue
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		findParameters: function (configuration, parameterType, parameters, onlyWithEmptyValue) {
			onlyWithEmptyValue = Ext.isBoolean(onlyWithEmptyValue) ? onlyWithEmptyValue : false;

			if (
				Ext.isObject(configuration) && !Ext.Object.isEmpty(configuration)
				&& Ext.isString(parameterType) && !Ext.isEmpty(parameterType)
				&& Ext.isArray(parameters)
			) {
				if (Ext.isObject(configuration.simple)) {
					var configurationParameter = configuration.simple;

					if (configurationParameter.parameterType == parameterType) {
						if (onlyWithEmptyValue)
							return Ext.Object.isEmpty(configurationParameter.value) ? parameters.push(configurationParameter) : null;

						return parameters.push(configurationParameter);
					}
				} else if (Ext.isArray(configuration.and) || Ext.isArray(configuration.or)) {
					var attributes = configuration.and || configuration.or;

					if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
						Ext.Array.each(attributes, function (attributeObject, i, allAttributeObjects) {
							this.findParameters(attributeObject, parameterType, parameters, onlyWithEmptyValue);
						}, this);
				}
			}
		},

		/**
		 * Implementation of model get custom routines:
		 * - on get description if description is empty return name property
		 *
		 * @param {String} propertyName
		 *
		 * @returns {Mixed}
		 *
		 * @override
		 */
		get: function (propertyName) {
			switch (propertyName) {
				case CMDBuild.core.constants.Proxy.DESCRIPTION:
					return this.callParent(arguments) || this.get(CMDBuild.core.constants.Proxy.NAME) || '';

				default:
					return this.callParent(arguments);
			}
		},

		/**
		 * @returns {Array} parameters
		 */
		getEmptyRuntimeParameters: function () {
			var parameters = [];

			this.findParameters(
				this.get(CMDBuild.core.constants.Proxy.CONFIGURATION)[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				parameters,
				true
			);

			return parameters;
		},

		/**
		 * @returns {Boolean}
		 */
		isEmpty: function () {
			return Ext.Object.isEmpty(this.get(CMDBuild.core.constants.Proxy.CONFIGURATION));
		},

		/**
		 * @returns {Boolean}
		 */
		isEmptyAdvanced: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

			return (
				Ext.isEmpty(configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE])
				&& Ext.isEmpty(configuration[CMDBuild.core.constants.Proxy.RELATION])
				&& Ext.isEmpty(configuration[CMDBuild.core.constants.Proxy.FUNCTIONS])
			);
		},

		/**
		 * @returns {Boolean}
		 */
		isEmptyBasic: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

			return Ext.isEmpty(configuration[CMDBuild.core.constants.Proxy.QUERY]);
		},

		/**
		 * Extract all simple objects from both filters (local and to be merged one) and rebuild merged filter
		 *
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 */
		mergeConfigurationWith: function (filter) {
			// Error handling
				if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter) || !filter.isFilterAdvancedCompatible)
					return _error('mergeWith(): unmanaged filter parameter', this, filter);
			// END: Error handling

			var configurationLocal = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				configurationOther = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				mergedFilterConfiguration = {};

			// Merge attribute
			if (
				!Ext.isEmpty(configurationLocal[CMDBuild.core.constants.Proxy.ATTRIBUTE])
				&& !Ext.isEmpty(configurationOther[CMDBuild.core.constants.Proxy.ATTRIBUTE])
			) {
				var mergedFilterItems = [],
					simpleObjects = [],
					simpleObjectsGroupedByName = {};

				this.extractSimpleObjects(simpleObjects, configurationLocal[CMDBuild.core.constants.Proxy.ATTRIBUTE]);
				this.extractSimpleObjects(simpleObjects, configurationOther[CMDBuild.core.constants.Proxy.ATTRIBUTE]);

				if (!Ext.isEmpty(simpleObjects)) {
					// Build filter attribute's groups
					Ext.Array.forEach(Ext.Array.unique(simpleObjects), function (simpleObject, i, allSimpleObjects) {
						var attributeName = simpleObject[CMDBuild.core.constants.Proxy.ATTRIBUTE];

						if (Ext.isString(attributeName) && !Ext.isEmpty(attributeName)) {
							var filterItemObject = {};
							filterItemObject[CMDBuild.core.constants.Proxy.SIMPLE] = simpleObject;

							if (Ext.isEmpty(simpleObjectsGroupedByName[attributeName]))
								simpleObjectsGroupedByName[attributeName] = [];

							simpleObjectsGroupedByName[attributeName].push(filterItemObject);
						}
					}, this);

					Ext.Object.each(simpleObjectsGroupedByName, function (name, objectsArray, myself) {
						if (objectsArray.length == 1) {
							mergedFilterItems.push(objectsArray[0]);
						} else {
							var itemObject = {};
							itemObject[CMDBuild.core.constants.Proxy.OR] = objectsArray;

							mergedFilterItems.push(itemObject);
						}
					}, this);
				}

				if (mergedFilterItems.length == 1) {
					mergedFilterConfiguration[CMDBuild.core.constants.Proxy.ATTRIBUTE] = mergedFilterItems[0];
				} else if (mergedFilterItems.length > 1) {
					mergedFilterConfiguration[CMDBuild.core.constants.Proxy.ATTRIBUTE] = {};
					mergedFilterConfiguration[CMDBuild.core.constants.Proxy.ATTRIBUTE][CMDBuild.core.constants.Proxy.AND] = mergedFilterItems;
				}
			}

			// Merge relation
			if (
				!Ext.isEmpty(configurationLocal[CMDBuild.core.constants.Proxy.RELATION])
				&& !Ext.isEmpty(configurationOther[CMDBuild.core.constants.Proxy.RELATION])
			) {
				mergedFilterConfiguration[CMDBuild.core.constants.Proxy.RELATION] = Ext.Array.merge(
					configurationOther[CMDBuild.core.constants.Proxy.RELATION],
					configurationLocal[CMDBuild.core.constants.Proxy.RELATION]
				);
			}

			// Merge functions
			if (
				!Ext.isEmpty(configurationLocal[CMDBuild.core.constants.Proxy.FUNCTIONS])
				&& !Ext.isEmpty(configurationOther[CMDBuild.core.constants.Proxy.FUNCTIONS])
			) {
				mergedFilterConfiguration[CMDBuild.core.constants.Proxy.FUNCTIONS] = Ext.Array.merge(
					configurationOther[CMDBuild.core.constants.Proxy.FUNCTIONS],
					configurationLocal[CMDBuild.core.constants.Proxy.FUNCTIONS]
				);
			}

			this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, mergedFilterConfiguration);
		},

		/**
		 * @returns {Void}
		 */
		resetRuntimeParametersValue: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				parameters = [];

			this.findParameters(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				parameters
			);

			Ext.Array.each(parameters, function (parameterObject, i, allParameterObjects) {
				if (Ext.isObject(parameterObject) && !Ext.Object.isEmpty(parameterObject))
					parameterObject[CMDBuild.core.constants.Proxy.VALUE] = [];
			}, this);

			this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
		},

		/**
		 * @returns {Void}
		 */
		resolveCalculatedParameters: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION);
			var parameters = [];

			this.findParameters(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE] || {},
				CMDBuild.core.constants.Proxy.CALCULATED,
				parameters
			);

			if (Ext.isArray(parameters) && !Ext.isEmpty(parameters)) {
				Ext.Array.each(parameters, function (claculatedParameter, i, allCalculatedParameters) {
					if (Ext.isObject(claculatedParameter) && !Ext.Object.isEmpty(claculatedParameter))
						claculatedParameter = this.resolveCalculatedParameterValue(claculatedParameter);
				}, this);

				this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
			}
		},

		/**
		 * @param {Object} parameter
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		resolveCalculatedParameterValue: function (parameter) {
			if (Ext.isObject(parameter) && !Ext.Object.isEmpty(parameter))
				switch (parameter.value[0]) {
					case '@MY_USER': {
						parameter.value[0] = String(CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.USER_ID));
					} break;

					case '@MY_GROUP': {
						parameter.value[0] = String(CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.DEFAULT_GROUP_ID));
					} break;
				}

			return parameter;
		},

		/**
		 * Implementation of model get custom routines:
		 * - on get description if description is empty return name property
		 *
		 * @param {String} fieldName
		 * @param {Object} newValue
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		set: function (fieldName, newValue) {
			if (fieldName != CMDBuild.core.constants.Proxy.DEFAULT)
				this[this.persistenceProperty][CMDBuild.core.constants.Proxy.DEFAULT] = false; // Remove default state on merge

			return this.callParent(arguments);
		},

		/**
		 * @param {Object} valuesObject
		 *
		 * @returns {Void}
		 */
		setRuntimeParameterValue: function (valuesObject) {
			// Error handling
				if (!Ext.isObject(valuesObject) || Ext.Object.isEmpty(valuesObject))
					return _error('setRuntimeParameterValue(): unmanaged parameter', this, valuesObject);
			// END: Error handling

			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				parameters = [];

			this.findParameters(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				parameters,
				true
			);

			Ext.Array.each(parameters, function (parameterObject, i, allParameterObjects) {
				if (Ext.isObject(parameterObject) && !Ext.Object.isEmpty(parameterObject)) {
					var value = valuesObject[parameterObject[CMDBuild.core.constants.Proxy.ATTRIBUTE]];

					if (!Ext.isEmpty(value))
						parameterObject[CMDBuild.core.constants.Proxy.VALUE] = [value];
				}
			}, this);

			this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
		}
	});

})();
