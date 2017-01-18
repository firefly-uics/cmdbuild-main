(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.Users', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.Users'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.Group}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.users.AvailableGridPanel}
		 */
		availableGrid: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupTabUsersAddButtonClick',
			'onUserAndGroupGroupTabUsersGroupSelected = onUserAndGroupGroupTabGroupSelected',
			'onUserAndGroupGroupTabUsersSaveButtonClick',
			'onUserAndGroupGroupTabUsersShow',
			'userAndGroupGroupTabUsersAvailableGridStoreLoad',
			'userAndGroupGroupTabUsersSelectedGridStoreLoad'
		],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.users.SelectedGridPanel}
		 */
		selectedGrid: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.users.UsersView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.userAndGroup.group.Group} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.users.UsersView', { delegate: this });

			// Shorthands
			this.availableGrid = this.view.availableGrid;
			this.selectedGrid = this.view.selectedGrid;
		},

		/**
		 * Disable tab on add button click
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabUsersAddButtonClick: function () {
			this.view.disable();
		},

		/**
		 * Enable/Disable tab evaluating selected group
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabUsersGroupSelected: function () {
			this.view.setDisabled(this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'));
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (use an array of id not a string)
		 */
		onUserAndGroupGroupTabUsersSaveButtonClick: function () {
			// Error handling
				if (this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'))
					return _error('onUserAndGroupGroupTabUsersSaveButtonClick(): empty selectedGroup property', this, this.cmfg('userAndGroupGroupSelectedGroupGet'));
			// END: Error handling

			var usersIdArray = [];

			Ext.Array.forEach(this.selectedGrid.getStore().getRange(), function (record, i, allRecords) {
				usersIdArray.push(record.get(CMDBuild.core.constants.Proxy.ID));
			}, this);

			usersIdArray = Ext.Array.clean(usersIdArray);
			usersIdArray = Ext.Array.unique(usersIdArray);

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.USERS] = usersIdArray.join();

			CMDBuild.proxy.administration.userAndGroup.group.tabs.Users.update({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					CMDBuild.core.Message.success();

					this.cmfg('onUserAndGroupGroupTabUsersShow');
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabUsersShow: function () {
			if (!this.cmfg('userAndGroupGroupSelectedGroupIsEmpty')) {
				this.cmfg('userAndGroupGroupTabUsersAvailableGridStoreLoad');
				this.cmfg('userAndGroupGroupTabUsersSelectedGridStoreLoad');
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.page
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		userAndGroupGroupTabUsersAvailableGridStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'))
					return _error('userAndGroupGroupTabUsersAvailableGridStoreLoad(): empty selectedGroup property', this, this.cmfg('userAndGroupGroupSelectedGroupGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ALREADY_ASSOCIATED] = false;
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

			this.availableGrid.getStore().getProxy().extraParams = params; // Setup extraParams to work also with column header click

			this.availableGrid.getStore().loadPage(parameters.page, { params: params });
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.page
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		userAndGroupGroupTabUsersSelectedGridStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'))
					return _error('userAndGroupGroupTabUsersSelectedGridStoreLoad(): empty selectedGroup property', this, this.cmfg('userAndGroupGroupSelectedGroupGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ALREADY_ASSOCIATED] = true;
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

			this.selectedGrid.getStore().getProxy().extraParams = params; // Setup extraParams to work also with column header click

			this.selectedGrid.getStore().load({ params: params });
		}
	});

})();
