(function() {

	Ext.ns("CMDBuild.administration.domain");
	/**
	 * @class CMDBuild.administration.domain.CMDomainAccordion
	 * @extend CMDBuild.TreePanel
	 * 
	 * Define the accordion that contains the tree of the CMDomain
	 */
	CMDBuild.administration.domain.CMDomainAccordion = Ext.extend(CMDBuild.TreePanel, {
		title : "@@Domain",
		initComponent : function() {
			var tr = CMDBuild.Translation.common.tree_names;
			this.rootVisible = false;
			this.border = false;
			this.fakeNodeEventName = "domain";
			this.root = CMDBuild.core.tree.CMDomainTree(CMDomainModelLibrary);
			CMDBuild.administration.domain.CMDomainAccordion.superclass.initComponent.apply(this, arguments);
		}
	});

	/**
	 * @class CMDBuild.CMDomainAccordionController
	 * @extend CMDBuild.TreePanelController
	 * 
	 * Controller of CMDBuild.administration.domain.CMDomainAccordion
	 * It must be move in the CMDBuild.administration.domain package
	 */
	CMDBuild.CMDomainAccordionController = Ext.extend(CMDBuild.TreePanelController, {
		silentListener : true,
		initComponent : function() {
			CMDBuild.CMDomainAccordionController.superclass.initComponent.apply(this, arguments);
		},
		onSelectNode : function(node) {
			if (node) {
				var cmDomain = node.getCMModel();
				if (cmDomain.NAME == CMDBuild.core.model.CMDomainModel.NAME) {
					this.publish("cmdb-select-domain", cmDomain);
				}
			}
		}
	});
})();