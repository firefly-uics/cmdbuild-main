/**
 * @class CMDBuild.WidgetBuilders.TimeStampAttribute
 * @extends CMDBuild.WidgetBuilders.DateAttribute
 */
Ext.ns("CMDBuild.WidgetBuilders"); 
CMDBuild.WidgetBuilders.DateTimeAttribute = function() {
	this.format = 'd/m/y H:i:s';
	this.fieldWidth = 200;
	this.headerWidth = 100;
};
CMDBuild.extend(CMDBuild.WidgetBuilders.DateTimeAttribute, CMDBuild.WidgetBuilders.DateAttribute);