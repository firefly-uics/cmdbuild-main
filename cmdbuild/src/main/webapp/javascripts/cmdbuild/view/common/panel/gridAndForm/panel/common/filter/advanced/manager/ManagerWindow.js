(function () {

	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.ManagerWindow', {
		extend: 'CMDBuild.core.window.AbstractModal',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		delegate: undefined,

		/**
		 * @cfg {Object}
		 */
		dimensions: {
			height: 200,
			width: 350
		},

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'absolute',

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.GridPanel}
		 */
		grid: undefined,

		border: true,
		closeAction: 'hide',
		draggable: false,
		frame: true,
		header: false,
		modal: false,
		resizable: false,

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
							Ext.create('CMDBuild.core.buttons.icon.add.Add', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerAddButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.grid = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (window, eOpts) {
				this.delegate.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerViewShow');
			}
		}
	});

})();
