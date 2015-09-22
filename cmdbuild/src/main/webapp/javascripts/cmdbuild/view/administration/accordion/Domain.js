(function() {

	Ext.define('CMDBuild.view.administration.accordion.Domain', {
		extend: 'CMDBuild.view.common.CMBaseAccordion',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.accordion.Domain}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		cmName: undefined,

		title: CMDBuild.Translation.domains,

		/**
		 * @return {Array} out
		 */
		buildTreeStructure: function() {
			var out = [];

			Ext.Object.each(_CMCache.getDomains(), function(id, domain, myself) {
				out.push({
					id: domain.get(CMDBuild.core.constants.Proxy.ID),
					text: domain.get(CMDBuild.core.constants.Proxy.DESCRIPTION),
					leaf: true,
					cmName: this.cmName,
					iconCls: 'domain'
				});
			}, this);

			return out;
		}
	});

})();