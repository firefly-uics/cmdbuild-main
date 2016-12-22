(function () {

	/**
	 * Required managed functions:
	 * 	- panelGridAndFormPanelFormTabActiveFireShowEvent
	 * 	- panelGridAndFormPanelFormTabActiveSet
	 * 	- panelGridAndFormPanelFormTabSelectionManage
	 *
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.form.Form', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.GridAndForm}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel}
		 */
		view: undefined,

		// Tab panel manage methods
			/**
			 * @returns {Void}
			 */
			panelGridAndFormPanelFormTabSelectionManage: function () {
				// Error handling
					if (!Ext.isObject(this.tabPanel) || Ext.Object.isEmpty(this.tabPanel) || !this.tabPanel instanceof Ext.tab.Panel)
						return _error('panelGridAndFormPanelFormTabSelectionManage(): unmanaged tabPanel property', this, this.tabPanel);
				// END: Error handling

				if (Ext.isEmpty(this.tabPanel.getActiveTab()))
					this.cmfg('panelGridAndFormPanelFormTabActiveSet');

				this.cmfg('panelGridAndFormPanelFormTabActiveFireShowEvent');
			},

			/**
			 * @returns {Void}
			 */
			panelGridAndFormPanelFormTabActiveFireShowEvent: function () {
				var activeTab = this.tabPanel.getActiveTab();

				if (Ext.isObject(activeTab) && !Ext.Object.isEmpty(activeTab))
					activeTab.fireEvent('show');
			},

			/**
			 * @param {Object or String or Number} panelToDisplay
			 *
			 * @returns {Void}
			 */
			panelGridAndFormPanelFormTabActiveSet: function (panelToDisplay) {
				this.tabPanel.setActiveTab(Ext.isEmpty(panelToDisplay) ? 0 : panelToDisplay);

				this.cmfg('panelGridAndFormPanelFormTabActiveFireShowEvent');
			}
	});

})();
