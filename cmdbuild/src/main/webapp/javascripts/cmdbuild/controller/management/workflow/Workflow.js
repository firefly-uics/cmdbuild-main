(function () {

	Ext.define('CMDBuild.controller.management.workflow.Workflow', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.GridAndForm',

		requires: [
			'CMDBuild.core.constants.Metadata',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.core.LoadMask',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.workflow.Activity',
			'CMDBuild.proxy.management.workflow.Instance',
			'CMDBuild.proxy.management.workflow.Workflow'
		],

		mixins: ['CMDBuild.controller.management.workflow.ExternalServices'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'identifierGet = workflowIdentifierGet, panelGridAndFormIdentifierGet',
			'onWorkflowAbortButtonClick',
			'onWorkflowAddButtonClick',
			'onWorkflowExternalServicesNavigationChronologyRecordSelect', // From mixins
			'onWorkflowExternalServicesTreePrintButtonClick', // From mixins
			'onWorkflowModifyButtonClick = onWorkflowActivityItemDoubleClick',
			'onWorkflowModuleInit = onModuleInit',
			'panelGridAndFormFullScreenUiSetup = workflowFullScreenUiSetup',
			'panelGridAndFormToolsArrayBuild',
			'panelGridAndFormViewModeEquals = workflowUiViewModeEquals',
			'panelGridAndFormViewModeGet = workflowUiViewModeGet',
			'panelGridAndFormViewModeSet = workflowUiViewModeSet',
			'workflowLocalCacheWorkflowGet',
			'workflowLocalCacheWorkflowGetAll',
			'workflowReset',
			'workflowSelectedActivityGet',
			'workflowSelectedActivityIsEmpty',
			'workflowSelectedInstanceGet = panelGridAndFormSelectedItemGet',
			'workflowSelectedInstanceIsEmpty = panelGridAndFormSelectedItemIsEmpty',
			'workflowSelectedWorkflowAttributesGet',
			'workflowSelectedWorkflowAttributesGetAll',
			'workflowSelectedWorkflowAttributesIsEmpty',
			'workflowSelectedWorkflowDefaultFilterGet',
			'workflowSelectedWorkflowDefaultFilterIsEmpty',
			'workflowSelectedWorkflowGet = panelGridAndFormSelectedEntityGet',
			'workflowSelectedWorkflowIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
			'workflowStartActivityGet',
			'workflowUiUpdate = panelGridAndFormUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.Tree}
		 */
		controllerTree: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.FormPanel}
		 */
		form: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		localCacheWorkflow: {
			byId: {},
			byName: {}
		},

		/**
		 * @property {CMDBuild.model.management.workflow.PreviousActivity}
		 *
		 * @private
		 */
		previousSelection: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.Activity}
		 *
		 * @private
		 */
		selectedActivity: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.Instance}
		 *
		 * @private
		 */
		selectedInstance: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.workflow.Workflow}
		 *
		 * @private
		 */
		selectedWorkflow: undefined,

		/**
		 * Array of attribute models (CMDBuild.model.management.workflow.Attribute)
		 *
		 * @property {Object}
		 *
		 * @private
		 */
		selectedWorkflowAttributes: {},

		/**
		 * @property {CMDBuild.model.common.Filter}
		 *
		 * @private
		 */
		selectedWorkflowDefaultFilter: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.StartActivity}
		 *
		 * @private
		 */
		startActivity: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.TreePanel}
		 */
		tree: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.WorkflowView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.MainViewport} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.WorkflowView', { delegate: this });

			// View reset
			this.view.removeAll();
			this.view.removeDocked(this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP));

			// Build sub-controllers
			this.controllerForm = Ext.create('CMDBuild.controller.management.workflow.panel.form.Form', { parentDelegate: this });
			this.controllerTree = Ext.create('CMDBuild.controller.management.workflow.panel.tree.Tree', { parentDelegate: this });

			// Build view (shorthands)
			this.view.add([
				this.tree = this.controllerTree.getView(),
				this.form = this.controllerForm.getView()
			]);
		},

		/**
		 * @param {Array} metadata
		 *
		 * @returns {Number or null} activityId
		 *
		 * @private
		 */
		getActivityIdByMetadata: function (metadata) {
			metadata = Ext.isArray(metadata) ? Ext.Array.clean(metadata) : Ext.Array.Clean([metadata]);

			if (!Ext.isEmpty(metadata)) {
				var activityObject = null,
					metadataValueActivitySubsetId = undefined,
					metadataValueNextActivitySubsetId = undefined;

				// Manual search as optimization to reduce loops number
				Ext.Array.forEach(metadata, function (metadata, i, allMetadata) {
					switch (metadata[CMDBuild.core.constants.Proxy.NAME]) {
						case CMDBuild.core.constants.Metadata.getActivitySubsetId(): {
							metadataValueActivitySubsetId = metadata[CMDBuild.core.constants.Proxy.VALUE];
						} break;

						case CMDBuild.core.constants.Metadata.getNextActivitySubsetId(): {
							metadataValueNextActivitySubsetId = metadata[CMDBuild.core.constants.Proxy.VALUE];
						} break;
					}
				}, this)

				// Search by subsetId metadata
				activityObject = this.getInstanceActivityByMetadata(
					CMDBuild.core.constants.Metadata.getActivitySubsetId(),
					metadataValueActivitySubsetId
				);

				// Search by nextSubsetId metadata
				if (Ext.isEmpty(activityObject))
					activityObject = this.getInstanceActivityByMetadata(
						CMDBuild.core.constants.Metadata.getNextActivitySubsetId(),
						metadataValueNextActivitySubsetId
					);

				return activityObject[CMDBuild.core.constants.Proxy.ID];
			}

			return null;
		},

		/**
		 * @param {String} name
		 * @param {String} value
		 *
		 * @returns {Object or null} activityId
		 *
		 * @private
		 */
		getInstanceActivityByMetadata: function (name, value) {
			if (
				Ext.isString(name) && !Ext.isEmpty(name)
				&& Ext.isString(value) && !Ext.isEmpty(value)
			) {
				return Ext.Array.findBy(
					this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST),
					function (item, i, allItems) {
						var activityInfoListSearchedObject = {};

						if (Ext.isArray(item[CMDBuild.core.constants.Proxy.METADATA]) && !Ext.isEmpty(item[CMDBuild.core.constants.Proxy.METADATA]))
							return Ext.Array.findBy(item[CMDBuild.core.constants.Proxy.METADATA], function (metadataObject, i, allMetadataObjects) {
								return (
									Ext.isObject(metadataObject) && !Ext.Object.isEmpty(metadataObject)
									&& metadataObject[CMDBuild.core.constants.Proxy.NAME] == CMDBuild.core.constants.Metadata.getActivitySubsetId()
									&& metadataObject[CMDBuild.core.constants.Proxy.VALUE] == metadataValueActivitySubsetId
								);
							}, this);

						return false;
					},
					this
				);
			}

			return null;
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowAbortButtonClick: function () {
			this.cmfg('workflowUiViewModeSet');

			// Forward to sub-controllers
			if (!this.workflowPreviousSelectionIsEmpty())
				return this.cmfg('workflowUiUpdate', {
					activityId: this.workflowPreviousSelectionGet(CMDBuild.core.constants.Proxy.ACTIVITY_ID),
					instanceId: this.workflowPreviousSelectionGet(CMDBuild.core.constants.Proxy.INSTANCE_ID),
					workflowId: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID)
				});

			return this.cmfg('workflowUiUpdate', { workflowId: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID) });
		},

		/**
		 * Similar to workflowUiUpdate implementation except for workflowId parameter and some other details
		 *
		 * @param {Object} parameters
		 * @param {Number} parameters.id
		 *
		 * @returns {Void}
		 */
		onWorkflowAddButtonClick: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isNumber(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('onWorkflowAddButtonClick(): unmanaged id parameter', this, parameters.id);
			// END: Error handling

			// UI reset
			this.cmfg('workflowFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('workflowReset');
			this.cmfg('workflowUiViewModeSet', 'add');

			// Local variables reset
			this.workflowSelectedActivityReset();
			this.workflowSelectedInstanceReset();
			this.workflowStartActivityReset();

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_ID] = parameters.id;

			CMDBuild.proxy.management.workflow.Workflow.readStart({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						decodedResponse['rawData'] = decodedResponse; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

						// Setup instance
							var instanceObject = {};
							instanceObject[CMDBuild.core.constants.Proxy.WORKFLOW_ID] = parameters.id;

							this.workflowSelectedInstanceSet({ value: instanceObject });

						// Setup activity
							this.workflowSelectedActivitySet({ value: decodedResponse });

						// Setup start activity
							var startActivityObject = {};
							startActivityObject[CMDBuild.core.constants.Proxy.STATUS] = true;
							startActivityObject[CMDBuild.core.constants.Proxy.WORKFLOW_ID] = parameters.id;

							this.workflowStartActivitySet({ value: startActivityObject });

						this.setViewTitle();

						// Forward to sub-controllers
						this.controllerForm.cmfg('workflowFormUiUpdate', { tabToSelect: 0 });
						this.controllerTree.cmfg('workflowTreeUiUpdate');
					} else {
						_error('onWorkflowAddButtonClick(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowModifyButtonClick: function () {
			this.cmfg('workflowFullScreenUiSetup', { maximize: 'bottom' });
			this.cmfg('workflowUiViewModeSet', 'edit');

			// Forward to sub-controllers
			this.controllerForm.cmfg('workflowFormUiUpdate');
		},

		/**
		 * Setup view items and controllers on accordion click
		 *
		 * @param {Object} parameters
		 * @param {CMDBuild.model.common.Accordion} parameters.node
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onWorkflowModuleInit: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.node = Ext.isObject(parameters.node) ? parameters.node : {};

			if (Ext.isObject(parameters.node) && !Ext.Object.isEmpty(parameters.node)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

				CMDBuild.proxy.management.workflow.Workflow.readAll({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							this.workflowLocalCacheWorkflowSet(decodedResponse);

							this.cmfg('workflowUiUpdate', {
								defaultFilterApplyIfExists: true,
								sortersReset: true,
								storeLoad: 'force',
								workflowId: parameters.node.get(CMDBuild.core.constants.Proxy.ENTITY_ID)
							});
						} else {
							_error('buildLocalCacheWorkflow(): unmanaged response', this, decodedResponse);
						}
					}
				});
			}

			this.onModuleInit(parameters); // Custom callParent() implementation
		},

		/**
		 * Read activity data based from activityId or metadata (priority to metadata)
		 *
		 * @param {String} activityId
		 * @param {Array} metadata
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readActivity: function (activityId, metadata, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;
			metadata = Ext.isArray(metadata) ? Ext.Array.clean(metadata) : Ext.Array.clean([metadata]);
			activityId = Ext.isEmpty(metadata) ? activityId : this.getActivityIdByMetadata(metadata);

			var activitiesInfoList = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST);

			// Returns the only instance's activity
			if (Ext.isArray(activitiesInfoList) && !Ext.isEmpty(activitiesInfoList) && activitiesInfoList.length == 1)
				activityId = activitiesInfoList[0][CMDBuild.core.constants.Proxy.ID];

			if (Ext.isString(activityId) && !Ext.isEmpty(activityId)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = activityId;
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_ID] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID);

				return CMDBuild.proxy.management.workflow.Activity.read({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							decodedResponse['rawData'] = decodedResponse; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

							this.workflowSelectedActivitySet({ value: decodedResponse });

							if (Ext.isFunction(callback))
								Ext.callback(callback, this);
						} else {
							_error('readActivity(): activity not found', this, activityId);
						}
					}
				});
			}

			return Ext.callback(callback, this);
		},

		/**
		 * @param {Number} instanceId
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readInstance: function (instanceId, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			if (Ext.isNumber(instanceId) && !Ext.isEmpty(instanceId)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = instanceId;
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

				return CMDBuild.proxy.management.workflow.Instance.read({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							decodedResponse['rawData'] = decodedResponse; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

							this.workflowSelectedInstanceSet({ value: decodedResponse });

							if (Ext.isFunction(callback))
								Ext.callback(callback, this);
						} else {
							_error('readInstance(): instance not found', this, instanceId);
						}
					}
				});
			}

			return Ext.callback(callback, this);
		},

		/**
		 * @param {Number} workflowId
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readWorkflow: function (workflowId, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (!Ext.isNumber(workflowId) || Ext.isEmpty(workflowId))
					return _error('readWorkflow(): unmanaged workflowId parameter', this, workflowId);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = workflowId;

			CMDBuild.proxy.management.workflow.Workflow.readById({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						decodedResponse['rawData'] = decodedResponse; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

						this.workflowSelectedWorkflowSet({ value: decodedResponse });

						Ext.callback(callback, this);
					} else {
						_error('readWorkflow(): workflow not found', this, workflowId);
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
		readWorkflowAttributes: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('readWorkflowAttributes(): empty selected workflow', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.management.workflow.Workflow.readAttributes({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.workflowSelectedWorkflowAttributesSet(decodedResponse);

						Ext.callback(callback, this);
					} else {
						_error('readWorkflowAttributes(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {CMDBuild.model.common.Accordion} node
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readWorkflowDefaultFilter: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('readWorkflowDefaultFilter(): empty selected workflow', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.GROUP] = CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.DEFAULT_GROUP_NAME);

			CMDBuild.proxy.management.workflow.Workflow.readDefaultFilter({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE][CMDBuild.core.constants.Proxy.ELEMENTS][0];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						var filterConfiguration = decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION];

						if (
							Ext.isString(filterConfiguration) && !Ext.isEmpty(filterConfiguration)
							&& CMDBuild.core.Utils.isJsonString(filterConfiguration)
						) {
							decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.decode(filterConfiguration);
						}

						this.workflowSelectedWorkflowDefaultFilterSet({ value: decodedResponse });
					}

					Ext.callback(callback, this);
				}
			});
		},

		// LocalCacheWorkflow property functions
			/**
			 * @param {Object} parameters
			 * @param {Number} parameters.id
			 * @param {String} parameters.name
			 *
			 * @returns {CMDBuild.model.management.workflow.workflow.Workflow or null}
			 */
			workflowLocalCacheWorkflowGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isNumber(parameters.id) && !Ext.isEmpty(parameters.id))
					return this.localCacheWorkflow.byId[parameters.id];

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return this.localCacheWorkflow.byName[parameters.name];

				return null;
			},

			/**
			 * @returns {Array}
			 */
			workflowLocalCacheWorkflowGetAll: function () {
				return Ext.Object.getValues(this.localCacheWorkflow.byName);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			workflowLocalCacheWorkflowReset: function () {
				this.localCacheWorkflow = {
					byId: {},
					byName: {}
				};
			},

			/**
			 * @param {Array} workflows
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowLocalCacheWorkflowSet: function (workflows) {
				this.workflowLocalCacheWorkflowReset();

				if (Ext.isArray(workflows) && !Ext.isEmpty(workflows))
					Ext.Array.forEach(workflows, function (workflowObject, i, allWorkflowObjects) {
						if (Ext.isObject(workflowObject) && !Ext.Object.isEmpty(workflowObject)) {
							workflowObject['rawData'] = workflowObject; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

							var model = Ext.create('CMDBuild.model.management.workflow.workflow.Workflow', workflowObject);

							this.localCacheWorkflow.byId[model.get(CMDBuild.core.constants.Proxy.ID)] = model;
							this.localCacheWorkflow.byName[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		// PreviousSelection property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			workflowPreviousSelectionGet: function (attributePath) {
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
			workflowPreviousSelectionIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousSelection';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			workflowPreviousSelectionReset: function () {
				return this.propertyManageReset('previousSelection');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowPreviousSelectionSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.PreviousActivity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'previousSelection';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		workflowReset: function () {
			this.controllerForm.cmfg('workflowFormReset');
			this.controllerTree.cmfg('workflowTreeReset');
		},

		// SelectedActivity property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowSelectedActivityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedActivity';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowSelectedActivityIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedActivity';
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
			workflowSelectedActivityReset: function (parameters) {
				this.propertyManageReset('selectedActivity');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowSelectedActivitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.Activity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedActivity';

					this.propertyManageSet(parameters);

					// Manage previous selected activity
					if (!this.cmfg('workflowStartActivityGet', CMDBuild.core.constants.Proxy.STATUS)) {
						var previousSelectionObject = {};
						previousSelectionObject[CMDBuild.core.constants.Proxy.ACTIVITY_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
						previousSelectionObject[CMDBuild.core.constants.Proxy.INSTANCE_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
						previousSelectionObject[CMDBuild.core.constants.Proxy.METADATA] = this.cmfg('workflowSelectedActivityGet',  CMDBuild.core.constants.Proxy.METADATA);
						previousSelectionObject[CMDBuild.core.constants.Proxy.WORKFLOW_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

						this.workflowPreviousSelectionSet({ value: previousSelectionObject });
					}
				}
			},

		// SelectedInstance property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowSelectedInstanceGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedInstance';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowSelectedInstanceIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedInstance';
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
			workflowSelectedInstanceReset: function (parameters) {
				this.propertyManageReset('selectedInstance');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowSelectedInstanceSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.Instance';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedInstance';

					this.propertyManageSet(parameters);

					// Manage previous selected activity
					var previousSelectionObject = {};
					previousSelectionObject[CMDBuild.core.constants.Proxy.INSTANCE_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
					previousSelectionObject[CMDBuild.core.constants.Proxy.WORKFLOW_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

					this.workflowPreviousSelectionSet({ value: previousSelectionObject });
				}
			},

		// SelectedWorkflow property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowSelectedWorkflowGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflow';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowSelectedWorkflowIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflow';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			workflowSelectedWorkflowReset: function () {
				return this.propertyManageReset('selectedWorkflow');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowSelectedWorkflowSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.workflow.Workflow';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflow';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedWorkflowAttributes property functions
			/**
			 * @param {Object} parameters
			 * @param {String} parameters.name
			 * @param {String} parameters.property
			 *
			 * @returns {Object or null}
			 */
			workflowSelectedWorkflowAttributesGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name)) {
					if (Ext.isString(parameters.property) && !Ext.isEmpty(parameters.property))
						return this.selectedWorkflowAttributes[parameters.name].get(parameters.property);

					return this.selectedWorkflowAttributes[parameters.name];
				}

				return null;
			},

			/**
			 * @returns {Array}
			 */
			workflowSelectedWorkflowAttributesGetAll: function () {
				return Ext.Object.getValues(this.selectedWorkflowAttributes);
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Boolean}
			 */
			workflowSelectedWorkflowAttributesIsEmpty: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return Ext.Object.isEmpty(this.selectedWorkflowAttributes[name]);

				return Ext.Object.isEmpty(this.selectedWorkflowAttributes);
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowSelectedWorkflowAttributesSet: function (attributes) {
				this.selectedWorkflowAttributes = {};

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.forEach(attributes, function (attributeObject, i, allAttributeObjects) {
						if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject)) {
							var attributeModel = Ext.create('CMDBuild.model.management.workflow.Attribute', attributeObject);

							this.selectedWorkflowAttributes[attributeModel.get(CMDBuild.core.constants.Proxy.NAME)] = attributeModel;
						}
					}, this);
			},

		// SelectedWorkflowDefaultFilter property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowSelectedWorkflowDefaultFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflowDefaultFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowSelectedWorkflowDefaultFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflowDefaultFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			workflowSelectedWorkflowDefaultFilterReset: function () {
				return this.propertyManageReset('selectedWorkflowDefaultFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowSelectedWorkflowDefaultFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflowDefaultFilter';

					this.propertyManageSet(parameters);
				}
			},

		// StartActivity property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowStartActivityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'startActivity';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowStartActivityReset: function () {
				this.workflowStartActivitySet({
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
			workflowStartActivitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.StartActivity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'startActivity';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {String} parameters.activityId
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Boolean} parameters.defaultFilterApplyIfExists
		 * @param {CMDBuild.model.common.Filter} parameters.filter
		 * @param {Boolean} parameters.flowStatus
		 * @param {Number} parameters.instanceId
		 * @param {Object} parameters.metadata
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.sortersReset
		 * @param {String} parameters.storeLoad - ManagedValues: [force]
		 * @param {Object or String or Number} parameters.tabToSelect
		 * @param {String} parameters.viewMode
		 * @param {Number} parameters.workflowId or parameters.entityId
		 *
		 * @returns {Void}
		 */
		workflowUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			parameters.workflowId = Ext.isEmpty(parameters.workflowId) ? parameters.entityId : parameters.workflowId; // Compatibility with panels call

			parameters.activityId = Ext.isString(parameters.activityId) ? parameters.activityId : null;
			parameters.instanceId = Ext.isNumber(parameters.instanceId) ? parameters.instanceId : null;
			parameters.metadata = Ext.isArray(parameters.metadata) ? parameters.metadata : [];
			parameters.viewMode = Ext.isString(parameters.viewMode) ? parameters.viewMode : 'read';
			parameters.workflowId = Ext.isNumber(parameters.workflowId) ? parameters.workflowId : null;

			// Error handling
				if (!Ext.isNumber(parameters.workflowId) || Ext.isEmpty(parameters.workflowId))
					return _error('workflowUiUpdate(): unmanaged workflowId parameter', this, parameters.workflowId);
			// END: Error handling

			// UI reset
			this.cmfg('workflowFullScreenUiSetup', { maximize: 'top' });
			this.cmfg('workflowReset');
			this.cmfg('workflowUiViewModeSet', parameters.viewMode);

			// Local variables reset
			this.workflowPreviousSelectionReset();
			this.workflowSelectedActivityReset();
			this.workflowSelectedInstanceReset();
			this.workflowSelectedWorkflowDefaultFilterReset();
			this.workflowSelectedWorkflowReset();
			this.workflowStartActivityReset();

			CMDBuild.core.LoadMask.show();

			this.readWorkflow(parameters.workflowId, function () {
				this.readWorkflowAttributes(function () {
					this.readWorkflowDefaultFilter(function () {
						this.readInstance(parameters.instanceId, function () {
							this.readActivity(parameters.activityId, parameters.metadata, function () {
								CMDBuild.core.LoadMask.hide();

								this.setViewTitle(this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

								// Forward to sub-controller
								this.controllerForm.cmfg('workflowFormUiUpdate', { tabToSelect: parameters.tabToSelect });
								this.controllerTree.cmfg('workflowTreeUiUpdate', {
									defaultFilterApplyIfExists: parameters.defaultFilterApplyIfExists,
									disableFirstRowSelection: parameters.disableFirstRowSelection,
									filter: parameters.filter,
									flowStatus: parameters.flowStatus,
									sortersReset: parameters.sortersReset,
									storeLoad: parameters.storeLoad,
									scope: parameters.scope,
									callback: parameters.callback
								});
							});
						});
					});
				});
			});
		}
	});

})();
