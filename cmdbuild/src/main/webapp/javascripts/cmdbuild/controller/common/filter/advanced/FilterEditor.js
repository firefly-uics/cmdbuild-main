(function () {

	/**
	 * @link CMDBuild.controller.common.field.filter.advanced.window.Window
	 * @deprecated CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.FilterEditor
	 */
	Ext.define('CMDBuild.controller.common.filter.advanced.FilterEditor', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelGridAndFormCommonFilterAdvancedFilterEditorAbortButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedFilterEditorApplyButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedFilterEditorSaveAndApplyButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedFilterEditorViewHide',
			'onPanelGridAndFormCommonFilterAdvancedFilterEditorViewShow'
		],

		/**
		 * @property {CMDBuild.view.common.filter.advanced.FilterEditorWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.filter.advanced.FilterEditorWindow', { delegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterEditorAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterEditorApplyButtonClick: function () {
			var filterModelObject = this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet').getData();
			filterModelObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = this.view.fieldFilter.getValue();

			// If new filter model
			if (Ext.isEmpty(filterModelObject[CMDBuild.core.constants.Proxy.ID])) {
				filterModelObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = CMDBuild.Translation.newSearchFilter;
				filterModelObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.newSearchFilter;
			}

			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', { value: filterModelObject });

			// Save filter in local storage
			if (this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty', CMDBuild.core.constants.Proxy.ID))
				this.cmfg('panelGridAndFormCommonFilterAdvancedLocalFilterAdd', this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet'));

			this.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose'); // Close manager view
			this.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterSelect', this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet')); // Apply filter to store
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterEditorSaveAndApplyButtonClick: function () {
			var filterModelObject = this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet').getData();
			filterModelObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = this.view.fieldFilter.getValue();

			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', { value: filterModelObject });
			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSave', { enableApply: true });
		},

		/**
		 * Reset manage toggle button on window hide with no filters in manager store
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterEditorViewHide: function () {
			if (this.cmfg('panelGridAndFormCommonFilterAdvancedManagerStoreIsEmpty'))
				this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleStateReset');
		},

		/**
		 * Show event forwarder method
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedFilterEditorViewShow: function () {
			this.setViewTitle([
				this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet', CMDBuild.core.constants.Proxy.NAME),
				this.cmfg('panelGridAndFormCommonFilterAdvancedEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
			]);

			this.view.fieldFilter.configure({
				className: this.cmfg('panelGridAndFormCommonFilterAdvancedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME),
				disabledPanels: ['functions'],
				scope: this,
				callback: function () {
					this.view.fieldFilter.setValue(this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));
				}
			});
		}
	});

})();
