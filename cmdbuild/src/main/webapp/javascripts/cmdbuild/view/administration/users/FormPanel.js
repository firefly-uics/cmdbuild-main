(function () {

	Ext.define('CMDBuild.view.administration.users.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: [
			'CMDBuild.core.proxy.CMProxyConstants',
			'CMDBuild.core.proxy.Users'
		],

		mixins: {
			formFunctions: 'CMDBuild.view.common.FormFunctions'
		},

		/**
		 * @cfg {CMDBuild.controller.administration.users.Main}
		 */
		delegate: undefined,

		/**
		 * @param {Ext.button.Button}
		 */
		disableUser: undefined,

		/**
		 * @param {CMDBuild.field.ErasableCombo}
		 */
		defaultGroup: undefined,

		/**
		 * @param {Ext.form.FieldSet}
		 */
		userInfo: undefined,

		/**
		 * @param {Ext.form.FieldSet}
		 */
		userPassword: undefined,

		/**
		 * @param {Ext.form.Panel}
		 */
		wrapper: undefined,

		bodyCls: 'cmgraypanel',
		border: false,
		cls: 'x-panel-body-default-framed cmbordertop',
		frame: false,
		layout: 'fit',
		split: true,

		initComponent: function () {
			var me = this;

			this.disableUser = Ext.create('Ext.button.Button', {
				iconCls: 'delete',
				text: CMDBuild.Translation.disableUser,
				scope: this,

				handler: function (button, e) {
					this.delegate.cmOn('onUserDisableButtonClick');
				}
			});

			// Page FieldSets configuration
				// User info
					this.defaultGroup = Ext.create('CMDBuild.field.ErasableCombo', {
						name: 'defaultgroup',
						fieldLabel: CMDBuild.Translation.defaultGroup,
						labelWidth: CMDBuild.LABEL_WIDTH,
						width: CMDBuild.ADM_BIG_FIELD_WIDTH,
						triggerAction: 'all',
						valueField: CMDBuild.core.proxy.CMProxyConstants.ID,
						displayField: CMDBuild.core.proxy.CMProxyConstants.DESCRIPTION,
						editable: false,
						allowBlank: true,

						store: CMDBuild.core.proxy.Users.getDefaultGroupStore(),
						queryMode: 'local',

						listConfig: {
							loadMask: false
						}
					});

					this.userInfo = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.userInformations,
						overflowY: 'auto',
						flex: 1,

						defaults: {
							xtype: 'textfield',
							labelWidth: CMDBuild.LABEL_WIDTH,
							maxWidth: CMDBuild.ADM_BIG_FIELD_WIDTH,
							anchor: '100%'
						},

						items: [
							{
								name: CMDBuild.core.proxy.CMProxyConstants.USERNAME,
								id: CMDBuild.core.proxy.CMProxyConstants.USERNAME,
								fieldLabel: CMDBuild.Translation.username,
								allowBlank: false,
								cmImmutable: true,
								vtype: 'alphanumextended'
							},
							{
								name: CMDBuild.core.proxy.CMProxyConstants.DESCRIPTION,
								fieldLabel: CMDBuild.Translation.descriptionLabel,
								allowBlank: false
							},
							{
								name: CMDBuild.core.proxy.CMProxyConstants.EMAIL,
								fieldLabel: CMDBuild.Translation.email,
								allowBlank: true,
								vtype: 'emailOrBlank'
							},
							this.defaultGroup,
							Ext.create('Ext.ux.form.XCheckbox', {
								name: CMDBuild.core.proxy.CMProxyConstants.IS_ACTIVE,
								fieldLabel: CMDBuild.Translation.active,
								labelWidth: CMDBuild.LABEL_WIDTH,
								checked: true
							})
						]
					});

				// Password
					this.userPassword = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.password,
						overflowY: 'auto',
						flex: 1,

						defaults: {
							xtype: 'textfield',
							labelWidth: CMDBuild.LABEL_WIDTH,
							maxWidth: CMDBuild.ADM_BIG_FIELD_WIDTH,
							anchor: '100%'
						},

						items: [
							{
								name: CMDBuild.core.proxy.CMProxyConstants.PASSWORD,
								id: 'user_password',
								inputType: 'password',
								fieldLabel: CMDBuild.Translation.password,
								allowBlank: false
							},
							{
								name: CMDBuild.core.proxy.CMProxyConstants.CONFIRMATION,
								inputType: 'password',
								fieldLabel: CMDBuild.Translation.confirmation,
								allowBlank: false,
								initialPassField: 'user_password',
								vtype: 'password'
							}
						]
					});
			// END: Page FieldSets configuration

			// Splitted-view wrapper
			this.wrapper = Ext.create('Ext.form.Panel', {
				bodyCls: 'cmgraypanel-nopadding',
				border: false,
				frame: false,

				layout: {
					type: 'hbox',
					align:'stretch'
				},

				items: [
					this.userInfo,
					{ xtype: 'splitter' },
					this.userPassword
				]
			});

			Ext.apply(this, {
				dockedItems: [
					{
						xtype: 'toolbar',
						dock: 'top',
						itemId: CMDBuild.core.proxy.CMProxyConstants.TOOLBAR_TOP,
						items: [
							Ext.create('CMDBuild.core.buttons.Modify', {
								text: CMDBuild.Translation.modifyUser,

								handler: function (button, e) {
									me.delegate.cmOn('onUserModifyButtonClick');
								}
							}),
							Ext.create('Ext.button.Button', {
								iconCls: 'password',
								text: CMDBuild.Translation.changePassword,

								handler: function (button, e) {
									me.delegate.cmOn('onUserChangePasswordButtonClick');
								}
							}),
							this.disableUser
						]
					},
					{
						xtype: 'toolbar',
						dock: 'bottom',
						itemId: CMDBuild.core.proxy.CMProxyConstants.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.Save', {
								handler: function(button, e) {
									me.delegate.cmOn('onUserSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.Abort', {
								handler: function(button, e) {
									me.delegate.cmOn('onUserAbortButtonClick');
								}
							})
						]
					}
				],
				items: [this.wrapper]
			});

			this.callParent(arguments);

			this.disableModify();
		},

		/**
		 * Forwarding method
		 *
		 * @return {Ext.form.Basic}
		 *
		 * @override
		 */
		getForm: function() {
			return this.wrapper.getForm();
		}
	});

})();