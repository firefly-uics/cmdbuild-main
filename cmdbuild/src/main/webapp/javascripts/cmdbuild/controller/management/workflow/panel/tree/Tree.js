(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.Tree', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.tree.Tree',

		requires: [
			'CMDBuild.controller.management.workflow.Utils',
			'CMDBuild.core.constants.Metadata',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.core.LoadMask',
			'CMDBuild.core.Message',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.workflow.panel.tree.Tree'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.Workflow}
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
			'getView = workflowTreeViewGet',
			'onWorkflowTreeColumnChanged',
			'onWorkflowTreePrintButtonClick = onPanelGridAndFormCommonToolbarPrintButtonClick',
			'onWorkflowTreeRecordSelect = onWorkflowTreeBeforeItemClick',
			'onWorkflowTreeSortChange',
			'workflowTreeAppliedFilterGet = panelGridAndFormListPanelAppliedFilterGet',
			'workflowTreeAppliedFilterIsEmpty = panelGridAndFormListPanelAppliedFilterIsEmpty',
			'workflowTreeRendererTreeColumn',
			'workflowTreeReset',
			'workflowTreeStoreGet = panelGridAndFormListPanelStoreGet',
			'workflowTreeStoreLoad = panelGridAndFormListPanelStoreLoad',
			'workflowTreeUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		controllerPrintWindow: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		controllerToolbarPaging: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.TreePanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.Workflow} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.TreePanel', { delegate: this });

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });
			this.controllerToolbarPaging = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging', { parentDelegate: this });
			this.controllerToolbarTop = Ext.create('CMDBuild.controller.management.workflow.panel.tree.toolbar.Top', { parentDelegate: this });

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
		 * Custom renderer to work with "CMDBuild.model.management.workflow.Node" custom get method
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

		/**
		 * Apply instance/activity selection
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Boolean} parameters.flowStatusForceEnabled
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.storeLoad
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		applySelection: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('applySelection(): no selected workflow found', this);

				if (this.cmfg('workflowSelectedInstanceIsEmpty'))
					return _error('applySelection(): no selected instance found', this);
			// END: Error handling

			this.positionInstanceGet({
				flowStatusForceEnabled: parameters.flowStatusForceEnabled,
				scope: this,
				failure: this.positionInstanceGetFailure,
				success: function (response, options, decodedResponse) {
					// Error handling
						if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
							return _error('applySelection(): unmanaged response', this, decodedResponse);
					// END: Error handling

					this.positionInstanceGetSuccess(
						decodedResponse[CMDBuild.core.constants.Proxy.POSITION],
						decodedResponse[CMDBuild.core.constants.Proxy.FLOW_STATUS],
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

		/**
		 * @returns {Array} visibleColumnNames
		 *
		 * @private
		 */
		displayedParametersNamesGet: function () {
			var visibleColumns = Ext.Array.slice(this.view.query('gridcolumn:not([hidden])'), 1), // Discard expander column
				visibleColumnNames = [];

			// Build columns dataIndex array
			if (Ext.isArray(visibleColumns) && !Ext.isEmpty(visibleColumns))
				Ext.Array.each(visibleColumns, function (columnObject, i, allColumnObjects) {
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
		 * Service method to complete node model data to avoid activity description rendering errors
		 *
		 * @param {CMDBuild.model.management.workflow.Node} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		nodeModelDataComplete: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('nodeModelDataComplete(): unmanaged record parameter', this, record);
			// END: Error handling

			var instanceValues = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.VALUES);

			switch (this.nodeTypeOf(record)) {
				// Complete brother node models with additional values (to correctly manage AdditionalActivityLabel metadata
				// also if relative column is not displayed)
				case 'activity': {
					var parent = record.parentNode;

					if (!parent.isRoot())
						parent.eachChild(function (childNode) {
							childNode.set(CMDBuild.core.constants.Proxy.VALUES, instanceValues);
						}, this);
				} break;

				// Complete record and children models with additional values (to correctly manage AdditionalActivityLabel metadata
				// also if relative column is not displayed)
				case 'instance': {
					record.set(CMDBuild.core.constants.Proxy.VALUES, instanceValues);
					record.eachChild(function (childNode) {
						childNode.set(CMDBuild.core.constants.Proxy.VALUES, instanceValues);
					}, this);
				} break;

				default:
					return _error('nodeModelDataComplete(): unmanaged record type', this, record);
			}

			CMDBuild.core.LoadMask.hide();
		},

		/**
		 * @param {CMDBuild.model.management.workflow.Node} node
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		nodeRecursiveAnchestorsExpand: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node) || !Ext.isFunction(node.bubble))
					return _error('nodeRecursiveAnchestorsExpand(): unmanaged node parameter', this, node);
			// END: Error handling

			node.bubble(function () {
				this.expand();
			});
		},

		/**
		 * Evaluates if node is an activity or instance
		 *
		 * @param {CMDBuild.model.management.workflow.Node} node
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		nodeTypeOf: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node))
					return _error('nodeTypeOf(): unmanaged node parameter', this, node);
			// END: Error handling

			var activityId = node.get(CMDBuild.core.constants.Proxy.ACTIVITY_ID),
				instanceId = node.get(CMDBuild.core.constants.Proxy.INSTANCE_ID),
				workflowId = node.get(CMDBuild.core.constants.Proxy.WORKFLOW_ID);

			if (
				Ext.isNumber(workflowId) && !Ext.isEmpty(workflowId)
				&& Ext.isNumber(instanceId) && !Ext.isEmpty(instanceId)
				&& Ext.isString(activityId) && !Ext.isEmpty(activityId)
			) {
				return 'activity';
			}

			if ( // Instance node selected
				Ext.isNumber(workflowId) && !Ext.isEmpty(workflowId)
				&& Ext.isNumber(instanceId) && !Ext.isEmpty(instanceId)
			) {
				return 'instance';
			}

			return '';
		},

		/**
		 * Setup correct selection inside and load store
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeColumnChanged: function () {
			if (!this.cmfg('workflowSelectedInstanceIsEmpty'))
				this.applySelection({
					disableFirstRowSelection: true,
					storeLoad: 'force'
				});
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 */
		onWorkflowTreePrintButtonClick: function (format) {
			// Error handling
				if (!Ext.isString(format) || Ext.isEmpty(format))
					return _error('onWorkflowTreePrintButtonClick(): unmanaged format parameter', this, format);
			// END: Error handling

			var sorters = this.cmfg('workflowTreeStoreGet').getSorters();

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
		 * @param {CMDBuild.model.management.workflow.Node} node
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeRecordSelect: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node) || !Ext.isFunction(node.get))
					return _error('onWorkflowTreeRecordSelect(): unmanaged node parameter', this, node);
			// END: Error handling

			var parameters = {};
			parameters.storeLoad = 'disabled';
			parameters[CMDBuild.core.constants.Proxy.ACTIVITY_ID] = node.get(CMDBuild.core.constants.Proxy.ACTIVITY_ID);
			parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID] = node.get(CMDBuild.core.constants.Proxy.INSTANCE_ID);
			parameters[CMDBuild.core.constants.Proxy.WORKFLOW_ID] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID);

			if (!this.cmfg('workflowTreeAppliedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION))
				parameters[CMDBuild.core.constants.Proxy.FILTER] = this.cmfg('workflowTreeAppliedFilterGet');

			this.cmfg('workflowUiUpdate', parameters);
		},

		/**
		 * Reset tree and form on column sort change
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeSortChange: function () {
			this.cmfg('workflowReset');
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
				var extraParams = this.cmfg('workflowTreeStoreGet').getProxy().extraParams;

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
					this.cmfg('workflowTreeStoreGet').getProxy().extraParams = valueObject;
			},

		/**
		 * Load store on selection related page, follows 3 steps:
		 * 	1. full call
		 * 	2. without filter
		 * 	3. without filter and flow status
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.failure
		 * @param {Boolean} parameters.flowStatusForceEnabled
		 * @param {Object} parameters.scope
		 * @param {Function} parameters.success
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionInstanceGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.flowStatusForceEnabled = Ext.isBoolean(parameters.flowStatusForceEnabled) ? parameters.flowStatusForceEnabled : false;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			var flowStatus = this.controllerToolbarTop.cmfg('workflowTreeToolbarTopStatusValueGet'),
				sort = this.cmfg('workflowTreeStoreGet').getSorters();

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('positionInstanceGet(): empty selected workflow', this);

				if (this.cmfg('workflowSelectedInstanceIsEmpty'))
					return _error('positionInstanceGet(): no selected instance found', this);

				if (!Ext.isFunction(parameters.failure))
					return _error('positionInstanceGet(): unmanaged failure parameter', this, parameters.failure);

				if (!Ext.isFunction(parameters.success))
					return _error('positionInstanceGet(): unmanaged success parameter', this, parameters.success);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

			if (!this.cmfg('workflowTreeAppliedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION))
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			if (!parameters.flowStatusForceEnabled)
				params[CMDBuild.core.constants.Proxy.FLOW_STATUS] = CMDBuild.controller.management.workflow.Utils.translateStatusFromCapitalizedMode(flowStatus);

			if (Ext.isArray(sort) && !Ext.isEmpty(sort))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sort);

			CMDBuild.proxy.management.workflow.panel.tree.Tree.readPosition({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					// Error handling
						if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
							return _error('positionInstanceGet(): unmanaged response', this, decodedResponse);
					// END: Error handling

					// Card found
					if (Ext.isBoolean(decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION]) && decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION]) {
						Ext.callback(
							parameters.success,
							parameters.scope,
							[response, options, decodedResponse]
						);
					} else { // Card not found
						if (this.cmfg('workflowTreeAppliedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION)) { // Failure
							Ext.callback(
								parameters.failure,
								parameters.scope,
								[response, options, decodedResponse]
							);
						} else { // Retry without filter
							this.workflowTreeAppliedFilterReset();

							return this.positionInstanceGet(parameters);
						}
					}
				}
			});
		},

		/**
		 * Card not found and store reload
		 *
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionInstanceGetFailure: function (response, options, decodedResponse) {
			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('positionInstanceGetFailure(): unmanaged decodedResponse parameter', this, decodedResponse);
			// END: Error handling

			CMDBuild.core.Message.error(
				CMDBuild.Translation.common.failure,
				Ext.String.format(
					CMDBuild.Translation.errors.reasons.CARD_NOTFOUND,
					this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					+ ' [' +this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME) + ']'
				)
			);

			this.cmfg('workflowReset');
			this.cmfg('workflowTreeStoreLoad', { disableFirstRowSelection: true });
		},

		/**
		 * @param {Number} position
		 * @param {String} flowStatus
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.storeLoad
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionInstanceGetSuccess: function (position, flowStatus, parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.storeLoad = Ext.isString(parameters.storeLoad) ? parameters.storeLoad : null;

			// Error handling
				if (!Ext.isNumber(position) || Ext.isEmpty(position))
					return _error('positionInstanceGetSuccess(): unmanaged position parameter', this, position);
			// END: Error handling

			var flowStatus = CMDBuild.controller.management.workflow.Utils.translateStatusFromCapitalizedMode(flowStatus),
				pageNumber = CMDBuild.core.Utils.getPageNumber(position),
				pageRelatedPosition = position % CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT);

			// Sync UI with flow status returned value
			if (Ext.isString(flowStatus) && !Ext.isEmpty(flowStatus))
				this.controllerToolbarTop.cmfg('workflowTreeToolbarTopStatusValueSet', flowStatus);

			if (this.cmfg('workflowTreeStoreGet').currentPage != pageNumber || parameters.storeLoad == 'force')
				return this.cmfg('workflowTreeStoreLoad', {
					disableFirstRowSelection: parameters.disableFirstRowSelection,
					page: pageNumber,
					scope: this,
					callback: function (records, operation, success) {
						this.positionInstanceGetSuccessCallback(pageRelatedPosition, {
							callback: parameters.callback,
							scope: parameters.scope
						});
					}
				});

			return this.positionInstanceGetSuccessCallback(pageRelatedPosition, {
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
		positionInstanceGetSuccessCallback: function (pageRelatedPosition, parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			var activityId = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID),
				instanceId = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
				selectedNode = this.cmfg('workflowTreeStoreGet').getRootNode().findChildBy(function (node) {
					if (!Ext.isEmpty(activityId))
						return (
							instanceId == node.get(CMDBuild.core.constants.Proxy.INSTANCE_ID)
							&& activityId == node.get(CMDBuild.core.constants.Proxy.ACTIVITY_ID)
						);

					return instanceId == node.get(CMDBuild.core.constants.Proxy.INSTANCE_ID);
				}, this, true);

			this.view.getSelectionModel().deselectAll();

			if (Ext.isObject(selectedNode) && !Ext.Object.isEmpty(selectedNode)) {
				this.nodeModelDataComplete(selectedNode);
				this.nodeRecursiveAnchestorsExpand(selectedNode);

				this.view.getSelectionModel().select(selectedNode, false, true);
			}

			if (Ext.isFunction(parameters.callback))
				Ext.callback(parameters.callback, parameters.scope);
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
				var attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('workflowSelectedWorkflowAttributesGetAll'), CMDBuild.core.constants.Proxy.SORT_INDEX, 'DESC');

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
			},

		// AppliedFilter property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowTreeAppliedFilterGet: function (attributePath) {
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
			workflowTreeAppliedFilterIsEmpty: function (attributePath) {
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
			workflowTreeAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Array} columnsDefinition
		 *
		 * @private
		 */
		workflowTreeBuildColumns: function () {
			var columnsDefinition = [
				Ext.create('CMDBuild.view.management.workflow.panel.tree.TreeColumn', {
					dataIndex: CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION,
					scope: this
				})
			];

			if (!this.cmfg('workflowSelectedWorkflowIsEmpty') && !this.cmfg('workflowSelectedWorkflowAttributesIsEmpty')) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
					attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('workflowSelectedWorkflowAttributesGetAll'), CMDBuild.core.constants.Proxy.INDEX);

				if (this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
					columnsDefinition.push({
						dataIndex: CMDBuild.core.constants.Proxy.WORKFLOW_DESCRIPTION,
						text: CMDBuild.Translation.subClass
					});

				Ext.Array.forEach(attributes, function (attributeModel, i, allAttributeModels) {
					if (
						Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel)
						&& attributeModel.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Proxy.WORKFLOW_DESCRIPTION
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
			}

			return columnsDefinition;
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.metadata
		 * @param {CMDBuild.model.management.workflow.Node} parameters.record
		 * @param {String} parameters.value
		 *
		 * @returns {String}
		 */
		workflowTreeRendererTreeColumn: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			var metadata = parameters.metadata,
				record = parameters.record;

			if (
				Ext.isObject(metadata) && !Ext.Object.isEmpty(metadata)
				&& Ext.isObject(record) && !Ext.Object.isEmpty(record)
				&& !record.parentNode.isRoot()
			) {
				// Apply colspan property to be visually equal to old grid
				metadata.tdAttr = 'colspan="' + this.view.columns.length + '"' ;

				// Build activities node description
				var activityMetadata = record.get(CMDBuild.core.constants.Proxy.ACTIVITY_METADATA),
					description = '<b>'+ record.get(CMDBuild.core.constants.Proxy.ACTIVITY_PERFORMER_NAME) + ':</b> '
						+ record.get(CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION);

				if (Ext.isArray(activityMetadata) && !Ext.isEmpty(activityMetadata))
					Ext.Array.forEach(activityMetadata, function (metadataObject, i, allMetadataObjects) {
						if (Ext.isObject(metadataObject) && !Ext.Object.isEmpty(metadataObject))
							switch (metadataObject[CMDBuild.core.constants.Proxy.NAME]) {
								case CMDBuild.core.constants.Metadata.getAdditionalActivityLabel(): {
									if (!Ext.isEmpty(record.get(metadataObject[CMDBuild.core.constants.Proxy.VALUE])))
										description += this.workflowTreeRendererTreeColumnManageMetadataAdditionalActivityLabel(
											record.get(metadataObject[CMDBuild.core.constants.Proxy.VALUE])
										);
								} break;
							}
					}, this);

				return description;
			}

			return parameters.value;
		},

		/**
		 * @param {Object or String} additionalLabelValue
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		workflowTreeRendererTreeColumnManageMetadataAdditionalActivityLabel: function (additionalLabelValue) {
			switch (Ext.typeOf(additionalLabelValue)) {
				case 'object':
					if (!Ext.Object.isEmpty(additionalLabelValue))
						if (Ext.isString(additionalLabelValue[CMDBuild.core.constants.Proxy.DESCRIPTION]) && !Ext.isEmpty(additionalLabelValue[CMDBuild.core.constants.Proxy.DESCRIPTION])) {
							return ' - ' + additionalLabelValue[CMDBuild.core.constants.Proxy.DESCRIPTION];
						} else if (Ext.isNumber(additionalLabelValue[CMDBuild.core.constants.Proxy.ID]) && !Ext.isEmpty(additionalLabelValue[CMDBuild.core.constants.Proxy.ID])) {
							return ' - ' + additionalLabelValue[CMDBuild.core.constants.Proxy.ID];
						}

				case 'string':
				default:
					if (!Ext.isEmpty(additionalLabelValue))
						return ' - ' + additionalLabelValue;
			}

			return '';
		},

		/**
		 * @returns {Void}
		 */
		workflowTreeReset: function () {
			this.view.getSelectionModel().deselectAll();
		},

		/**
		 * @returns {Ext.data.TreeStore}
		 */
		workflowTreeStoreGet: function () {
			return this.view.getStore();
		},

		/**
		 * On load action sends by default node parameter witch isn't managed by server
		 * Manages store configurations like: filter, sorters, attributes, workflowName and state (flowStatus)
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
		workflowTreeStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('workflowTreeStoreLoad(): selected workflow object empty', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			this.cmfg('workflowTreeStoreGet').getRootNode().removeAll();

			var params = Ext.isObject(parameters.params) ? parameters.params : {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(this.displayedParametersNamesGet());
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.STATE] = this.controllerToolbarTop.cmfg('workflowTreeToolbarTopStatusValueGet');

			if (!this.cmfg('workflowTreeAppliedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION))
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			this.storeExtraParamsSet(params); // Setup extraParams to work also with sorters and print report

			this.cmfg('workflowTreeStoreGet').loadPage(parameters.page, {
				params: params,
				scope: Ext.isEmpty(parameters.scope) ? this : parameters.scope,
				callback: this.workflowTreeStoreLoadCallbackBuild({
					disableFirstRowSelection: parameters.disableFirstRowSelection,
					callback: parameters.callback
				})
			});
		},

		/**
		 * Apply interceptor with default store load callback actions, if callback is empty will be replaced with Ext.emptyFn
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 *
		 * @returns {Function}
		 *
		 * @private
		 */
		workflowTreeStoreLoadCallbackBuild: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.disableFirstRowSelection = Ext.isBoolean(parameters.disableFirstRowSelection) ? parameters.disableFirstRowSelection : false;

			return Ext.Function.createInterceptor(parameters.callback, function (records, options, success) {
				if (!parameters.disableFirstRowSelection && !this.view.getSelectionModel().hasSelection())
					this.view.getSelectionModel().select(0);
			}, this);
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.defaultFilterApplyIfExists
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {CMDBuild.model.common.Filter} parameters.filter
		 * @param {Boolean} parameters.flowStatusForceEnabled
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.sortersReset
		 * @param {Boolean} parameters.storeLoad
		 *
		 * @returns {Void}
		 */
		workflowTreeUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.defaultFilterApplyIfExists = Ext.isBoolean(parameters.defaultFilterApplyIfExists) ? parameters.defaultFilterApplyIfExists : false;
			parameters.filter = Ext.isObject(parameters.filter) && parameters.filter.isFilterAdvancedCompatible ? parameters.filter : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;
			parameters.sortersReset = Ext.isBoolean(parameters.sortersReset) ? parameters.sortersReset : false;

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('workflowTreeUiUpdate(): empty selected workflow', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			this.workflowTreeAppliedFilterReset();

			// Filter setup
				if (Ext.isObject(parameters.filter) && !Ext.Object.isEmpty(parameters.filter))
					this.workflowTreeAppliedFilterSet({ value: parameters.filter });

				// Apply default filter
				if (parameters.defaultFilterApplyIfExists && !this.cmfg('workflowSelectedWorkflowDefaultFilterIsEmpty') && this.cmfg('workflowTreeAppliedFilterIsEmpty'))
					this.workflowTreeAppliedFilterSet({ value: this.cmfg('workflowSelectedWorkflowDefaultFilterGet') });

			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add': {
					this.cmfg('workflowTreeReset');

					this.view.collapseAll();
				} break;

				default: {
					// Suspend events to avoid sortchange fire that will reset form
					this.view.suspendEvents(false);
					this.view.reconfigure(
						parameters.sortersReset ? this.storeSortersSet(this.cmfg('workflowTreeStoreGet')) : null,
						this.workflowTreeBuildColumns()
					);
					this.view.resumeEvents();

					// Forward to sub-controllers
					this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingUiUpdate');
					this.controllerToolbarTop.cmfg('workflowTreeToolbarTopUiUpdate');

					// Setup correct selection and load store
					if (!this.cmfg('workflowSelectedInstanceIsEmpty'))
						return this.applySelection({
							disableFirstRowSelection: parameters.disableFirstRowSelection,
							flowStatusForceEnabled: parameters.flowStatusForceEnabled,
							storeLoad: parameters.storeLoad,
							scope: parameters.scope,
							callback: parameters.callback
						});

					if (parameters.storeLoad == 'disabled')
						return Ext.callback(parameters.callback, parameters.scope);

					// Load store and select first card
					return this.cmfg('workflowTreeStoreLoad', {
						disableFirstRowSelection: parameters.disableFirstRowSelection,
						scope: parameters.scope,
						callback: parameters.callback
					});
				}
			}
		}
	});

})();
