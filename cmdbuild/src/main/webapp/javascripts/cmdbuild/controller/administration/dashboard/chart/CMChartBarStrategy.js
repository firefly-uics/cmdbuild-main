(function() {
	Ext.define("CMDBuild.controller.administration.dashboard.charts.CMChartBarStrategy", {
		extend: "CMDBuild.controller.administration.dashboard.charts.CMChartTypeStrategy",

		constructor: function(form) {
			this.form = form;
		},

		interestedFields: [
			"legend",
			"categoryAxisField",
			"categoryAxisLabel",
			"valueAxisFields",
			"valueAxisLabel",
			"chartOrientation"
		],

		// override
		fillFieldsForChart: function(chart) {
			this.form.fillFieldsWith({
				legend: chart.withLegend(),
				categoryAxisField: chart.getCategoryAxisField(),
				categoryAxisLabel: chart.getCategoryAxisLabel(),
				valueAxisFields: chart.getValueAxisFields(),
				valueAxisLabel: chart.getValueAxisLabel(),
				chartOrientation: chart.getChartOrientation()
			});
		},

		// override
		updateDataSourceDependantFields: function(dsName) {
			this.form.setCategoryAxesAvailableData(this.getAvailableDsOutputFields());
			this.form.setValueAxesAvailableData(this.getAvailableDsOutputFields(["integer"]));
		},

		// override
		showChartFields: function() {
			this.callParent(arguments);
			this.form.showAxesFieldSets();
		}
	});

})();