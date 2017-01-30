(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.versions.VersionsView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Versions}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.versions.GridPanel}
		 */
		grid: undefined,

		closeAction: 'hide',
		dimensionsMode: 'percentage',
		layout: 'fit',
		overflowY: 'auto',
		title: CMDBuild.Translation.attachmentVersions,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.grid = Ext.create('CMDBuild.view.common.panel.module.attachment.versions.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
