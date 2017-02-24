(function() {

	Ext.define("CMDBuild.view.management.widget.webService.CMXMLWindow", {
		extend: "CMDBuild.core.window.AbstractModal",

		// configuration
		xmlNode: null,
		// configuration

		dimensionsMode: 'percentage',

		initComponent: function() {
			var me = this;

			if (this.xmlNode != null) {
				this.title = this.xmlNode.nodeName;
				this.items = [buildForm(me)];
			}

			this.buttonAlign = "center",
			this.buttons = [{
				text: CMDBuild.Translation.close,
				handler: function() {
					me.destroy();
				}
			}];

			this.bodyStyle = {
				padding: "5px"
			};

			this.callParent(arguments);
		}
	});

	function buildForm(me) {
		var xmlUtility = CMDBuild.view.management.widget.webService.XMLUtility;
		var children = me.xmlNode.childNodes;
		var fields = [];

		for (var i=0, l=children.length; i<l; ++i) {
			var child = children[i];
			var text = xmlUtility.getNodeText(child);
			var label = child.nodeName;

			fields.push({
				xtype: 'displayfield',
				fieldLabel: label,
				labelAlign: "right",
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				width: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
		        value: text
			});
		}

		return {
			boder: true,
			frame: true,
			items: fields
		};
	}

})();
