(function () {

	Ext.define('CMDBuild.controller.management.routes.Workflow', {
		extend: 'CMDBuild.controller.common.abstract.Routes',

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.routes.Workflow'
		],

		/**
		 * @property {CMDBuild.model.management.routes.Workflow}
		 *
		 * @private
		 */
		parametersModel: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		supportedPrintFormats: [
			CMDBuild.core.constants.Proxy.PDF,
			CMDBuild.core.constants.Proxy.CSV
		],

		/**
		 * @param {Object} params
		 * @param {String} params.processIdentifier
		 * @param {String} params.clientFilter
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 */
		detail: function (params, path, router) {
			if (this.paramsValidation(params))
				this.readWorkflow({
					scope: this,
					callback: function (response, options, decodedResponse) {
						var accordionController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', decodedResponse[CMDBuild.core.constants.Proxy.ID]),
							clientFilter = this.parametersModel.get(CMDBuild.core.constants.Proxy.CLIENT_FILTER),
							isClientFilterValid = Ext.isObject(clientFilter) && !Ext.Object.isEmpty(clientFilter);

						// Error handling
							if (!CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerExists', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow()))
								return _error('detail(): module controller retriving error', this, CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

							if (!Ext.isObject(accordionController) || Ext.Object.isEmpty(accordionController) || !Ext.isFunction(accordionController.cmfg))
								return CMDBuild.core.Message.warning(CMDBuild.Translation.warning, CMDBuild.Translation.warnings.itemNotAvailable);
						// END: Error handling

						var moduleController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

						Ext.apply(accordionController, {
							disableSelection: true,
							scope: this,
							callback: function () {
								accordionController.cmfg('accordionDeselect');
								accordionController.cmfg('accordionNodeByIdSelect', {
									id: decodedResponse[CMDBuild.core.constants.Proxy.ID],
									mode: isClientFilterValid ? 'silently' : null
								});

								if (isClientFilterValid)
									moduleController.cmfg('workflowUiUpdate', {
										filter: Ext.create('CMDBuild.model.common.Filter', { configuration: clientFilter }),
										sortersReset: true,
										storeLoadForce: true,
										workflowId: decodedResponse[CMDBuild.core.constants.Proxy.ID]
									});
							}
						});

						accordionController.cmfg('accordionExpand');
					}
				});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Boolean}
		 *
		 * @override
		 * @private
		 */
		paramsValidation: function (parameters) {
			this.parametersModel = Ext.create('CMDBuild.model.management.routes.Workflow', parameters);

			// Process identifier validation
			if (Ext.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidProcessIdentifier + ' (' + this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			// Client filter validation
			if (!Ext.isEmpty(this.parametersModel.get(CMDBuild.core.constants.Proxy.CLIENT_FILTER))) {
				// FIXME: validate filter with server side call
			}

			// Print format validation
			if (!Ext.Array.contains(this.supportedPrintFormats, this.parametersModel.get(CMDBuild.core.constants.Proxy.FORMAT))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidPrintFormat + ' (' + this.parametersModel.get(CMDBuild.core.constants.Proxy.FORMAT) + ')',
					false
				);

				return false;
			}

			return this.callParent(arguments);
		},

		/**
		 * @param {Object} params
		 * @param {String} params.format
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 */
		print: function (params, path, router) {
			if (this.paramsValidation(params))
				this.readWorkflow({
					scope: this,
					callback: function (response, options, decodedResponse) {
						// Error handling
							if (!CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerExists', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow()))
								return _error('print(): module controller retriving error', this, CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());
						// END: Error handling

						var moduleController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

						moduleController.cmfg('onWorkflowExternalServicesTreePrintButtonClick', {
							format: this.parametersModel.get(CMDBuild.core.constants.Proxy.FORMAT),
							workflowId: decodedResponse[CMDBuild.core.constants.Proxy.ID]
						});
					}
				});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @private
		 */
		readWorkflow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			var params = {};
			params[CMDBuild.core.constants.Proxy.NAME] = this.parametersModel.get(CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER);

			CMDBuild.proxy.management.routes.Workflow.readByName({
				params: params,
				scope: parameters.scope,
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

					if (Ext.isFunction(parameters.callback))
						Ext.callback(parameters.callback, parameters.scope, [response, options, decodedResponse]);
				}
			});
		},

		/**
		 * @param {Object} params
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 */
		showAll: function (params, path, router) {
			var accordionController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportAccordionControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

			// Error handling
				if (!Ext.isObject(accordionController) || Ext.Object.isEmpty(accordionController) || !Ext.isFunction(accordionController.cmfg))
					return CMDBuild.core.Message.warning(CMDBuild.Translation.warning, CMDBuild.Translation.warnings.itemNotAvailable);
			// END: Error handling

			accordionController.cmfg('accordionExpand');
		}
	});

})();
