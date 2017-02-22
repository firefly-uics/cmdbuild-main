(function () {

	/**
	 * DataView customizations
	 *
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelAppliedFilterIsEmpty
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormUiUpdate
	 */
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.override.common.field.filter.basic.Basic', {
		extend: 'CMDBuild.controller.common.field.filter.basic.Basic',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		parentDelegate: undefined,

		/**
		 * @param {Boolean} disableStoreLoad
		 *
		 * @returns {Void}
		 */
		fieldFilterBasicReset: function (disableStoreLoad) {
			disableStoreLoad = Ext.isBoolean(disableStoreLoad) ? disableStoreLoad : false;

			// Error handling
				if (!Ext.isObject(this.view) || Ext.Object.isEmpty(this.view))
					return _error('onFieldFilterBasicReset(): view not found', this, this.view);
			// END: Error handling

			this.view.setValue();

			if (!disableStoreLoad) {
				var appliedFilterConfigurationObject = undefined;

				if (
					!this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')
					&& !this.cmfg('panelGridAndFormListPanelAppliedFilterGet').isEmptyAdvanced()
				) {
					appliedFilterConfigurationObject = this.cmfg('panelGridAndFormListPanelAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);

					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];
				}

				var params = {};
				params[CMDBuild.core.constants.Proxy.ENTITY_ID] = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID);

				if (Ext.isObject(appliedFilterConfigurationObject) && !Ext.Object.isEmpty(appliedFilterConfigurationObject))
					params[CMDBuild.core.constants.Proxy.FILTER] = Ext.create('CMDBuild.model.common.Filter', { configuration: appliedFilterConfigurationObject });

				this.cmfg('panelGridAndFormUiUpdate', params);
			}
		},

		/**
		 * @returns {Void}
		 */
		onFieldFilterBasicTrigger1Click: function () {
			var value = Ext.String.trim(this.view.getValue());

			if (Ext.isString(value) && !Ext.isEmpty(value)) { // Apply action on NON empty filter string
				var newConfigurationObject = {};

				// Build and apply new filter
				if (this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')) {
					newConfigurationObject = {};
					newConfigurationObject[CMDBuild.core.constants.Proxy.QUERY] = value;
				} else { // Merge filters objects
					newConfigurationObject = this.cmfg('panelGridAndFormListPanelAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);
					newConfigurationObject[CMDBuild.core.constants.Proxy.QUERY] = value;
				}

				this.cmfg('panelGridAndFormUiUpdate', {
					entityId: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
					filter: Ext.create('CMDBuild.model.common.Filter', { configuration: newConfigurationObject })
				});
			} else { // Reset action on empty filter string
				this.cmfg('fieldFilterBasicReset');
			}
		}
	});

})();
