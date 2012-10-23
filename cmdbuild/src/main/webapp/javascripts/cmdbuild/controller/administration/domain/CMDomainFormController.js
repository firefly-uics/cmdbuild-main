(function() {
	
	Ext.define("CMDBuild.controller.administration.domain.CMDomainFormController", {
		constructor: function(view) {
			this.view = view;
			this.currentDomain = null;
			
			this.view.saveButton.on("click", onSaveButtonClick, this);
			this.view.deleteButton.on("click", onDeleteButtonClick, this);
			this.view.abortButton.on("click", onAbortButtonClick, this);
		},
		onDomainSelected: function(cmDomain) {
			this.currentDomain = cmDomain;
			this.view.onDomainSelected(cmDomain);
		},
		onAddButtonClick: function() {
			this.currentDomain = null;
			this.view.onAddButtonClick();
		},
		onDomainDeleted: Ext.emptyFn
	});
	
	function onSaveButtonClick() {
		var invalidFields = this.view.getNonValidFields();

		if (invalidFields.length == 0) {
			CMDBuild.LoadMask.get().show();
			var data = this.view.getData();
			if (this.currentDomain == null) {
				data.id = -1;
			} else {
				data.id = this.currentDomain.get("id");
			}

			CMDBuild.ServiceProxy.administration.domain.save({
				params: data,
				scope: this,
				success: function(req, res, decoded) {
					this.view.disableModify();
					_CMCache.onDomainSaved(decoded.domain);
				},
				callback: function() {
					CMDBuild.LoadMask.get().hide();
				}
			});

		} else {
			CMDBuild.Msg.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.invalid_fields, false);
		}
	}
	
	function onAbortButtonClick() {
		if (this.currentDomain != null) {
			this.onDomainSelected(this.currentDomain);
		} else {
			this.view.reset();
			this.view.disableModify();
		}
	}

	function onDeleteButtonClick() {
		Ext.Msg.show({
			title: this.view.translation.delete_domain,
			msg: CMDBuild.Translation.common.confirmpopup.areyousure,
			scope: this,
			buttons: Ext.Msg.YESNO,
			fn: function(button) {
				if (button == "yes") {
					deleteDomain.call(this);
				}
			}
		});
	}
	
	function deleteDomain() {
		if (this.currentDomain == null) {
			// nothing to delete
			return;
		}
		CMDBuild.LoadMask.get().show();
		CMDBuild.ServiceProxy.administration.domain.remove({
			params: {
				id: this.currentDomain.get("id")
			},
			scope : this,
			success : function(form, action) {
				this.view.reset();
				_CMCache.onDomainDeleted(this.currentDomain.get("id"));
			},
			callback : function() {
				CMDBuild.LoadMask.get().hide();
			}
		});
	}
})();