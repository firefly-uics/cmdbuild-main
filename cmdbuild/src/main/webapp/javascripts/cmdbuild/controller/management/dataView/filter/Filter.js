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
			'dataViewFilterPreviousCardGet',
			'dataViewFilterPreviousCardIsEmpty',
			'dataViewFilterPreviousCardReset',
			'dataViewFilterReset',
			'dataViewFilterSelectedCardAttributesGet',
			'dataViewFilterSelectedCardAttributesIsEmpty',
			'dataViewFilterSelectedCardGet',
			'dataViewFilterSelectedCardIsEmpty',
			'dataViewFilterSelectedCardReset',
			'dataViewFilterSelectedDataViewAttributesGet',
			'dataViewFilterSelectedDataViewAttributesIsEmpty',
			'dataViewFilterSourceEntryTypeGet = panelGridAndFormSelectedEntityGet',
			'dataViewFilterSourceEntryTypeIsEmpty',
			'dataViewFilterUiUpdate',
			'onDataViewFilterAbortButtonClick',
			'onDataViewFilterAddButtonClick',
			'onDataViewFilterModifyButtonClick',
			'onDataViewFilterRecordDoubleClick',
			'panelGridAndFormFullScreenUiSetup = dataViewFilterFullScreenUiSetup',
			'panelGridAndFormToolsArrayBuild',
			'panelGridAndFormViewModeIsEdit = dataViewFilterUiViewModeIsEdit',
			'panelGridAndFormViewModeSet = dataViewFilterUiViewModeSet'
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
		previousCard: undefined,

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
		selectedCardAttributes: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		selectedDataViewAttributes: {},

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
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildLocalCache: function (callback) {
			this.buildLocalCacheEntryType(function () {
				this.buildLocalCacheDataViewAttributes(callback);
			});
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildLocalCacheDataViewAttributes: function (callback) {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('buildLocalCacheDataViewAttributes(): empty selected dataView', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME);

			CMDBuild.proxy.management.dataView.filter.Filter.readAttributes({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.dataViewFilterSelectedDataViewAttributesSet(decodedResponse);

						if (Ext.isFunction(callback))
							Ext.callback(callback, this);
					} else {
						_error('buildLocalCacheDataViewAttributes(): unmanaged response', this, decodedResponse);
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
		buildLocalCacheEntryType: function (callback) {
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

						if (Ext.isFunction(callback))
							Ext.callback(callback, this);
					} else {
						_error('buildLocalCacheEntryType(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.cardId
		 * @param {String} parameters.className - internal use
		 * @param {Boolean} parameters.enableFilterReset
		 * @param {Boolean} parameters.forceStoreLoad
		 * @param {Number} parameters.position
		 * @param {Boolean} parameters.resetSorters
		 * @param {Object} parameters.scope
		 * @param {Object} parameters.tabToSelect
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 */
		dataViewFilterUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.cardId = Ext.isNumber(parameters.cardId) ? parameters.cardId : null;
			parameters.className = Ext.isString(parameters.className) ? parameters.className
				: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME);
			parameters.viewMode = Ext.isString(parameters.viewMode) ? parameters.viewMode : 'read';

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewFilterUiUpdate(): empty selected dataView', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'top' });
			this.cmfg('dataViewFilterPreviousCardReset');
			this.cmfg('dataViewFilterSelectedCardReset');
			this.cmfg('dataViewFilterUiViewModeSet', parameters.viewMode);

			if (this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.TYPE) == 'filter') {
				CMDBuild.core.LoadMask.show(); // Manual loadMask manage

				this.buildLocalCache(function () {
					if (Ext.isEmpty(parameters.cardId)) {
						CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

						this.setViewTitle(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

						// Forward to sub-controllers
						this.controllerForm.cmfg('dataViewFilterFormUiUpdate', { tabToSelect: parameters.tabToSelect });
						this.controllerGrid.cmfg('dataViewFilterGridUiUpdate', {
							enableFilterReset: parameters.enableFilterReset,
							forceStoreLoad: parameters.forceStoreLoad,
							position: parameters.position,
							resetSorters: parameters.resetSorters,
							scope: parameters.scope,
							callback: parameters.callback
						});
					} else {
						this.readSelectedCardData({
							cardId: parameters.cardId,
							className: parameters.className,
							scope: this,
							callback: function () {
								this.readSelectedCardAttributes({
									scope: this,
									callback: function () {
										CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

										// History record save
										if (!this.cmfg('dataViewSelectedDataViewIsEmpty') && !this.cmfg('dataViewFilterSelectedCardIsEmpty'))
											CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
												moduleId: this.cmfg('dataViewIdentifierGet'),
												entryType: {
													description: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
													id: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
													object: this.cmfg('dataViewSelectedDataViewGet')
												},
												item: {
													description: this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
														|| this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CODE),
													id: this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
													object: this.cmfg('dataViewFilterSelectedCardGet')
												}
											});

										this.setViewTitle(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

										// Forward to sub-controllers
										this.controllerForm.cmfg('dataViewFilterFormUiUpdate', { tabToSelect: parameters.tabToSelect });
										this.controllerGrid.cmfg('dataViewFilterGridUiUpdate', {
											enableFilterReset: parameters.enableFilterReset,
											forceStoreLoad: parameters.forceStoreLoad,
											position: parameters.position,
											resetSorters: parameters.resetSorters,
											scope: parameters.scope,
											callback: parameters.callback
										});
									}
								});
							}
						});
					}
				});
			}
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
		onDataViewFilterAbortButtonClick: function () {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'top' });
			this.cmfg('dataViewFilterSelectedCardReset');
			this.cmfg('dataViewFilterReset');
			this.cmfg('dataViewFilterUiViewModeSet');

			// Forward to sub-controllers
			this.controllerForm.cmfg('onDataViewFilterFormAbortButtonClick');

			// Manage previous selected Card
			if (this.cmfg('dataViewFilterSelectedCardIsEmpty') && !this.cmfg('dataViewFilterPreviousCardIsEmpty'))
				this.cmfg('dataViewFilterUiUpdate', {
					cardId: this.cmfg('dataViewFilterPreviousCardGet', CMDBuild.core.constants.Proxy.ID),
					className: this.cmfg('dataViewFilterPreviousCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME)
				});
		},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 */
		onDataViewFilterAddButtonClick: function (id) {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('dataViewFilterSelectedCardReset');
			this.cmfg('dataViewFilterUiViewModeSet', 'edit');

			// Forward to sub-controllers
			this.controllerForm.cmfg('onDataViewFilterFormAddButtonClick', id);
			this.controllerGrid.cmfg('onDataViewFilterGridAddButtonClick', id);
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterModifyButtonClick: function () {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('dataViewFilterUiViewModeSet', 'edit');

			// Forward to sub-controllers
			this.controllerForm.cmfg('onDataViewFilterFormModifyButtonClick');
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterRecordDoubleClick: function () {
			this.cmfg('dataViewFilterFullScreenUiSetup', { maximize: 'bottom' });

			// Forward to sub-controllers
			this.controllerForm.cmfg('onDataViewFilterFormRecordDoubleClick');
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterReset: function () {
			this.controllerForm.cmfg('dataViewFilterFormReset');
			this.controllerGrid.cmfg('dataViewFilterGridReset');
		},

		// PreviousCard property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewFilterPreviousCardGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			dataViewFilterPreviousCardIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 */
			dataViewFilterPreviousCardReset: function () {
				return this.propertyManageReset('previousCard');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterPreviousCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.filter.PreviousCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousCard';

					this.propertyManageSet(parameters);
				}
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
						this.dataViewFilterPreviousCardSet({ value: this.cmfg('dataViewFilterSelectedCardGet').getData() });
				}
			},

		// SelectedCardAttributes property functions
			/**
			 * @param {String} name
			 *
			 * @returns {Array or CMDBuild.model.management.dataView.filter.Attribute}
			 */
			dataViewFilterSelectedCardAttributesGet: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return this.selectedCardAttributes[name];

				return Ext.Object.getValues(this.selectedCardAttributes);
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Boolean}
			 */
			dataViewFilterSelectedCardAttributesIsEmpty: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return Ext.isEmpty(this.selectedCardAttributes[name]);

				return Ext.isEmpty(this.selectedCardAttributes);
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterSelectedCardAttributesSet: function (attributes) {
				this.selectedCardAttributes = {};

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.each(attributes, function (attributeObject, i, allAttributeObjects) {
						if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject))
							this.selectedCardAttributes[attributeObject[CMDBuild.core.constants.Proxy.NAME]] = Ext.create('CMDBuild.model.management.dataView.filter.Attribute', attributeObject);
					}, this);
			},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readSelectedCardAttributes: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('readSelectedCardAttributes(): unmanaged selectedCard property', this, this.cmfg('dataViewFilterSelectedCardGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);

			CMDBuild.proxy.management.dataView.filter.Filter.readAttributes({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.dataViewFilterSelectedCardAttributesSet(decodedResponse);

						if (Ext.isFunction(parameters.callback))
							Ext.callback(parameters.callback, parameters.scope);
					} else {
						_error('readSelectedCardAttributes(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.callback
		 * @param {Number} parameters.cardId
		 * @param {String} parameters.className
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readSelectedCardData: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (!Ext.isNumber(parameters.cardId) || Ext.isEmpty(parameters.cardId))
					return _error('readSelectedCardData(): unmanaged cardId parameter', this, parameters.cardId);

				if (!Ext.isString(parameters.className) || Ext.isEmpty(parameters.className))
					return _error('readSelectedCardData(): unmanaged className parameter', this, parameters.className);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = parameters.cardId;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = parameters.className;

			CMDBuild.proxy.management.dataView.filter.Filter.readCard({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CARD];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.dataViewFilterSelectedCardSet({ value: decodedResponse });

						if (Ext.isFunction(parameters.callback))
							Ext.callback(parameters.callback, parameters.scope);
					} else {
						_error('readSelectedCardData(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		// SelectedDataViewAttributes property functions
			/**
			 * @param {String} name
			 *
			 * @returns {Array or CMDBuild.model.management.dataView.filter.Attribute}
			 */
			dataViewFilterSelectedDataViewAttributesGet: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return this.selectedDataViewAttributes[name];

				return Ext.Object.getValues(this.selectedDataViewAttributes);
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Boolean}
			 */
			dataViewFilterSelectedDataViewAttributesIsEmpty: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return Ext.isEmpty(this.selectedDataViewAttributes[name]);

				return Ext.isEmpty(this.selectedDataViewAttributes);
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterSelectedDataViewAttributesSet: function (attributes) {
				this.selectedDataViewAttributes = {};

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.each(attributes, function (attributeObject, i, allAttributeObjects) {
						if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject))
							this.selectedDataViewAttributes[attributeObject[CMDBuild.core.constants.Proxy.NAME]] = Ext.create('CMDBuild.model.management.dataView.filter.Attribute', attributeObject);
					}, this);
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
			}
	});

})();
