(function() {

	Ext.define('CMDBuild.controller.administration.workflow.Workflow', {
		extend: 'CMDBuild.controller.common.abstract.BasePanel',

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.administration.classes.CMClassAttributeController}
		 */
		controllerAttributes: undefined,

		/**
		 * @property {CMDBuild.controller.administration.workflow.tabs.Domains}
		 */
		controllerDomains: undefined,

		/**
		 * @property {CMDBuild.controller.administration.workflow.tabs.Properties}
		 */
		controllerProperties: undefined,

		/**
		 * @property {CMDBuild.controller.administration.workflow.tabs.TaskManager}
		 */
		controllerTaks: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowAddButtonClick',
			'onWorkflowPrintSchemaButtonClick = onButtonPrintClick',
			'workflowSelectedWorkflowGet',
			'workflowSelectedWorkflowIsEmpty',
			'workflowSelectedWorkflowReset',
			'workflowTabInit'
		],

		/**
		 * @property {CMDBuild.model.workflow.Workflow}
		 *
		 * @private
		 */
		selectedWorkflow: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.workflow.WorkflowView}
		 */
		view: undefined,

		/**
		 * @param {CMDBuild.view.administration.workflow.WorkflowView} view
		 *
		 * @override
		 */
		constructor: function(view) {
			this.callParent(arguments);

			// Handlers inject
			this.view.printSchemaButton.delegate = this; // Useless on module instantiation refactor

			// Shorthands
			this.tabPanel = this.view.tabPanel;

			this.tabPanel.removeAll();

			// Controller build
			this.controllerAttributes = Ext.create('CMDBuild.controller.administration.classes.CMClassAttributeController', this.view.attributesPanel);
			this.controllerDomains = Ext.create('CMDBuild.controller.administration.workflow.tabs.Domains', { parentDelegate: this });
			this.controllerProperties = Ext.create('CMDBuild.controller.administration.workflow.tabs.Properties', { parentDelegate: this });
			this.controllerTasks = Ext.create('CMDBuild.controller.administration.workflow.tabs.TaskManager', { parentDelegate: this });

			// Inject tabs (sorted)
			this.tabPanel.add(this.controllerProperties.getView());
			this.tabPanel.add(this.view.attributesPanel); // TODO: legacy
			this.tabPanel.add(this.controllerDomains.getView());
			this.tabPanel.add(this.controllerTasks.getView());
		},

		/**
		 * Setup view items and controllers on accordion click
		 *
		 * @param {CMDBuild.model.common.accordion.Generic} node
		 *
		 * @public
		 * @override
		 */
		onViewOnFront: function(node) {
			if (!Ext.Object.isEmpty(node)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = false;

				CMDBuild.core.proxy.workflow.Workflow.read({ // TODO: waiting for refactor (CRUD)
					params: params,
					scope: this,
					success: function(response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES] || [];

						var selectedWorkflow = Ext.Array.findBy(decodedResponse, function(workflowObject, i) {
							return node.get(CMDBuild.core.constants.Proxy.ENTITY_ID) == workflowObject[CMDBuild.core.constants.Proxy.ID];
						}, this);

						if (!Ext.isEmpty(selectedWorkflow)) {
							this.workflowSelectedWorkflowSet({ value: selectedWorkflow });

							this.setViewTitle(this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

							this.cmfg('workflowTabInit');

							this.tabPanel.setActiveTab(0);
							this.tabPanel.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected
						} else {
							_error('workflow with id "' + node.get(CMDBuild.core.constants.Proxy.ENTITY_ID) + '" not found', this);
						}
					}
				});

				this.callParent(arguments);
			}
		},

		onWorkflowAddButtonClick: function() {
			_CMMainViewportController.deselectAccordionByName(CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

			this.setViewTitle();

			this.workflowSelectedWorkflowReset();

			this.tabPanel.setActiveTab(0);

			this.controllerAttributes.onAddClassButtonClick(); // TODO: legacy
			this.controllerDomains.cmfg('onWorkflowTabDomainsAddWorkflowButtonClick');
			this.controllerProperties.cmfg('onWorkflowTabPropertiesAddWorkflowButtonClick');
			this.controllerTasks.cmfg('onWorkflowTabTasksAddWorkflowButtonClick');
		},


		/**
		 * @param {String} format
		 */
		onWorkflowPrintSchemaButtonClick: function(format) {
			if (!Ext.isEmpty(format)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.FORMAT] = format;

				Ext.create('CMDBuild.controller.common.entryTypeGrid.printTool.PrintWindow', {
					parentDelegate: this,
					format: format,
					mode: 'schema',
					parameters: params
				});
			}
		},

		// SelectedWorkflow property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowSelectedWorkflowGet: function(attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflow';
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
			workflowSelectedWorkflowIsEmpty: function(attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflow';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @private
			 */
			workflowSelectedWorkflowReset: function(parameters) {
				this.propertyManageReset('selectedWorkflow');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @private
			 */
			workflowSelectedWorkflowSet: function(parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.workflow.Workflow';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWorkflow';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * TODO: use AbstractController forwarding methods on controllerAttributes controller refactor
		 */
		workflowTabInit: function() {
			this.controllerAttributes.onClassSelected(this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID)); // TODO: legacy
			this.controllerDomains.cmfg('workflowTabInit');
			this.controllerProperties.cmfg('workflowTabInit');
			this.controllerTasks.cmfg('workflowTabInit');
		}
	});

})();