(function () {

	Ext.define('CMDBuild.core.buttons.icon.add.Card', {
		extend: 'CMDBuild.core.buttons.Abstract',

		iconCls: 'add',
		textDefault: CMDBuild.Translation.addCard,

		/**
		 * Enable only if is not superclass or if is superclass not empty
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		enable: function () {
			if (this.isEnableActionEnabled())
				this.callParent(arguments);
		},

		/**
		 * Default implementation
		 *
		 * @returns {Boolean}
		 *
		 * @abstract
		 */
		isEnableActionEnabled: function () {
			return true;
		}
	});

})();
