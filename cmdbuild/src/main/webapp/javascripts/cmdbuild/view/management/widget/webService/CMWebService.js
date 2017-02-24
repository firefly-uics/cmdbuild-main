(function() {

	var MAGNIFY_CLASS = "action-all-info";
	var CALLBACK_MAPPING = {};
	CALLBACK_MAPPING[MAGNIFY_CLASS] = "onWebServiceWidgetShowAllInfoButtonClick";

	Ext.define("CMDBuild.view.management.widget.webService.CMWebService", {
		extend: "Ext.panel.Panel",

		mixins: {
			delegable: "CMDBuild.core.CMDelegable"
		},

		constructor: function() {
			this.mixins.delegable.constructor.call(this,
				"CMDBuild.view.management.widget.webService.CMWebServiceDelegate");
			this.callParent(arguments);
		},

		initComponent: function() {
			this.frame = false;
			this.border = false;
			this.layout = "border";
			this.autoScroll = true;
			this.callParent(arguments);
		},

		getSelectedRecords: function() {
			var selection = [];
			// if the widget is never opened
			// the grid is not configured
			if (this.grid) {
				selection = this.grid.getSelectionModel().getSelection();
			}

			return selection;
		},

		configureGrid: function(store, columns, selectionModel) {
			this.grid = Ext.create('CMDBuild.view.management.widget.webService.CMWebServiceGrid', {
				region: "center",
				border: false,
				columns: addMagnifyButtonColumn(columns),
				selModel: selectionModel,
				store: store
			});


			this.add(this.grid);

			this.mon(this.grid, 'beforeitemclick', function(grid, model, htmlelement, rowIndex, event, opt) {
				var className = event.target.className;
				if (typeof CALLBACK_MAPPING[className] == "string") {
					this.callDelegates(CALLBACK_MAPPING[className], [this, model]);
				}
			}, this);
		}
	});

	function addMagnifyButtonColumn(columns) {
		columns.push({
			width: 30,
			sortable: false,
			align: "center",
			hideable: false,
			renderer: function (value, metadata, record) {
				return '<img style="cursor:pointer"'
				+'" class="' + MAGNIFY_CLASS + '" src="images/icons/zoom.png"/>';
			}
		});

		return columns;
	}

})();
