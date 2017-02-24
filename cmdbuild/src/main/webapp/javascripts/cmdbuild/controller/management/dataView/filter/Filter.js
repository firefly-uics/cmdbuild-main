(function () {

	Ext.define('CMDBuild.controller.management.dataView.filter.Filter', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.GridAndForm',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.LoadMask',
			'CMDBuild.proxy.management.dataView.filter.Filter'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.DataView}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewFilterCacheEntryTypeGet',
			'dataViewFilterCacheEntryTypeGetAll',
			'dataViewFilterReset',
			'dataViewFilterSelectedCardGet = panelGridAndFormSelectedItemGet',
			'dataViewFilterSelectedCardIsEmpty = panelGridAndFormSelectedItemIsEmpty',
			'dataViewFilterSelectedCardReset',
			'dataViewFilterSourceEntryTypeAttributesGet',
			'dataViewFilterSourceEntryTypeAttributesIsEmpty',
			'dataViewFilterSourceEntryTypeGet = panelGridAndFormSelectedEntityGet',
			'dataViewFilterSourceEntryTypeIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
			'dataViewFilterStartCardGet',
			'dataViewFilterUiUpdate = panelGridAndFormUiUpdate',
			'dataViewFilterUiViewModeSet',
			'onDataViewFilterAbortButtonClick',
			'onDataViewFilterAddButtonClick',
			'onDataViewFilterCloneButtonClick',
			'onDataViewFilterModifyButtonClick = onDataViewFilterRecordDoubleClick',
			'panelGridAndFormFullScreenUiSetup = dataViewFilterFullScreenUiSetup',
			'panelGridAndFormToolsArrayBuild',
			'panelGridAndFormViewModeEquals = dataViewFilterUiViewModeEquals',
			'panelGridAndFormViewModeGet = dataViewFilterUiViewModeGet'
		],

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.grid.Grid}
		 */
		controllerGrid: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		localCacheEntryType: {
			byId: {},
			byName: {}
		},

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.grid.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.management.dataView.filter.PreviousCard}
		 *
		 * @private
		 */
		previousSelection: undefined,

		/**
		 * @property {CMDBuild.model.management.dataView.filter.SelectedCard}
		 *
		 * @private
		 */
		selectedCard: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		sourceEntryTypeAttributes: {},

		/**
		 * @property {CMDBuild.model.management.dataView.filter.StartCard}
		 *
		 * @private
		 */
		startCard: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.FilterView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.DataView} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Managed view mode
			this.viewModeManaged.push('clone');

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.FilterView', { delegate: this });

			// View reset
			this.view.removeAll();
			this.view.removeDocked(this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP));

			// Build sub-controllers
			this.controllerForm = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.Form', { parentDelegate: this });
			this.controllerGrid = Ext.create('CMDBuild.controller.management.dataView.filter.panel.grid.Grid', { parentDelegate: this });

			// Build view
			this.view.add([
				this.grid = this.controllerGrid.getView(),
				this.form = this.controllerForm.getView()
			]);
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterAbortButtonClick: function () {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'top' });
			this.cmfg('dataViewFilterReset');
			this.cmfg('dataViewFilterSelectedCardReset');
			this.cmfg('dataViewFilterUiViewModeSet');

			// Forward to sub-controllers
			if (!this.dataViewFilterPreviousSelectionIsEmpty())
				return this.cmfg('dataViewFilterUiUpdate', { cardId: this.dataViewFilterPreviousSelectionGet(CMDBuild.core.constants.Proxy.ID) });

			return this.controllerForm.cmfg('dataViewFilterFormUiUpdate');
		},

		/**
		 * Similar to dataViewFilterUiUpdate implementation except for entityId parameter and some other details
		 *
		 * @param {Object} parameters
		 * @param {Number} parameters.id
		 *
		 * @returns {Void}
		 */
		onDataViewFilterAddButtonClick: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isNumber(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('onDataViewFilterAddButtonClick(): unmanaged id parameter', this, parameters.id);
			// END: Error handling

			// UI reset
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('dataViewFilterReset');
			this.cmfg('dataViewFilterUiViewModeSet', 'add');

			// Local variables reset
			this.cmfg('dataViewFilterSelectedCardReset');
			this.dataViewFilterStartCardReset();

			this.dataViewFilterStartCardSet({
				value: {
					status: true,
					classId: parameters.id
				}
			});

			this.setViewTitle(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

			// Forward to sub-controllers
			this.controllerForm.cmfg('dataViewFilterFormUiUpdate', { tabToSelect: 0 });
			this.controllerGrid.cmfg('dataViewFilterGridUiUpdate');
		},

		// LocalCacheEntryType property functions
			/**
			 * @param {Object} parameters
			 * @param {Number} parameters.id
			 * @param {String} parameters.name
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			dataViewFilterCacheEntryTypeExists: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isNumber(parameters.id) && !Ext.isEmpty(parameters.id))
					return !Ext.isEmpty(this.localCacheEntryType.byId[parameters.id]);

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return !Ext.isEmpty(this.localCacheEntryType.byName[parameters.name]);

				return false;
			},

			/**
			 * @param {Object} parameters
			 * @param {Number} parameters.id
			 * @param {String} parameters.name
			 *
			 * @returns {CMDBuild.model.management.dataView.filter.entryType.EntryType or null}
			 */
			dataViewFilterCacheEntryTypeGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isNumber(parameters.id) && !Ext.isEmpty(parameters.id))
					return this.localCacheEntryType.byId[parameters.id];

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return this.localCacheEntryType.byName[parameters.name];

				return null;
			},

			/**
			 * @returns {Array}
			 */
			dataViewFilterCacheEntryTypeGetAll: function () {
				return Ext.Object.getValues(this.localCacheEntryType.byName);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			dataViewFilterCacheEntryTypeReset: function () {
				this.localCacheEntryType = {
					byId: {},
					byName: {}
				};
			},

			/**
			 * @param {Array} entryTypeArray
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterCacheEntryTypeSet: function (entryTypeArray) {
				this.dataViewFilterCacheEntryTypeReset();

				if (Ext.isArray(entryTypeArray) && !Ext.isEmpty(entryTypeArray))
					Ext.Array.forEach(entryTypeArray, function (entryTypeObject, i, allEntryTypeObjects) {
						if (Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject)) {
							var model = Ext.create('CMDBuild.model.management.dataView.filter.entryType.EntryType', entryTypeObject);

							this.localCacheEntryType.byId[model.get(CMDBuild.core.constants.Proxy.ID)] = model;
							this.localCacheEntryType.byName[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterCloneButtonClick: function () {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('dataViewFilterUiViewModeSet', 'clone');

			this.dataViewFilterSelectedCardSet({
				propertyName: CMDBuild.core.constants.Proxy.ID,
				value: null
			});

			// Forward to sub-controllers
			this.controllerForm.cmfg('dataViewFilterFormUiUpdate', { tabToSelect: 0 });
			this.controllerGrid.cmfg('dataViewFilterGridUiUpdate');
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterModifyButtonClick: function () {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('dataViewFilterUiViewModeSet', 'edit');

			// Forward to sub-controllers
			this.controllerForm.cmfg('dataViewFilterFormUiUpdate');
		},

		// PreviousSelection property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			dataViewFilterPreviousSelectionGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousSelection';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			dataViewFilterPreviousSelectionIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousSelection';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 */
			dataViewFilterPreviousSelectionReset: function () {
				return this.propertyManageReset('previousSelection');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterPreviousSelectionSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.filter.PreviousCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousSelection';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		dataViewFilterReset: function () {
			this.controllerForm.cmfg('dataViewFilterFormReset');
			this.controllerGrid.cmfg('dataViewFilterGridReset');
		},

		// StartCard property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewFilterStartCardGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'startCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterStartCardReset: function () {
				this.dataViewFilterStartCardSet({
					value: {
						status: false
					}
				});
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterStartCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.filter.StartCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'startCard';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.cardId
		 * @param {CMDBuild.model.common.Filter} parameters.filter
		 * @param {Boolean} parameters.sortersReset
		 * @param {Object} parameters.scope
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 * @param {Object} parameters.tabToSelect
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 */
		dataViewFilterUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.cardId = Ext.isNumber(parameters.cardId) ? parameters.cardId : null;
			parameters.viewMode = Ext.isString(parameters.viewMode) ? parameters.viewMode : 'read';

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewFilterUiUpdate(): unmanaged selectedDataView property', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			// UI reset
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'top' });
			this.cmfg('dataViewFilterReset');
			this.cmfg('dataViewFilterUiViewModeSet', parameters.viewMode);

			// Local variables reset
			this.cmfg('dataViewFilterSelectedCardReset');
			this.dataViewFilterPreviousSelectionReset();
			this.dataViewFilterStartCardReset();

			if (this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.TYPE) == 'filter') {
				CMDBuild.core.LoadMask.show(); // Manual loadMask manage

				this.readAllEntryTypes(function () {
					this.readAttributes(function () {
						this.readCard(parameters.cardId, function () {
							CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

							this.setViewTitle(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

							// Forward to sub-controllers
							this.controllerForm.cmfg('dataViewFilterFormUiUpdate', { tabToSelect: parameters.tabToSelect });
							this.controllerGrid.cmfg('dataViewFilterGridUiUpdate', {
								filter: parameters.filter,
								sortersReset: parameters.sortersReset,
								storeLoad: parameters.storeLoad,
								scope: parameters.scope,
								callback: parameters.callback
							});
						});
					});
				});
			}
		},

		/**
		 * Customization of panelGridAndFormViewModeSet() to avoid processes edit mode
		 *
		 * @param {String} mode
		 *
		 * @returns {Void}
		 */
		dataViewFilterUiViewModeSet: function (mode) {
			mode = Ext.isString(mode) ? mode : 'read';

			if (this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.TYPE) == CMDBuild.core.constants.Global.getTableTypeWorkflow())
				mode = 'readOnly';

			return this.panelGridAndFormViewModeSet(mode);
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readAllEntryTypes: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.management.dataView.filter.Filter.readAllEntryTypes({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.dataViewFilterCacheEntryTypeSet(decodedResponse);

						Ext.callback(callback, this);
					} else {
						_error('readAllEntryTypes(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readAttributes: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (this.cmfg('dataViewFilterSourceEntryTypeIsEmpty'))
					return _error('readAttributes(): unmanaged sourceEntryType property', this, this.cmfg('dataViewFilterSourceEntryTypeGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.management.dataView.filter.Filter.readAttributes({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.dataViewFilterSourceEntryTypeAttributesSet(decodedResponse);

						Ext.callback(callback, this);
					} else {
						_error('readAttributes(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.callback
		 * @param {Number} parameters.id
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readCard: function (id, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (this.cmfg('dataViewFilterSourceEntryTypeIsEmpty'))
					return _error('readCard(): unmanaged sourceEntryType property', this, this.cmfg('dataViewFilterSourceEntryTypeGet'));
			// END: Error handling

			if (Ext.isNumber(id) && !Ext.isEmpty(id)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = id;
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

				return CMDBuild.proxy.management.dataView.filter.Filter.readCard({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CARD];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							this.dataViewFilterSelectedCardSet({ value: decodedResponse });

							Ext.callback(callback, this);
						} else {
							_error('readCard(): unmanaged response', this, decodedResponse);
						}
					}
				});
			}

			return Ext.callback(callback, this);
		},

		// SelectedCard property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewFilterSelectedCardGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			dataViewFilterSelectedCardIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 */
			dataViewFilterSelectedCardReset: function () {
				this.propertyManageReset('selectedCard');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterSelectedCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.filter.SelectedCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';

					this.propertyManageSet(parameters);

					// Manage previous selected Card
					if (!this.cmfg('dataViewFilterSelectedCardIsEmpty'))
						this.dataViewFilterPreviousSelectionSet({ value: this.cmfg('dataViewFilterSelectedCardGet').getData() });
				}
			},

		/**
		 * SourceEntryType property functions
		 *
		 * Service methods for compatibility mode with panel base classes
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewFilterSourceEntryTypeGet: function (attributePath) {
				attributePath = Ext.isArray(attributePath) ? Ext.Array.clean(attributePath) : Ext.Array.clean([attributePath]);

				var sourceEntryType = this.cmfg('dataViewFilterCacheEntryTypeGet', {
					name: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME)
				});

				if (Ext.isObject(sourceEntryType) && !Ext.Object.isEmpty(sourceEntryType)) {
					if (!Ext.isEmpty(attributePath))
						return sourceEntryType.get(attributePath);

					return sourceEntryType;
				}

				return undefined;
			},

			/**
			 * @returns {Boolean}
			 */
			dataViewFilterSourceEntryTypeIsEmpty: function () {
				return !this.dataViewFilterCacheEntryTypeExists({ name: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME) });
			},

		// SourceEntryTypeAttributes property functions
			/**
			 * @param {String} name
			 *
			 * @returns {Array or CMDBuild.model.management.dataView.filter.Attribute}
			 */
			dataViewFilterSourceEntryTypeAttributesGet: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return this.sourceEntryTypeAttributes[name];

				return Ext.Object.getValues(this.sourceEntryTypeAttributes);
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Boolean}
			 */
			dataViewFilterSourceEntryTypeAttributesIsEmpty: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return Ext.isEmpty(this.sourceEntryTypeAttributes[name]);

				return Ext.isEmpty(this.sourceEntryTypeAttributes);
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterSourceEntryTypeAttributesSet: function (attributes) {
				this.sourceEntryTypeAttributes = {};

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.forEach(attributes, function (attributeObject, i, allAttributeObjects) {
						if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject))
							this.sourceEntryTypeAttributes[attributeObject[CMDBuild.core.constants.Proxy.NAME]] = Ext.create('CMDBuild.model.management.dataView.filter.Attribute', attributeObject);
					}, this);
			}
	});

})();
