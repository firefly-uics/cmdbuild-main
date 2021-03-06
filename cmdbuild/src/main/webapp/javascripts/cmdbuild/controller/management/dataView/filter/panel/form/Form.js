(function () {

	/**
	 * Adapter
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.Form', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.form.Form',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WidgetType',
			'CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.Filter}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewFilterFormReset',
			'dataViewFilterFormTemplateResolverFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'dataViewFilterFormUiUpdate',
			'dataViewFilterFormWidgetExists',
			'onDataViewFilterFormSaveButtonClick',
			'onDataViewFilterFormTabCardPrintButtonClick',
			'panelGridAndFormPanelFormTabActiveFireShowEvent = dataViewFilterFormTabActiveFireShowEvent',
			'panelGridAndFormPanelFormTabActiveSet = dataViewFilterFormTabActiveSet',
			'panelGridAndFormPanelFormTabSelectionManage = dataViewFilterFormTabSelectionManage'
		],

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.Attachment}
		 */
		controllerTabAttachment: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card}
		 */
		controllerTabCard: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.Email}
		 */
		controllerTabEmail: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.History}
		 */
		controllerTabHistory: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.MasterDetail}
		 */
		controllerTabMasterDetail: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note}
		 */
		controllerTabNote: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.Relations}
		 */
		controllerTabRelations: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.FormPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.filter.Filter} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.FormPanel', { delegate: this });

			// Shorthands
			this.tabPanel = this.view.tabPanel;

			// View reset
			this.tabPanel.removeAll();

			// Build sub-controllers
			this.controllerTabCard = this.buildTabControllerCard();

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_ATTACHMENT_TAB))
				this.controllerTabAttachment = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Attachment', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_EMAIL_TAB))
				this.controllerTabEmail = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Email', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_HISTORY_TAB))
				this.controllerTabHistory = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.History', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_DETAIL_TAB))
				this.controllerTabMasterDetail = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.MasterDetail', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_NOTE_TAB))
				this.controllerTabNote = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_RELATION_TAB))
				this.controllerTabRelations = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Relations', { parentDelegate: this });

			// View build (sorted)
			this.tabPanel.add([
				Ext.isEmpty(this.controllerTabCard) ? null : this.controllerTabCard.getView(),
				Ext.isEmpty(this.controllerTabMasterDetail) ? null : this.controllerTabMasterDetail.getView(),
				Ext.isEmpty(this.controllerTabNote) ? null : this.controllerTabNote.getView(),
				Ext.isEmpty(this.controllerTabRelations) ? null : this.controllerTabRelations.getView(),
				Ext.isEmpty(this.controllerTabHistory) ? null : this.controllerTabHistory.getView(),
				Ext.isEmpty(this.controllerTabEmail) ? null : this.controllerTabEmail.getView(),
				Ext.isEmpty(this.controllerTabAttachment) ? null : this.controllerTabAttachment.getView()
			]);

			this.cmfg('dataViewFilterFormTabSelectionManage');
		},

		/**
		 * @returns {CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card} controllerTabCard
		 *
		 * @private
		 */
		buildTabControllerCard: function () {
			var controllerTabCard = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card', { parentDelegate: this });

			this.widgetManager = new CMDBuild.view.management.common.widgets.CMWidgetManager(
				controllerTabCard.getView(), // as CMWidgetManagerDelegate
				this.tabPanel // as CMTabbedWidgetDelegate
			);
			this.widgetControllerManager = new CMDBuild.controller.management.common.CMWidgetManagerController(this.widgetManager);

			controllerTabCard.widgetControllerManager = this.widgetControllerManager;
			controllerTabCard.widgetControllerManager.setDelegate(controllerTabCard);

			return controllerTabCard;
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterFormReset: function () {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.reset();

			if (Ext.isObject(this.controllerTabAttachment) && !Ext.Object.isEmpty(this.controllerTabAttachment))
				this.controllerTabAttachment.cmfg('panelModuleAttachmentTabReset');

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.reset();

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('dataViewFilterFormTabHistoryReset');

			if (Ext.isObject(this.controllerTabMasterDetail) && !Ext.Object.isEmpty(this.controllerTabMasterDetail))
				this.controllerTabMasterDetail.reset();

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('dataViewFilterFormTabNoteReset');

			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations))
				this.controllerTabRelations.reset();
		},

		/**
		 * Retrieve the form to use as target for the templateResolver
		 *
		 * @returns {Ext.form.Basic or null}
		 */
		dataViewFilterFormTemplateResolverFormGet: function () {
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				return this.controllerTabCard.getFormForTemplateResolver();

			return null;
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.tabToSelect
		 *
		 * @returns {Void}
		 */
		dataViewFilterFormUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.dataViewFilterFormTabCardUiUpdate();

			if (Ext.isObject(this.controllerTabAttachment) && !Ext.Object.isEmpty(this.controllerTabAttachment))
				this.controllerTabAttachment.cmfg('dataViewFilterFormTabAttachmentUiUpdate');

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.cmfg('dataViewFilterFormTabEmailUiUpdate');

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('dataViewFilterFormTabHistoryUiUpdate');

			if (Ext.isObject(this.controllerTabMasterDetail) && !Ext.Object.isEmpty(this.controllerTabMasterDetail))
				this.controllerTabMasterDetail.dataViewFilterFormTabMasterDetailUiUpdate();

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('dataViewFilterFormTabNoteUiUpdate');

			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations))
				this.controllerTabRelations.dataViewFilterFormTabRelationsUiUpdate();

			// Tab selection manage
			if (!Ext.isEmpty(parameters.tabToSelect))
				return this.cmfg('dataViewFilterFormTabActiveSet', parameters.tabToSelect);

			return this.cmfg('dataViewFilterFormTabSelectionManage');
		},

		/**
		 * @param {String} type
		 *
		 * @returns {Boolean}
		 */
		dataViewFilterFormWidgetExists: function (type) {
			switch (type) {
				case CMDBuild.core.constants.WidgetType.getOpenNote():
					return true;

				default: {
					return true; // FIXME: needs full implementation

					var exists = false;

					if (!this.cmfg('dataViewFilterSelectedCardIsEmpty'))
						Ext.Array.each(this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WIDGETS), function (widgetConfigObject, i, allWidgetConfigObjects) {
							exists = (
								Ext.isObject(widgetConfigObject) && !Ext.Object.isEmpty(widgetConfigObject)
								&& widgetConfigObject[CMDBuild.core.constants.Proxy.TYPE] == type
							);

							return !exists;
						}, this);

					return exists;
				}
			}
		},

		/**
		 * Retrieve the form to use as target for the templateResolver
		 *
		 * @returns {Object or null}
		 */
		getFormForTemplateResolver: function() {
			if (Ext.isObject(this.widgetManager) && !Ext.Object.isEmpty(this.widgetManager) && Ext.isFunction(this.widgetManager.getFormForTemplateResolver))
				return this.widgetManager.getFormForTemplateResolver() || null;

			return null;
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormSaveButtonClick: function () {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onSaveCardClick();

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.onSaveCardClick();
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move in tab card controller)
		 */
		onDataViewFilterFormTabCardPrintButtonClick: function (format) {
			this.controllerTabCard.onPrintCardMenuClick(format);
		}
	});

})();
