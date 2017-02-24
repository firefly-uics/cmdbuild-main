(function() {

	Ext.define('CMDBuild.view.management.widget.grid.GridPanel', {
		extend: 'Ext.grid.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.widget.grid.Grid}
		 */
		delegate: undefined,

		/**
		 * @cfg {Array}
		 */
		columns: [],

		/**
		 * @property {Ext.grid.plugin.CellEditing}
		 */
		gridEditorPlugin: undefined,

		border: false,
		forceFit: true,

		initComponent: function() {
			this.gridEditorPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit: 1
			});

			Ext.apply(this, {
				plugins: [this.gridEditorPlugin]
			});

			this.callParent(arguments);
		}
	});

})();