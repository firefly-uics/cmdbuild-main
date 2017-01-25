(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.Note', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WidgetType',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.workflow.panel.form.tabs.Note'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowFormTabNoteBackButtonClick',
			'onWorkflowFormTabNoteSaveButtonClick',
			'onWorkflowFormTabNoteShow',
			'workflowFormTabNoteReset',
			'workflowFormTabNoteUiUpdate',
			'workflowFormTabNoteValueGet'
		],

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView}
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
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildForm: function () {
			// UI view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add': {
					if (this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()))
						return this.buildFormModeEdit();

					return this.buildFormModeRead();
				} break;

				case 'edit': {
					if (
						this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote())
						&& this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE)
					) {
						return this.buildFormModeEdit();
					}

					return this.buildFormModeRead();
				} break;

				default:
					return this.buildFormModeRead();
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeEdit: function () {
			this.form.add(
				Ext.create('CMDBuild.view.common.field.HtmlEditor', {
					name: 'Notes',
					border: false,
					hideLabel: true
				})
			);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeRead: function () {
			this.form.add(
				Ext.create('Ext.container.Container', {
					border: false,
					cls: 'cmdb-blue-panel-no-padding',
					frame: false,
					overflowY: 'auto',

					items: [
						Ext.create('Ext.form.field.Display', {
							disablePanelFunctions: true,
							name: 'Notes',
							padding: '5px'
						})
					]
				})
			);
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		itemLock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('workflowSelectedInstanceIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);

				return CMDBuild.proxy.management.workflow.panel.form.tabs.Note.lock({
					params: params,
					scope: parameters.scope,
					success: parameters.callback
				});
			}

			return Ext.callback(parameters.callback, parameters.scope);
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		itemUnlock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('workflowSelectedInstanceIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);

				return CMDBuild.proxy.management.workflow.panel.form.tabs.Note.unlock({
					params: params,
					scope: parameters.scope,
					success: parameters.callback
				});
			}

			return Ext.callback(parameters.callback, parameters.scope);
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteBackButtonClick: function () {
			this.cmfg('workflowFormTabActiveSet');
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteSaveButtonClick: function () {
			// Error handling
				if (this.cmfg('workflowStartActivityGet', CMDBuild.core.constants.Proxy.STATUS))
					return CMDBuild.core.Message.warning(null, CMDBuild.Translation.warnings.canNotModifyNotesBeforeSavingTheActivity, false);
			// END: Error handling

			if (this.validate(this.view)) {
				var params = {};
				params['ww'] = '{}';
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.ADVANCE] = false;
				params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode({ Notes: this.cmfg('workflowFormTabNoteValueGet') });
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.WORKFLOW_ID);

				CMDBuild.proxy.management.workflow.panel.form.tabs.Note.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('workflowUiUpdate', {
							activityId: this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID),
							instanceId: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
							workflowId: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
							tabToSelect: this.view,
							callback: function () {
								CMDBuild.core.LoadMask.hide();
							}
						});
					}
				});
			}
		},

		/**
		 * Performance optimization to avoid to do all computation on UiUpdate action
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteShow: function () {
			var previousValue = this.cmfg('workflowFormTabNoteValueGet');

			this.form.removeAll(false);

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('onWorkflowFormTabNoteShow(): empty selected workflow property', this, this.cmfg('workflowSelectedWorkflowGet'));

				if (this.cmfg('workflowSelectedInstanceIsEmpty'))
					return _error('onWorkflowFormTabNoteShow(): empty selected instance property', this, this.cmfg('workflowSelectedInstanceGet'));
			// END: Error handling

			// History record save
			CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
				moduleId: CMDBuild.core.constants.ModuleIdentifiers.getWorkflow(),
				entryType: {
					description: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					id: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
					object: this.cmfg('workflowSelectedWorkflowGet')
				},
				item: {
					description: null, // Instances hasn't description property so display ID and no description
					id: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
					object: this.cmfg('workflowSelectedInstanceGet')
				},
				section: {
					description: this.view.title,
					object: this.view
				}
			});

			// UI view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add': {
					if (this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()))
						return this.itemLock({
							scope: this,
							callback: Ext.bind(this.showEventCallback, this, [previousValue])
						});

					return this.itemUnlock({
						scope: this,
						callback: Ext.bind(this.showEventCallback, this, [previousValue])
					});
				} break;

				case 'edit': {
					if (this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()))
						return this.itemLock({
							scope: this,
							callback: Ext.bind(this.showEventCallback, this, [previousValue])
						});

					return this.itemUnlock({
						scope: this,
						callback: Ext.bind(this.showEventCallback, this, [previousValue])
					});
				} break;

				default:
					return this.itemUnlock({
						scope: this,
						callback: Ext.bind(this.showEventCallback, this, [previousValue])
					});
			}
		},

		/**
		 * @param {String} valueToSet
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		showEventCallback: function (valueToSet) {
			valueToSet = Ext.isString(valueToSet) && !Ext.isEmpty(valueToSet)
				? { Notes: valueToSet } : this.cmfg('workflowSelectedInstanceGet', [CMDBuild.core.constants.Proxy.VALUES]);

			this.buildForm();

			this.form.getForm().setValues(valueToSet);

			// Buttons setup
			this.view.buttonBack.setVisible(this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()));

			this.view.panelFunctionModifyStateSet({
				forceToolbarTopState: !(
					!this.cmfg('workflowUiViewModeEquals', ['add', 'edit'])
					&& this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote())
					&& this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE)
				),
				state: this.cmfg('workflowUiViewModeEquals', ['add', 'edit'])
			});
		},

		/**
		 * @returns {Void}
		 */
		workflowFormTabNoteReset: function () {
			this.form.removeAll(false);

			this.view.disable();
		},

		/**
		 * Enable disable tab based on selection validity
		 *
		 * @returns {Void}
		 */
		workflowFormTabNoteUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add':
					return this.view.setDisabled(!this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()));

				default:
					return this.view.setDisabled(this.cmfg('workflowSelectedInstanceIsEmpty'));
			}
		},

		/**
		 * @returns {String}
		 */
		workflowFormTabNoteValueGet: function () {
			return this.view.panelFunctionValueGet({ propertyName: 'Notes' });
		}
	});

})();
