(function () {

	Ext.define('CMDBuild.controller.management.routes.Instance', {
		extend: 'CMDBuild.controller.common.abstract.Routes',

		requires: [
			'CMDBuild.core.configurations.Routes',
			'CMDBuild.core.configurations.WorkflowStates',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.routes.Instance'
		],

		/**
		 * @property {CMDBuild.model.management.routes.Instance}
		 *
		 * @private
		 */
		paramsModel: undefined,

		/**
		 * @param {Object} params - url parameters
		 * @param {String} params.processIdentifier - process name
		 * @param {Number} params.instanceIdentifier - instance id
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 */
		detail: function (params, path, router) {
			if (this.paramsValidation(params)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = false;

				CMDBuild.proxy.management.routes.Instance.readWorkflow({ // FIXME: waiting for refactor (server endpoint)
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							var workflowObject = Ext.Array.findBy(decodedResponse, function (workflowObject, i) {
								return this.paramsModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER) == workflowObject[CMDBuild.core.constants.Proxy.NAME];
							}, this);

							if (Ext.isObject(workflowObject) && !Ext.Object.isEmpty(workflowObject)) {
								if (!Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER))) // Single card selection
									return this.manageIdentifierInstance(workflowObject);

								if (!Ext.Object.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))) // SimpleFilter
									return this.manageFilterSimple(workflowObject, this.paramsModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER));
							}

							return CMDBuild.core.Message.error(
								CMDBuild.Translation.common.failure,
								CMDBuild.Translation.errors.routesInvalidProcessIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER) + ')',
								false
							);
						} else {
							_error('detail(): unmanaged decodedResponse value', this, decodedResponse);
						}
					}
				});
			}
		},

		/**
		 * @param {Object} workflowObject
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageFilterSimple: function (workflowObject) {
			var simpleFilterDefinitionObject = this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER);

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.paramsModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER);
			params[CMDBuild.core.constants.Proxy.FILTER] = '{"attribute":{"simple":{"attribute":"'
				+ simpleFilterDefinitionObject[CMDBuild.core.constants.Proxy.KEY] + '","operator":"equal","value":["'
				+ simpleFilterDefinitionObject[CMDBuild.core.constants.Proxy.VALUE] + '"]}}}';
			params[CMDBuild.core.constants.Proxy.STATE] = CMDBuild.core.configurations.WorkflowStates.getAll();

			CMDBuild.proxy.management.routes.Instance.readAllActivities({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (decodedResponse[CMDBuild.core.constants.Proxy.RESULTS] == 1) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS];

						this.manageIdentifierInstance(
							workflowObject,
							decodedResponse[0][CMDBuild.core.constants.Proxy.ID],
							CMDBuild.core.configurations.WorkflowStates.getAll()
						);
					} else {
						CMDBuild.core.Message.error(
							CMDBuild.Translation.common.failure,
							CMDBuild.Translation.errors.routesInvalidSimpleFilter,
							false
						);
					}
				}
			});
		},

		/**
		 * @param {Object} workflowObject
		 * @param {Number} instanceIdentifier
		 * @param {String} forceState
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageIdentifierInstance: function (workflowObject, instanceIdentifier, forceState) {
			var accordionController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportAccordionControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());
			var moduleController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

			if (!Ext.isObject(workflowObject) || Ext.Object.isEmpty(workflowObject))
				return _error('manageIdentifierInstance(): invalid workflowObject parameter', this, workflowObject);


			if (!Ext.isNumber(instanceIdentifier) || Ext.isEmpty(instanceIdentifier))
				return _error('manageIdentifierInstance(): invalid instanceIdentifier parameter', this, instanceIdentifier);

			if (
				Ext.isObject(accordionController) && !Ext.Object.isEmpty(accordionController)
				&& Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)
			) {
				accordionController.disableStoreLoad = true;
				accordionController.cmfg('accordionExpand', {
					scope: this,
					callback: function () {
						Ext.apply(accordionController, { // Setup accordion update callback
							scope: this,
							callback: function () {
								moduleController.cmfg('workflowTreeApplyStoreEvent', {
									eventName: 'load',
									fn: function () {
										moduleController.cmfg('workflowTreeActivityOpen', { id: instanceIdentifier });

										if (Ext.isString(forceState) && !Ext.isEmpty(forceState))
											moduleController.cmfg('workflowTreeToolbarTopStatusValueSet', {
												value: forceState,
												silently: true // Useless server call optimization
											});
									},
									scope: this,
									options: { single: true }
								});
							}
						});

						accordionController.cmfg('accordionDeselect');
						accordionController.cmfg('accordionUpdateStore', workflowObject[CMDBuild.core.constants.Proxy.ID]);
					}
				});
			} else {
				_error('manageIdentifierInstance(): accordion or module controllers not found', this, CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());
			}
		},

		/**
		 * @param {Object} params
		 *
		 * @returns  {Boolean}
		 *
		 * @override
		 * @private
		 */
		paramsValidation: function (params) {
			this.paramsModel = Ext.create('CMDBuild.model.management.routes.Instance', params);

			// Process identifier validation
			if (Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidProcessIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			// Instance identifier validation
			if (
				Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER))
				&& Ext.Object.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))
			) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidInstanceIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			return this.callParent(arguments);
		}
	});

})();