(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.synchronous.Step2', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.synchronous.Synchronous}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerFormTaskEventSynchronousStep2EntryTypeSelected'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.event.synchronous.Step2View}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.event.synchronous.Synchronous} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.event.synchronous.Step2View', { delegate: this });
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {String} parameters.className
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		onTaskManagerFormTaskEventSynchronousStep2EntryTypeSelected: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.className = Ext.isString(parameters.className) ? parameters.className
				: this.cmfg('taskManagerFormViewGet').panelFunctionValueGet({ propertyName: CMDBuild.core.constants.Proxy.CLASS_NAME });
			parameters.disabledPanels = ['functions'];

			this.view.fieldFilter.configure(parameters);
		}
	});

})();
