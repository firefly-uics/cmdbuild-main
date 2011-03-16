/*
 * PatchManager
 * This component manage the update state of the database 
 */

Ext.onReady(function() {
	var tr = CMDBuild.Translation.administration.modClass.classProperties;
	this.store = new Ext.data.JsonStore({
		url: 'services/json/configure/getpatches',
		autoLoad: true,
        root: "patches",
        fields: ['name', 'description'],
        remoteSort: false,
        sortInfo : {
	      field : 'name',
	      direction : "ASC"
	  	}
	});
	
	this.patchesGrid = new Ext.grid.GridPanel ({
		store: this.store,
		frame: true,
		layout: 'fit',
		stripeRows: true,
		viewConfig: { forceFit:true },
		columns: [
		     {header: tr.name, dataIndex: 'name', width: 100, fixed: true},
		     {header: tr.description, dataIndex: 'description'}
		]
	});
	
	this.applyButton = new CMDBuild.buttons.ApplyButton({
		handler: function() {
			var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:CMDBuild.Translation.common.wait_title});
			loadMask.show();
			CMDBuild.Ajax.request({
	    		method: 'POST',
	    		url : 'services/json/configure/applypatches',
	    		timeout: 600000,
				waitTitle : CMDBuild.Translation.common.wait_title,
				waitMsg : CMDBuild.Translation.common.wait_msg,
				scope: this,
				important: true,
				success: function() {	    		
					window.location = 'management.jsp';
	    		},
	    		failure: function() {
	    			this.store.load();
	    			loadMask.hide();
	    		}
			});
		},
		scope: this
	});
	
	this.viewport = new Ext.Viewport({		
		layout: 'border',
		items: [{
            border: false,
            region:'north',
            height: 55,
            contentEl: 'header'
        },{
			region: 'center',			
			layout: 'fit',
			frame: true,
			title: CMDBuild.Translation.patch.patch_list,
			items: [this.patchesGrid],
			buttonAlign: 'center',
			buttons: [this.applyButton]
		},{
			border: false,
            region:'south',
            contentEl: 'footer'
		}]	
	});
});
