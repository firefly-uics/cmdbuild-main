(function () {

	Ext.define('CMDBuild.controller.management.dataView.sql.panel.grid.toolbar.Top', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.panel.grid.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.grid.toolbar.TopView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.sql.panel.grid.Grid} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.sql.panel.grid.toolbar.TopView', { delegate: this });
		}
	});

})();
