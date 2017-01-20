(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.OperativeInstructions', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'workflowFormOperativeInstructionsReset',
			'workflowFormOperativeInstructionsUiUpdate'
		],

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel}
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

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel', { delegate: this });
		},

		/**
		 * @returns {Void}
		 */
		workflowFormOperativeInstructionsReset: function () {
			this.view.update('');
		},

		/**
		 * @returns {Void}
		 */
		workflowFormOperativeInstructionsUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add':
					return this.view.update('');

				default: {
					if (!this.cmfg('workflowSelectedInstanceIsEmpty'))
						this.view.update(this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.INSTRUCTIONS));
				}
			}
		}
	});

})();
