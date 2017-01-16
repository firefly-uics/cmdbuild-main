(function () {

	Ext.define('CMDBuild.view.common.field.display.Reference', {
		extend: 'Ext.form.field.Display',

		/**
		 * @property {CMDBuild.controller.common.field.display.Reference}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		targetClassName: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				delegate: Ext.create('CMDBuild.controller.common.field.display.Reference', { view: this })
			});

			this.callParent(arguments);
		},

		/**
		 * @param {String or Object} value
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		setValue: function (value) {
			this.callParent([this.delegate.cmfg('fieldDisplayReferenceDecodeValue', value)]);
		}
	});

})();
