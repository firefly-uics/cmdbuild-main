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
		 * @property {CMDBuild.model.common.Filter}
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
			'dataViewFilterGridReset',
			'dataViewFilterGridStoreGet = panelGridAndFormListPanelStoreGet',
			'dataViewFilterGridStoreLoad = panelGridAndFormListPanelStoreLoad',
			'dataViewFilterGridUiUpdate',
			'onDataViewFilterGridColumnChanged',
			'onDataViewFilterGridPrintButtonClick',
			'onDataViewFilterGridRecordSelect',
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
		 * @property {CMDBuild.controller.management.dataView.filter.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging}
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
			this.controllerToolbarPaging = Ext.create('CMDBuild.controller.management.dataView.filter.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging', { parentDelegate: this });
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
		 * @param {CMDBuild.model.management.dataView.filter.Attribute} columnModel
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
		 * @param {Object} parameters.scope
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		applySelection: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.position = Ext.isNumber(parameters.position) ? parameters.position : null;

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('applySelection(): no selected dataView found', this);

				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('applySelection(): no selected card found', this);
			// END: Error handling

			this.positionCardGet({
				scope: this,
				failure: this.positionCardGetFailure,
				success: function (response, options, decodedResponse) {
					// Error handling
						if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
							return _error('applySelection(): unmanaged response', this, decodedResponse);
					// END: Error handling

					this.positionCardGetSuccess(
						decodedResponse[CMDBuild.core.constants.Proxy.POSITION],
						options.params[CMDBuild.core.constants.Proxy.FILTER],
						{
							disableFirstRowSelection: parameters.disableFirstRowSelection,
							storeLoad: parameters.storeLoad,
							callback: parameters.callback,
							scope: parameters.scope
						}
					);
				}
			});
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
			 * Customized to use model isEmpty() function
			 *
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
				if (this.cmfg('dataViewFilterGridAppliedFilterIsEmpty'))
					this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingFilterAdvancedReset');
			}, this);
		},

		/**
		 * @returns {Array} columnsDefinition
		 *
		 * @private
		 */
		dataViewFilterGridBuildColumns: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewFilterGridBuildColumns(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewFilterSourceEntryTypeAttributesIsEmpty'))
					return _error('dataViewFilterGridBuildColumns(): empty selected attributes property', this, this.cmfg('dataViewFilterSourceEntryTypeAttributesGet'));
			// END: Error handling

			var attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('dataViewFilterSourceEntryTypeAttributesGet'), CMDBuild.core.constants.Proxy.INDEX),
				columnsDefinition = [],
				fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this });

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

			return columnsDefinition;
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterGridReset: function () {
			this.view.getSelectionModel().deselectAll();
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
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			if (!this.cmfg('dataViewFilterGridAppliedFilterIsEmpty'))
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			this.storeExtraParamsSet(params); // Setup extraParams to work also with sorters and print report

			this.cmfg('dataViewFilterGridStoreGet').loadPage(parameters.page, {
				params: params,
				scope: Ext.isEmpty(parameters.scope) ? this : parameters.scope,
				callback: this.buildLoadCallback(parameters.callback)
			});
		},

		/**
		 * Setup store, columns, sorters and UI view mode manage
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {CMDBuild.model.common.Filter} parameters.filter
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.sortersReset
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 *
		 * @returns {Void}
		 */
		dataViewFilterGridUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;
			parameters.sortersReset = Ext.isBoolean(parameters.sortersReset) ? parameters.sortersReset : false;

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewFilterGridUiUpdate(): empty selected dataView', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			this.dataViewFilterGridAppliedFilterReset();

			// Default filter manage: merge every time with default filter or apply clean default filter
			if (
				Ext.isObject(parameters.filter) && !Ext.Object.isEmpty(parameters.filter) && parameters.filter.isFilterAdvancedCompatible
				&& !parameters.filter.get(CMDBuild.core.constants.Proxy.DEFAULT)
			) {
				parameters.filter.mergeConfigurations(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.FILTER));
			} else {
				parameters.filter = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.FILTER);
			}

			this.dataViewFilterGridAppliedFilterSet({ value: parameters.filter });

			switch (this.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
				case 'clone':
					return this.view.getSelectionModel().deselectAll(); // Just reset selection on add and clone mode

				default: {
					this.view.suspendEvents(false);
					this.view.reconfigure(
						parameters.sortersReset ? this.storeSortersSet(this.cmfg('dataViewFilterGridStoreGet')) : null,
						this.dataViewFilterGridBuildColumns()
					);
					this.view.resumeEvents();

					// Forward to sub-controllers
					this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingUiUpdate');
					this.controllerToolbarTop.cmfg('dataViewFilterGridToolbarTopUiUpdate');

					// Select selectedCard inside loaded store
					if (!this.cmfg('dataViewFilterSelectedCardIsEmpty'))
						return this.applySelection({
							disableFirstRowSelection: parameters.disableFirstRowSelection,
							storeLoad: parameters.storeLoad,
							scope: parameters.scope,
							callback: parameters.callback
						});

					// Load store and select first card
					return this.cmfg('dataViewFilterGridStoreLoad', {
						disableFirstRowSelection: parameters.disableFirstRowSelection,
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
		 * @param {CMDBuild.model.management.dataView.filter.panel.grid.Record} record
		 *
		 * @returns {Void}
		 */
		onDataViewFilterGridRecordSelect: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onDataViewFilterGridRecordSelect(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = record.get(CMDBuild.core.constants.Proxy.ID);

			this.cmfg('dataViewFilterUiUpdate', params);
		},

		/**
		 * Reset grid and form on column sort change if selected card is not found in loaded store
		 *
		 * @returns {Void}
		 */
		onDataViewFilterGridSortChange: function () {
			this.cmfg('dataViewFilterGridStoreGet').on('load', function (store, records, successful, eOpts) {
				if (!this.cmfg('dataViewFilterSelectedCardIsEmpty')) {
					var selectedRecordIndex = store.find(CMDBuild.core.constants.Proxy.ID, this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID));

					this.view.getSelectionModel().select(Math.abs(selectedRecordIndex), false, true);

					if (selectedRecordIndex < 0) {
						this.cmfg('dataViewFilterSelectedCardReset');
						this.cmfg('dataViewFilterReset');
					}
				}
			}, this, { single: true });
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

		/**
		 * Load store on selection related page, follows 3 steps:
		 * 	1. full call
		 * 	2. without filter
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.failure
		 * @param {Object} parameters.scope
		 * @param {Function} parameters.success
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionCardGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			var sort = this.cmfg('dataViewFilterGridStoreGet').getSorters();

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('positionCardGet(): no selected dataView found', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('positionCardGet(): no selected card found', this, this.cmfg('dataViewFilterSelectedCardGet'));

				if (!Ext.isFunction(parameters.failure))
					return _error('positionCardGet(): unmanaged failure parameter', this, parameters.failure);

				if (!Ext.isFunction(parameters.success))
					return _error('positionCardGet(): unmanaged success parameter', this, parameters.success);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			if (!this.cmfg('dataViewFilterGridAppliedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION))
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('dataViewFilterGridAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

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
							this.dataViewFilterGridAppliedFilterReset();

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

			CMDBuild.core.Message.error(
				CMDBuild.Translation.common.failure,
				Ext.String.format(
					CMDBuild.Translation.errors.reasons.CARD_NOTFOUND,
					this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					+ ' [' + this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.NAME) + ']'
				)
			);

			this.cmfg('dataViewFilterReset');
			this.cmfg('dataViewFilterGridStoreLoad', { disableFirstRowSelection: true });
		},

		/**
		 * @param {Number} position
		 * @param {String} filter
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Object} parameters.scope
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionCardGetSuccess: function (position, filter, parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.storeLoad = Ext.isString(parameters.storeLoad) ? parameters.storeLoad : null;

			// Error handling
				if (!Ext.isNumber(position) || Ext.isEmpty(position))
					return _error('positionCardGetSuccess(): unmanaged position parameter', this, position);
			// END: Error handling

			var pageNumber = CMDBuild.core.Utils.getPageNumber(position),
				pageRelatedPosition = position % CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT);

			if (this.cmfg('dataViewFilterGridStoreGet').currentPage != pageNumber || parameters.storeLoad == 'force')
				return this.cmfg('dataViewFilterGridStoreLoad', {
					disableFirstRowSelection: parameters.disableFirstRowSelection,
					page: pageNumber,
					scope: this,
					callback: function (records, operation, success) {
						this.positionCardGetSuccessCallback(pageRelatedPosition, {
							callback: parameters.callback,
							scope: parameters.scope
						});
					}
				});

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

			if (Ext.isNumber(pageRelatedPosition))
				this.view.getSelectionModel().select(pageRelatedPosition, false, true);

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
				var attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('dataViewFilterSourceEntryTypeAttributesGet'), CMDBuild.core.constants.Proxy.SORT_INDEX, 'DESC');

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
