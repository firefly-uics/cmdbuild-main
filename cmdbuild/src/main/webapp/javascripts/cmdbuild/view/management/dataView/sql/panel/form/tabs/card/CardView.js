(function () {

	Ext.define('CMDBuild.view.management.dataView.sql.panel.form.tabs.card.CardView', {
		extend: 'Ext.panel.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.panel.form.tabs.card.Card}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.form.tabs.card.FormPanel}
		 */
		form: undefined,

		border: false,
		cls: 'cmdb-blue-panel-no-padding',
		frame: false,
		itemId: 'dataViewSqlFormTabCard',
		layout: 'fit',
		title: CMDBuild.Translation.card,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							Ext.create('CMDBuild.core.buttons.icon.modify.Modify', {
								text: CMDBuild.Translation.modifyCard,
								disabled: true
							}),
							Ext.create('CMDBuild.core.buttons.icon.Remove', {
								text: CMDBuild.Translation.deleteCard,
								disabled: true
							}),
							Ext.create('CMDBuild.core.buttons.icon.Clone', {
								text: CMDBuild.Translation.cloneCard,
								disabled: true
							}),
							Ext.create('CMDBuild.core.buttons.icon.RelationGraph', {
								disabled: true
							}),
							Ext.create('CMDBuild.core.buttons.icon.split.Print', {
								text: CMDBuild.Translation.print + ' ' + CMDBuild.Translation.card.toLowerCase(),
								disabled: true
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',
						cls: 'x-panel-body-default-framed',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Save', { disabled: true }),
							Ext.create('CMDBuild.core.buttons.text.Abort', { disabled: true })
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.management.dataView.sql.panel.form.tabs.card.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
