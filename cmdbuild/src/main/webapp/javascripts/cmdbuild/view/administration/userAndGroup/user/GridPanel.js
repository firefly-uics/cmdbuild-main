(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.user.GridPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.grid.GridPanel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.user.User'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.User}
		 */
		delegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.administration.userAndGroup.user.User.getStore()
			});

			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Paging', {
						delegate: this.delegate,

						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						store: this.getStore(),
						displayInfo: true,
						displayMsg: '{0} - {1} ' + CMDBuild.Translation.of + ' {2}',
						emptyMsg: CMDBuild.Translation.noTopicsToDisplay,

						/**
						 * @param {Number} page
						 *
						 * @returns {Void}
						 *
						 * @override
						 */
						customLoadMethod: function (page) {
							return this.delegate.cmfg('userAndGroupUserStoreLoad', { page: page });
						}
					})
				],
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.NAME,
						text: CMDBuild.Translation.username
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel
					},
					Ext.create('Ext.ux.grid.column.Active', {
						dataIndex: CMDBuild.core.constants.Proxy.ACTIVE,
						text: CMDBuild.Translation.enabled,
						maxWidth: 60,
						align: 'center',
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			itemdblclick: function (panel, record, item, index, e, eOpts) {
				this.delegate.cmfg('onUserAndGroupUserItemDoubleClick');
			},
			select: function (row, record, index) {
				this.delegate.cmfg('onUserAndGroupUserRowSelected');
			}
		}
	});

})();
