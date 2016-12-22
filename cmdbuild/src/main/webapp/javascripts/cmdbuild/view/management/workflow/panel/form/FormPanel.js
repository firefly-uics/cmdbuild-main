(function () {

	/**
	 * Adapter
	 *
	 * Extends "CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel" on full widget refactor
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.workflow.panel.form.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel}
		 */
		operativeInstructionsPanel: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.TabPanel}
		 */
		tabPanel: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		border: false,
		cls: 'cmdb-border-top',
		frame: false,
		height: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.CARD_FORM_RATIO) + '%',
		layout: 'border',
		region: 'south',
		split: true,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.operativeInstructionsPanel = Ext.create('CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel', { delegate: this.delegate }),
					this.tabPanel = Ext.create('CMDBuild.view.management.workflow.panel.form.TabPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
