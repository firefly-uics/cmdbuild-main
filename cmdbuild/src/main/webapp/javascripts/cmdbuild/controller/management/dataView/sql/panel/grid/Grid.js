(function () {

	Ext.define('CMDBuild.controller.management.dataView.sql.panel.grid.Grid', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.grid.Grid',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.Sql}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.common.Filter}
		 *
		 * @private
		 */
		appliedFilter: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewSqlGridAppliedFilterGet = panelGridAndFormListPanelAppliedFilterGet',
			'dataViewSqlGridAppliedFilterIsEmpty = panelGridAndFormListPanelAppliedFilterIsEmpty',
			'dataViewSqlGridReset',
			'dataViewSqlGridStoreGet = panelGridAndFormListPanelStoreGet',
			'dataViewSqlGridStoreLoad = panelGridAndFormListPanelStoreLoad',
			'dataViewSqlGridUiUpdate',
			'onDataViewSqlGridColumnChanged',
			'onDataViewSqlGridPrintButtonClick',
			'onDataViewSqlGridRecordSelect',
			'onDataViewSqlGridSortChange'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		controllerPrintWindow: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		controllerToolbarPaging: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.panel.grid.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.grid.GridPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.sql.Sql} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.sql.panel.grid.GridPanel', { delegate: this });

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });
			this.controllerToolbarPaging = Ext.create('CMDBuild.controller.management.dataView.sql.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				parentDelegate: this,
				disableFilterAdvanced: true
			});
			this.controllerToolbarTop = Ext.create('CMDBuild.controller.management.dataView.sql.panel.grid.toolbar.Top', { parentDelegate: this });

			// Add docked
			this.view.addDocked([
				this.controllerToolbarPaging.getView(),
				this.controllerToolbarTop.getView()
			]);
		},

		/**
		 * @param {Object} header
		 *
		 * @returns {String} value
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: delete when old FieldManager will be replaced (applyCustomRenderer)
		 */
		addRendererToHeader: function (header) {
			header.renderer = function (value, metadata, record, rowIndex, colIndex, store, view) {
				value = record.get(header.dataIndex);

				if (typeof value == 'undefined' || value == null) {
					return '';
				} else if (typeof value == 'object') {
					/**
					 * Some values (like reference or lookup) are serialized as object {id: "", description:""}.
					 * Here we display the description
					 */
					value = value.description;
				} else if (typeof value == 'boolean') { // Localize the boolean values
					value = value ? Ext.MessageBox.buttonText.yes : Ext.MessageBox.buttonText.no;
				} else if (typeof value == 'string') { // Strip HTML tags from strings in grid
					value = Ext.util.Format.stripTags(value);
				}

				return value;
			};
		},

		/**
		 * Custom renderer to work with "CMDBuild.model.management.dataView.sql.panel.grid.Record" custom get method
		 *
		 * @param {Object} column
		 * @param {CMDBuild.model.common.attributes.Attribute} columnModel
		 *
		 * @returns {Object} column
		 *
		 * @private
		 */
		applyCustomRenderer: function (column, columnModel) {
			switch (columnModel.get(CMDBuild.core.constants.Proxy.TYPE)) {
				case 'boolean':
					return Ext.apply(column, {
						renderer: function (value, metadata, record, rowIndex, colIndex, store, view) {
							value = record.get(column.dataIndex);

							return value ? CMDBuild.Translation.yes : CMDBuild.Translation.no; // Translate value
						}
					});

				default:
					return Ext.apply(column, {
						renderer: function (value, metadata, record, rowIndex, colIndex, store, view) {
							return Ext.util.Format.stripTags(record.get(column.dataIndex));
						}
					});
			}
		},

		/**
		 * Apply card selection
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Number} parameters.page
		 * @param {Number} parameters.position
		 * @param {Object} parameters.scope
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		applySelection: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.storeLoad = Ext.isString(parameters.storeLoad) ? parameters.storeLoad : null;

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('applySelection(): no selected dataView found', this);

				if (this.cmfg('dataViewSqlSelectedCardIsEmpty'))
					return _error('applySelection(): no selected card found', this);
			// END: Error handling

			if (this.cmfg('dataViewSqlGridStoreGet').currentPage != parameters.page || parameters.storeLoad == 'force')
				return this.cmfg('dataViewSqlGridStoreLoad', {
					disableFirstRowSelection: parameters.disableFirstRowSelection,
					page: parameters.page,
					scope: this,
					callback: function (records, operation, success) {
						this.positionItemGetSuccessCallback(parameters.position, {
							callback: parameters.callback,
							scope: parameters.scope
						});
					}
				});

			return this.positionItemGetSuccessCallback(parameters.position, {
				callback: parameters.callback,
				scope: parameters.scope
			});
		},

		// AppliedFilter property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewSqlGridAppliedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewSqlGridAppliedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSqlGridAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSqlGridAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * Apply interceptor with default store load callback actions, if callback is empty will be replaced with Ext.emptyFn
		 *
		 * @param {Function} callback
		 *
		 * @returns {Function}
		 *
		 * @private
		 */
		buildLoadCallback: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			return Ext.Function.createInterceptor(callback, function (records, options, success) {
				if (this.cmfg('dataViewSqlGridAppliedFilterIsEmpty'))
					this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingFilterAdvancedReset');
			}, this);
		},

		/**
		 * @returns {Array} columnsDefinition
		 *
		 * @private
		 */
		dataViewSqlGridBuildColumns: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewSqlFormTabCardUiUpdate(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewSqlSelectedDataSourceIsEmpty'))
					return _error('dataViewSqlFormTabCardUiUpdate(): empty selected dataSource property', this, this.cmfg('dataViewSqlSelectedDataSourceGet'));
			// END: Error handling

			var columnsDefinition = [],
				fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
				dataSourceOutputAttributes = this.cmfg('dataViewSqlSelectedDataSourceGet', CMDBuild.core.constants.Proxy.OUTPUT);

			Ext.Array.forEach(dataSourceOutputAttributes, function (attributeModel, i, allAttributeModels) {
				if (
					Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel)
					&& attributeModel.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION
				) {
					if (fieldManager.isAttributeManaged(attributeModel.get(CMDBuild.core.constants.Proxy.TYPE))) {
						fieldManager.attributeModelSet(attributeModel);
						fieldManager.push(
							columnsDefinition,
							this.applyCustomRenderer(fieldManager.buildColumn(), attributeModel)
						);
					} else if (attributeModel.get(CMDBuild.core.constants.Proxy.TYPE) != 'ipaddress') { // FIXME: future implementation - @deprecated - Old field manager
						var column = CMDBuild.Management.FieldManager.getHeaderForAttr(attributeModel.get(CMDBuild.core.constants.Proxy.SOURCE_OBJECT));

						if (Ext.isObject(column) && !Ext.Object.isEmpty(column)) {
							column.text = column.header; // Create alias of header property because it's deprecated

							// Remove width properties by default to be compatible with forceFit property
							delete column.flex;
							delete column.width;
							delete column.minWidth;

							this.addRendererToHeader(column);

							fieldManager.push(columnsDefinition, column);
						}
					}
				}
			}, this);

			Ext.Array.forEach(columnsDefinition, function (column, i, allColumns) {
				if (Ext.isObject(column) && !Ext.Object.isEmpty(column)) {
					column.hideable = false; // FIXME: waiting for server side implementation (attributes optimization)
					column.flex = 1; // FIX: grid reconfigure bug that breaks row width
				}
			}, this);

			return columnsDefinition;
		},

		/**
		 * @returns {Void}
		 */
		dataViewSqlGridReset: function () {
			this.view.getSelectionModel().deselectAll();
		},

		/**
		 * @returns {Ext.data.TreeStore}
		 */
		dataViewSqlGridStoreGet: function () {
			return this.view.getStore();
		},

		/**
		 * On load action sends by default record parameter witch isn't managed by server
		 * Manages store configurations like: filter, sorters, function
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Number} parameters.page
		 * @param {Object} parameters.params - additional load custom parameters
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		dataViewSqlGridStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : null;
			parameters.disableFirstRowSelection = Ext.isBoolean(parameters.disableFirstRowSelection) ? parameters.disableFirstRowSelection : false;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewSqlGridStoreLoad(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			// Manage callback
			if (!parameters.disableFirstRowSelection)
				parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : this.selectFirst;

			var params = Ext.isObject(parameters.params) ? parameters.params : {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(this.displayedParametersNamesGet());
			params[CMDBuild.core.constants.Proxy.FUNCTION] = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_FUNCTION);

			if (!this.cmfg('dataViewSqlGridAppliedFilterIsEmpty'))
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('dataViewSqlGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			this.storeExtraParamsSet(params); // Setup extraParams to work also with sorters and print report

			this.cmfg('dataViewSqlGridStoreGet').loadPage(parameters.page, {
				params: params,
				scope: Ext.isEmpty(parameters.scope) ? this : parameters.scope,
				callback: this.buildLoadCallback(parameters.callback)
			});
		},

		/**
		 * Setup store, columns and sorters
		 * Custom implementation because of absence of unique ID in SQL cards and because of no getPosition
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {CMDBuild.model.common.Filter} parameters.filter
		 * @param {Number} parameters.page
		 * @param {Number} parameters.position
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.sortersReset
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 *
		 * @returns {Void}
		 */
		dataViewSqlGridUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;
			parameters.sortersReset = Ext.isBoolean(parameters.sortersReset) ? parameters.sortersReset : false;

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewSqlGridUiUpdate(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			this.dataViewSqlGridAppliedFilterReset();

			if (Ext.isObject(parameters.filter) && !Ext.Object.isEmpty(parameters.filter) && parameters.filter.isFilterAdvancedCompatible)
				this.dataViewSqlGridAppliedFilterSet({ value: parameters.filter });

			switch (this.cmfg('dataViewSqlUiViewModeGet')) {
				default: {
					// Suspend events to avoid sortchange fire that will reset form
					this.view.suspendEvents(false);
					this.view.reconfigure(
						parameters.sortersReset ? this.storeSortersSet(this.cmfg('dataViewSqlGridStoreGet')) : null,
						this.dataViewSqlGridBuildColumns()
					);
					this.view.resumeEvents();

					// Forward to sub-controllers
					this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingUiUpdate');

					// Select selectedCard inside loaded store
					if (!this.cmfg('dataViewSqlSelectedCardIsEmpty'))
						return this.applySelection({
							disableFirstRowSelection: parameters.disableFirstRowSelection,
							page: parameters.page,
							position: parameters.position,
							storeLoad: parameters.storeLoad,
							scope: parameters.scope,
							callback: parameters.callback
						});

					// Load store and select first card
					return this.cmfg('dataViewSqlGridStoreLoad', {
						disableFirstRowSelection: parameters.disableFirstRowSelection,
						page: parameters.page,
						scope: parameters.scope,
						callback: parameters.callback
					});
				}
			}
		},

		/**
		 * @returns {Array} visibleColumnNames
		 *
		 * @private
		 */
		displayedParametersNamesGet: function () {
			var visibleColumns = this.view.query('gridcolumn:not([hidden])'),
				visibleColumnNames = [];

			// Build columns dataIndex array
			if (Ext.isArray(visibleColumns) && !Ext.isEmpty(visibleColumns))
				Ext.Array.forEach(visibleColumns, function (columnObject, i, allColumnObjects) {
					if (
						Ext.isObject(columnObject) && !Ext.Object.isEmpty(columnObject)
						&& !Ext.isEmpty(columnObject.dataIndex)
					) {
						visibleColumnNames.push(columnObject.dataIndex);
					}
				}, this);

			return visibleColumnNames;
		},

		/**
		 * @returns {Void}
		 *
		 * FIXME: waiting for server side implementation (attributes optimization)
		 */
		onDataViewSqlGridColumnChanged: function () {
			 this.cmfg('dataViewSqlGridStoreLoad');
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 */
		onDataViewSqlGridPrintButtonClick: function (format) {
			// Error handling
				if (!Ext.isString(format) || Ext.isEmpty(format))
					return _error('onDataViewSqlGridPrintButtonClick(): unmanaged format parameter', this, format);
			// END: Error handling

			var sorters = this.cmfg('dataViewSqlGridStoreGet').getSorters();

			var params = Ext.clone(this.storeExtraParamsGet());
			params[CMDBuild.core.constants.Proxy.TYPE] = format;

			if (Ext.isArray(sorters) && !Ext.isEmpty(sorters))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sorters);

			// Removes unwanted params to print all workflow data
			delete params[CMDBuild.core.constants.Proxy.PAGE];
			delete params[CMDBuild.core.constants.Proxy.LIMIT];

			this.controllerPrintWindow.cmfg('panelGridAndFormCommonPrintWindowShow', {
				format: format,
				mode: 'dataViewSql',
				params: params
			});
		},

		/**
		 * @param {CMDBuild.model.management.dataView.sql.panel.grid.Record} record
		 *
		 * @returns {Void}
		 */
		onDataViewSqlGridRecordSelect: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onDataViewSqlGridRecordSelect(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.RECORD] = record;
			params[CMDBuild.core.constants.Proxy.PAGE] = record.store.currentPage;
			params[CMDBuild.core.constants.Proxy.POSITION] = record.index;

			this.cmfg('dataViewSqlUiUpdate', params);
		},

		/**
		 * Reset grid and form on column sort change
		 * Custom implementation because of absence of unique ID in SQL cards
		 *
		 * @returns {Void}
		 */
		onDataViewSqlGridSortChange: function () {
			this.cmfg('dataViewSqlGridStoreGet').on('load', function (store, records, successful, eOpts) {
				if (!this.cmfg('dataViewSqlSelectedCardIsEmpty')) {
					var selectedCardValues = this.cmfg('dataViewSqlSelectedCardGet', CMDBuild.core.constants.Proxy.VALUES),
						selectedRecordIndex = store.findBy(function (record, id) {
							return Ext.Object.equals(record.get(CMDBuild.core.constants.Proxy.VALUES), selectedCardValues);
						}, this);

					this.view.getSelectionModel().select(Math.abs(selectedRecordIndex), false, true);

					if (selectedRecordIndex < 0) {
						this.cmfg('dataViewSqlSelectedCardReset');
						this.cmfg('dataViewSqlReset');
					}
				}
			}, this, { single: true });
		},


		/**
		 * @param {Number} position
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionItemGetSuccessCallback: function (position, parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;
			position = Ext.isNumber(position) ? position : 0;

			this.view.getSelectionModel().deselectAll();

			if (Ext.isNumber(position))
				this.view.getSelectionModel().select(position, false, true);

			if (Ext.isFunction(parameters.callback))
				Ext.callback(parameters.callback, parameters.scope);
		},

		// Grid selection methods
			/**
			 * Event fired because UI must be reconfigured with first store record
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			selectFirst: function () {
				if (!this.view.getSelectionModel().hasSelection())
					this.view.getSelectionModel().select(0);
			},

		// Store extra params methods
			/**
			 * @param {String} name
			 *
			 * @returns {Mixed}
			 *
			 * @private
			 */
			storeExtraParamsGet: function (name) {
				var extraParams = this.cmfg('dataViewSqlGridStoreGet').getProxy().extraParams;

				if (Ext.isString(name) && !Ext.isEmpty(name))
					return extraParams[name];

				return extraParams;
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Mixed}
			 *
			 * @private
			 */
			storeExtraParamsRemove: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					delete this.storeExtraParamsGet(name);
			},

			/**
			 * @param {Object} valueObject
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			storeExtraParamsSet: function (valueObject) {
				if (Ext.isObject(valueObject))
					this.cmfg('dataViewSqlGridStoreGet').getProxy().extraParams = valueObject;
			},

		// Store sorters
			/**
			 * @param {Ext.data.TreeStore} store
			 * @param {Object} sorter
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			storeSortersAdd: function (store, sorter) {
				// Error handling
					if (Ext.isEmpty(store) || Ext.isEmpty(store.sorters) || !Ext.isFunction(store.sorters.add))
						return _error('storeSortersAdd(): unable to add store sorters', this, store, sorter);

					if (
						!Ext.isObject(sorter) || Ext.Object.isEmpty(sorter)
						|| Ext.isEmpty(sorter.property)
						|| Ext.isEmpty(sorter.direction)
					) {
						return _error('storeSortersAdd(): unmanaged sorter object', this, store, sorter);
					}
				// END: Error handling

				store.sorters.add(sorter);
			},

			/**
			 * @param {Ext.data.TreeStore} store
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			storeSortersClear: function (store) {
				if (!Ext.isEmpty(store) && !Ext.isEmpty(store.sorters) && Ext.isFunction(store.sorters.clear))
					return store.sorters.clear();

				return _error('storeSortersClear(): unable to clear store sorters', this, store);
			},

			/**
			 * Sort array descending because storeSortersAdd() inserts values from the bottom of sorters array, not from top
			 *
			 * @param {Ext.data.TreeStore} store
			 *
			 * @returns {Ext.data.TreeStore} store
			 *
			 * @private
			 */
			storeSortersSet: function (store) { // TODO: refactor on getAttribute() implementation
				var attributes = CMDBuild.core.Utils.objectArraySort(
					this.cmfg('dataViewSqlSelectedDataSourceGet', CMDBuild.core.constants.Proxy.OUTPUT),
					CMDBuild.core.constants.Proxy.SORT_INDEX,
					'DESC'
				);

				// Setup store sorters
				this.storeSortersClear(store);

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.forEach(attributes, function (attributeModel, i, allAttributeModels) {
						if (
							Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel)
							&& !Ext.isEmpty(attributeModel.get(CMDBuild.core.constants.Proxy.SORT_DIRECTION))
						) {
							this.storeSortersAdd(store, {
								property: attributeModel.get(CMDBuild.core.constants.Proxy.NAME),
								direction: attributeModel.get(CMDBuild.core.constants.Proxy.SORT_DIRECTION)
							});
						}
					}, this);

				return store;
			}
	});

})();
