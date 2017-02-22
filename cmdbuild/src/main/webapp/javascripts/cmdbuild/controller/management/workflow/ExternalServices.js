(function () {

	Ext.define('CMDBuild.controller.management.workflow.ExternalServices', {

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.navigation.chronology.Record} parameters.record
		 *
		 * @returns {Void}
		 */
		onWorkflowExternalServicesNavigationChronologyRecordSelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			var record = parameters.record;

			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onWorkflowExternalServicesNavigationChronologyRecordSelect(): unmanaged record parameter', this, record);

				if (record.isEmpty([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID]))
					return _error('onWorkflowExternalServicesNavigationChronologyRecordSelect(): unmanaged record entryType id property', this, record);
			// END: Error handling

			var accordionController = this.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', record.get([
				CMDBuild.core.constants.Proxy.ENTRY_TYPE,
				CMDBuild.core.constants.Proxy.ID
			]));

			if (Ext.isObject(accordionController) && !Ext.Object.isEmpty(accordionController) && Ext.isFunction(accordionController.cmfg)) {
				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect'); // Instruction required or selection doesn't work if exists another selection
						accordionController.cmfg('accordionNodeByIdSelect', {
							id: record.get([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID]),
							mode: 'silently'
						});

						this.cmfg('workflowUiUpdate', {
							defaultFilterApplyIfExists: true,
							disableFirstRowSelection: true,
							instanceId: record.get([CMDBuild.core.constants.Proxy.ITEM, CMDBuild.core.constants.Proxy.ID]),
							sortersReset: true,
							storeLoad: 'force',
							tabToSelect: record.get([CMDBuild.core.constants.Proxy.SECTION, CMDBuild.core.constants.Proxy.OBJECT, 'itemId']),
							workflowId: record.get([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID])
						});
					}
				});

				accordionController.cmfg('accordionExpand');
			} else {
				_error(
					'onWorkflowExternalServicesNavigationChronologyRecordSelect(): accordion controller not found',
					this,
					record.get([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID])
				);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.format
		 * @param {Object} parameters.instanceId
		 * @param {Object} parameters.workflowId
		 *
		 * @returns {Void}
		 */
		onWorkflowExternalServicesTreePrintButtonClick: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isNumber(parameters.workflowId) || Ext.isEmpty(parameters.workflowId))
					return _error('onWorkflowExternalServicesTreePrintButtonClick(): unmanaged workflowId property', this, parameters.workflowId);
			// END: Error handling

			var accordionController = this.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', parameters.workflowId);

			if (Ext.isObject(accordionController) && !Ext.Object.isEmpty(accordionController) && Ext.isFunction(accordionController.cmfg)) {
				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect'); // Instruction required or selection doesn't work if exists another selection
						accordionController.cmfg('accordionNodeByIdSelect', {
							id: parameters.workflowId,
							mode: 'silently'
						});

						this.cmfg('workflowUiUpdate', {
							defaultFilterApplyIfExists: true,
							disableFirstRowSelection: true,
							instanceId: parameters.instanceId,
							sortersReset: true,
							storeLoad: 'force',
							workflowId: parameters.workflowId,
							scope: this,
							callback: function () {
								this.controllerTree.cmfg('onWorkflowTreePrintButtonClick', parameters.format);
							}
						});
					}
				});

				accordionController.cmfg('accordionExpand');
			} else {
				_error('onWorkflowExternalServicesTreePrintButtonClick(): accordion controller not found', this, parameters.workflowId);
			}
		}
	});

})();
