(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel', {
		extend: 'Ext.form.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.form.Form}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		border: false,
		cls: 'cmdb-border-top',
		frame: false,
		height: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.CARD_FORM_RATIO) + '%',
		layout: 'fit',
		region: 'south',
		split: true,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.tabPanel = Ext.create('Ext.tab.Panel', {
						border: false,
						frame: false,

						showWidget: function () { // FIXME: used from widgetManager class (remove on widget manager refactor)
							return false;
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
