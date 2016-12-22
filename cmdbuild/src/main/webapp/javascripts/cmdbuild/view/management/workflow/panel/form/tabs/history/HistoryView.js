(function () {

	/**
	 * @link CMDBuild.view.management.dataView.filter.panel.form.tabs.history.HistoryView
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.history.HistoryView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.History}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.history.GridPanel}
		 */
		grid: undefined,

		border: false,
		cls: 'cmdb-blue-panel-no-padding',
		frame: false,
		itemId: 'workflowFormTabHistory',
		layout: 'fit',
		title: CMDBuild.Translation.history,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.grid = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.history.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onWorkflowTabHistoryPanelShow');
			}
		},

		/**
		 * Service function executed from module controller
		 *
		 * @returns {Void}
		 */
		reset: function () {
			this.setDisabled(this.delegate.cmfg('workflowHistorySelectedEntityIsEmpty'));
		}
	});

})();
