(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.Utils'
	]);

	Ext.define('CMDBuild.model.common.Filter', {
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
		 * Override to permits multilevel get with a single function and custom routine:
		 * 	- on get description if description is empty return name property
		 *
		 * @param {Array or String} property
		 *
		 * @returns {Mixed or null}
		 *
		 * @override
		 */
		get: function (property) {
			if (Ext.isArray(property) && !Ext.isEmpty(property)) {
				var returnValue = this;

				Ext.Array.forEach(property, function (propertyName, i, allPropertyNames) {
					if (Ext.isObject(returnValue) && !Ext.Object.isEmpty(returnValue))
						if (Ext.isFunction(returnValue.get)) { // Ext.data.Model manage
							returnValue = returnValue.get(propertyName);
						} else if (!Ext.isEmpty(returnValue[propertyName])) { // Simple object manage
							returnValue = returnValue[propertyName];
						} else { // Not found
							returnValue = null;
						}
				}, this);

				return returnValue;
			}

			switch (property) {
				case CMDBuild.core.constants.Proxy.DESCRIPTION:
					return (
						this.callParent(arguments)
						|| this.get(CMDBuild.core.constants.Proxy.NAME)
						|| ''
					);

				default:
					return this.callParent(arguments);
			}
		},

		/**
		 * @returns {Array} parameters
		 */
		getEmptyRuntimeParameters: function () {
			var parameters = [];

			this.simpleObjectsFindByType(
				this.get([CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.ATTRIBUTE]),
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
			return Ext.isEmpty(
				this.get([CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.QUERY])
			);
		},

		// Merge manage methods
			/**
			 *
			 *
			 * @param {CMDBuild.model.common.Filter} filter
			 *
			 * @returns {Void}
			 */
			mergeConfigurations: function (filter) {
				// Error handling
					if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter) || !filter.isFilterAdvancedCompatible)
						return _error('mergeConfigurations(): unmanaged filter parameter', this, filter);
				// END: Error handling

				var configurationLocal = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
					configurationOther = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
					mergedFilterConfiguration = {};

				// Merge attribute
				var attribute = this.mergeConfigurationsAttributes(
					configurationLocal[CMDBuild.core.constants.Proxy.ATTRIBUTE],
					configurationOther[CMDBuild.core.constants.Proxy.ATTRIBUTE]
				);

				if (!Ext.Object.isEmpty(attribute))
					mergedFilterConfiguration[CMDBuild.core.constants.Proxy.ATTRIBUTE] = attribute;

				// Merge relation
					var relation = this.mergeConfigurationsRelation(
						configurationLocal[CMDBuild.core.constants.Proxy.RELATION],
						configurationOther[CMDBuild.core.constants.Proxy.RELATION]
					);

					if (!Ext.isEmpty(relation))
						mergedFilterConfiguration[CMDBuild.core.constants.Proxy.RELATION] = relation;

				// Merge functions
					var functions = this.mergeConfigurationsFunctions(
						configurationLocal[CMDBuild.core.constants.Proxy.FUNCTIONS],
						configurationOther[CMDBuild.core.constants.Proxy.FUNCTIONS]
					);

					if (!Ext.isEmpty(functions))
						mergedFilterConfiguration[CMDBuild.core.constants.Proxy.FUNCTIONS] = functions;

				// Merge query
					var query = this.mergeConfigurationsQuery(
						configurationLocal[CMDBuild.core.constants.Proxy.QUERY],
						configurationOther[CMDBuild.core.constants.Proxy.QUERY]
					);

					if (!Ext.isEmpty(query))
						mergedFilterConfiguration[CMDBuild.core.constants.Proxy.QUERY] = query;

				this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, mergedFilterConfiguration);
			},

			/**
			 * Extract all simple objects from both filters (local and to be merged one) and rebuild merged filter
			 *
			 * @param {Object} local
			 * @param {Object} other
			 *
			 * @returns {Object}
			 *
			 * @private
			 */
			mergeConfigurationsAttributes: function (local, other) {
				local = Ext.isObject(local) ? local : {};
				other = Ext.isObject(other) ? other : {};

				if (!Ext.Object.isEmpty(local) && !Ext.Object.isEmpty(other)) { // Merge objects
					var simpleObjects = [];

					this.simpleObjectsRecoursiveExtract(simpleObjects, local);
					this.simpleObjectsRecoursiveExtract(simpleObjects, other);

					if (Ext.isArray(simpleObjects) && !Ext.isEmpty(simpleObjects)) {
						var mergedAttributeObject = this.simpleObjectsGroupLogicRelationsFinalize(
							this.simpleObjectsGroupLogicRelationsBuild(
								this.simpleObjectsGroupByName(simpleObjects)
							)
						);

						if (Ext.isObject(mergedAttributeObject) && !Ext.isEmpty(mergedAttributeObject))
							return mergedAttributeObject;
					}
				}

				if (!Ext.Object.isEmpty(local) && Ext.Object.isEmpty(other)) // Return local
					return local;

				if (Ext.Object.isEmpty(local) && !Ext.Object.isEmpty(other)) // Return other
					return other;

				return {};
			},

			/**
			 * @param {Array} local
			 * @param {Array} other
			 *
			 * @returns {Array}
			 *
			 * @private
			 */
			mergeConfigurationsFunctions: function (local, other) {
				local = Ext.isArray(local) ? local : [];
				other = Ext.isArray(other) ? other : [];

				return Ext.Array.merge(local, other);
			},

			/**
			 * Prioritize local filter value
			 *
			 * @param {String} local
			 * @param {String} other
			 *
			 * @returns {String}
			 *
			 * @private
			 */
			mergeConfigurationsQuery: function (local, other) {
				if (Ext.isString(local) && !Ext.isEmpty(local))
					return local;

				if (Ext.isString(other) && !Ext.isEmpty(other))
					return other;

				return '';
			},

			/**
			 * @param {Array} local
			 * @param {Array} other
			 *
			 * @returns {Array}
			 *
			 * @private
			 */
			mergeConfigurationsRelation: function (local, other) {
				local = Ext.isArray(local) ? local : [];
				other = Ext.isArray(other) ? other : [];

				return Ext.Array.merge(local, other);
			},

		/**
		 * @returns {Void}
		 */
		resetRuntimeParametersValue: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				simpleObjects = [];

			this.simpleObjectsFindByType(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				simpleObjects
			);

			if (Ext.isArray(simpleObjects) && !Ext.isEmpty(simpleObjects)) {
				Ext.Array.forEach(simpleObjects, function (simpleObject, i, allSimpleObjects) {
					if (Ext.isObject(simpleObject) && !Ext.Object.isEmpty(simpleObject))
						simpleObjects[i][CMDBuild.core.constants.Proxy.VALUE] = [];
				}, this);

				var clearedAttributeObject = this.simpleObjectsGroupLogicRelationsFinalize(
					this.simpleObjectsGroupLogicRelationsBuild(
						this.simpleObjectsGroupByName(simpleObjects)
					)
				);

				if (Ext.isObject(clearedAttributeObject) && !Ext.Object.isEmpty(clearedAttributeObject))
					configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE] = clearedAttributeObject;

				this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
			}
		},

		/**
		 * @returns {Void}
		 */
		resolveCalculatedParameters: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				simpleObjects = [];

			this.simpleObjectsFindByType(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.CALCULATED,
				simpleObjects
			);

			if (Ext.isArray(simpleObjects) && !Ext.isEmpty(simpleObjects)) {
				Ext.Array.forEach(simpleObjects, function (simpleObject, i, allSimpleObjects) {
					if (Ext.isObject(simpleObject) && !Ext.Object.isEmpty(simpleObject))
						simpleObjects[i][CMDBuild.core.constants.Proxy.VALUE] = this.resolveCalculatedParameterValue(simpleObject[CMDBuild.core.constants.Proxy.VALUE])
				}, this);

				var resolvedAttributeObject = this.simpleObjectsGroupLogicRelationsFinalize(
					this.simpleObjectsGroupLogicRelationsBuild(
						this.simpleObjectsGroupByName(simpleObjects)
					)
				);

				if (Ext.isObject(resolvedAttributeObject) && !Ext.Object.isEmpty(resolvedAttributeObject))
					configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE] = resolvedAttributeObject;

				this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
			}
		},

		/**
		 * @param {Array} values
		 *
		 * @returns {Array} values
		 *
		 * @private
		 */
		resolveCalculatedParameterValue: function (values) {
			values = Ext.isArray(values) ? values : [];

			Ext.Array.forEach(values, function (value, i, allValues) {
				switch (value) {
					case '@MY_USER':
						return value[i] = String(CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.USER_ID));

					case '@MY_GROUP':
						return value[i] = String(CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.DEFAULT_GROUP_ID));
				}
			}, this);

			return values;
		},

		/**
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
				simpleObjects = [];

			this.simpleObjectsFindByType(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				simpleObjects,
				true
			);

			if (Ext.isArray(simpleObjects) && !Ext.isEmpty(simpleObjects)) {
				Ext.Array.forEach(simpleObjects, function (simpleObject, i, allSimpleObjects) {
					if (Ext.isObject(simpleObject) && !Ext.Object.isEmpty(simpleObject)) {
						var value = valuesObject[simpleObject[CMDBuild.core.constants.Proxy.ATTRIBUTE]];

						if (!Ext.isEmpty(value))
							simpleObjects[i][CMDBuild.core.constants.Proxy.VALUE] = Ext.Array.clean([value]);
					}
				}, this);

				var managedAttributeObject = this.simpleObjectsGroupLogicRelationsFinalize(
					this.simpleObjectsGroupLogicRelationsBuild(
						this.simpleObjectsGroupByName(simpleObjects)
					)
				);

				if (Ext.isObject(managedAttributeObject) && !Ext.Object.isEmpty(managedAttributeObject))
					configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE] = managedAttributeObject;

				this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
			}
		},

		// SimpleObjects manage functions
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
			simpleObjectsFindByType: function (configuration, parameterType, parameters, onlyWithEmptyValue) {
				onlyWithEmptyValue = Ext.isBoolean(onlyWithEmptyValue) ? onlyWithEmptyValue : false;

				// Error handling
					if (!Ext.isString(parameterType) || Ext.isEmpty(parameterType))
						return _error('simpleObjectsFindByType(): unmanaged parameterType parameter', this, parameterType);

					if (!Ext.isArray(parameters))
						return _error('simpleObjectsFindByType(): unmanaged parameters parameter', this, parameters);
				// END: Error handling

				var simpleObjects = [];

				this.simpleObjectsRecoursiveExtract(simpleObjects, configuration);

				Ext.Array.forEach(simpleObjects, function (simple, i, allSimple) {
					if (
						Ext.isObject(simple) && !Ext.Object.isEmpty(simple)
						&& simple.parameterType == parameterType
					) {
						if (onlyWithEmptyValue)
							return Ext.Object.isEmpty(simple.value) ? parameters.push(simple) : null;

						return parameters.push(simple);
					}
				}, this)
			},

			/**
			 * @param {Array} simpleObjects
			 *
			 * @returns {Object} groups
			 *
			 * @private
			 */
			simpleObjectsGroupByName: function (simpleObjects) {
				var groups = {};

				if (Ext.isArray(simpleObjects) && !Ext.isEmpty(simpleObjects))
					Ext.Array.forEach(simpleObjects, function (simpleObject, i, allSimpleObjects) {
						var attributeName = simpleObject[CMDBuild.core.constants.Proxy.ATTRIBUTE];

						if (Ext.isString(attributeName) && !Ext.isEmpty(attributeName)) {
							var filterItemObject = {};
							filterItemObject[CMDBuild.core.constants.Proxy.SIMPLE] = simpleObject;

							if (Ext.isEmpty(groups[attributeName]))
								groups[attributeName] = [];

							groups[attributeName].push(filterItemObject);
						}
					}, this);

				return groups;
			},

			/**
			 * Concatenate a simpleObjects grouped object with condition arrays
			 *
			 * @param {Object} groups
			 *
			 * @returns {Array} logicRelations
			 *
			 * @private
			 */
			simpleObjectsGroupLogicRelationsBuild: function (groups) {
				var logicRelations = [];

				if (Ext.isObject(groups) && !Ext.Object.isEmpty(groups))
					Ext.Object.each(groups, function (name, objectsArray, myself) {
						if (objectsArray.length == 1) {
							logicRelations.push(objectsArray[0]);
						} else {
							var itemObject = {};
							itemObject[CMDBuild.core.constants.Proxy.OR] = objectsArray;

							logicRelations.push(itemObject);
						}
					}, this);

				return logicRelations;
			},

			/**
			 * @param {Array} logicRelations
			 *
			 * @returns {Object}
			 *
			 * @private
			 */
			simpleObjectsGroupLogicRelationsFinalize: function (logicRelations) {
				if (logicRelations.length == 1)
					return logicRelations[0];

				if (logicRelations.length > 1) {
					var returnObject = {};
					returnObject[CMDBuild.core.constants.Proxy.AND] = logicRelations;

					return returnObject;
				}

				return {};
			},

			/**
			 * @param {Array} destinationContainer
			 * @param {Array or Object} item
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			simpleObjectsRecoursiveExtract: function (destinationContainer, item) {
				// Error handling
					if (!Ext.isArray(destinationContainer))
						return _error('simpleObjectsRecoursiveExtract(): unmanaged destinationContainer parameter', this, destinationContainer);
				// END: Error handling

				if (Ext.isObject(item) && !Ext.Object.isEmpty(item)) {
					if (!Ext.isEmpty(item.and))
						return this.simpleObjectsRecoursiveExtract(destinationContainer, item.and);

					if (!Ext.isEmpty(item.or))
						return this.simpleObjectsRecoursiveExtract(destinationContainer, item.or);

					if (!Ext.isEmpty(item.simple))
						return CMDBuild.core.Utils.arrayPushIfUnique(destinationContainer, Ext.clone(item.simple));
				} else if (Ext.isArray(item) && !Ext.isEmpty(item)) {
					Ext.Array.forEach(item, function (filterObject, i, allFilterObjects) {
						this.simpleObjectsRecoursiveExtract(destinationContainer, filterObject);
					}, this);
				}
			}
	});

})();
