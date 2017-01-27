(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.attachments.versions.VersionsView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.Versions}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.versions.GridPanel}
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
					this.grid = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.versions.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
