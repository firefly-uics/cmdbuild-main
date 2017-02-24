(function () {

	/**
	 * DataView from Sql customizations
	 *
	 * Required managed functions from upper structure:
	 * 	- onPanelGridAndFormCommonToolbarPrintButtonClick
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelAppliedFilterIsEmpty
	 * 	- panelGridAndFormListPanelStoreGet
	 * 	- panelGridAndFormListPanelStoreLoad
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormUiUpdate
	 */
	Ext.define('CMDBuild.controller.management.dataView.sql.panel.override.common.panel.gridAndForm.panel.common.toolbar.Paging', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.panel.grid.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced}
		 */
		controllerFilterAdvanced: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.panel.override.common.field.filter.basic.Basic}
		 */
		controllerFilterBasic: undefined,

		/**
		 * @cfg {CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		view: undefined,

		/**
		 * Merge also basic to avoid callParent
		 *
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.sql.panel.grid.Grid} configurationObject.parentDelegate
		 * @param {Boolean} configurationObject.enableFilterAdvanced
		 * @param {Boolean} configurationObject.enableFilterBasic
		 * @param {Boolean} configurationObject.enableButtonPrint
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.stringToFunctionNameMap = {};

			Ext.apply(this, configurationObject); // Apply configuration to class

			this.decodeCatchedFunctionsArray();

			// Build sub-controllers
			this.controllerFilterAdvanced = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced', { parentDelegate: this });
			this.controllerFilterBasic = Ext.create('CMDBuild.controller.management.dataView.sql.panel.override.common.field.filter.basic.Basic', { parentDelegate: this });

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				delegate: this,
				store: this.cmfg('dataViewSqlGridStoreGet'),
				items: [
					{ xtype: 'tbseparator' },
					this.controllerFilterBasic.getView(),
					{ xtype: 'tbseparator' },
					this.controllerFilterAdvanced.getView(),
					{ xtype: 'tbseparator' },
					this.printButton = Ext.create('CMDBuild.core.buttons.icon.split.Print', {
						delegate: this,
						delegateEventPrefix: 'onDataViewSqlGrid',
						formatList: [
							CMDBuild.core.constants.Proxy.PDF,
							CMDBuild.core.constants.Proxy.CSV
						]
					})
				]
			});
		}
	});

})();
