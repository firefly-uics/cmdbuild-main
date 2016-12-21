(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelFilterApply
	 * 	- panelGridAndFormListPanelFilterClear
	 * 	- panelGridAndFormListPanelGet
	 * 	- panelGridAndFormListPanelStoreGet
	 * 	- panelGridAndFormListPanelStoreLoad
	 *
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.tree.Tree', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.GridAndForm}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.tree.TreePanel}
		 */
		view: undefined
	});

})();
