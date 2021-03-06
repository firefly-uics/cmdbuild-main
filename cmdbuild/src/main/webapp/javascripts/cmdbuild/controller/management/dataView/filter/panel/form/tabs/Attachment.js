(function () {

	/**
	 * Override to customize grid buttons disable action
	 */
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Attachment', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Tab',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WidgetType',
			'CMDBuild.core.constants.WorkflowStates'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentTabAddButtonClick',
			'onPanelModuleAttachmentTabBackButtonClick',
			'onPanelModuleAttachmentTabShow',
			'onDataViewFilterFormTabAttachmentShowCallback = onPanelModuleAttachmentTabShowCallback', // Public only for overriding reason
			'panelModuleAttachmentTabReset',
			'dataViewFilterFormTabAttachmentUiUpdate'
		],

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.TabView}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabAttachmentShowCallback: function () {
			this.grid.buttonAdd.setDisabled(
				this.cmfg('panelGridAndFormViewModeEquals', 'readOnly')
				|| !this.cmfg('panelGridAndFormSelectedEntityGet', [
					CMDBuild.core.constants.Proxy.PERMISSIONS,
					CMDBuild.core.constants.Proxy.WRITE
				])
			);

			this.controllerGrid.cmfg('panelModuleAttachmentGridStoreLoad');
		},

		/**
		 * Enable disable tab based on selection validity
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		dataViewFilterFormTabAttachmentUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.view.disable();

				default:
					return this.view.setDisabled(this.cmfg('dataViewFilterSelectedCardIsEmpty'));
			}
		}
	});

})();
