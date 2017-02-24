(function() {

	Ext.define("CMDBuild.view.management.widget.presetFromCard.CMPresetFromCard", {
		extend: "Ext.panel.Panel",

		mixins: {
			delegable: "CMDBuild.core.CMDelegable"
		},

		constructor: function() {
			this.mixins.delegable.constructor.call( //
				this, //
				"CMDBuild.view.management.widget.presetFromCard.CMPresetFromCardDelegate" //
				);

			this.callParent(arguments);
		},

		initComponent: function() {
			this.grid = Ext.create('CMDBuild.view.management.widget.presetFromCard.CMPresetFromCardGrid', {
				autoScroll : true,
				hideMode: "offsets",
				region: "center",
				border: false
			});

			this.frame = false;
			this.border = false;
			this.layout = "border";
			this.items = [this.grid];

			this.callParent(arguments);
		},

		updateGrid: function(classId, cqlParams) {
			this.grid.CQL = cqlParams;
			this.grid.store.proxy.extraParams = this.grid.getStoreExtraParams();
			this.grid.updateStoreForClassId(classId);
		},

		getSelection: function() {
			var selection = null;
			var sm = this.grid.getSelectionModel();
			if (sm) {
				selections = sm.getSelection();
				if (selections.length > 0) {
					selection = selections[0];
				}
			}

			return selection;
		},

		// buttons that the owner panel add to itself
		getExtraButtons: function() {
			var me = this;
			return [ //
				new Ext.Button({
					text: CMDBuild.Translation.ok,
					name: 'saveButton',
					handler: function() {
						me.callDelegates("onPresetFromCardSaveButtonClick", [me]);
					}
				})
			];
		}
	});

})();
