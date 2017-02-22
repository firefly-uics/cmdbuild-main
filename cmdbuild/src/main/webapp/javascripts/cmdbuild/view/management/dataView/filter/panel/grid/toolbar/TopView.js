(function () {

	Ext.define('CMDBuild.view.management.dataView.filter.panel.grid.toolbar.TopView', {
		extend: 'Ext.toolbar.Toolbar',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.grid.toolbar.Top}
		 */
		delegate: undefined,

		dock: 'top',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,
				items: [
					Ext.create('CMDBuild.core.buttons.icon.add.Add', { // Placeholder
						itemId: 'addButton',
						disabled: true
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
