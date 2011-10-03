(function() {
	
	Ext.define("CMDBuild.controller.administration.group.CMGroupFormController", {
		constructor: function(view) {
			this.view = view;
			this.currentGroup = null;
			
			this.view.saveButton.on("click", onSaveButtonClick, this);
			this.view.abortButton.on("click", onAbortButtonClick, this);
			this.view.enableGroupButton.on("click", onEnableGroupButtonClick, this);
			this.view.modifyButton.on("click", onModifyButtonClick, this);
		},

		onGroupSelected: function(g) {
			this.currentGroup = g;
			if (g == null) {
				this.view.disableModify(enableTBar = false);
				this.view.reset();
			} else {
				this.view.loadGroup(g);
				this.view.disableModify(enableTBar = true);
			}
		},
		
		onAddGroupButtonClick: function() {
			this.currentGroup = null;
			this.view.reset();
			this.view.enableModify(all = true);
		}
	});
	
	function onSaveButtonClick() {
		var nonValid = this.view.getNonValidFields();
		if (nonValid.length == 0) {
			CMDBuild.ServiceProxy.group.save({
				scope : this,
				params : buildParamsForSave.call(this),
				success : function(r) {
					var g = Ext.JSON.decode(r.responseText).group;
					_CMCache.onGroupSaved(g);
				},
				failure : onAbortButtonClick
			});
		} else {
			CMDBuild.Msg.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.invalid_fields, false);
		}
	}

	function onAbortButtonClick() {
		if (this.currentGroup != null) { 
			this.view.loadGroup(this.currentGroup);
		} else {
			this.view.reset();
		}
		this.view.disableModify();
	}

	function onEnableGroupButtonClick() {
		CMDBuild.Ajax.request({
			url : 'services/json/schema/modsecurity/enabledisablegroup',
			params : {
				groupId : this.currentGroup.get("id"),
				isActive : !this.currentGroup.get("isActive")
			},
			waitMsg : CMDBuild.Translation.common.wait_title,
			method : 'POST',
			scope : this,
			success : function(response, options, decoded) {
				var g = decoded.group;
				_CMCache.onGroupSaved(g);
			}
		});
	}

	function onModifyButtonClick() {
		this.view.enableModify();
	}

	function buildParamsForSave() {
		var modules = this.view.modulesCheckInput.toArray;
		var disabledModules = (function() {
			var out = [];
			for ( var i = 0, len = modules.length; i < len; ++i) {
				var module = modules[i];
				if (module.checked) {
					out.push(module.module);
				}
			}
			return out;
		})();
	
		var params = this.view.getData();
		if (this.currentGroup == null) {
			params.id = -1;
		} else {
			params.id = this.currentGroup.get("id");
		}

		if (disabledModules.length > 0) {
			params.disabledModules = disabledModules
		}
	
		return params;
	}
})();