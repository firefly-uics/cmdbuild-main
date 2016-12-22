(function () {

	Ext.define('CMDBuild.controller.management.dataView.sql.panel.form.Form', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.form.Form',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.Sql}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewSqlFormReset',
			'dataViewSqlFormUiUpdate',
			'panelGridAndFormPanelFormTabActiveSet = dataViewSqlFormTabActiveSet',
			'panelGridAndFormPanelFormTabSelectionManage = dataViewSqlFormTabSelectionManage'
		],

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.panel.form.tabs.card.Card}
		 */
		controllerTabCard: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.form.FormPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.sql.Sql} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.sql.panel.form.FormPanel', { delegate: this });

			// Shorthands
			this.tabPanel = this.view.tabPanel;

			// View reset
			this.tabPanel.removeAll();

			// Build sub-controllers
			this.controllerTabCard = Ext.create('CMDBuild.controller.management.dataView.sql.panel.form.tabs.card.Card', { parentDelegate: this });

			// View build (sorted)
			this.tabPanel.add([
				Ext.isEmpty(this.controllerTabCard) ? null : this.controllerTabCard.getView(),
				Ext.create('Ext.panel.Panel', {
					title: CMDBuild.Translation.detail,
					border: false,
					disabled: true
				}),
				Ext.create('Ext.panel.Panel', {
					title: CMDBuild.Translation.notes,
					border: false,
					disabled: true
				}),
				Ext.create('Ext.panel.Panel', {
					title: CMDBuild.Translation.relations,
					border: false,
					disabled: true
				}),
				Ext.create('Ext.panel.Panel', {
					title: CMDBuild.Translation.history,
					border: false,
					disabled: true
				}),
				Ext.create('Ext.panel.Panel', {
					title: CMDBuild.Translation.attachments,
					border: false,
					disabled: true
				})
			]);
		},

		/**
		 * @returns {Void}
		 */
		dataViewSqlFormReset: function () {
			// Forward to sub-controllers
			this.controllerTabCard.cmfg('dataViewSqlFormTabCardReset');
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.tabToSelect
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 */
		dataViewSqlFormUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			this.cmfg('dataViewSqlFormReset');

			// Forward to sub-controllers
			this.controllerTabCard.cmfg('dataViewSqlFormTabCardUiUpdate', { viewMode: parameters.viewMode });

			if (!Ext.isEmpty(parameters.tabToSelect))
				return this.cmfg('dataViewSqlFormTabActiveSet', parameters.tabToSelect);

			return this.cmfg('dataViewSqlFormTabSelectionManage');
		}
	});

})();
