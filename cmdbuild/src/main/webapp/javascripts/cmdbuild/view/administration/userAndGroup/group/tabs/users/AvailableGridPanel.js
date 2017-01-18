(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.group.tabs.users.AvailableGridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.Users'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.tabs.Users}
		 */
		delegate: undefined,

		border: true,
		flex: 1,
		forceFit: true,
		frame: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it
		title: CMDBuild.Translation.availableUsers,

		viewConfig: {
			loadMask: true,
			stripeRows: true
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.administration.userAndGroup.group.tabs.Users.getStoreGroupsUser()
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
							return this.delegate.cmfg('userAndGroupGroupTabUsersAvailableGridStoreLoad', { page: page });
						}
					})
				],
				columns: [
					{
						text: CMDBuild.Translation.username,
						dataIndex: CMDBuild.core.constants.Proxy.NAME
					},
					{
						text: CMDBuild.Translation.descriptionLabel,
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION
					}
				]
			});

			this.callParent(arguments);
		}
	});

})();
