(function() {

	Ext.define('CMDBuild.controller.management.report.Report', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'identifierGet = reportIdentifierGet',
			'onReportModuleInit = onModuleInit',
			'reportSelectedAccordionGet',
			'reportSelectedAccordionIsEmpty'
		],

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {Object}
		 */
		sectionController: undefined,

		/**
		 * @property {CMDBuild.model.management.report.Accordion}
		 *
		 * @private
		 */
		selectedAccordion: undefined,

		/**
		 * @cfg {CMDBuild.view.management.report.ReportView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.report.ReportView', { delegate: this });
		},

		/**
		 * Setup view items and controllers on accordion click
		 *
		 * @param {Object} parameters
		 * @param {CMDBuild.model.management.report.Accordion} parameters.node
		 *
		 * @override
		 */
		onReportModuleInit: function(parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			if (Ext.isObject(parameters.node) && !Ext.Object.isEmpty(parameters.node)) {
				var nodeData = parameters.node.getData();
				nodeData[CMDBuild.core.constants.Proxy.TYPE] = nodeData[CMDBuild.core.constants.Proxy.ENTITY_ID];

				this.reportSelectedAccordionSet({ value: nodeData });

				this.view.removeAll(true);

				switch (this.reportSelectedAccordionGet(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY)[0]) {
					case 'custom':
					default: {
						this.sectionController = Ext.create('CMDBuild.controller.management.report.Custom', { parentDelegate: this });
					}
				}

				this.setViewTitle(parameters.node.get(CMDBuild.core.constants.Proxy.TEXT));

				this.view.add(this.sectionController.getView());

				this.sectionController.cmfg('onReportShow');

				// History record save
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: this.cmfg('reportIdentifierGet'),
					entryType: {
						description: this.reportSelectedAccordionGet(CMDBuild.core.constants.Proxy.DESCRIPTION),
						id: this.reportSelectedAccordionGet(CMDBuild.core.constants.Proxy.ID),
						object: this.reportSelectedAccordionGet()
					}
				});

				this.onModuleInit(parameters); // Custom callParent() implementation
			}
		},

		// SelectedAccordion property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @return {Mixed or undefined}
			 */
			reportSelectedAccordionGet: function(attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAccordion';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @return {Mixed or undefined}
			 */
			reportSelectedAccordionIsEmpty: function(attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAccordion';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @private
			 */
			reportSelectedAccordionSet: function(parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.report.SelectedAccordion';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAccordion';

					this.propertyManageSet(parameters);
				}
			}
	});

})();