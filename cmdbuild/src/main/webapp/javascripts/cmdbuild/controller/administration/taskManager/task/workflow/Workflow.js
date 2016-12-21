(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.workflow.Workflow', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Workflow'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerFormTaskAbortButtonClick',
			'onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskCloneButtonClick',
			'onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskRemoveButtonClick',
			'onTaskManagerFormTaskWorkflowRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskWorkflowSaveButtonClick = onTaskManagerFormTaskSaveButtonClick',
			'onTaskManagerFormTaskWorkflowValidateSetup -> controllerStep1, controllerStep2'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.workflow.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.workflow.Step2}
		 */
		controllerStep2: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Build sub-controllers
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.workflow.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.workflow.Step2', { parentDelegate: this });

			this.cmfg('taskManagerFormPanelsAdd', [
				this.controllerStep1.getView(),
				this.controllerStep2.getView()
			]);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskWorkflowRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				this.cmfg('taskManagerFormViewGet').panelFunctionModifyStateSet({
					forceToolbarBottomState: true,
					forceToolbarTopState: true,
					state: false
				});

				this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');

				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.Workflow.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							this.cmfg('taskManagerFormViewGet').loadRecord(
								Ext.create('CMDBuild.model.administration.taskManager.task.workflow.Workflow', decodedResponse)
							);

							this.cmfg('taskManagerFormViewGet').panelFunctionModifyStateSet({ state: false });

							this.onTaskManagerFormTaskRowSelected(arguments); // CallParent alias
						} else {
							_error('onTaskManagerFormTaskWorkflowRowSelected(): unmanaged response', this, decodedResponse);
						}
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskWorkflowSaveButtonClick: function () {
			var formData = Ext.create('CMDBuild.model.administration.taskManager.task.workflow.Workflow', this.cmfg('taskManagerFormViewDataGet'));

			// Validate before save
			if (this.validate(formData.get(CMDBuild.core.constants.Proxy.ACTIVE)))
				if (this.cmfg('taskManagerSelectedTaskIsEmpty')) {
					CMDBuild.proxy.administration.taskManager.task.Workflow.create({
						params: formData.getSubmitData('create'),
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.Workflow.update({
						params: formData.getSubmitData('update'),
						scope: this,
						success: this.success
					});
				}

			this.onTaskManagerFormTaskSaveButtonClick(); // CallParent alias
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 * @private
		 */
		removeItem: function () {
			// Error handling
				if (this.cmfg('taskManagerSelectedTaskIsEmpty'))
					return _error('removeItem(): empty selected task property', this, this.cmfg('taskManagerSelectedTaskGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

			CMDBuild.proxy.administration.taskManager.task.Workflow.remove({
				params: params,
				scope: this,
				success: this.success
			});

			this.callParent(arguments);
		},

		/**
		 * @param {Boolean} fullValidation
		 *
		 * @returns {Boolean}
		 *
		 * @override
		 * @private
		 */
		validate: function (fullValidation) {
			fullValidation = Ext.isBoolean(fullValidation) ? fullValidation : false;

			this.cmfg('onTaskManagerFormTaskWorkflowValidateSetup', fullValidation);

			return this.callParent(arguments);
		}
	});

})();
