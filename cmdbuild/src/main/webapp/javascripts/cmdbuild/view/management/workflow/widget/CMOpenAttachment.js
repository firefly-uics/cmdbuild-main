(function() {
	Ext.define("CMDBuild.view.management.workflow.widgets.CMOpenAttachment", {
		extend: "CMDBuild.view.management.classes.attachments.CMCardAttachmentsPanel",

		initComponent: function() {
			this.backToActivityButton = new Ext.button.Button({
				text: CMDBuild.Translation.common.buttons.workflow.back
			});

			Ext.apply(this, {
				buttonAlign: "center",
				buttons: [this.backToActivityButton],
				cls: "x-panel-body-default-framed"
			});

			this.callParent(arguments);

			this.mon(this, "deactivate", function() {
				this.disable();
			}, this);
		},

		configure: function(c) {
			this.widgetConf = c.widget;
			this.activity = c.activity.raw || c.activity.data;
			this.clientForm = c.clientForm;
			this.readOnly = c.widget.ReadOnly;

			Ext.apply(this, this.widgetConf);

			this.setExtraParams({
				IdClass: this.activity.IdClass,
				Id: this.activity.Id
			});

			this.writePrivileges = this.activity.priv_write && !this.readOnly;
			this.addAttachmentButton.setDisabled(!this.writePrivileges);

			this.loaded = false;
		},

		cmActivate: function() {
			this.enable();
			this.ownerCt.setActiveTab(this);
		}
	});
})();