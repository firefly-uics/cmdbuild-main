(function () {

	/**
	 * Adapter
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.management.workflow.panel.form.Form', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.form.Form',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.controller.management.workflow.panel.form.tabs.activity.Activity'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.Workflow}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowFormSaveButtonClick',
			'panelGridAndFormPanelFormTabActiveFireShowEvent = workflowFormTabActiveFireShowEvent',
			'panelGridAndFormPanelFormTabActiveSet = workflowFormTabActiveSet',
			'panelGridAndFormPanelFormTabSelectionManage = workflowFormTabSelectionManage',
			'workflowFormReset',
			'workflowFormTabNoteValueGet',
			'workflowFormTemplateResolverFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'workflowFormUiUpdate',
			'workflowFormWidgetExists'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.OperativeInstructions}
		 */
		controllerOperativeInstructions: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.activity.Activity}
		 */
		controllerTabActivity: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Attachment}
		 */
		controllerTabAttachment: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.Email}
		 */
		controllerTabEmail: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.History}
		 */
		controllerTabHistory: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.Note}
		 */
		controllerTabNote: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.Relations}
		 */
		controllerTabRelations: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.FormPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.Workflow} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.FormPanel', { delegate: this });

			// Shorthands
			this.tabPanel = Ext.create('CMDBuild.view.management.workflow.panel.form.TabPanel', { delegate: this });

			// Build sub-controllers
			this.controllerOperativeInstructions = Ext.create('CMDBuild.controller.management.workflow.panel.form.OperativeInstructions', { parentDelegate: this });
			this.controllerTabActivity = this.buildTabControllerActivity();

			if (!CMDBuild.configuration.userInterface.isDisabledProcessTab(CMDBuild.core.constants.Proxy.PROCESS_ATTACHMENT_TAB))
				this.controllerTabAttachment = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Attachment', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledProcessTab(CMDBuild.core.constants.Proxy.PROCESS_EMAIL_TAB))
				this.controllerTabEmail = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.Email', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledProcessTab(CMDBuild.core.constants.Proxy.PROCESS_HISTORY_TAB))
				this.controllerTabHistory = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.History', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledProcessTab(CMDBuild.core.constants.Proxy.PROCESS_NOTE_TAB))
				this.controllerTabNote = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.Note', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledProcessTab(CMDBuild.core.constants.Proxy.PROCESS_RELATION_TAB))
				this.controllerTabRelations = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.Relations', { parentDelegate: this });

			// View build
			this.tabPanel.add([ // Tab panel build (sorted)
				this.controllerTabActivity.getView(),
				Ext.isEmpty(this.controllerTabNote) ? null : this.controllerTabNote.getView(),
				Ext.isEmpty(this.controllerTabRelations) ? null : this.controllerTabRelations.getView(),
				Ext.isEmpty(this.controllerTabHistory) ? null : this.controllerTabHistory.getView(),
				Ext.isEmpty(this.controllerTabEmail) ? null : this.controllerTabEmail.getView(),
				Ext.isEmpty(this.controllerTabAttachment) ? null : this.controllerTabAttachment.getView()
			]);

			this.view.removeAll();
			this.view.add([
				this.controllerOperativeInstructions.getView(),
				this.tabPanel
			]);

			this.cmfg('workflowFormTabSelectionManage');
		},

		/**
		 * @returns {CMDBuild.controller.management.workflow.panel.form.tabs.activity.Activity} activityPanelController
		 *
		 * @private
		 */
		buildTabControllerActivity: function () {
			var controllerTabActivity = Ext.create('CMDBuild.controller.management.workflow.panel.form.tabs.activity.Activity', { parentDelegate: this });

			this.widgetManager = new CMDBuild.view.management.common.widgets.CMWidgetManager(
				controllerTabActivity.getView(), // as CMWidgetManagerDelegate
				this.tabPanel // as CMTabbedWidgetDelegate
			);
			this.widgetControllerManager = new CMDBuild.controller.management.common.CMWidgetManagerController(this.widgetManager);

			controllerTabActivity.widgetControllerManager = this.widgetControllerManager;
			controllerTabActivity.widgetControllerManager.setDelegate(controllerTabActivity);

			return controllerTabActivity;
		},

		/**
		 * Forward to sub-controllers
		 *
		 * @returns {Void}
		 */
		onWorkflowFormSaveButtonClick: function () {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabActivity) && !Ext.Object.isEmpty(this.controllerTabActivity))
				this.controllerTabActivity.onSaveCardClick();

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.onSaveCardClick();
		},

		/**
		 * @returns {Void}
		 */
		workflowFormReset: function () {
			// Forward to sub-controllers
			this.controllerOperativeInstructions.cmfg('workflowFormOperativeInstructionsReset');

			if (Ext.isObject(this.controllerTabActivity) && !Ext.Object.isEmpty(this.controllerTabActivity))
				this.controllerTabActivity.reset();

			if (Ext.isObject(this.controllerTabAttachment) && !Ext.Object.isEmpty(this.controllerTabAttachment))
				this.controllerTabAttachment.cmfg('panelModuleAttachmentTabReset');

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.reset();

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('workflowFormTabHistoryReset');

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('workflowFormTabNoteReset');

			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations))
				this.controllerTabRelations.reset();
		},

		/**
		 * @returns {String}
		 *
		 * FIXME: move all save action here on tab activity refactor
		 */
		workflowFormTabNoteValueGet: function () {
			return this.controllerTabNote.cmfg('workflowFormTabNoteValueGet');
		},

		/**
		 * Retrieve the form to use as target for the templateResolver
		 *
		 * @returns {Ext.form.Basic or null}
		 */
		workflowFormTemplateResolverFormGet: function () {
			if (Ext.isObject(this.controllerTabActivity) && !Ext.Object.isEmpty(this.controllerTabActivity))
				return this.controllerTabActivity.getFormForTemplateResolver();

			return null;
		},

		/**
		 * @param {Object} parameters
		 * @param {Object or String or Number} parameters.tabToSelect
		 *
		 * @returns {Void}
		 */
		workflowFormUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Forward to sub-controllers
			this.controllerOperativeInstructions.cmfg('workflowFormOperativeInstructionsUiUpdate');

			if (Ext.isObject(this.controllerTabActivity) && !Ext.Object.isEmpty(this.controllerTabActivity))
				this.controllerTabActivity.workflowFormTabActivityUiUpdate();

			if (Ext.isObject(this.controllerTabAttachment) && !Ext.Object.isEmpty(this.controllerTabAttachment))
				this.controllerTabAttachment.cmfg('workflowFormTabAttachmentsUiUpdate');

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.cmfg('workflowFormTabEmailUiUpdate');

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('workflowFormTabHistoryUiUpdate');

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('workflowFormTabNoteUiUpdate');

			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations))
				this.controllerTabRelations.workflowFormTabRelationsUiUpdate();

			// Tab selection manage
			if (!Ext.isEmpty(parameters.tabToSelect))
				return this.cmfg('workflowFormTabActiveSet', parameters.tabToSelect);

			return this.cmfg('workflowFormTabSelectionManage');
		},

		/**
		 * @param {String} type
		 *
		 * @returns {Boolean} exists
		 */
		workflowFormWidgetExists: function (type) {
			var exists = false;

			if (
				!this.cmfg('workflowSelectedActivityIsEmpty')
				&& Ext.isString(type) && !Ext.isEmpty(type)
			) {
				Ext.Array.each(this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WIDGETS), function (widgetConfigObject, i, allWidgetConfigObjects) {
					exists = (
						Ext.isObject(widgetConfigObject) && !Ext.Object.isEmpty(widgetConfigObject)
						&& widgetConfigObject[CMDBuild.core.constants.Proxy.TYPE] == type
					);

					return !exists;
				}, this);
			}

			return exists;
		}
	});

})();
