(function() {

	/**
	 * @legacy
	 */

	Ext.define("CMDBuild.controller.management.workflow.CMActivityPanelControllerDelegate", {
		onCardSaved: Ext.emptyFn
	});

	/**
	 * @merged CMDBuild.controller.management.classes.CMCardPanelController
	 * @merged CMDBuild.controller.management.classes.CMBaseCardPanelController
	 * @merged CMDBuild.controller.management.classes.CMModCardSubController
	 */
	Ext.define("CMDBuild.controller.management.workflow.panel.form.tabs.activity.Activity", {

		requires: [
			'CMDBuild.controller.management.workflow.panel.form.tabs.activity.StaticsController',
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Metadata',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.workflow.panel.form.tabs.Activity'
		],

		mixins: {
			observable: "Ext.util.Observable"
		},

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Object}
		 */
		lastSelectedActivityInstance: undefined,

		/**
		 * @property {Object}
		 */
		lastSelectedProcessInstance: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			Ext.apply(this, configurationObject);

			this.mixins.observable.constructor.call(this, arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.activity.ActivityView', { delegate: this });

			this.entryType = null;

			var ev = this.view.CMEVENTS;

			this.CMEVENTS = {
				cardSaved: "cm-card-saved",
				abortedModify: "cm-card-modify-abort",
				editModeDidAcitvate: ev.editModeDidAcitvate,
				displayModeDidActivate: ev.displayModeDidActivate
			};

			this.addEvents(
				ev.editModeDidAcitvate,
				ev.displayModeDidActivate,
				this.CMEVENTS.abortedModify,
				this.CMEVENTS.cardSaved,
				this.CMEVENTS.editModeDidAcitvate,
				this.CMEVENTS.displayModeDidActivate
			);

			this.relayEvents(this.view, [ev.editModeDidAcitvate, ev.displayModeDidActivate]);

			// this flag is used to define if the user has click on the
			// save or advance button. The difference is that on save
			// the widgets do nothing and the saved activity goes in display mode.
			// On advance, otherwise, the widgets do the react (save their state) and
			// the saved activity lies in edit mode, to continue the data entry.
			this.isAdvance = false;

			this.mon(this.view, ev.openGraphButtonClick, this.onShowGraphClick, this);
			this.mon(this.view, ev.widgetButtonClick, this.onWidgetButtonClick, this);
			this.mon(this.view, this.view.CMEVENTS.editModeDidAcitvate, this.onEditMode, this);
			this.mon(this.view, this.view.CMEVENTS.checkEditability, onCheckEditability, this);
			this.mon(this.view, this.view.CMEVENTS.displayModeDidActivate, onDisplayMode, this);

			this.delegate = Ext.create('CMDBuild.controller.management.workflow.CMActivityPanelControllerDelegate');

			// Build sub-controllers
			this.controllerWindowGraph = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', { parentDelegate: this });
		},

		/**
		 * Enable/Disable tab selection based
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		workflowFormTabActivityUiUpdate: function (parameters) {
			// FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
				if (!this.parentDelegate.cmfg('workflowSelectedWorkflowIsEmpty'))
					_CMWFState.setProcessClassRef(Ext.create('CMDBuild.cache.CMEntryTypeModel', this.parentDelegate.cmfg('workflowSelectedWorkflowGet', 'rawData')));

				if (!this.parentDelegate.cmfg('workflowSelectedInstanceIsEmpty'))
					_CMWFState.setProcessInstanceSynchronous(Ext.create('CMDBuild.model.CMProcessInstance', this.parentDelegate.cmfg('workflowSelectedInstanceGet', 'rawData')));

				if (!this.parentDelegate.cmfg('workflowSelectedActivityIsEmpty'))
					_CMWFState.setActivityInstance(Ext.create('CMDBuild.model.CMActivityInstance', this.parentDelegate.cmfg('workflowSelectedActivityGet', 'rawData')));

			if (!this.parentDelegate.cmfg('workflowSelectedInstanceIsEmpty'))
				this.onProcessInstanceChange(Ext.create('CMDBuild.model.CMProcessInstance', this.parentDelegate.cmfg('workflowSelectedInstanceGet', 'rawData')));

			if (!this.parentDelegate.cmfg('workflowSelectedActivityIsEmpty'))
				this.onActivityInstanceChange(Ext.create('CMDBuild.model.CMActivityInstance', this.parentDelegate.cmfg('workflowSelectedActivityGet', 'rawData')));

			var state = (
				this.parentDelegate.cmfg('workflowSelectedInstanceIsEmpty')
				&& this.parentDelegate.cmfg('workflowSelectedActivityIsEmpty')
				&& !this.parentDelegate.cmfg('workflowStartActivityGet', CMDBuild.core.constants.Proxy.STATUS)
			);

			this.view.enable();

			if (state) {
				this.changeClassUIConfigurationForGroup(true, true);
			} else {
				this.changeClassUIConfigurationForGroup(!this.parentDelegate.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE));
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 * @legacy
		 */
		panelListenerManagerShow: function () {
			// History record save
			if (!this.parentDelegate.cmfg('workflowSelectedWorkflowIsEmpty') && !this.parentDelegate.cmfg('workflowSelectedInstanceIsEmpty'))
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: this.parentDelegate.cmfg('workflowIdentifierGet'),
					entryType: {
						description: this.parentDelegate.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
						id: this.parentDelegate.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
						object: this.parentDelegate.cmfg('workflowSelectedWorkflowGet')
					},
					item: {
						description: null, // Instances hasn't description property so display ID and no description
						id: this.parentDelegate.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
						object: this.parentDelegate.cmfg('workflowSelectedInstanceGet')
					},
					section: {
						description: this.view.title,
						object: this.view
					}
				});

			// UI view mode manage
			switch (this.parentDelegate.cmfg('workflowUiViewModeGet')) {
				case 'add': {
					var me = this;

					this.view.enable();

					_CMWFState.setProcessInstance(
						Ext.create('CMDBuild.model.CMProcessInstance', {
							classId: this.parentDelegate.cmfg('workflowStartActivityGet', CMDBuild.core.constants.Proxy.WORKFLOW_ID)
						}),
						function () {
							var activityModel = Ext.create('CMDBuild.model.CMActivityInstance', me.parentDelegate.cmfg('workflowSelectedActivityGet', 'rawData'));

							_CMWFState.setActivityInstance(activityModel);

							me.onActivityInstanceChange(activityModel);
						}
					);
				} break;

				case 'edit':
					return this.onModifyCardClick();
			}
		},

		/**
		 * @legacy
		 */
		getView: function () {
			return this.view;
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		reset: function () {
			this.view.displayMode();
			this.view.clear();

			// Manually disable all buttons
			this.view.form.modifyCardButton.disable();
			this.view.form.deleteCardButton.disable();
		},

		// wfStateDelegate
		onProcessInstanceChange: function(processInstance) {
			var me = this;

			this.unlock();
			this.clearView();

			this.lastSelectedProcessInstance = processInstance; // Used to unlock last locked card

			if (
				processInstance != null // is null on abort of a new process
				&& processInstance.isStateCompleted()
			) {
				this.loadFields(processInstance.getClassId(), function loadFieldsCb() {
					me.fillFormWithProcessInstanceData(processInstance);
				});
			} else {
				enableStopButtonIfUserCanUseIt(this, processInstance);
			}
		},

		// wfStateDelegate
		/**
		 * @param {Object} activityInstance
		 *
		 * @returns {Void}
		 */
		onActivityInstanceChange: function (activityInstance) {
			var me = this;
			var activityMetadata = activityInstance.data[CMDBuild.core.constants.Proxy.METADATA];
			var processInstance = _CMWFState.getProcessInstance();

			this.unlock();

			this.lastSelectedActivityInstance = activityInstance; // Used to unlock last locked card

			// Reduce the layouts work while fill the panel and build the widgets.
			// Resume it at the end and force a layout update
			Ext.suspendLayouts();

			this.view.updateInfo(activityInstance.getPerformerName(), activityInstance.getDescription());

			// At first update the widget because they could depends to the form. The Template resolver starts when the form goes in edit mode,
			// so the widgets must be already ready to done them works
			var updateWidget = processInstance.isStateOpen() || activityInstance.isNew();

			if (updateWidget) {
				this.widgetControllerManager.buildControllers(activityInstance);
			} else {
				this.widgetControllerManager.buildControllers(null);
			}

			// Resume the layouts here because the form already suspend the layouts automatically
			Ext.resumeLayouts();

			this.view.doLayout();

			// Load always the fields
			this.loadFields(processInstance.getClassId(), function (attributes) {
				// Fill always the process to trigger the template resolver of filtered references
				me.fillFormWithProcessInstanceData(processInstance);
				manageEditability(me, activityInstance, processInstance);

				// Manage metadata (SelectedAttributesGroup)
				if (Ext.isArray(activityMetadata) && !Ext.isEmpty(activityMetadata)) {
					Ext.Array.each(activityMetadata, function (metadataObject, i, allMetadataObjects) {
						if (Ext.isObject(metadataObject) && !Ext.Object.isEmpty(metadataObject))
							switch (metadataObject[CMDBuild.core.constants.Proxy.NAME]) {
								case CMDBuild.core.constants.Metadata.getSelectedAttributesGroup(): {
									var preselectedTab = null;
									var markerAttribute = Ext.Array.findBy(attributes, function (item, index) {
										return item[CMDBuild.core.constants.Proxy.NAME] == metadataObject[CMDBuild.core.constants.Proxy.VALUE];
									}, this);

									if (!Ext.isEmpty(markerAttribute)) {
										this.view.form.tabPanel.items.each(function (item, index, len) {
											if (item.title == markerAttribute[CMDBuild.core.constants.Proxy.GROUP])
												preselectedTab = item;
										}, this);

										if (!Ext.isEmpty(preselectedTab))
											this.view.form.tabPanel.setActiveTab(preselectedTab);
									}
								} break;
							}
					}, me);
				}
			});
		},

		onWidgetButtonClick: function(w) {
			if (this.widgetControllerManager) {
				this.widgetControllerManager.onWidgetButtonClick(w);
			}
		},

		changeClassUIConfigurationForGroup: function(disabledModify, disabledRemove) {
			this.view.form.modifyCardButton.disabledForGroup = disabledModify;
			this.view.form.deleteCardButton.disabledForGroup = disabledRemove;
			if (this.view.form.modifyCardButton.disabledForGroup)
				this.view.form.modifyCardButton.disable();
			else
				this.view.form.modifyCardButton.enable();

			if (this.view.form.deleteCardButton.disabledForGroup)
				this.view.form.deleteCardButton.disable();
			else
				this.view.form.deleteCardButton.enable();
		},

		onModifyCardClick: function() {
			var processInstance = _CMWFState.getProcessInstance();
			var activityInstance = _CMWFState.getActivityInstance();

			this.isAdvance = false;

			if (
				!Ext.isEmpty(processInstance) && processInstance.isStateOpen()
				&& !Ext.isEmpty(activityInstance) && activityInstance.isWritable()
			) {
				this.lock(function() {
					this.view.editMode();
				}, this);
			}
		},

		/**
		 * @param {Function} success
		 * @param {Object} scope
		 */
		lock: function(success, scope) {
			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& _CMWFState.getActivityInstance()
				&& _CMWFState.getProcessInstance()
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = _CMWFState.getActivityInstance().data[CMDBuild.core.constants.Proxy.ID];
				params[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = _CMWFState.getProcessInstance().data[CMDBuild.core.constants.Proxy.ID];

				CMDBuild.proxy.management.workflow.panel.form.tabs.Activity.lock({
					params: params,
					loadMask: false,
					scope: scope,
					success: success
				});
			} else {
				Ext.callback(success, scope);
			}
		},

		isEditable: function(card) {
			if (!card)
				return false;

			var privileges = CMDBuild.core.Utils.getEntryTypePrivileges(_CMCache.getEntryTypeById(card.get('IdClass')));
			return (privileges.create);
		},

		setWidgetManager: function(wm) {
			this.widgetManager = wm;
		},

		unlock: function() {
			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !Ext.isEmpty(this.lastSelectedActivityInstance)
				&& this.view.isInEditing()
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.lastSelectedActivityInstance.data[CMDBuild.core.constants.Proxy.ID];
				params[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = this.lastSelectedProcessInstance.data[CMDBuild.core.constants.Proxy.ID];

				CMDBuild.proxy.management.workflow.panel.form.tabs.Activity.unlock({
					params: params,
					loadMask: false
				});
			}
		},

		onRemoveCardClick: function() {
			var me = this;
			Ext.MessageBox.confirm(
				CMDBuild.Translation.abortProcess, // title
				CMDBuild.Translation.areYouSureYouWantToAbortThisProcess, // message
				confirmCB);

			function confirmCB(btn) {
				if (btn != 'yes') {
					return;
				} else {
					deleteActivity.call(me);
				}
			}
		},

		onAdvanceCardButtonClick: function() {
			this.isAdvance = true;

			this.widgetControllerManager.waitForBusyWidgets(save, this); // Check for busy widgets on advance
		},

		onSaveCardClick: function() {
			this.isAdvance = false;

			this.widgetControllerManager.waitForBusyWidgets(save, this); // Check for busy widgets also on save
		},

		// override
		onAbortCardClick: function() {
			this.isAdvance = false;
			var activityInstance = _CMWFState.getActivityInstance();

			if (activityInstance && activityInstance.isNew()) {
				this.onProcessInstanceChange();
			} else {
				this.onActivityInstanceChange(activityInstance);
			}

			this.fireEvent(this.CMEVENTS.abortedModify);
		},

		onAddCardButtonClick: function(classIdOfNewCard) {
			if (!classIdOfNewCard) {
				return;
			}

			this.view.editMode();
		},

		clearView: function() {
			this.view.clear();
		},

		addCardDataProviders: function(dataProvider) {
			this.cardDataProviders.push(dataProvider);
		},

		// override
		loadFields: function(entryTypeId, cb) {
			var me = this;
			var activityInstance = _CMWFState.getActivityInstance();
			var processInstance = _CMWFState.getProcessInstance();
			var variables = [];

			if (activityInstance) {
				variables = activityInstance.getVariables();
			}

			function onAttributesLoaded(attributes) {
				// Filter attributes to show, if we have a closed process who all attributes
				if (
					activityInstance.isNew()
					|| processInstance.isStateOpen()
					|| processInstance.isStateSuspended()
				) {
					attributes = CMDBuild.controller.management.workflow.panel.form.tabs.activity.StaticsController.filterAttributesInStep(attributes, variables);
				}

				me.view.fillForm(attributes, editMode = false);

				if (cb) {
					cb(attributes);
				}
			}

			if (entryTypeId) {
				_CMCache.getAttributeList(entryTypeId, onAttributesLoaded);
			} else {
				onAttributesLoaded([]);
			}
		},

		fillFormWithProcessInstanceData: function(processInstance) {
			if (processInstance != null) {
				this.view.loadCard(processInstance.asDummyModel());
				this.view.displayModeForNotEditableCard();

				if (!processInstance.isNew() && processInstance.isStateOpen())
					this.ensureEditPanel(); // Creates editPanel with relative form fields
			}
		},

		/**
		 * @override
		 */
		onShowGraphClick: function() {
			var pi = _CMWFState.getProcessInstance();

			this.controllerWindowGraph.cmfg('onPanelGridAndFormGraphWindowConfigureAndShow', {
				classId: pi.getClassId(),
				cardId: pi.getId()
			});
		},

		onEditMode: function() {
			this.editMode = true;

			if (this.widgetControllerManager) {
				this.widgetControllerManager.onCardGoesInEdit();
			}
		},

		onCardGoesInEdit: function() {
			if (this.widgetControllerManager) {
				this.widgetControllerManager.onCardGoesInEdit();
			}
		},

		// widgetManager delegate
		ensureEditPanel: function() {
			this.view.ensureEditPanel();
		}
	});

	function deleteActivity() {
		var processInstance = _CMWFState.getProcessInstance();

		if (!processInstance && !processInstance.isNew())
			return;

		this.clearView();

		CMDBuild.proxy.management.workflow.panel.form.tabs.Activity.abort({
			params: {
				classId: processInstance.getClassId(),
				cardId: processInstance.getId()
			},
			scope: this,
			success: function (response, options, decodedResponse) {
				this.parentDelegate.cmfg('workflowUiUpdate', {
					disableFirstRowSelection: true,
					storeLoad: 'force'
				});
			}
		});
	}


	function onCheckEditability(cb) {
		var me = this;
		var pi = _CMWFState.getProcessInstance();

		// for a new process do nothing
		if (pi.isNew()) {
			cb();
			return;
		}

		var requestParams = {
			processInstanceId: pi.getId(),
			className: pi.get("className"),
			beginDate: pi.get("beginDateAsLong")
		}

		CMDBuild.proxy.management.workflow.panel.form.tabs.Activity.isUpdated({
			params: requestParams,
			loadMask: false,
			success: function(operation, requestConfiguration, decodedResponse) {
				var isUpdated = decodedResponse.response.updated;
				if (isUpdated) {
					cb();
				}
			}
		});
	}

	function onDisplayMode() {
		this.editMode = false;
	}

	function save() {
		var me = this,
			requestParams = {},
			pi = _CMWFState.getProcessInstance(),
			ai = _CMWFState.getActivityInstance(),
			valid,
			noteValue = this.parentDelegate.cmfg('workflowFormTabNoteValueGet');

		if (pi) {
			var formValues = this.view.getValues();

			// Used server side to be sure to update the last version of the process
			formValues.beginDate = pi.get("beginDateAsLong");

			if (Ext.isString(noteValue) && !Ext.isEmpty(noteValue))
				formValues['Notes'] = noteValue;

			requestParams = {
				classId: pi.getClassId(),
				attributes: Ext.encode(formValues),
				advance: me.isAdvance
			};

			if (pi.getId())
				requestParams.cardId = pi.getId();

			if (ai && ai.getId)
				requestParams.activityInstanceId = ai.getId();

			// Business rule: Someone want the validation only if advance and not if save only
			valid = requestParams.advance ? validate(me) : true;

			if (valid) {
				requestParams["ww"] = Ext.JSON.encode(this.widgetControllerManager.getData(me.advance));

				_msg('Saving workflow with params', requestParams);

				CMDBuild.proxy.management.workflow.panel.form.tabs.Activity.update({
					params: requestParams,
					scope: this,
					clientValidation: this.isAdvance, // Force save request
					failure: function (response, options, decodedResponse) {
						this.parentDelegate.cmfg('workflowUiUpdate', {
							disableFirstRowSelection: true,
							storeLoad: 'force',
							workflowId: this.parentDelegate.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID)
						});
					},
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						// Error handling
							if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
								return _error('save(): unmanaged response', this, decodedResponse);
						// END: Error handling

						var flowStatus = decodedResponse[CMDBuild.core.constants.Proxy.FLOW_STATUS];

						this.view.displayMode();

						// To enable the editing for the right processInstance
						if (this.isAdvance)
							this.idToAdvance = decodedResponse['Id'];

						if (
							Ext.isString(flowStatus) && !Ext.isEmpty(flowStatus)
							&& (
								flowStatus == CMDBuild.core.constants.WorkflowStates.getCompletedCapitalized()
								|| flowStatus == CMDBuild.core.constants.WorkflowStates.getSuspendedCapitalized()
							)
						) {
							this.parentDelegate.cmfg('workflowUiUpdate', {
								disableFirstRowSelection: true,
								storeLoad: 'force',
								workflowId: decodedResponse['IdClass']
							});
						} else {
							this.parentDelegate.cmfg('workflowUiUpdate', {
								disableFirstRowSelection: true,
								instanceId: decodedResponse['Id'],
								metadata: decodedResponse[CMDBuild.core.constants.Proxy.METADATA],
								storeLoad: 'force',
								viewMode: this.isAdvance ? 'edit' : 'read',
								workflowId: decodedResponse['IdClass'],
								scope: this,
								callback: function () {
									this.parentDelegate.cmfg('workflowFullScreenUiSetup', { maximize: 'bottom' });
								}
							});
						}
					}
				});
			}
		} else {
			_error('save(): there are no processInstance to save', this);
		}
	}

	function validateForm(me) {
		var form = me.view.getForm();
		var invalidAttributes = CMDBuild.controller.management.workflow.panel.form.tabs.activity.StaticsController.getInvalidAttributeAsHTML(form);

		if (invalidAttributes != null) {
			var msg = Ext.String.format("<p class=\"{0}\">{1}</p>", CMDBuild.core.constants.Global.getErrorMsgCss(), CMDBuild.Translation.errors.invalid_attributes);
			CMDBuild.core.Message.error(null, msg + invalidAttributes, false);

			return false;
		} else {
			return true;
		}
	}

	function validate(me) {
		var valid = validateForm(me),
			wrongWidgets = me.widgetControllerManager.getWrongWFAsHTML();

		if (wrongWidgets != null) {
			valid = false;
			var msg = Ext.String.format("<p class=\"{0}\">{1}</p>"
					, CMDBuild.core.constants.Global.getErrorMsgCss()
					, CMDBuild.Translation.errors.invalid_extended_attributes);
			CMDBuild.core.Message.error(null, msg + wrongWidgets, popup = false);
		}

		return valid;
	}

	function manageEditability(me, activityInstance, processInstance) {
		if (activityInstance.isNew()) {
			me.view.editMode();

			return;
		}

		if (
			!processInstance.isStateOpen()
			|| activityInstance.isNullObject()
			|| !activityInstance.isWritable()
		) {
			me.view.displayModeForNotEditableCard();

			enableStopButtonIfUserCanUseIt(me, processInstance);

			return;
		}

		if (
			me.isAdvance
			&& processInstance.getId() == me.idToAdvance
		) {
			me.view.editMode();

			// Lock card on advance action
			me.lock(function() {
				me.view.editMode();
			});

			me.isAdvance = false;

			return;
		}

		me.view.displayMode(true);

		enableStopButtonIfUserCanUseIt(me, processInstance);
	}

	function enableStopButtonIfUserCanUseIt(me, processInstance) {
		me.view.disableStopButton();
		if (!processInstance) {
			return;
		}

		var processClassId = processInstance.getClassId();
		if (processClassId) {
			var processClass = _CMCache.getEntryTypeById(processClassId);
			if (processClass) {
				var theUserCanStopTheProcess = processClass.isUserStoppable() || CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.IS_ADMINISTRATOR);
				var theProcessIsNotAlreadyTerminated = processInstance.isStateOpen() || processInstance.isStateSuspended();

				if (theUserCanStopTheProcess && theProcessIsNotAlreadyTerminated) {
					me.view.enableStopButton();
				}
			}
		}
	}

})();
