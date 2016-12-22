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
			'dataViewFilterFormUiUpdate',
			'onDataViewFilterFormAbortButtonClick',
			'onDataViewFilterFormAddButtonClick',
			'onDataViewFilterFormCloneButtonClick',
			'onDataViewFilterFormModifyButtonClick = onDataViewFilterFormRecordDoubleClick',
			'onDataViewFilterFormPrintButtonClick',
			'onDataViewFilterFormRemoveButtonClick',
			'onDataViewFilterFormSaveButtonClick',
			'panelGridAndFormPanelFormTabActiveSet = dataViewFilterFormTabActiveSet',
			'panelGridAndFormPanelFormTabSelectionManage = dataViewFilterFormTabSelectionManage'
		],

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.panel.form.tabs.attachments.Attachments}
		 */
		controllerTabAttachments: undefined,

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

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.PROCESS_ATTACHMENT_TAB))
				this.controllerTabAttachments = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.attachments.Attachments', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.PROCESS_EMAIL_TAB))
				this.controllerTabEmail = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Email', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.PROCESS_HISTORY_TAB))
				this.controllerTabHistory = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.History', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_DETAIL_TAB))
				this.controllerTabMasterDetail = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.MasterDetail', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.PROCESS_NOTE_TAB))
				this.controllerTabNote = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note', { parentDelegate: this });

			if (!CMDBuild.configuration.userInterface.isDisabledCardTab(CMDBuild.core.constants.Proxy.PROCESS_RELATION_TAB))
				this.controllerTabRelations = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Relations', { parentDelegate: this });

			// View build (sorted)
			this.tabPanel.add([
				Ext.isEmpty(this.controllerTabCard) ? null : this.controllerTabCard.getView(),
				Ext.isEmpty(this.controllerTabMasterDetail) ? null : this.controllerTabMasterDetail.getView(),
				Ext.isEmpty(this.controllerTabNote) ? null : this.controllerTabNote.getView(),
				Ext.isEmpty(this.controllerTabRelations) ? null : this.controllerTabRelations.getView(),
				Ext.isEmpty(this.controllerTabHistory) ? null : this.controllerTabHistory.getView(),
				Ext.isEmpty(this.controllerTabEmail) ? null : this.controllerTabEmail.getView(),
				Ext.isEmpty(this.controllerTabAttachments) ? null : this.controllerTabAttachments.getView()
			]);
		},

		/**
		 * @returns {CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card} controllerTabCard
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

//			if (Ext.isObject(this.controllerTabAttachments) && !Ext.Object.isEmpty(this.controllerTabAttachments)) // FIXME: not managed
//				this.controllerTabAttachments.reset();

//			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail)) // FIXME: not managed
//				this.controllerTabEmail.reset();

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('dataViewFilterFormTabHistoryReset');

//			if (Ext.isObject(this.controllerTabMasterDetail) && !Ext.Object.isEmpty(this.controllerTabMasterDetail)) // FIXME: not managed
//				this.controllerTabMasterDetail.reset();

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('dataViewFilterFormTabNoteReset');

//			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations)) // FIXME: not managed
//				this.controllerTabRelations.reset();
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.tabToSelect
		 * @param {String} parameters.viewMode // FIXME: future todo, must be synchronized with internal tab structure
		 *
		 * @returns {Void}
		 */
		dataViewFilterFormUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			this.cmfg('dataViewFilterFormReset');

			// Forward to sub-controllers
			if (!this.cmfg('dataViewFilterSelectedCardIsEmpty') && !this.cmfg('dataViewFilterSourceEntryTypeIsEmpty')) {
				if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard)) {
					this.controllerTabCard.onEntryTypeSelected();
					this.controllerTabCard.onCardSelected();
				}

				if (Ext.isObject(this.controllerTabAttachments) && !Ext.Object.isEmpty(this.controllerTabAttachments)) {
					this.controllerTabAttachments.onEntryTypeSelected();
					this.controllerTabAttachments.onCardSelected();
				}

				if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail)) {
					this.controllerTabEmail.onEntryTypeSelected();
					this.controllerTabEmail.onCardSelected();
				}

				if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
					this.controllerTabHistory.cmfg('onDataViewFilterFormTabHistoryCardSelect');

				if (Ext.isObject(this.controllerTabMasterDetail) && !Ext.Object.isEmpty(this.controllerTabMasterDetail)) {
					this.controllerTabMasterDetail.onEntryTypeSelected();
					this.controllerTabMasterDetail.onCardSelected();
				}

				if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
					this.controllerTabNote.cmfg('onDataViewFilterFormTabNoteCardSelect');

				if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations)) {
					this.controllerTabRelations.onEntryTypeSelected();
					this.controllerTabRelations.onCardSelected();
				}
			}

			if (!Ext.isEmpty(parameters.tabToSelect))
				return this.cmfg('dataViewFilterFormTabActiveSet', parameters.tabToSelect);

			return this.cmfg('dataViewFilterFormTabSelectionManage');
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
		onDataViewFilterFormAbortButtonClick: function () {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onAbortCardClick();

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.onAbortCardClick();
		},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormAddButtonClick: function (id) {
			// Error handling
				if (!Ext.isNumber(id) || Ext.isEmpty(id))
					return _error('onDataViewFilterFormAddButtonClick(): unmanaged id parameter', this, id);
			// END: Error handling

			this.cmfg('dataViewFilterFormTabActiveSet');

			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onAddCardButtonClick(id);

			if (Ext.isObject(this.controllerTabAttachments) && !Ext.Object.isEmpty(this.controllerTabAttachments))
				this.controllerTabAttachments.onAddCardButtonClick();

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.onAddCardButtonClick();

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('onDataViewFilterFormCardAddTabHistoryButtonClick');

			if (Ext.isObject(this.controllerTabMasterDetail) && !Ext.Object.isEmpty(this.controllerTabMasterDetail))
				this.controllerTabMasterDetail.onAddCardButtonClick();

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('onDataViewFilterFormCardAddTabNoteButtonClick');

			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations))
				this.controllerTabRelations.onAddCardButtonClick();
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormCloneButtonClick: function () {
			this.cmfg('dataViewFilterFormTabActiveSet');

			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onCloneCardClick();

			if (Ext.isObject(this.controllerTabAttachments) && !Ext.Object.isEmpty(this.controllerTabAttachments))
				this.controllerTabAttachments.onCloneCard();

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.onCloneCard();

			if (Ext.isObject(this.controllerTabHistory) && !Ext.Object.isEmpty(this.controllerTabHistory))
				this.controllerTabHistory.cmfg('onDataViewFilterFormCardCloneTabHistoryButtonClick');

			if (Ext.isObject(this.controllerTabMasterDetail) && !Ext.Object.isEmpty(this.controllerTabMasterDetail))
				this.controllerTabMasterDetail.onCloneCard();

			if (Ext.isObject(this.controllerTabNote) && !Ext.Object.isEmpty(this.controllerTabNote))
				this.controllerTabNote.cmfg('onDataViewFilterFormCardCloneTabNoteButtonClick');

			if (Ext.isObject(this.controllerTabRelations) && !Ext.Object.isEmpty(this.controllerTabRelations))
				this.controllerTabRelations.onCloneCard();
		},

		/**
		 * Synchronize tab states
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormModifyButtonClick: function () {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onModifyCardClick();

			if (Ext.isObject(this.controllerTabEmail) && !Ext.Object.isEmpty(this.controllerTabEmail))
				this.controllerTabEmail.onModifyCardClick();
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 *
		 * FIXME: move to card panel controller on refactor
		 */
		onDataViewFilterFormPrintButtonClick: function (format) {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onPrintCardMenuClick(format);
		},

		/**
		 * @returns {Void}
		 *
		 * FIXME: move to card panel controller on refactor
		 */
		onDataViewFilterFormRemoveButtonClick: function () {
			// Forward to sub-controllers
			if (Ext.isObject(this.controllerTabCard) && !Ext.Object.isEmpty(this.controllerTabCard))
				this.controllerTabCard.onRemoveCardClick();
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
		}
	});

})();
