(function() {

	Ext.define('CMDBuild.view.management.common.widgets.manageEmail.EmailWindowEditForm', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.proxy.CMProxyConstants'],

		mixins: {
			cmFormFunctions: 'CMDBUild.view.common.CMFormFunctions'
		},

		/**
		 * @cfg {CMDBuild.controller.management.common.widgets.manageEmail.EmailWindow}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.field.CMHtmlEditorField}
		 */
		emailContentField: undefined,

		frame: false,
		border: false,
		padding: '5',
		flex: 3,
		bodyCls: 'x-panel-body-default-framed',

		layout: {
			type: 'vbox',
			align: 'stretch' // Child items are stretched to full width
		},

		defaults: {
			labelAlign: 'right'
		},

		initComponent: function() {
			this.emailContentField = Ext.create('CMDBuild.view.common.field.CMHtmlEditorField', {
				name: CMDBuild.core.proxy.CMProxyConstants.BODY,
				hideLabel: true,
				value: this.delegate.record.get(CMDBuild.core.proxy.CMProxyConstants.BODY),
				flex: 1
			});

			Ext.apply(this, {
				items: [
					{
						xtype: 'displayfield',
						name: CMDBuild.core.proxy.CMProxyConstants.FROM,
						fieldLabel: CMDBuild.Translation.from,
						vtype: 'multiemail',
						value: this.delegate.record.get(CMDBuild.core.proxy.CMProxyConstants.FROM)
					},
					{
						xtype: 'textfield',
						name: CMDBuild.core.proxy.CMProxyConstants.TO,
						allowBlank: false,
						fieldLabel: CMDBuild.Translation.to,
						vtype: 'multiemail',
						value: this.delegate.record.get(CMDBuild.core.proxy.CMProxyConstants.TO)
					},
					{
						xtype: 'textfield',
						name: CMDBuild.core.proxy.CMProxyConstants.CC,
						fieldLabel: CMDBuild.Translation.cc,
						vtype: 'multiemail',
						value: this.delegate.record.get(CMDBuild.core.proxy.CMProxyConstants.CC)
					},
					{
						xtype: 'textfield',
						name: CMDBuild.core.proxy.CMProxyConstants.BCC,
						fieldLabel: CMDBuild.Translation.bcc,
						vtype: 'multiemail',
						value: this.delegate.record.get(CMDBuild.core.proxy.CMProxyConstants.BCC)
					},
					{
						xtype: 'textfield',
						name: CMDBuild.core.proxy.CMProxyConstants.SUBJECT,
						allowBlank: false,
						fieldLabel: CMDBuild.Translation.subject,
						value: this.delegate.record.get(CMDBuild.core.proxy.CMProxyConstants.SUBJECT)
					},
					this.emailContentField
				]
			});

			this.callParent(arguments);

			this.fixIEFocusIssue();
		},

		/**
		 * Sometimes on IE the HtmlEditor is not able to take the focus after the mouse click. With this call it works. The reason is currently unknown.
		 */
		fixIEFocusIssue: function() {
			if (Ext.isIE)
				this.mon(this.emailContentField, 'render', function() {
					try {
						this.emailContentField.focus();
					} catch (e) {}
				}, this);
		}
	});

})();