(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelAppliedFilterIsEmpty
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormUiUpdate
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'getView = panelGridAndFormCommonFilterAdvancedViewGet',
			'onPanelGridAndFormCommonFilterAdvancedClearButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedDisable',
			'onPanelGridAndFormCommonFilterAdvancedEnable',
			'onPanelGridAndFormCommonFilterAdvancedFilterSelect',
			'onPanelGridAndFormCommonFilterAdvancedManageToggleButtonClick',
			'panelGridAndFormCommonFilterAdvancedLocalFilterAdd',
			'panelGridAndFormCommonFilterAdvancedLocalFilterGet',
			'panelGridAndFormCommonFilterAdvancedLocalFilterIsEmpty',
			'panelGridAndFormCommonFilterAdvancedLocalFilterRemove',
			'panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet',
			'panelGridAndFormCommonFilterAdvancedManageToggleStateReset',
			'panelGridAndFormCommonFilterAdvancedSetDisabled',
			'panelGridAndFormCommonFilterAdvancedUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		controllerManager: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters}
		 */
		controllerRuntimeParameters: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		localFilterCache: {},

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.AdvancedView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.AdvancedView', { delegate: this });

			// Build sub-controllers
			this.controllerManager = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager', { parentDelegate: this });
			this.controllerRuntimeParameters = Ext.create('CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters', { parentDelegate: this });
		},

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
				if (
					this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')
					|| this.cmfg('panelGridAndFormListPanelAppliedFilterGet').isEmptyBasic()
				) {
					this.cmfg('panelGridAndFormUiUpdate', {
						filterReset: true,
						workflowId: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
					});
				} else {
					var appliedFilterModel = this.cmfg('panelGridAndFormListPanelAppliedFilterGet'),
						appliedFilterConfigurationObject = appliedFilterModel.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.ATTRIBUTE];
					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.RELATION];
					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.FUNCTIONS];

					this.cmfg('panelGridAndFormUiUpdate', {
						filter: Ext.create('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', { configuration: appliedFilterConfigurationObject }),
						workflowId: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
					});
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedDisable: function () {
			this.view.clearButton.disable();
			this.view.manageToggleButton.disable();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedEnable: function () {
			this.view.clearButton.enable();
			this.view.manageToggleButton.enable();
		},

		/**
		 * Apply selected filter to store or clear grid and buttons state
		 *
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
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
					filter: filter,
					workflowId: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
				});
			} else {
				this.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick');
			}
		},

		/**
		 * @param {Boolean} buttonState
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManageToggleButtonClick: function (buttonState) {
			return buttonState
				? this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewShow')
				: this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose');
		},

		/**
		 * @param {String} label
		 *
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet: function (label) {
			this.view.manageToggleButton.setText(Ext.isEmpty(label) ? CMDBuild.Translation.searchFilter : Ext.String.ellipsis(label, 20));
			this.view.manageToggleButton.setTooltip(Ext.isEmpty(label) ? '' : label);
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedManageToggleStateReset: function () {
			this.view.manageToggleButton.toggle(false);
		},

		/**
		 * @param {Boolean} state
		 *
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedSetDisabled: function (state) {
			state = Ext.isBoolean(state) ? state : true;

			if (state)
				return this.cmfg('onPanelGridAndFormCommonFilterAdvancedDisable');

			return this.cmfg('onPanelGridAndFormCommonFilterAdvancedEnable');
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedUiUpdate: function () {
			this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose');

			this.view.clearButton.enable();

			if (
				this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')
				|| this.cmfg('panelGridAndFormListPanelAppliedFilterGet', CMDBuild.core.constants.Proxy.DEFAULT)
				|| this.cmfg('panelGridAndFormListPanelAppliedFilterGet').isEmptyAdvanced()
			) {
				this.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick', { disableStoreLoad: true });
			} else {
				var filter = this.cmfg('panelGridAndFormListPanelAppliedFilterGet');

				filter.resetRuntimeParametersValue();

				this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet', filter.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
			}
		},

		// LocalFilterCache property functions
			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			panelGridAndFormCommonFilterAdvancedLocalFilterAdd: function (filterModel) {
				// Error handling
					if (!Ext.isObject(filterModel) || Ext.Object.isEmpty(filterModel))
						return _error('panelGridAndFormCommonFilterAdvancedLocalFilterAdd(): unmanaged filterModel parameter', this, filterModel);
				// END: Error handling

				var filterIdentifier = filterModel.get(CMDBuild.core.constants.Proxy.ID);

				if (Ext.isEmpty(filterIdentifier))
					filterIdentifier = new Date().valueOf(); // Compatibility mode with IE older than IE 9 (Date.now())

				this.localFilterCache[filterIdentifier] = filterModel;
			},

			/**
			 * @returns {Array} localFilterModels
			 */
			panelGridAndFormCommonFilterAdvancedLocalFilterGet: function () {
				var localFilterModels = Ext.Object.getValues(this.localFilterCache),
					selectedEntryTypeName = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

				// Remove filter models not related with selected entrytype
				if (Ext.isArray(localFilterModels) && !Ext.isEmpty(localFilterModels))
					localFilterModels = Ext.Array.filter(localFilterModels, function (filterModel, i, allFilterModels) {
						return filterModel.get(CMDBuild.core.constants.Proxy.ENTRY_TYPE) == selectedEntryTypeName;
					}, this);

				return localFilterModels;
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelGridAndFormCommonFilterAdvancedLocalFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'localFilterCache';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			panelGridAndFormCommonFilterAdvancedLocalFilterRemove: function (filterModel) {
				// Error handling
					if (!Ext.isObject(filterModel) || Ext.Object.isEmpty(filterModel))
						return _error('panelGridAndFormCommonFilterAdvancedLocalFilterRemove(): unmanaged filterModel parameter', this, filterModel);
				// END: Error handling

				var identifierToDelete = null;

				// Search for filter
				Ext.Object.each(this.localFilterCache, function (id, object, myself) {
					var filterModelObject = filterModel.getData();
					var localFilterObject = object.getData();

					if (Ext.Object.equals(filterModelObject, localFilterObject))
						identifierToDelete = id;
				}, this);

				if (!Ext.isEmpty(identifierToDelete))
					delete this.localFilterCache[identifierToDelete];
			}
	});

})();
