(function () {

	/**
	 * @deprecated CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.SaveDialogWindow
	 */
	Ext.define('CMDBuild.view.common.filter.advanced.saveDialog.SaveDialogWindow', {
		extend: 'CMDBuild.core.window.AbstractModal',

		/**
		 * @cfg {CMDBuild.controller.common.filter.advanced.SaveDialog}
		 */
		delegate: undefined,

		/**
		 * @cfg {Object}
		 */
		dimensions: {
			width: 650
		},

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'absolute',

		/**
		 * @property {CMDBuild.view.common.filter.advanced.saveDialog.FormPanel}
		 */
		form: undefined,

		border: true,
		closeAction: 'hide',
		frame: true,
		title: CMDBuild.Translation.filterParameters,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.form = Ext.create('CMDBuild.view.common.filter.advanced.saveDialog.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
