(function () {

	Ext.define('CMDBuild.controller.common.sessionExpired.SessionExpired', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.proxy.session.JsonRpc'
		],

		/**
		 * @cfg {Mixed}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		ajaxParameters: {},

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onSessionExpiredChangeUserButtonClick = onSessionExpiredConfirmButtonClick',
			'onSessionExpiredLoginButtonClick'
		],

		/**
		 * @cfg {Boolean}
		 */
		passwordFieldEnable: true,

		/**
		 * @property {CMDBuild.view.common.sessionExpired.SessionExpiredWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Mixed} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.sessionExpired.SessionExpiredWindow', { delegate: this });

			// Shorthands
			this.form = this.view.form;

			this.form.password.setDisabled(!this.passwordFieldEnable);

			if (!Ext.isEmpty(this.view))
				this.view.show();
		},

		/**
		 * @returns {Void}
		 */
		onSessionExpiredChangeUserButtonClick: function () {
			window.location = '.';
		},

		/**
		 * @returns {Void}
		 */
		onSessionExpiredLoginButtonClick: function () {
			this.view.hide();

			var params = {};
			params[CMDBuild.core.constants.Proxy.PASSWORD] = this.form.password.getValue();
			params[CMDBuild.core.constants.Proxy.USERNAME] = CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.USERNAME);
			params[CMDBuild.core.constants.Proxy.ROLE] = CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.DEFAULT_GROUP_NAME);

			// LoadMask manual manage to avoid to hide on success
			CMDBuild.core.LoadMask.show();
			CMDBuild.core.proxy.session.JsonRpc.login({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					CMDBuild.core.proxy.session.Rest.login({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

							if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse))
								Ext.util.Cookies.set(CMDBuild.core.constants.Proxy.SESSION_TOKEN, decodedResponse['_id']);
						},
						callback: function (options, success, response) {
							// CMDBuild redirect
							if (Ext.Object.isEmpty(this.ajaxParameters)) {
								window.location.reload();
							} else {
								CMDBuild.core.LoadMask.hide();

								CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, this.ajaxParameters);
							}
						}
					});
				},
				failure: function (response, options, decodedResponse) {
					var oldToFront = this.view.toFront;
					this.toFront = Ext.emptyFn;
					this.show();
					this.toFront = oldToFront;

					CMDBuild.core.LoadMask.hide();
				}
			});
		}
	});

})();