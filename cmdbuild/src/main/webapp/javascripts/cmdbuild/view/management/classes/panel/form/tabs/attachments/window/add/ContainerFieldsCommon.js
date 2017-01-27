(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsCommon', {
		extend: 'Ext.container.Container',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments'
		],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Add}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-blue-panel',
		frame: false,

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.CATEGORY,
						fieldLabel: CMDBuild.core.Utils.prependMandatoryLabel(CMDBuild.Translation.category),
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						valueField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						allowBlank: false,
						forceSelection: true,
						editable: false,

						store: CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.getStoreLokup(),
						queryMode: 'local',

						listeners: {
							scope: this,
							change: function (field, newValue, oldValue, eOpts) {
								if (Ext.isString(newValue) && !Ext.isEmpty(newValue))
									this.delegate.cmfg('onClassesFormTabAttachmentsWindowAddCategoryChange', newValue);
							}
						}
					}),
					Ext.create('Ext.form.field.File', {
						name: 'File',
						fieldLabel: CMDBuild.core.Utils.prependMandatoryLabel(CMDBuild.Translation.loadAttachment),
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
						allowBlank: false
					}),
					Ext.create('Ext.form.field.TextArea', {
						name: CMDBuild.core.constants.Proxy.DESCRIPTION,
						fieldLabel: CMDBuild.core.Utils.prependMandatoryLabel(CMDBuild.Translation.descriptionLabel),
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
						allowBlank: false
					}),
					Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.MAJOR,
						fieldLabel: CMDBuild.Translation.majorVersion,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						inputValue: true,
						uncheckedValue: false,
						disabled: true,
						value: true
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
