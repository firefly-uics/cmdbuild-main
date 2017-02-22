(function () {

	Ext.define('CMDBuild.controller.management.routes.Instance', {
		extend: 'CMDBuild.controller.common.abstract.Routes',

		requires: [
			'CMDBuild.controller.management.workflow.Utils',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.routes.Instance'
		],

		/**
		 * @property {CMDBuild.model.management.routes.Instance}
		 *
		 * @private
		 */
		parametersModel: undefined,

		/**
		 * @param {Object} params
		 * @param {String} params.processIdentifier
		 * @param {Number} params.instanceIdentifier
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 */
		detail: function (params, path, router) {
			if (this.paramsValidation(params)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.NAME] = this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER);

				CMDBuild.proxy.management.routes.Instance.readWorkflow({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						// Error handling
							if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
								return CMDBuild.core.Message.error(
									CMDBuild.Translation.common.failure,
									CMDBuild.Translation.errors.routesInvalidProcessIdentifier + ' (' + this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER) + ')',
									false
								);
						// END: Error handling

						if (!Ext.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER))) // Single card selection
							return this.readInstanceDetails(decodedResponse);

						if (!Ext.Object.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))) // SimpleFilter
							return this.manageFilterSimple(decodedResponse);
					}
				});
			}
		},

		/**
		 * Get instance id and flowStatus from filtered cards
		 *
		 * @param {Object} workflowObject
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageFilterSimple: function (workflowObject) {
			var simpleFilterDefinitionObject = this.parametersModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER),
 				simpleFilterObject = {
					"attribute": {
						"simple": {
							"attribute": simpleFilterDefinitionObject[CMDBuild.core.constants.Proxy.KEY],
							"operator": "equal",
							"value": [
								simpleFilterDefinitionObject[CMDBuild.core.constants.Proxy.VALUE]
							]
						}
					}
				};

			var params = {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Description']);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER);
			params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(simpleFilterObject);
			params[CMDBuild.core.constants.Proxy.STATE] = CMDBuild.core.constants.WorkflowStates.getAll();

			CMDBuild.proxy.management.routes.Instance.readAll({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					// Error handling
						if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse) || decodedResponse[CMDBuild.core.constants.Proxy.RESULTS] > 1)
							return CMDBuild.core.Message.error(
								CMDBuild.Translation.common.failure,
								CMDBuild.Translation.errors.routesInvalidSimpleFilter,
								false
							);
					// END: Error handling

					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS][0];

					this.manageIdentifierInstance(
						workflowObject,
						decodedResponse[CMDBuild.core.constants.Proxy.ID],
						decodedResponse[CMDBuild.core.constants.Proxy.FLOW_STATUS]
					);
				}
			});
		},

		/**
		 * @param {Object} workflowObject
		 * @param {Number} instanceIdentifier
		 * @param {String} flowStatus
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageIdentifierInstance: function (workflowObject, instanceIdentifier, flowStatus) {
			var accordionController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', workflowObject[CMDBuild.core.constants.Proxy.ID]);

			// Error handling
				if (!Ext.isObject(workflowObject) || Ext.Object.isEmpty(workflowObject))
					return _error('manageIdentifierInstance(): unmanaged workflowObject parameter', this, workflowObject);

				if (!Ext.isObject(accordionController) || Ext.Object.isEmpty(accordionController) || !Ext.isFunction(accordionController.cmfg))
					return _error('manageIdentifierInstance(): accordionController not found', this, accordionController);

				if (!CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerExists', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow()))
					return _error('manageIdentifierInstance(): module controller retriving error', this, CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());
			// END: Error handling

			var moduleController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

			Ext.apply(accordionController, {
				disableSelection: true,
				scope: this,
				callback: function () {
					accordionController.cmfg('accordionDeselect');
					accordionController.cmfg('accordionNodeByIdSelect', {
						id: workflowObject[CMDBuild.core.constants.Proxy.ID],
						mode: 'silently'
					});

					moduleController.cmfg('workflowUiUpdate', {
						defaultFilterApplyIfExists: true,
						disableFirstRowSelection: true,
						flowStatus: CMDBuild.controller.management.workflow.Utils.translateStatusFromCapitalizedMode(flowStatus),
						instanceId: instanceIdentifier,
						sortersReset: true,
						storeLoad: 'force',
						workflowId: workflowObject[CMDBuild.core.constants.Proxy.ID]
					});
				}
			});

			accordionController.cmfg('accordionExpand');
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns  {Boolean}
		 *
		 * @override
		 * @private
		 */
		paramsValidation: function (parameters) {
			this.parametersModel = Ext.create('CMDBuild.model.management.routes.Instance', parameters);

			// Process identifier validation
			if (Ext.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidProcessIdentifier + ' (' + this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			// Instance identifier validation
			if (
				Ext.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER))
				&& Ext.Object.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))
			) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidInstanceIdentifier + ' (' + this.parametersModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			return this.callParent(arguments);
		},

		/**
		 * Get instance flowStatus
		 *
		 * @param {Object} workflowObject
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readInstanceDetails: function (workflowObject) {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.parametersModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER);

			CMDBuild.proxy.management.routes.Instance.read({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					// Error handling
						if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
							return CMDBuild.core.Message.error(
								CMDBuild.Translation.common.failure,
								CMDBuild.Translation.errors.routesInvalidInstanceIdentifier + ' (' + this.parametersModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER) + ')',
								false
							);
					// END: Error handling

					this.manageIdentifierInstance(
						workflowObject,
						decodedResponse[CMDBuild.core.constants.Proxy.ID],
						decodedResponse[CMDBuild.core.constants.Proxy.FLOW_STATUS]
					);
				}
			});
		}
	});

})();
