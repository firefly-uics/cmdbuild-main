(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelAppliedFilterIsEmpty
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormUiUpdate
	 */
	Ext.define('CMDBuild.controller.common.field.filter.basic.Basic', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.advanced.window.Window}
		 */
		controllerFilterWindow: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldFilterBasicReset',
			'fieldFilterBasicSetDisabled',
			'fieldFilterBasicUiUpdate',
			'onFieldFilterBasicTrigger1Click = onFieldFilterBasicEnterKeyPress',
			'onFieldFilterBasicTrigger2Click'
		],

		/**
		 * @property {CMDBuild.view.common.field.filter.basic.Basic}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 * @param {Object} configObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.field.filter.basic.Basic', { delegate: this });
		},

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
				if (
					this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')
					|| this.cmfg('panelGridAndFormListPanelAppliedFilterGet').isEmptyAdvanced()
				) {
					this.cmfg('panelGridAndFormUiUpdate', {
						filterReset: true,
						workflowId: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
					});
				} else {
					var appliedFilterModel = this.cmfg('panelGridAndFormListPanelAppliedFilterGet'),
						appliedFilterConfigurationObject = appliedFilterModel.get(CMDBuild.core.constants.Proxy.CONFIGURATION)

					delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

					this.cmfg('panelGridAndFormUiUpdate', {
						filter: Ext.create('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', { configuration: appliedFilterConfigurationObject }),
						workflowId: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
					});
				}
			}
		},

		/**
		 * @param {Boolean} state
		 *
		 * @returns {Void}
		 */
		fieldFilterBasicSetDisabled: function (state) {
			state = Ext.isBoolean(state) ? state : true;

			return this.view.setDisabled(state);
		},

		/**
		 * @returns {Void}
		 */
		fieldFilterBasicUiUpdate: function () {
			if (
				!this.cmfg('panelGridAndFormListPanelAppliedFilterIsEmpty')
				&& !this.cmfg('panelGridAndFormListPanelAppliedFilterGet').isEmptyBasic()
			) {
				var appliedFilterConfiguration = this.cmfg('panelGridAndFormListPanelAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION),
					queryString = appliedFilterConfiguration[CMDBuild.core.constants.Proxy.QUERY];

				if (Ext.isString(queryString) && !Ext.isEmpty(queryString))
					this.view.setValue(queryString);
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
					filter: Ext.create('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', { configuration: newConfigurationObject }),
					workflowId: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
				});
			} else { // Reset action on empty filter string
				this.cmfg('fieldFilterBasicReset');
			}
		},

		/**
		 * @returns {Void}
		 */
		onFieldFilterBasicTrigger2Click: function () {
			if (!this.view.isDisabled())
				this.cmfg('fieldFilterBasicReset');
		}
	});

})();
