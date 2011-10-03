(function() {
	
var tr = CMDBuild.Translation.administration.setup.cmdbuild;

Ext.define("CMDBuild.view.administration.configuration.CMModConfigurationGenericOption", {
	extend: "CMDBuild.view.administration.configuration.CMBaseModConfiguration",
	
	alias: "widget.configuregenericoptions",

	configFileName: 'cmdbuild',
	
	constructor: function() {
		this.title = tr.title;
		this.instanceNameField = new Ext.form.field.Text({
			fieldLabel: tr.instancename,
			name: 'instance_name',
			allowBlank: true
		});
		
		var startingClass = new CMDBuild.field.ErasableCombo({
			fieldLabel : tr.startingClass,
			name : 'startingclass',
			valueField : 'id',
			displayField : 'description',
			editable : false,
			store : _CMCache.getClassesAndProcessesStore(),
			queryMode : 'local'
		});
		
		this.items = [
			{
			xtype: 'fieldset',
			title: tr.fieldsetgeneraltitle,
			items: [
				this.instanceNameField
				,startingClass
			,{
				fieldLabel: tr.rowlimit,
				xtype: 'numberfield',
				name: 'rowlimit',
				allowBlank: false
			},{
				fieldLabel: tr.referencecombolimit,
				xtype: 'numberfield',
				name: 'referencecombolimit',
				allowBlank: false
			},{
				fieldLabel: tr.relationlimit,
				xtype: 'numberfield',
				name: 'relationlimit',
				allowBlank: false
			},{
				fieldLabel: tr.cardpanelheight,
				xtype: 'numberfield',
				name: 'grid_card_ratio',
				allowBlank: false,
				maxValue: 100,
				minValue: 0
			},{
				fieldLabel: tr.sessiontimeout,
				xtype: 'numberfield',
				name: 'session.timeout',
				allowBlank: true,
				minValue: 0
			}]
		},{
			xtype: 'fieldset',
			title: tr.fieldsetpopupwindowtitle,
			items: [{
				fieldLabel: tr.popupheightlabel,
			    xtype: 'numberfield',
			    name: 'popuppercentageheight',
			    maxValue: 100,
			    allowBlank: false
			},{
			  	fieldLabel: tr.popupwidthlabel,
			    xtype: 'numberfield',
			    name: 'popuppercentagewidth',
			    maxValue:100,
			    allowBlank: false
			}]
		},
		{
			xtype: 'fieldset',
			title : tr.fieldsetlanguageltitle,
			items : [ {
				fieldLabel : tr.language,
				xtype : 'xcombo',
				name : 'language',
				hiddenName : 'language',
				valueField : 'name',
				displayField : 'value',
				grow : true,
				triggerAction : 'all',
				minChars : 0,
				store : new Ext.data.Store( {
					model : 'TranslationModel',
					proxy : {
						type : 'ajax',
						url : 'services/json/utils/listavailabletranslations',
						reader : {
							type : 'json',
							root : 'translations'
						}
					},
					autoLoad : true
				})
			}, {
				fieldLabel : tr.languagePrompt,
				xtype : 'xcheckbox',
				name : 'languageprompt'
			}]
		}
		];

		this.callParent(arguments);
	},
	
	afterSubmit: function() {
		var hdInstanceName = Ext.get('instance_name');
		hdInstanceName.dom.innerHTML = this.instanceNameField.getValue();
	}

});

})();