(function () {

	/**
	 * Extends original view to implement function to select tab on widget button click
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.dataView.filter.panel.form.tabs.email.EmailView', {
		extend: 'CMDBuild.view.management.common.tabs.email.EmailView',

		requires: ['CMDBuild.core.constants.Proxy'],


		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.tabs.Email}
		 */
		delegate: undefined,

		itemId: 'dataViewFilterFormTabEmail',

		/**
		 * @returns {Void}
		 */
		cmActivate: function () {
			this.setDisabled(false);

			this.delegate.parentDelegate.tabPanel.setActiveTab(this);
		}
	});

})();
