(function () {

	Ext.define('CMDBuild.view.management.dataView.sql.SqlView', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.GridAndFormView',

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.Sql}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.views,

		title: CMDBuild.Translation.views
	});

})();
