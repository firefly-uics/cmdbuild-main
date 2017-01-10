(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- onPanelGridAndFormCommonToolbarPrintButtonClick
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelAppliedFilterIsEmpty
	 * 	- panelGridAndFormListPanelFilterApply
	 * 	- panelGridAndFormListPanelFilterClear
	 * 	- panelGridAndFormListPanelStoreGet
	 * 	- panelGridAndFormListPanelStoreLoad
	 * 	- panelGridAndFormSelectedEntityGet
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormCommonToolbarPagingFilterAdvancedReset',
			'panelGridAndFormCommonToolbarPagingFilterBasicReset',
			'panelGridAndFormCommonToolbarPagingUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced}
		 */
		controllerFilterAdvanced: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.basic.Basic}
		 */
		controllerFilterBasic: undefined,

		/**
		 * @cfg {Boolean}
		 */
		disableButtonPrint: false,

		/**
		 * @cfg {Boolean}
		 */
		disableFilterAdvanced: false,

		/**
		 * @cfg {Boolean}
		 */
		disableFilterBasic: false,

		/**
		 * @property {CMDBuild.core.buttons.icon.split.Print}
		 */
		printButton: undefined,

		/**
		 * @cfg {CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 * @param {Boolean} configurationObject.enableFilterAdvanced
		 * @param {Boolean} configurationObject.enableFilterBasic
		 * @param {Boolean} configurationObject.enableButtonPrint
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Build sub-controllers
			this.controllerFilterAdvanced = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced', { parentDelegate: this });
			this.controllerFilterBasic = Ext.create('CMDBuild.controller.common.field.filter.basic.Basic', { parentDelegate: this });

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				delegate: this,
				store: this.cmfg('panelGridAndFormListPanelStoreGet'),
				items: [
					{ xtype: 'tbseparator' },
					this.controllerFilterBasic.getView(),
					{ xtype: 'tbseparator' },
					this.controllerFilterAdvanced.getView(),
					{ xtype: 'tbseparator' },
					this.printButton = Ext.create('CMDBuild.core.buttons.icon.split.Print', {
						delegate: this,
						delegateEventPrefix: 'onPanelGridAndFormCommonToolbar',
						formatList: [
							CMDBuild.core.constants.Proxy.PDF,
							CMDBuild.core.constants.Proxy.CSV
						]
					})
				]
			});
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonToolbarPagingFilterAdvancedReset: function () {
			if (Ext.isObject(this.controllerFilterAdvanced) && !Ext.Object.isEmpty(this.controllerFilterAdvanced))
				this.controllerFilterAdvanced.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick', { disableStoreLoad: true });
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonToolbarPagingFilterBasicReset: function () {
			if (Ext.isObject(this.controllerFilterBasic) && !Ext.Object.isEmpty(this.controllerFilterBasic))
				this.controllerFilterBasic.cmfg('onFieldFilterBasicReset', true);
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonToolbarPagingUiUpdate: function () {
			this.cmfg('panelGridAndFormCommonToolbarPagingFilterBasicReset');

			// Setup enable/disable state
			this.controllerFilterAdvanced.cmfg('panelGridAndFormCommonFilterAdvancedSetDisabled', this.disableFilterAdvanced);
			this.controllerFilterBasic.cmfg('fieldFilterBasicSetDisabled', this.disableFilterBasic);
			this.printButton.setDisabled(this.disableButtonPrint);

			// Forward to sub-controllers
			this.controllerFilterAdvanced.cmfg('panelGridAndFormCommonFilterAdvancedUiUpdate');
		}
	});

})();
