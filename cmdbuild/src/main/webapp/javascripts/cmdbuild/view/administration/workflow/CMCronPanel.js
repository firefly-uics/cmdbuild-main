(function() {

	var tr = CMDBuild.Translation.administration.tasks; // Path to translation

	Ext.define('CMDBuild.view.administration.workflow.CMCronPanel', {
		extend: 'Ext.panel.Panel',

		mixins: {
			cmFormFunctions: 'CMDBUild.view.common.CMFormFunctions'
		},

		delegate: undefined,

		layout: 'fit',
		frame: false,
		border: true,

		initComponent: function() {
			var me = this;

			this.addButton = Ext.create('Ext.button.Button', {
				iconCls: 'add',
				text: tr.add,
				handler: function() {
					me.delegate.cmOn('onAddButtonClick');
				}
			});

			this.modifyButton = Ext.create('Ext.button.Button', {
				iconCls: 'modify',
				text: tr.modify,
				handler: function() {
					me.delegate.cmOn('onModifyButtonClick');
				}
			});

			this.removeButton = Ext.create('Ext.button.Button', {
				iconCls: 'delete',
				text: tr.remove,
				handler: function() {
					me.delegate.cmOn('onRemoveButtonClick');
				}
			});

			this.grid = Ext.create('CMDBuild.view.administration.workflow.CMProcessTasksGrid');

			this.cmTBar = [this.addButton, this.modifyButton, this.removeButton];

			Ext.apply(this, {
				items: [this.grid],
				tbar: this.cmTBar
			});

			this.callParent();
			this.disableCMTbar();
		}
	});

})();