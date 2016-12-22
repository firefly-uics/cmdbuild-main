(function () {

	Ext.define('CMDBuild.controller.management.dataView.filter.panel.grid.Grid', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.grid.Grid',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.dataView.filter.panel.grid.Grid'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.Filter}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter}
		 *
		 * @private
		 */
		appliedFilter: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewFilterGridAppliedFilterGet = panelGridAndFormListPanelAppliedFilterGet',
			'dataViewFilterGridAppliedFilterIsEmpty = panelGridAndFormListPanelAppliedFilterIsEmpty',
			'dataViewFilterGridFilterApply = panelGridAndFormListPanelFilterApply',
			'dataViewFilterGridFilterClear = panelGridAndFormListPanelFilterClear',
			'dataViewFilterGridReset',
			'dataViewFilterGridStoreGet = panelGridAndFormListPanelStoreGet',
			'dataViewFilterGridStoreLoad = panelGridAndFormListPanelStoreLoad',
			'dataViewFilterGridUiUpdate',
			'getView = panelGridAndFormListPanelGet',
			'onDataViewFilterGridAddButtonClick',
			'onDataViewFilterGridColumnChanged',
			'onDataViewFilterGridPrintButtonClick = onPanelGridAndFormCommonToolbarPrintButtonClick',
			'onDataViewFilterGridSortChange'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		controllerPrintWindow: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters}
		 */
		controllerRuntimeParameters: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		controllerToolbarPaging: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.grid.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window}
		 */
		controllerWindowGraph: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.grid.GridPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.filter.Filter} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.grid.GridPanel', { delegate: this });

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });
			this.controllerRuntimeParameters = Ext.create('CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters', { parentDelegate: this });
			this.controllerToolbarPaging = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging', { parentDelegate: this });
			this.controllerToolbarTop = Ext.create('CMDBuild.controller.management.dataView.filter.panel.grid.toolbar.Top', { parentDelegate: this });
			this.controllerWindowGraph = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', { parentDelegate: this });

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
		 * Custom renderer to work with "CMDBuild.model.management.dataView.filter.panel.grid.Record" custom get method
		 *
		 * @param {Object} column
		 * @param {CMDBuild.model.management.workflow.Attribute} columnModel
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

		// AppliedFilter property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewFilterGridAppliedFilterGet: function (attributePath) {
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
			dataViewFilterGridAppliedFilterIsEmpty: function (attributePath) {
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
			dataViewFilterGridAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');

				// Default filter manage: apply dataView's filter
				var defaultFilter = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.FILTER).getData();
				defaultFilter[CMDBuild.core.constants.Proxy.DEFAULT] = true; // Setup default state

				this.dataViewFilterGridAppliedFilterSet({ value: defaultFilter });
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter';
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
				if (this.dataViewFilterGridAppliedFilterIsEmpty())
					this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingFilterAdvancedReset');
			}, this);
		},

		/**
		 * @returns {Array} columnsDefinition
		 *
		 * @private
		 */
		dataViewFilterGridBuildColumns: function () {
			var columnsDefinition = [];

			if (!this.cmfg('dataViewSelectedDataViewIsEmpty') && !this.cmfg('dataViewFilterSelectedDataViewAttributesIsEmpty')) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
					attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('dataViewFilterSelectedDataViewAttributesGet'), CMDBuild.core.constants.Proxy.INDEX);

				if (this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
					columnsDefinition.push({
						dataIndex: CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION,
						text: CMDBuild.Translation.subClass,
						sortable: false
					});

				Ext.Array.forEach(attributes, function (attributeModel, i, allAttributeModels) {
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

				// Add Graph button
				if (
					this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) != CMDBuild.core.constants.Global.getTableTypeSimpleTable()
					&& CMDBuild.configuration.graph.get(CMDBuild.core.constants.Proxy.ENABLED)
				) {
					columnsDefinition.push(
						Ext.create('Ext.grid.column.Action', {
							align: 'center',
							maxWidth: 30,
							sortable: false,
							hideable: false,
							menuDisabled: true,
							fixed: true,

							items: [
								Ext.create('CMDBuild.core.buttons.icon.Graph', {
									tooltip: CMDBuild.Translation.openRelationGraph,
									withSpacer: true,
									scope: this,

									handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
										this.controllerWindowGraph.cmfg('onPanelGridAndFormGraphWindowConfigureAndShow', {
											cardId: record.get(CMDBuild.core.constants.Proxy.ID),
											classId: record.get(CMDBuild.core.constants.Proxy.CLASS_ID)
										});
									}
								})
							]
						})
					);
				}
			}

			return columnsDefinition;
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.forceStoreLoad
		 * @param {Number} parameters.id
		 * @param {Number} parameters.position
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		dataViewFilterGridCardSelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.position = Ext.isNumber(parameters.position) ? parameters.position : null;

			// Error handling
				if (!Ext.isNumber(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('dataViewFilterGridCardSelect(): unmanaged id parameter', this, parameters.id);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = parameters.id;

			if (!this.dataViewFilterGridAppliedFilterIsEmpty())
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			// If position parameter isn't already valorized calculate position in card's store
			if (Ext.isEmpty(parameters.position))
				return this.positionCardGet({
					params: params,
					scope: this,
					failure: this.positionCardGetFailure,
					success: function (response, options, decodedResponse) {
						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							this.positionCardGetSuccess(
								decodedResponse[CMDBuild.core.constants.Proxy.POSITION],
								options.params[CMDBuild.core.constants.Proxy.FILTER],
								{
									forceStoreLoad: parameters.forceStoreLoad,
									callback: parameters.callback,
									scope: parameters.scope
								}
							);
						} else {
							_error('dataViewFilterGridCardSelect(): unmanaged response', this, decodedResponse);
						}
					}
				});

			// Directly select card in current loaded store
			return this.positionCardGetSuccessCallback(parameters.position, parameters);
		},

		// Filter management methods
			/**
			 * @param {Object} parameters
			 * @param {Boolean} parameters.disableStoreLoad
			 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} parameters.filter
			 * @param {Boolean} parameters.type
			 *
			 * @returns {Void}
			 */
			dataViewFilterGridFilterApply: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.disableStoreLoad = Ext.isBoolean(parameters.disableStoreLoad) ? parameters.disableStoreLoad : false;

				switch (parameters.type) {
					case 'advanced': {
						this.dataViewFilterGridFilterApplyAdvanced(parameters.filter);
					} break;

					case 'basic': {
						this.dataViewFilterGridFilterApplyBasic(parameters.filter);
					} break;

					default:
						return _error('dataViewFilterGridFilterApply(): unmanaged type parameter', this, parameters.type);
				}

				if (!parameters.disableStoreLoad)
					this.cmfg('dataViewFilterGridStoreLoad');
			},

			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridFilterApplyAdvanced: function (filter) {
				// Error handling
					if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter) || !filter.isFilterAdvancedCompatible)
						return _error('dataViewFilterGridFilterApplyAdvanced(): unmanaged filter parameter', this, filter);
				// END: Error handling

				var emptyRuntimeParameters = filter.getEmptyRuntimeParameters()
					filterConfigurationObject = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

				if (Ext.isArray(emptyRuntimeParameters) && !Ext.isEmpty(emptyRuntimeParameters))
					return this.controllerRuntimeParameters.cmfg('fieldFilterRuntimeParametersShow', filter);

				filter.resolveCalculatedParameters();

				// Merge applied filter query parameter to filter object
				if (!this.dataViewFilterGridAppliedFilterIsEmpty()) {
					var appliedFilterConfigurationObject = this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);

					// Default filter manage: merge with dataView's filter
					filter.mergeConfigurationWith(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.FILTER));

					if (!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]))
						filter.set(CMDBuild.core.constants.Proxy.CONFIGURATION, Ext.apply(filterConfigurationObject, {
							query: appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]
						}));
				}

				this.dataViewFilterGridAppliedFilterSet({ value: filter.getData() });
			},

			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridFilterApplyBasic: function (filter) {
				// Error handling
					if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter) || !filter.isFilterAdvancedCompatible)
						return _error('dataViewFilterGridFilterApplyBasic(): unmanaged filter parameter', this, filter);
				// END: Error handling

				var filterConfigurationObject = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
					newConfigurationObject = {};

				// Merge filters objects
				if (this.dataViewFilterGridAppliedFilterIsEmpty()) {
					newConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = {};
					newConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION][CMDBuild.core.constants.Proxy.QUERY] = filterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];
					newConfigurationObject[CMDBuild.core.constants.Proxy.DEFAULT] = false; // Remove default state

					this.dataViewFilterGridAppliedFilterSet({ value: newConfigurationObject });
				} else {
					newConfigurationObject = this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);
					newConfigurationObject[CMDBuild.core.constants.Proxy.QUERY] = filterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

					this.dataViewFilterGridAppliedFilterSet({
						propertyName: CMDBuild.core.constants.Proxy.CONFIGURATION,
						value: newConfigurationObject
					});
				}
			},

			/**
			 * @param {Object} parameters
			 * @param {Boolean} parameters.disableStoreLoad
			 * @param {Boolean} parameters.type
			 *
			 * @returns {Void}
			 */
			dataViewFilterGridFilterClear: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.disableStoreLoad = Ext.isBoolean(parameters.disableStoreLoad) ? parameters.disableStoreLoad : false;

				if (!this.dataViewFilterGridAppliedFilterIsEmpty()) {
					var appliedFilterConfigurationObject = Ext.clone(this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

					switch (parameters.type) {
						case 'advanced': {
							if (
								(
									!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.ATTRIBUTE])
									|| !Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.RELATION])
									|| !Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.FUNCTIONS])
								)
								&& !this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.DEFAULT)
							) {
								this.dataViewFilterGridAppliedFilterReset();

								// Merge with previous filter query parameter if present
								if (!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]))
									this.dataViewFilterGridAppliedFilterSet({
										value: this.cmfg('dataViewFilterGridAppliedFilterGet').mergeConfigurationWith(
											Ext.create('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', {
												configuration: appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]
											})
										)
									});
							}
						} break;

						case 'basic': {
							if (!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY])) {
								delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

								if (Ext.Object.isEmpty(appliedFilterConfigurationObject)) {
									this.dataViewFilterGridAppliedFilterReset();
								} else {
									this.dataViewFilterGridAppliedFilterSet({
										propertyName: CMDBuild.core.constants.Proxy.CONFIGURATION,
										value: appliedFilterConfigurationObject
									});
								}
							}
						} break;

						default: {
							if (!this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.DEFAULT))
								this.dataViewFilterGridAppliedFilterReset();
						}
					}
				}

				if (!parameters.disableStoreLoad)
					this.cmfg('dataViewFilterGridStoreLoad');
			},

		/**
		 * @returns {Void}
		 */
		dataViewFilterGridReset: function () {
			this.view.getSelectionModel().deselectAll();

			this.cmfg('dataViewFilterSelectedCardReset');
		},

		/**
		 * @returns {Ext.data.TreeStore}
		 */
		dataViewFilterGridStoreGet: function () {
			return this.view.getStore();
		},

		/**
		 * On load action sends by default record parameter witch isn't managed by server
		 * Manages store configurations like: filter, sorters, attributes, class name
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
		dataViewFilterGridStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : null;
			parameters.disableFirstRowSelection = Ext.isBoolean(parameters.disableFirstRowSelection) ? parameters.disableFirstRowSelection : false;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewFilterGridStoreLoad(): empty selected dataView', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			// Manage callback
			if (!parameters.disableFirstRowSelection)
				parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : this.selectFirst;

			var params = Ext.isObject(parameters.params) ? parameters.params : {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(this.displayedParametersNamesGet());
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME);

			if (!this.dataViewFilterGridAppliedFilterIsEmpty())
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			this.storeExtraParamsSet(params); // Setup extraParams to work also with sorters and print report

			this.cmfg('dataViewFilterGridStoreGet').loadPage(parameters.page, {
				params: params,
				scope: Ext.isEmpty(parameters.scope) ? this : parameters.scope,
				callback: this.buildLoadCallback(parameters.callback)
			});
		},

		/**
		 * Setup store, columns and sorters
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.enableFilterReset
		 * @param {Boolean} parameters.forceStoreLoad
		 * @param {Number} parameters.position
		 * @param {Boolean} parameters.resetSorters
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		dataViewFilterGridUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enableFilterReset = Ext.isBoolean(parameters.enableFilterReset) ? parameters.enableFilterReset : false;
			parameters.resetSorters = Ext.isBoolean(parameters.resetSorters) ? parameters.resetSorters : false;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (parameters.enableFilterReset)
				this.dataViewFilterGridAppliedFilterReset();

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewFilterGridUiUpdate(): empty selected dataView', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			var store = this.cmfg('dataViewFilterGridStoreGet');

			if (parameters.resetSorters)
				store = this.storeSortersSet(store);

			this.view.reconfigure(store, this.dataViewFilterGridBuildColumns());

			// Forward to sub-controllers
			this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingUiUpdate');
			this.controllerToolbarTop.cmfg('dataViewFilterGridToolbarTopUiUpdate');

			// Select selectedCard inside loaded store
			if (!this.cmfg('dataViewFilterSelectedCardIsEmpty'))
				return this.dataViewFilterGridCardSelect({
					id: this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
					forceStoreLoad: parameters.forceStoreLoad,
					position: parameters.position,
					scope: parameters.scope,
					callback: parameters.callback
				});

			// Load store and select first card
			return this.cmfg('dataViewFilterGridStoreLoad', {
				scope: parameters.scope,
				callback: parameters.callback
			});
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
		 */
		onDataViewFilterGridAddButtonClick: function () {
			this.view.getSelectionModel().deselectAll();
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterGridColumnChanged: function () {
			this.cmfg('dataViewFilterGridStoreLoad');
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 */
		onDataViewFilterGridPrintButtonClick: function (format) {
			// Error handling
				if (!Ext.isString(format) || Ext.isEmpty(format))
					return _error('onDataViewFilterGridPrintButtonClick(): unmanaged format parameter', this, format);
			// END: Error handling

			var sorters = this.cmfg('dataViewFilterGridStoreGet').getSorters();

			var params = Ext.clone(this.storeExtraParamsGet());
			params[CMDBuild.core.constants.Proxy.TYPE] = format;

			if (Ext.isArray(sorters) && !Ext.isEmpty(sorters))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sorters);

			// Removes unwanted params to print all workflow data
			delete params[CMDBuild.core.constants.Proxy.PAGE];
			delete params[CMDBuild.core.constants.Proxy.LIMIT];

			this.controllerPrintWindow.cmfg('panelGridAndFormCommonPrintWindowShow', {
				format: format,
				mode: 'view',
				params: params
			});
		},

		/**
		 * Reset grid and form on column sort change
		 *
		 * @returns {Void}
		 */
		onDataViewFilterGridSortChange: function () {
			this.cmfg('dataViewFilterGridStoreGet').on('load', function (store, records, successful, eOpts) {
				if (this.cmfg('dataViewFilterSelectedCardIsEmpty')) {
					this.cmfg('dataViewFilterReset');
				} else {
					var selectedRecordIndex = store.find(CMDBuild.core.constants.Proxy.ID, this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID));

					this.view.getSelectionModel().select(Math.abs(selectedRecordIndex), false, true);

					if (selectedRecordIndex < 0)
						this.cmfg('dataViewFilterReset');
				}
			}, this, { single: true });
		},

		// Grid selection methods
			/**
			 * @param {Number} position
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			selectByPosition: function (position) {
				// Error handling
					if (!Ext.isNumber(position) || Ext.isEmpty(position))
						return _error('selectByPosition(): unmanaged position parameter', this, position);
				// END: Error handling

				this.view.getSelectionModel().select(position, false, true);
			},

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

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.failure
		 * @param {Object} parameters.params
		 * @param {String} parameters.params.filter
		 * @param {Number} parameters.params.id
		 * @param {Object} parameters.scope
		 * @param {Function} parameters.success
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionCardGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			var cardId = parameters.params[CMDBuild.core.constants.Proxy.ID],
				filter = parameters.params[CMDBuild.core.constants.Proxy.FILTER],
				sort = this.cmfg('dataViewFilterGridStoreGet').getSorters();

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('positionCardGet(): empty selected dataView', this);

				if (!Ext.isFunction(parameters.failure))
					return _error('positionCardGet(): unmanaged failure parameter', this, parameters.failure);

				if (!Ext.isFunction(parameters.success))
					return _error('positionCardGet(): unmanaged success parameter', this, parameters.success);

				if (!Ext.isNumber(cardId) || Ext.isEmpty(cardId))
					return _error('positionCardGet(): unmanaged id parameter', this, cardId);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = cardId;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_ENTRY_TYPE_NAME);

			if (Ext.isString(filter) && !Ext.isEmpty(filter))
				params[CMDBuild.core.constants.Proxy.FILTER] = filter;

			if (Ext.isArray(sort) && !Ext.isEmpty(sort))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sort);

			CMDBuild.proxy.management.dataView.filter.panel.grid.Grid.readPosition({
				params: params,
				scope: parameters.scope,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					// Error handling
						if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
							return _error('positionCardGet(): unmanaged response', this, decodedResponse);
					// END: Error handling

					// Card found
					if (Ext.isBoolean(decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION]) && decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION]) {
						Ext.callback(
							parameters.success,
							parameters.scope,
							[response, options, decodedResponse]
						);
					} else { // Card not found
						if (this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.DEFAULT)) { // Failure
							Ext.callback(
								parameters.failure,
								parameters.scope,
								[response, options, decodedResponse]
							);
						} else { // Retry with default filter
							this.cmfg('dataViewFilterGridFilterClear', { disableStoreLoad: true });

							// Default filter manage: apply dataView's filter
							parameters.params.filter = Ext.encode(this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

							this.positionCardGet(parameters);
						}
					}
				}
			});
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionCardGetFailure: function (response, options, decodedResponse) {
			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('positionCardGetFailure(): unmanaged decodedResponse parameter', this, decodedResponse);
			// END: Error handling

			var filter = options.params[CMDBuild.core.constants.Proxy.FILTER];

			CMDBuild.core.Message.error(
				CMDBuild.Translation.common.failure,
				Ext.String.format(
					CMDBuild.Translation.errors.reasons.CARD_NOTFOUND,
					this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					+ ' [' + this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.NAME) + ']'
				)
			);

			// Sync UI with parameter filter property value
			if (!Ext.isString(filter) || Ext.isEmpty(filter))
				this.cmfg('dataViewFilterGridFilterClear', { disableStoreLoad: true });

			this.cmfg('dataViewFilterReset');
			this.cmfg('dataViewFilterGridStoreLoad', { disableFirstRowSelection: true });
		},

		/**
		 * @param {Number} position
		 * @param {String} filter
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.forceStoreLoad
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionCardGetSuccess: function (position, filter, parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.forceStoreLoad = Ext.isBoolean(parameters.forceStoreLoad) ? parameters.forceStoreLoad : false;

			// Error handling
				if (!Ext.isNumber(position) || Ext.isEmpty(position))
					return _error('positionCardGetSuccess(): unmanaged position parameter', this, position);
			// END: Error handling

			var pageNumber = CMDBuild.core.Utils.getPageNumber(position),
				pageRelatedPosition = position % CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT);

			// Sync UI with parameter filter property value
			if (!Ext.isString(filter) || Ext.isEmpty(filter))
				this.cmfg('dataViewFilterGridFilterClear', { disableStoreLoad: true });

			if (
				this.cmfg('dataViewFilterGridStoreGet').currentPage != pageNumber
				|| parameters.forceStoreLoad
			) {
				return this.cmfg('dataViewFilterGridStoreLoad', {
					page: pageNumber,
					scope: this,
					callback: function (records, operation, success) {
						this.positionCardGetSuccessCallback(pageRelatedPosition, {
							callback: parameters.callback,
							scope: parameters.scope
						});
					}
				});
			}

			return this.positionCardGetSuccessCallback(pageRelatedPosition, {
				callback: parameters.callback,
				scope: parameters.scope
			});
		},

		/**
		 * @param {Number} pageRelatedPosition
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionCardGetSuccessCallback: function (pageRelatedPosition, parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			this.view.getSelectionModel().deselectAll();

			this.selectByPosition(pageRelatedPosition);

			if (Ext.isFunction(parameters.callback))
				Ext.callback(parameters.callback, parameters.scope);
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
				var extraParams = this.cmfg('dataViewFilterGridStoreGet').getProxy().extraParams;

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
					delete this.storeExtraParamsGet()[name];
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
					this.cmfg('dataViewFilterGridStoreGet').getProxy().extraParams = valueObject;
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
			storeSortersSet: function (store) {
				var attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('dataViewFilterSelectedDataViewAttributesGet'), CMDBuild.core.constants.Proxy.SORT_INDEX, 'DESC');

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
