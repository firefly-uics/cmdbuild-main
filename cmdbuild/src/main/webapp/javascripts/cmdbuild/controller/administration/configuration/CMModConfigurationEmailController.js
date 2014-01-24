(function() {

	var tr = CMDBuild.Translation.administration.setup; // Path to translation

	Ext.define("CMDBuild.controller.administration.configuration.CMModConfigurationEmailController", {
		extend: "CMDBuild.controller.CMBasePanelController",

		constructor: function(view) {
			this.callParent(arguments);

			// Handlers exchange
			this.grid = this.view.emailGrid;
			this.form = this.view.emailForm;
			this.view.delegate = this;
			this.grid.delegate = this;
			this.form.delegate = this;

			this.selectedId = null;
			this.selectionModel = this.grid.getSelectionModel();
		},

		/**
		 * @param {String} name
		 * @param {Object} param
		 * @param {Function} callback
		 * Gatherer function to catch events
		 */
		cmOn: function(name, param, callBack) {
			switch (name) {
				case 'onAbortButtonClick':
					return this.onAbortButtonClick();
				case 'onAddButtonClick':
					return this.onAddButtonClick();
				case 'onModifyButtonClick':
					return this.onModifyButtonClick();
				case 'onRemoveButtonClick':
					return this.onRemoveButtonClick();
				case 'onRowSelected':
					return this.onRowSelected(param.record);
				case 'onSaveButtonClick':
					return this.onSaveButtonClick();
				default: {
					if (
						this.parentDelegate
						&& typeof this.parentDelegate === 'object'
					) {
						return this.parentDelegate.cmOn(name, param, callBack);
					}
				}
			}
		},

		onAbortButtonClick: function() {
			if (this.selectedId != null) {
				this.onRowSelected();
			} else {
				this.form.reset();
				this.form.disableModify();
			}
		},

		onAddButtonClick: function() {
			this.selectionModel.deselectAll();
			this.selectedId = null;
			this.form.reset();
			this.form.enableModify(true);
		},

		onModifyButtonClick: function() {
			this.form.disableCMTbar();
			this.form.enableCMButtons();
			this.form.enableModify(true);
		},

		onRemoveButtonClick: function() {
			Ext.Msg.show({
				title: tr.remove,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				scope: this,
				buttons: Ext.Msg.YESNO,
				fn: function(button) {
					if (button == 'yes') {
						this.removeEmailAccount();
					}
				}
			});
		},

		onRowSelected: function() {
			if (this.selectionModel.hasSelection()) {
				var me = this;
				this.selectedId = this.selectionModel.getSelection()[0].get('id');

				// Selected user asynchronous store query
				this.selectedDataStore = CMDBuild.ServiceProxy.configuration.email.get(this.selectedId);
				this.selectedDataStore.load();
				this.selectedDataStore.on("load", function() {
					me.form.loadRecord(this.getAt(0));
				});

				this.form.disableModify(true);
			}
		},

		onSaveButtonClick: function() {
			var nonvalid = this.form.getNonValidFields();
			if (nonvalid.length > 0) {
				CMDBuild.Msg.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.invalid_fields, false);
				return;
			}

			var formData = this.form.getValues();
			if (formData.id == null || formData.id == '') {
				CMDBuild.ServiceProxy.configuration.email.createEmailAccount({
					params: formData,
					scope: this,
					success: this.success,
					callback: this.callback
				});
			} else {
				CMDBuild.ServiceProxy.configuration.email.updateEmailAccount({
					params: formData,
					scope: this,
					success: this.success,
					callback: this.callback
				});
			}
		},

		removeEmailAccount: function() {
			if (this.selectedId == null) {
				// Nothing to remove
				return;
			}

			var me = this;

			CMDBuild.ServiceProxy.configuration.email.removeEmailAccount({
				params: this.selectedId,
				scope: this,
				success: function() {
					me.form.reset();
					me.form.disableModify();
				},
				callback: this.callback()
			});
		},

		success: function(result, options, decodedResult) {
			var me = this;
			var savedId = decodedResult.response.elements[0].id;
			var store = this.grid.store;
			store.load();
			store.on('load', function() {
				me.form.loadRecord(this.getAt(0));
				var rowIndex = this.find('id', savedId);
				me.selectionModel.select(rowIndex);
			});

			this.form.disableModify();
		},

		callback: function() {
			CMDBuild.LoadMask.get().hide();
		}
	});

})();