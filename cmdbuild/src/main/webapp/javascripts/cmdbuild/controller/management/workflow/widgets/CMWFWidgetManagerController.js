(function() {
	Ext.define("CMDBuild.controller.management.workflow.CMWidgetManager", {
		extend: "CMDBuild.controller.management.common.CMBaseWidgetMananager",

//		// override
//		buildWidgetController: function buildWidgetController(ui, widgetDef, card) {
//			var me = this,
//				controllerPKG = CMDBuild.controller.management.workflow.widgets,
//				builders = {
//					createModifyCard: function(ui) {
//						var widgetControllerManager = new CMDBuild.controller.management.classes.CMWidgetManager(ui.getWidgetManager());
//						var widgetReader = new CMDBuild.controller.management.workflow.widgets.CMCreateModifyCardWidgetReader();
//
//						return new CMDBuild.controller.management.common.widgets.CMCreateModifyCardController(
//							ui,
//							me,
//							widgetDef,
//							me.view.getFormForTemplateResolver(),
//							card,
//							widgetReader,
//							widgetControllerManager
//						);
//					},
//					createReport: function(ui, superController, widgetDef, card) {
//						return new CMDBuild.controller.management.common.widgets.CMOpenReportController(
//							ui,
//							superController,
//							widgetDef,
//							me.view.getFormForTemplateResolver(),
//							new CMDBuild.controller.management.common.widgets.CMWFOpenReportControllerWidgetReader(),
//							card
//						);
//						
//					},
//					linkCards: function(ui) {
//						return new controllerPKG.CMLinkCardsController(ui, me, widgetDef);
//					},
//					manageEmail: function(ui) {
//						return new controllerPKG.CMManageEmailController(ui, me, widgetDef);
//					},
//					manageRelation: function(ui) {
//						return new controllerPKG.CMManageRelationController(ui, me, widgetDef);
//					},
//					openNote: function(ui) {
//						return new controllerPKG.CMOpenNoteController(ui, me, widgetDef, card);
//					},
//					openAttachment: function(ui) {
//						return new controllerPKG.CMAttachmentController(ui, me, widgetDef, card);
//					},
//					calendar: function(ui, me, widgetDef,card) {
//						return new CMDBuild.controller.management.common.widgets.CMCalendarController(
//							ui,
//							me,
//							widgetDef,
//							me.view.getFormForTemplateResolver(),
//							new CMDBuild.controller.management.workflow.widgets.CMCalendarControllerWidgetReader(),
//							card
//						);
//					}
//				};
//
//			return builders[widgetDef.extattrtype](ui, me, widgetDef, card);
//		},

		// for the back button is openAttachment and openNote
		showActivityPanel: function() {
			this.view.showActivityPanel();
		}
	});
})();
