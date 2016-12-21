(function () {

	Ext.define('CMDBuild.controller.management.dataView.ExternalServices', {

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.navigation.chronology.Record} parameters.record
		 *
		 * @returns {Void}
		 */
		onDataViewExternalServicesNavigationChronologyRecordSelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			var record = parameters.record;

			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onDataViewExternalServicesNavigationChronologyRecordSelect(): unmanaged record parameter', this, record);

				if (record.isEmpty([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID]))
					return _error('onDataViewExternalServicesNavigationChronologyRecordSelect(): unmanaged record entryType id property', this, record);
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

						this.cmfg('dataViewUiUpdate', {
							cardId: record.get([CMDBuild.core.constants.Proxy.ITEM, CMDBuild.core.constants.Proxy.ID]),
							entityId: record.get([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID]),
							tabToSelect: record.get([CMDBuild.core.constants.Proxy.SECTION, CMDBuild.core.constants.Proxy.OBJECT, 'itemId'])
						});
					}
				});

				accordionController.cmfg('accordionExpand');
			} else {
				_error(
					'onDataViewExternalServicesNavigationChronologyRecordSelect(): accordion controller not found',
					this,
					record.get([CMDBuild.core.constants.Proxy.ENTRY_TYPE, CMDBuild.core.constants.Proxy.ID])
				);
			}
		}
	});

})();
