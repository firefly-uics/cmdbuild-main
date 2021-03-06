(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.widgets.WidgetsView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.Widgets}
		 */
		delegate: undefined,

		/**
		 * @property {Object}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.widgets.GridPanel}
		 */
		grid: undefined,

		border: false,
		frame: false,
		layout: 'border',
		title: CMDBuild.Translation.widget,

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
							Ext.create('CMDBuild.core.buttons.icon.split.add.Widget', {
								delegate: this.delegate,
								delegateEventPrefix: 'onClassesTabWidgets'
							})
						]
					})
				],
				items: [
					this.grid = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.GridPanel', {
						delegate: this.delegate,
						region: 'north',
						split: true,
						height: '30%'
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onClassesTabWidgetsShow');
			}
		}
	});

})();
