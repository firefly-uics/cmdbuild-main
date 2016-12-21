(function () {

	Ext.define('CMDBuild.view.management.dataView.filter.panel.form.FormPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		layout: 'fit',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.tabPanel = Ext.create('Ext.tab.Panel', {
						border: false,
						frame: false,
						region: 'center',

						showWidget: function () { // FIXME: used from widgetManager class (remove on widget manager refactor)
							return false;
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
