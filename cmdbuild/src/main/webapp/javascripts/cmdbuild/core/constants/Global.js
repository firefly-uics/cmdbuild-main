(function () {

	Ext.define('CMDBuild.core.constants.Global', {

		singleton: true,

		/**
		 * @cfg {Object}
		 *
		 * @private
		 */
		config: {
			errorMsgCss: 'cmdb-error-msg',
			mandatoryLabelFlag: '* ',
			rootNameClasses: 'Class',
			rootNameWorkflows: 'Activity',
			tableTypeClass: 'class',
			tableTypeSimpleTable: 'simpletable',
			tableTypeStandardTable: 'standard',
			tableTypeWorkflow: 'processclass',
			titleSeparator: ' - '
		},

		/**
		 * @param {Object} config
		 *
		 * @returns {Void}
		 */
		constructor: function (config) {
			this.initConfig(config);
		}
	});

})();
