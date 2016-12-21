(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- onPanelGridAndFormCommonToolbarPrintButtonClick
	 * 	- panelGridAndFormListPanelStoreGet
	 * 	- panelGridAndFormListPanelStoreLoad
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
			'onPanelGridAndFormCommonToolbarPagingShow',
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
		enableFilterAdvanced: false,

		/**
		 * @cfg {Boolean}
		 */
		enableFilterBasic: false,

		/**
		 * @cfg {Boolean}
		 */
		enableButtonPrint: false,

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

			var items = [];

			// Build basic filter controller
			if (Ext.isBoolean(this.enableFilterBasic) && this.enableFilterBasic) {
				this.controllerFilterBasic = Ext.create('CMDBuild.controller.common.field.filter.basic.Basic', { parentDelegate: this });

				items: Ext.Array.push(items, [
					{ xtype: 'tbseparator' },
					this.controllerFilterBasic.getView()
				]);
			}

			// Build advanced filter controller
			if (Ext.isBoolean(this.enableFilterAdvanced) && this.enableFilterAdvanced) {
				this.controllerFilterAdvanced = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced', { parentDelegate: this });

				items: Ext.Array.push(items, [
					{ xtype: 'tbseparator' },
					this.controllerFilterAdvanced.getView()
				]);
			}

			// Build print button
			if (Ext.isBoolean(this.enableButtonPrint) && this.enableButtonPrint)
				items: Ext.Array.push(items, [
					{ xtype: 'tbseparator' },
					this.printButton = Ext.create('CMDBuild.core.buttons.icon.split.Print', {
						delegate: this,
						delegateEventPrefix: 'onPanelGridAndFormCommonToolbar',
						formatList: [
							CMDBuild.core.constants.Proxy.PDF,
							CMDBuild.core.constants.Proxy.CSV
						]
					})
				]);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				delegate: this,
				store: this.cmfg('panelGridAndFormListPanelStoreGet'),
				items: items
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
		 * Forwarder method
		 *
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

			if (Ext.isObject(this.controllerFilterAdvanced) && !Ext.Object.isEmpty(this.controllerFilterAdvanced))
				this.controllerFilterAdvanced.cmfg('panelGridAndFormCommonFilterAdvancedUiUpdate');
		}
	});

})();
