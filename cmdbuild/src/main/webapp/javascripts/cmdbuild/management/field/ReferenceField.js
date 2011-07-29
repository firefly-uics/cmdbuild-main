(function() {

	Ext.define("CMDBuild.Management.ReferenceField", {
		statics: {
			build: function(attribute, subFields) {
				var field = Ext.create("CMDBuild.Management.ReferenceField.Field", {
					attribute: attribute
				});

				if (attribute.fieldFilter) {
					//is using a template
					
					field.vtype = 'valueInStore'; // custom
					field.invalidText = CMDBuild.Translation.errors.reference_invalid;
					
					var xaVars = CMDBuild.Utils.Metadata.extractMetaByNS(attribute.meta, "system.template.");
					xaVars["SystemFieldFilter"] = attribute.fieldFilter;
			
					field.templateResolver = new CMDBuild.Management.TemplateResolver({
						getBasicForm: function() {
							return field.findParentByType('form').getForm();
						},
						xaVars: xaVars,
						getServerVars: function() {
							return field.findParentByType('form').ownerCt.ownerCt.currentRecord.data;
						}
					});
			
					/*
					 * when the form switches to edit mode, resolve the template and
					 * validate the value in compliance with the filter result
					 */
					field.resolveTemplate = resolveTemplate;
					
					//the validation on select is needed to remove the
					//non validation indicator, after a valid selection
					field.on('select', function(combo, rec, index){
						combo.validate();
					});
				}
				
				// adds the record when the store is not completely loaded (too many records)
				field.setValue = Ext.Function.createInterceptor(field.setValue, function(value) {
					if (typeof value == "undefined" || value == "") {
						return;
					}
			
					var storeNotEmpty = this.store.getCount() != 0;		
					var valueNotInStore = this.store.find(this.valueField, value) == -1;		
					var storeNotOneTime = !this.store.isOneTime;
			
					if (storeNotEmpty && this.storeIsLargerThenLimit() && storeNotOneTime && valueNotInStore) {
						this.valueNotFoundText = CMDBuild.Translation.common.loading;
						var newTotal = this.store.getTotalCount();
			
						var _store = this.store;
						var params = Ext.apply({}, _store.baseParams);
						params['Id'] = value;
						
						CMDBuild.Ajax.request({
							url : _store.proxy.url,
							params: params,
							method : 'POST',
							success : function(response, options, decoded) {
								decoded[_store.totalProperty] = _store.getTotalCount();
								_store.loadData(decoded, true);
							}
						});
					}
					
				}, field);
				
				field.setValue = Ext.Function.createSequence(field.setValue, function(v) {
					if (field.store.isOneTime
							&& v != "" && typeof v != "undefined"
							&& field.store.find(field.valueField, v) == -1) {
						
						var recordIndex = field.permanentStore.find(field.valueField, v);
						if (recordIndex == -1) {
							field.permanentStore.load({
								params: { Id: v },
								add: true,
								callback: function(r,o,s) { 
									field.setRawValue(r[0].data.Description);
								}
							});
						} else {
							var r = field.permanentStore.getAt(recordIndex);
							if (r) {
								field.setRawValue(r.data.Description);
							}
						}
					}
					
					field.validate();
				});

				if (subFields && subFields.length > 0) {
					var subFieldsPanel = new Ext.panel.Panel({
						bodyCls: "x-panel-body-default-framed",
						hideMode: "offsets",
						hidden: true,
						frame: false,
						items: [subFields]
					}),

					button = new Ext.button.Button({
						enableToggle: true,
						iconCls: "detail",
						margin: "0 0 0 5",
						listeners: {
							toggle: function(button, pressed) {
								if (pressed) {
									subFieldsPanel.show();
								} else {
									subFieldsPanel.hide();
								}
							}
						}
					});

					return new Ext.panel.Panel({
						frame: false,
						border: false,
						bodyCls: "x-panel-body-default-framed",
						items: [{
							xtype:'panel',
							bodyCls: "x-panel-body-default-framed",
							frame: false,
							layout: "hbox",
							items: [field, button]
						},
							subFieldsPanel
						]
					});

				} else {
					return field;
				}
			}
		}
	});

	Ext.define("CMDBuild.Management.ReferenceField.Field", {
		extend: "CMDBuild.Management.SearchableCombo",
		attribute: undefined,
		
		initComponent: function() {
			var attribute = this.attribute;
			var permanentStore = CMDBuild.Cache.getReferenceStoreById(attribute.referencedIdClass);
			var store = CMDBuild.Cache.getReferenceStore(attribute);

			store.on('loadexception', function() {
				field.valueNotFoundText = '';
				field.setValue('');
			});

			Ext.apply(this, {
				plugins: new CMDBuild.SetValueOnLoadPlugin(),
				fieldLabel: attribute.description,
				labelWidth: CMDBuild.CM_LABEL_WIDTH,
				name: attribute.name,
				store: store,
				permanentStore: permanentStore,
				queryMode: 'local',
				valueField: 'Id',
				displayField: 'Description',
				allowBlank: !attribute.isnotnull,
				grow: true, // XComboBox autogrow
				minChars: 1,
				filtered: false,
				CMAttribute: attribute
			});
			
			this.callParent(arguments);
		},
		
		//TODO 3 to 4 probably never reached
		expand: function() {
			if (this.store.isLoading()) {
				return false;
			}

			if (this.storeIsLargerThenLimit()) {
//				this.createReferenceWindow();
				return false;
			}
			
			this.callParent(arguments);
		}
	});
	
	function resolveTemplate() {
		if (!field.disabled) {
			field.templateResolver.resolveTemplates({
				attributes: ["SystemFieldFilter"],
				callback: onTemplateResolved
			});
		}
	};

	function onTemplateResolved(out, ctx) {	
		var f = field;
		f.filtered = true;
		var currentValue = f.getValue();
		var currentRawValue = f.getRawValue();
		// was buildCQLQueryParameters(attribute.fieldFilter, ctx), but it did not allow query composition
		var callParams = field.templateResolver.buildCQLQueryParameters(out["SystemFieldFilter"]);
		f.callParams = Ext.apply({}, callParams);
		if (callParams) {
			f.store.baseParams.CQL = callParams.CQL; // NdPaolo: this should not be necessary, where it is set?!
			f.store.load({
				params: callParams,
				//TODO define a business rule to manage the case of inconsistency
				//between data already stored and new filter policy, an idea is an alert message
				//with a pretty window pop up
				callback: function() {
					if (f.isValid()) {
						f.removeClass(f.invalidClass);
					}
				}
			});
		} else {
			var emptyDataSet = {};
			emptyDataSet[f.store.root] = [];
			emptyDataSet[f.store.totalProperty] = 0;
			f.store.loadData(emptyDataSet);
		}
		addListenerToDeps();
	};
	
	function addListenerToDeps() {
		var ld = field.templateResolver.getLocalDepsAsField();
		for(var i in ld) {
			//before the blur if the value is changed
			if (ld[i]) {
				ld[i].on('change',resolveTemplate);
			}
		}
	};
})();