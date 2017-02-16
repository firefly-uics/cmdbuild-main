(function () {

	Ext.define('CMDBuild.view.management.dataView.filter.FilterView', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.GridAndFormView',

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.Filter}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.views,

		title: CMDBuild.Translation.views
	});

})();
