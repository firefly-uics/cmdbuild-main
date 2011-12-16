(function() {
	Ext.define("CMDBuild.view.management.common.widgets.CMOpenReport", {
		extend: "Ext.panel.Panel",

		statics: {
			WIDGET_NAME: ".OpenReport"
		},

		formatCombo: {},
		attributeList: [],
		formFields: [],

		initComponent: function() {
			this.WIDGET_NAME = this.self.WIDGET_NAME;
			this.CMEVENTS = {
				saveButtonClick: "cm-save-click"
			}

			this.formatCombo = new Ext.form.ComboBox({
				fieldLabel : CMDBuild.Translation.management.modworkflow.extattrs.createreport.format_label,
				labelAlign: "right",
				labelWidth: CMDBuild.LABEL_WIDTH,
				name : 'reportExtension',
				editable : false,
				disableKeyFilter : true,
				forceSelection : true,
				queryMode : 'local',
				store : new Ext.data.ArrayStore({
					autoDestroy: true,
					fields : [ 'value', 'text' ],
					data : [
						[ 'pdf', 'PDF' ],
						[ 'csv', 'CSV' ],
						[ 'odt', 'ODT' ],
						[ 'rtf', 'RTF' ]
					]
				}),
				valueField: 'value',
				displayField: 'text',
				value: 'pdf'
			});
	
			this.formPanel = new Ext.FormPanel({
				monitorValid : true,
				autoScroll : true,
				frame : false,
				border: false,
				region : 'center',
				bodyCls: "x-panel-body-default-framed",
				padding: "5",
				items : [ this.formatCombo ]
			});

			Ext.apply(this, {
				layout: 'border',
				buttonAlign: 'center',
				items: [this.formPanel],
				cls: "x-panel-body-default-framed",
				border: false,
				frame: false
			});

			this.callParent(arguments);
			this.addEvents(this.CMEVENTS.saveButtonClick);
		},

		// buttons that the owner panel add to itself
		getExtraButtons: function() {
			var me = this;
			return [new Ext.Button( {
				text : CMDBuild.Translation.common.buttons.save,
				name : 'saveButton',
				handler: function() {
					me.fireEvent(me.CMEVENTS.saveButtonClick);
				}
			})]
		},

		forceExtension: function(extension) {
			if (extension) {
				this.formatCombo.setValue(extension);
				this.formatCombo.disable();
			} else {
				this.formatCombo.enable();
			}
		},
	
		// add the required attributes
		configureForm: function(attributes, parameters) {
			if (!this.formPanelCreated) {
				this.formPanelCreated = true;
				// add fields to form panel
				for (var i=0; i<attributes.length; i++) {
					var attribute = attributes[i],
						field = CMDBuild.Management.FieldManager.getFieldForAttr(attribute, false);
	
					if (field) {
						if(parameters[attribute.name] && typeof (parameters[attribute.name] != 'object')) {
							field.setValue(parameters[attribute.name]);
						} else if(attribute.defaultvalue) {
							field.setValue(attribute.defaultvalue);
						}
	
						this.formFields[i] = field;
						this.formPanel.add(field);
					}
				}
				this.formPanel.doLayout();
			}
		},
	
		fillFormValues: function(parameters) {
			for(var i=0;i<this.formFields.length;i++) {
				var field = this.formFields[i];
				if(parameters[field.name] && (typeof parameters[field.name] == 'object')) {
					var value = this.getActivityFormVariable(parameters[field.name]);
					field.setValue(value);
				}
			}
		}
	});

})();
