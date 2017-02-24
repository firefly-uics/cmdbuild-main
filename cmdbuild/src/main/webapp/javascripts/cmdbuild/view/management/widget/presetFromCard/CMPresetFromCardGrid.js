(function() {

	Ext.define("CMDBuild.view.management.widget.presetFromCard.CMPresetFromCardGrid", {
		extend: "CMDBuild.view.management.common.CMCardGrid",

		cmAdvancedFilter: false,
		cmAddPrintButton: false,
		cmAddGraphColumn: false,

		selType: "checkboxmodel",
		selModel: {
			mode: "SINGLE"
		},

		// override
		buildExtraColumns: function() {
			return [{
				header: '&nbsp',
				width: 30,
				tdCls: "grid-button",
				fixed: true,
				sortable: false,
				align: 'center',
				dataIndex: 'Id',
				menuDisabled: true,
				hideable: false,
				renderer: function() {
					return '<img style="cursor:pointer" class="action-card-show" src="images/icons/zoom.png"/>';
				}
			}]
		}
	});

})();
