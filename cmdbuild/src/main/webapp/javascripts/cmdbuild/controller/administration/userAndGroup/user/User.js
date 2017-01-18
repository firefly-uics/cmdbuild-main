(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.user.User', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.GridAndForm',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.user.User'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.UserAndGroup}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupUserAbortButtonClick',
			'onUserAndGroupUserAccordionSelected = onUserAndGroupAccordionSelected',
			'onUserAndGroupUserAddButtonClick',
			'onUserAndGroupUserChangePasswordButtonClick',
			'onUserAndGroupUserDisableButtonClick',
			'onUserAndGroupUserModifyButtonClick = onUserAndGroupUserItemDoubleClick',
			'onUserAndGroupUserPrivilegedChange',
			'onUserAndGroupUserRowSelected',
			'onUserAndGroupUserSaveButtonClick',
			'onUserAndGroupUserServiceChange',
			'onUserAndGroupUserShow'
		],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.administration.userAndGroup.user.User}
		 *
		 * @private
		 */
		selectedUser: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.UserView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.userAndGroup.user.UserAndGroup} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.user.UserView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserAbortButtonClick: function () {
			if (!this.userAndGroupUserSelectedUserIsEmpty()) {
				this.cmfg('onUserAndGroupUserRowSelected');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserAccordionSelected: function () {
			if (
				!this.cmfg('userAndGroupSelectedAccordionIsEmpty')
				&& this.cmfg('userAndGroupSelectedAccordionGet', CMDBuild.core.constants.Proxy.SECTION_HIERARCHY)[0] == 'user'
			) {
				this.cmfg('userAndGroupViewTitleSet', this.getBaseTitle());
				this.cmfg('userAndGroupViewActiveItemSet', this.view);
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserAddButtonClick: function () {
			this.grid.getSelectionModel().deselectAll();

			this.userAndGroupUserSelectedUserReset();

			this.form.reset();
			this.form.setDisabledModify(false, true);
			this.form.defaultGroupCombo.setDisabled(true);
			this.form.loadRecord(Ext.create('CMDBuild.model.administration.userAndGroup.user.User'));
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserChangePasswordButtonClick: function () {
			this.form.setDisabledFieldSet(this.form.userPasswordFieldSet, false);
			this.form.setDisabledTopBar(true);
			this.form.setDisabledBottomBar(false);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserDisableButtonClick: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.DISABLE] = this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ACTIVE);

			CMDBuild.proxy.administration.userAndGroup.user.User.disable({
				params: params,
				scope: this,
				success: this.success
			});
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserModifyButtonClick: function () {
			this.form.setDisabledFieldSet(this.form.userInfoFieldSet, false);
			this.form.setDisabledTopBar(true);
			this.form.setDisabledBottomBar(false);
		},

		/**
		 * Privileged is a specialization of service, so if someone check privileged is implicit that is a service user
		 *
		 * @returns {Void}
		 */
		onUserAndGroupUserPrivilegedChange: function () {
			if (this.form.privilegedCheckbox.getValue())
				this.form.serviceCheckbox.setValue(true);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserRowSelected: function () {
			if (this.grid.getSelectionModel().hasSelection()) {
				this.userAndGroupUserSelectedUserSet({ value: this.grid.getSelectionModel().getSelection()[0] });

				this.form.reset();
				this.form.setDisabledModify(true, true);

				// Update buttonToggleEnableDisable button
				this.form.buttonToggleEnableDisable.setActiveState(this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ACTIVE));

				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ID);

				this.form.defaultGroupCombo.getStore().load({
					params: params,
					scope: this,
					callback: function (records, operation, success) {
						var defaultGroup = this.form.defaultGroupCombo.getStore().findRecord('isdefault', true);

						if (!Ext.isEmpty(defaultGroup))
							this.userAndGroupUserSelectedUserSet({
								propertyName: 'defaultgroup',
								value: defaultGroup.get(CMDBuild.core.constants.Proxy.ID)
							});

						this.form.getForm().loadRecord(this.userAndGroupUserSelectedUserGet());
					}
				});

			}
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for a refactor (new CRUD standards)
		 */
		onUserAndGroupUserSaveButtonClick: function () {
			if (this.validate(this.form)) {
				var params = this.form.getData(true);

				if (Ext.isEmpty(params[CMDBuild.core.constants.Proxy.ID])) {
					params[CMDBuild.core.constants.Proxy.ID] = -1;

					CMDBuild.proxy.administration.userAndGroup.user.User.create({
						params: params,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.userAndGroup.user.User.update({
						params: params,
						scope: this,
						success: this.success
					});
				}
			}
		},

		/**
		 * Privileged is a specialization of service, so if someone uncheck service is implicit that is not a privileged user
		 *
		 * @returns {Void}
		 */
		onUserAndGroupUserServiceChange: function () {
			if (!this.form.serviceCheckbox.getValue())
				this.form.privilegedCheckbox.setValue(false);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserShow: function () {
			this.storeLoad({
				scope: this,
				callback: function (records, operation, success) {
					if (!this.grid.getSelectionModel().hasSelection())
						this.grid.getSelectionModel().select(0, true);
				}
			});
		},

		// SelectedUser property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedUser';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedUser';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserReset: function () {
				this.propertyManageReset('selectedUser');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.userAndGroup.user.User';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedUser';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		storeLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			this.grid.getSelectionModel().deselectAll();

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE_ONLY] = this.view.includeDisabledUsers.getValue();

			this.grid.getStore().load({
				params: params,
				scope: parameters.scope,
				callback: parameters.callback
			});
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		success: function (response, options, decodedResponse) {
			decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('success(): unmanaged response', this, decodedResponse);
			// END: Error handling

			this.view.includeDisabledUsers.reset(); // Reset checkbox value to load all users on save

			this.storeLoad({
				scope: this,
				callback: function (records, operation, success) {
					this.grid.getSelectionModel().select(
						this.grid.getStore().find(CMDBuild.core.constants.Proxy.ID, decodedResponse[CMDBuild.core.constants.Proxy.ID])
					);

					this.form.setDisabledModify(true);
				}
			});
		}
	});

})();
