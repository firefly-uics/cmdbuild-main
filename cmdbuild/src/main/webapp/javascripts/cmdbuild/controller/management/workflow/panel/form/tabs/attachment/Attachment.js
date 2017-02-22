(function () {

	/**
	 * Override to customize grid buttons disable action
	 */
	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Attachment', {
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
			'onWorkflowFormTabAttachmentShowCallback = onPanelModuleAttachmentTabShowCallback', // Public only for overriding reason
			'onWorkflowFormTabAttachmentInstanceSelect',
			'panelModuleAttachmentTabReset',
			'workflowFormTabAttachmentsUiUpdate'
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
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.TabView', { delegate: this });

			// Build sub-controllers
			this.controllerGrid = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Grid', { parentDelegate: this });

			// Shorthands
			this.grid = this.controllerGrid.getView();

			// View build
			this.view.add([this.grid]);
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabAttachmentShowCallback: function () {
			// Add button setup
				this.grid.buttonAdd.setDisabled(
					this.parentDelegate.cmfg('workflowStartActivityGet', CMDBuild.core.constants.Proxy.STATUS) // On instance's first step
					|| !this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenAttachment())
					|| !this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE)
				);

				if (
					CMDBuild.configuration.workflow.get(CMDBuild.core.constants.Proxy.ENABLE_ADD_ATTACHMENT_ON_CLOSED_ACTIVITIES)
					&& this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getCompletedCapitalized()
				) { // EnableAddAttachmentOnClosedActivities configuration manage
					this.grid.buttonAdd.enable();
				}

			// Back button setup
			this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM).setVisible(
				this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenAttachment())
			);

			// Grid border setup
			this.controllerGrid.cmfg('panelModuleAttachmentGridBorderBottomSet', this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenAttachment()));

			this.controllerGrid.cmfg('panelModuleAttachmentGridStoreLoad');
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabAttachmentInstanceSelect: function () {
			this.view.setDisabled(
				!CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED)
				|| this.cmfg('workflowSelectedInstanceIsEmpty')
			);
		},

		/**
		 * Enable disable tab based on selection validity
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		workflowFormTabAttachmentsUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add':
					return this.view.setDisabled(!this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenAttachment()));

				default:
					return this.view.setDisabled(this.cmfg('workflowSelectedInstanceIsEmpty'));
			}
		}
	});

})();
