(function () {

	/**
	 * Workflow specific email tab controller
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.Email', {
		extend: 'CMDBuild.controller.management.common.tabs.email.Email',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.email.EmailView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.cmfgCatchedFunctions.push('workflowFormTabEmailUiUpdate');

			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.email.EmailView', { delegate: this });
			this.view.add(this.grid);
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		workflowFormTabEmailUiUpdate: function () {
			if (!this.cmfg('workflowSelectedWorkflowIsEmpty'))
				this.onProcessClassRefChange(Ext.create('CMDBuild.cache.CMEntryTypeModel', this.cmfg('workflowSelectedWorkflowGet', 'rawData')));

			if (!this.cmfg('workflowSelectedInstanceIsEmpty'))
				this.onProcessInstanceChange(Ext.create('CMDBuild.model.CMProcessInstance', this.cmfg('workflowSelectedInstanceGet', 'rawData')));

			if (!this.cmfg('workflowSelectedActivityIsEmpty'))
				this.onActivityInstanceChange(Ext.create('CMDBuild.model.CMActivityInstance', this.cmfg('workflowSelectedActivityGet', 'rawData')));

			// Ui view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add':
					return this.view.enable();

				default:
					return this.view.setDisabled(this.cmfg('workflowSelectedInstanceIsEmpty'));
			}
		},

		/**
		 * It's the change of processIstance step (called activity)
		 *
		 * @param {CMDBuild.model.CMActivityInstance} activityIstance
		 */
		onActivityInstanceChange: Ext.emptyFn,

		onAbortCardClick: function () {
			this.cmfg('tabEmailEditModeSet', false);
			this.cmfg('tabEmailConfigurationReset');
		},

		/**
		 * Equals to onEntryTypeSelected in classes
		 *
		 * @param {CMDBuild.cache.CMEntryTypeModel} entryType
		 */
		onProcessClassRefChange: function (entryType) {
			this.cmfg('tabEmailEditModeSet', false);

			// FIXME: ugly hack to make it works
			if (this.parentDelegate.cmfg('workflowSelectedInstanceIsEmpty'))
				this.onProcessInstanceChange(Ext.create('CMDBuild.model.CMProcessInstance', { flowStatus: 'OPEN' }));
		},

		/**
		 * Equals to onCardSelected in classes
		 *
		 * @param {CMDBuild.model.CMProcessInstance} processInstance
		 */
		onProcessInstanceChange: function (processInstance) {
			if (!Ext.isEmpty(processInstance) && processInstance.isStateOpen()) {
				this.cmfg('tabEmailConfigurationReset');
				this.cmfg('tabEmailSelectedEntitySet', {
					selectedEntity: processInstance,
					scope: this,
					callbackFunction: function (options, success, response) {
						this.cmfg('tabEmailRegenerateAllEmailsSet', processInstance.isNew());
						this.forceRegenerationSet(processInstance.isNew());
						this.cmfg('onTabEmailPanelShow');
					}
				});
				this.cmfg('tabEmailEditModeSet', processInstance.isNew()); // Enable/Disable tab based on model new state to separate create/view mode
				this.controllerGrid.cmfg('tabEmailGridUiStateSet');
			} else { // We have a closed process instance
				this.cmfg('tabEmailSelectedEntitySet', {
					selectedEntity: processInstance,
					scope: this,
					callbackFunction: function (options, success, response) {
						this.cmfg('onTabEmailPanelShow');
					}
				});
			}
		},

		/**
		 * Launch regeneration on save button click and send all draft emails
		 */
		onSaveCardClick: function () {
			if (!this.grid.getStore().isLoading()) {
				this.cmfg('tabEmailRegenerateAllEmailsSet', true);
				this.cmfg('onTabEmailPanelShow');
			}
		},

		/**
		 * @override
		 */
		onTabEmailPanelShow: function () {
			if (this.view.isVisible()) {
				// History record save
				if (!Ext.isEmpty(_CMWFState.getProcessClassRef()) && !Ext.isEmpty( _CMWFState.getProcessInstance()))
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: 'workflow',
						entryType: {
							description: _CMWFState.getProcessClassRef().get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMWFState.getProcessClassRef().get(CMDBuild.core.constants.Proxy.ID),
							object: _CMWFState.getProcessClassRef()
						},
						item: {
							description: _CMWFState.getProcessInstance().get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMWFState.getProcessInstance().get(CMDBuild.core.constants.Proxy.ID),
							object: _CMWFState.getProcessInstance()
						},
						section: {
							description: this.view.title,
							object: this.view
						}
					});

				this.callParent(arguments);

				// Ui view mode manage
				switch (this.cmfg('workflowUiViewModeGet')) {
					case 'add': {
						this.view.enable();

						this.cmfg('tabEmailEditModeSet', false);

						// Reset selected entity, regenerate email and load store
						this.cmfg('tabEmailSelectedEntitySet', {
							scope: this,
							callbackFunction: function (options, success, response) {
								this.cmfg('tabEmailRegenerateAllEmailsSet', true);

								this.forceRegenerationSet(true);
							}
						});
					} break;

					case 'edit':
						return this.onModifyCardClick();

					default:
						return this.onAbortCardClick();
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		reset: function () {
			this.grid.getStore().removeAll();

			this.view.disable();
		}
	});

})();
