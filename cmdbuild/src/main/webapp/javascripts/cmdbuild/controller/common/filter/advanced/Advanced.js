(function () {

	/**
	 * @deprecated CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced
	 */
	Ext.define('CMDBuild.controller.common.filter.advanced.Advanced', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter}
		 *
		 * @private
		 */
		appliedFilter: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormCommonFilterAdvancedAppliedFilterGet',
			'panelGridAndFormCommonFilterAdvancedAppliedFilterIsEmpty',
			'panelGridAndFormCommonFilterAdvancedAppliedFilterReset',
			'panelGridAndFormCommonFilterAdvancedAppliedFilterSet',
			'panelGridAndFormCommonFilterAdvancedEntryTypeGet',
			'panelGridAndFormCommonFilterAdvancedEntryTypeIsEmpty',
			'panelGridAndFormCommonFilterAdvancedEntryTypeSet = entryTypeSet',
			'panelGridAndFormCommonFilterAdvancedLocalFilterAdd',
			'panelGridAndFormCommonFilterAdvancedLocalFilterGet',
			'panelGridAndFormCommonFilterAdvancedLocalFilterIsEmpty',
			'panelGridAndFormCommonFilterAdvancedLocalFilterRemove',
			'panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet',
			'panelGridAndFormCommonFilterAdvancedManageToggleStateReset',
			'panelGridAndFormCommonFilterAdvancedMasterGridGet',
			'getView = panelGridAndFormCommonFilterAdvancedViewGet',
			'onPanelGridAndFormCommonFilterAdvancedClearButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedDisable',
			'onPanelGridAndFormCommonFilterAdvancedEnable',
			'onPanelGridAndFormCommonFilterAdvancedFilterSelect',
			'onPanelGridAndFormCommonFilterAdvancedManageToggleButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.common.filter.advanced.Manager}
		 */
		controllerManager: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		localFilterCache: {},

		/**
		 * @cfg {Ext.grid.Panel}
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent)
		 */
		masterGrid: undefined,

		/**
		 * @property {CMDBuild.model.common.filter.advanced.SelectedEntryType}
		 *
		 * @private
		 */
		selectedEntryType: undefined,

		/**
		 * @property {CMDBuild.view.common.filter.advanced.AdvancedView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.filter.advanced.AdvancedView', { delegate: this });

			// Build sub-controllers
			this.controllerManager = Ext.create('CMDBuild.controller.common.filter.advanced.Manager', { parentDelegate: this });
		},

		/**
		 * AppliedFilter property functions
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent, grid controller)
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelGridAndFormCommonFilterAdvancedAppliedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelGridAndFormCommonFilterAdvancedAppliedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			panelGridAndFormCommonFilterAdvancedAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			panelGridAndFormCommonFilterAdvancedAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * EntryType property functions
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent, grid controller)
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelGridAndFormCommonFilterAdvancedEntryTypeGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelGridAndFormCommonFilterAdvancedEntryTypeIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';
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
			panelGridAndFormCommonFilterAdvancedEntryTypeSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.filter.advanced.SelectedEntryType';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';

					this.propertyManageSet(parameters);
				}
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
		 * @returns {Ext.grid.Panel}
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent)
		 */
		panelGridAndFormCommonFilterAdvancedMasterGridGet: function () {
			return this.masterGrid;
		},

		// LocalFilterCache property functions
			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			panelGridAndFormCommonFilterAdvancedLocalFilterAdd: function (filterModel) {
				if (Ext.isObject(filterModel) && !Ext.Object.isEmpty(filterModel)) {
					var filterIdentifier = filterModel.get(CMDBuild.core.constants.Proxy.ID);

					if (Ext.isEmpty(filterIdentifier))
						filterIdentifier = new Date().valueOf(); // Compatibility mode with IE older than IE 9 (Date.now())

					this.localFilterCache[filterIdentifier] = filterModel;
				} else {
					_error('panelGridAndFormCommonFilterAdvancedLocalFilterAdd(): unmanaged filterModel parameter', this, filterModel);
				}
			},

			/**
			 * @returns {Array}
			 */
			panelGridAndFormCommonFilterAdvancedLocalFilterGet: function () {
				var localFilterModels = Ext.Object.getValues(this.localFilterCache),
					selectedEntryTypeName = this.cmfg('panelGridAndFormCommonFilterAdvancedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

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
				if (Ext.isObject(filterModel) && !Ext.Object.isEmpty(filterModel)) {
					var identifierToDelete = null;

					// Search for filter
					Ext.Object.each(this.localFilterCache, function (id, object, myself) {
						var filterModelObject = filterModel.getData(),
							localFilterObject = object.getData();

						if (Ext.Object.equals(filterModelObject, localFilterObject))
							identifierToDelete = id;
					}, this);

					if (!Ext.isEmpty(identifierToDelete))
						delete this.localFilterCache[identifierToDelete];
				} else {
					_error('panelGridAndFormCommonFilterAdvancedLocalFilterRemove(): unmanaged filterModel parameter', this, filterModel);
				}
			},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedClearButtonClick: function () {
			var masterGrid = this.cmfg('panelGridAndFormCommonFilterAdvancedMasterGridGet');

			if (!Ext.isEmpty(masterGrid)) {
				if (masterGrid.getSelectionModel().hasSelection())
					masterGrid.getSelectionModel().deselectAll();

				if (!this.cmfg('panelGridAndFormCommonFilterAdvancedAppliedFilterIsEmpty'))
					this.cmfg('panelGridAndFormCommonFilterAdvancedAppliedFilterReset');

				this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet');

				this.view.clearButton.disable();

				/**
				 * @legacy
				 *
				 * FIXME: waiting for refactor (use cmfg)
				 */
				masterGrid.applyFilterToStore({});
				masterGrid.reload();
			} else {
				_error('onPanelGridAndFormCommonFilterAdvancedClearButtonClick(): empty master grid', this, masterGrid);
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
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterSelect: function (filter) {
			var masterGrid = this.cmfg('panelGridAndFormCommonFilterAdvancedMasterGridGet');

			if (!Ext.isEmpty(masterGrid)) {
				this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose');

				filter.resetRuntimeParametersValue();

				this.cmfg('panelGridAndFormCommonFilterAdvancedAppliedFilterSet', { value: filter });
				this.cmfg(
					'panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet',
					this.cmfg('panelGridAndFormCommonFilterAdvancedAppliedFilterGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
				);

				this.view.clearButton.enable();

				/**
				 * @legacy
				 *
				 * FIXME: waiting for refactor (use cmfg)
				 */
				masterGrid.delegate.onFilterMenuButtonApplyActionClick(Ext.create('CMDBuild.model.CMFilterModel', filter.getData()));
			} else {
				_error('onPanelGridAndFormCommonFilterAdvancedFilterSelect(): empty master grid', this, masterGrid);
			}
		},

		/**
		 * @param {Boolean} buttonState
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManageToggleButtonClick: function (buttonState) {
			if (buttonState) {
				this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewShow');
			} else {
				this.controllerManager.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose');
			}
		}
	});

})();
