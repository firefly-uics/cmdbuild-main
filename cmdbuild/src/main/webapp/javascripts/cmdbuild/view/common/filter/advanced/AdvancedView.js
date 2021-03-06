(function () {

	/**
	 * @deprecated CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.AdvancedView
	 */
	Ext.define('CMDBuild.view.common.filter.advanced.AdvancedView', {
		extend: 'Ext.container.ButtonGroup',

		/**
		 * @cfg {CMDBuild.controller.common.filter.advanced.Advanced}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.icon.filter.SearchClear}
		 */
		clearButton: undefined,

		/**
		 * @property {CMDBuild.core.buttons.icon.filter.SearchSet}
		 */
		manageToggleButton: undefined,

		border: false,
		frame: false,
		shadow: false,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.manageToggleButton = Ext.create('CMDBuild.core.buttons.icon.filter.SearchSet', {
						enableToggle: true,
						scope: this,

						toggleHandler: function (button, state) {
							this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManageToggleButtonClick', state);
						}
					}),
					this.clearButton = Ext.create('CMDBuild.core.buttons.icon.filter.SearchClear', {
						disabled: true,
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick');
						}
					})
				]
			});

			this.callParent(arguments);
		},

		/**
		 * Override to avoid full button group container disabled
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		disable: function () {
			this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedDisable');
		},

		/**
		 * @returns {Void}
		 *
		 * @deprecated
		 */
		disableClearFilterButton: function () {
			_deprecated('disableClearFilterButton', this);

			this.clearButton.disable();
		},

		/**
		 * Override to avoid full button group container disabled
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		enable: function () {
			this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedEnable');
		},

		/**
		 * @returns {Void}
		 *
		 * @deprecated
		 */
		enableClearFilterButton: function () {
			_deprecated('enableClearFilterButton', this);

			this.clearButton.enable();
		},

		/**
		 * @param {String} label
		 *
		 * @returns {Ext.data.Store}
		 *
		 * @deprecated
		 */
		getFilterStore: function () {
			_deprecated('getFilterStore', this);

			return this.delegate.controllerManager.grid.getStore();
		},

		/**
		 * @param {String} label
		 *
		 * @returns {Void}
		 *
		 * @deprecated
		 */
		setFilterButtonLabel: function (label) {
			_deprecated('setFilterButtonLabel', this);

			this.delegate.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet', label);
		}
	});

})();
