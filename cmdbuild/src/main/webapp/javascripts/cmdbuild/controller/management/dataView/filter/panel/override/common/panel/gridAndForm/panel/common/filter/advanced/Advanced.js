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
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.override.common.panel.gridAndForm.panel.common.filter.advanced.Advanced', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced',

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		parentDelegate: undefined,

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.disableStoreLoad
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedClearButtonClick: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.disableStoreLoad = Ext.isBoolean(parameters.disableStoreLoad) ? parameters.disableStoreLoad : false;

			this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet');

			this.view.clearButton.disable();

			if (!parameters.disableStoreLoad) {
				var appliedFilterConfigurationObject = undefined;

				if (!this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty') && !this.cmfg('panelGridAndFormListPanelAppliedFilterGet').isEmptyBasic()) {
					appliedFilterConfigurationObject = this.cmfg('panelGridAndFormListPanelAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);

					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.ATTRIBUTE];
					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.RELATION];
					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.FUNCTIONS];
				}

				var params = {};
				params[CMDBuild.core.constants.Proxy.ENTITY_ID] = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID);

				if (!Ext.isEmpty(appliedFilterConfigurationObject))
					params[CMDBuild.core.constants.Proxy.FILTER] = Ext.create('CMDBuild.model.common.Filter', {
						configuration: appliedFilterConfigurationObject
					});

				this.cmfg('panelGridAndFormUiUpdate', params);
			}
		},

		/**
		 * Apply selected filter to store or clear grid and buttons state
		 *
		 * @param {CMDBuild.model.common.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterSelect: function (filter) {
			this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose');

			this.view.clearButton.enable();

			if (Ext.isObject(filter) && !Ext.Object.isEmpty(filter) && filter.isFilterAdvancedCompatible && !filter.isEmpty()) {
				filter.resetRuntimeParametersValue();

				this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet', filter.get(CMDBuild.core.constants.Proxy.DESCRIPTION));

				var emptyRuntimeParameters = filter.getEmptyRuntimeParameters(),
					filterConfigurationObject = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

				if (Ext.isArray(emptyRuntimeParameters) && !Ext.isEmpty(emptyRuntimeParameters))
					return this.controllerRuntimeParameters.cmfg('fieldFilterRuntimeParametersShow', filter);

				filter.resolveCalculatedParameters();

				// Merge applied filter query parameter to filter object
				if (!this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')) {
					var appliedFilterConfigurationObject = this.cmfg('panelGridAndFormListPanelAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);

					if (!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]))
						filter.set(CMDBuild.core.constants.Proxy.CONFIGURATION, Ext.apply(filterConfigurationObject, {
							query: appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]
						}));
				}

				this.cmfg('panelGridAndFormUiUpdate', {
					entityId: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
					filter: filter
				});
			} else {
				this.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick');
			}
		}
	});

})();
