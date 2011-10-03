(function() {

	Ext.define("CMDBuild.controller.management.report.CMModReportController", {
		extend: "CMDBuild.controller.CMBasePanelController",

		onViewOnFront: function(selection) {
			if (selection) {
				this.view.onReportTypeSelected(selection);

				var r = selection.raw || selection.data;
				if (r && r.objid) {
					// is a node from the menu accordion
					// so ask directly the report
					this.view.requestReport({
						id: r.objid,
						type: "CUSTOM",
						extension: (function extracExtension() {
							return r.subtype.replace(/report/i,"")
						})()
					});
				}
			}
		}
	});

})();