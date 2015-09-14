(function() {

	Ext.define('CMDBuild.view.administration.accordion.Menu', {
		extend: 'CMDBuild.view.common.accordion.Abstract',

		requires: [
			'CMDBuild.core.proxy.Constants',
			'CMDBuild.model.common.AccordionStore'
		],

		title: CMDBuild.Translation.menu,

		/**
		 * @param {Ext.panel.Panel} panel
		 * @param {Boolean} animate
		 * @param {Object} eOpts
		 *
		 * @override
		 */
		beforeExpand: function(panel, animate, eOpts) {
			CMDBuild.ServiceProxy.group.read({
				loadMask: true,
				scope: this,
				success: function(response, options, decodedResponse) {
					Ext.suspendLayouts();

					CMDBuild.core.Utils.objectArraySort(decodedResponse.groups, CMDBuild.core.proxy.Constants.TEXT);

					var out = [{
						cmName: 'menu',
						iconCls: 'cmdbuild-tree-group-icon',
						id: 0,
						leaf: true,
						text: '*Default*'
					}];

					Ext.Object.each(decodedResponse.groups, function(key, group, myself) {
						out.push({
							cmName: 'menu',
							iconCls: 'cmdbuild-tree-group-icon',
							id: group[CMDBuild.core.proxy.Constants.ID],
							leaf: true,
							name: group[CMDBuild.core.proxy.Constants.NAME],
							text: group[CMDBuild.core.proxy.Constants.TEXT]
						});
					}, this);

					this.getStore().getRootNode().removeAll();
					this.getStore().getRootNode().appendChild(out);

					Ext.resumeLayouts(true);

					this.deferExpand();
				}
			});

			return this.callParent(arguments);
		}
	});

})();