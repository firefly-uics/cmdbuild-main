/**
 * @class CMDBuild.WidgetBuilders.DecimalAttribute
 * @extends CMDBuild.WidgetBuilders.RangeQueryAttribute
 */
CMDBuild.WidgetBuilders.DecimalAttribute = function() {};
CMDBuild.extend(CMDBuild.WidgetBuilders.DecimalAttribute, CMDBuild.WidgetBuilders.RangeQueryAttribute);
CMDBuild.WidgetBuilders.DecimalAttribute.prototype.MAXWIDTH = 80;
CMDBuild.WidgetBuilders.DecimalAttribute.prototype.customVType = "numeric";
CMDBuild.WidgetBuilders.DecimalAttribute.prototype.gridRenderer = function(v) {
	return "<div class=\"numeric_column\">" + v + "<div>";
};
/**
 * @override
 * @param attribute
 * @return object
 */
CMDBuild.WidgetBuilders.DecimalAttribute.prototype.buildGridHeader = function(attribute) {
	return {
		header: attribute.description,
		sortable : true,
		dataIndex : attribute.name,
		hidden: !attribute.isbasedsp,
		fixed: false,
		width: this.MAXWIDTH,
		renderer: this.gridRenderer
	};
};
/**
 * @override
 * @param attribute
 * @return Ext.form.TextField
 */
CMDBuild.WidgetBuilders.DecimalAttribute.prototype.buildAttributeField = function(attribute) {
	return new Ext.form.TextField({
		fieldLabel: attribute.description,
		name: attribute.name,
		allowBlank: !attribute.isnotnull,
		width: this.MAXWIDTH,
		scale: attribute.scale,
		precision: attribute.precision,
		vtype: this.customVType,
		CMAttribute: attribute
	});
};