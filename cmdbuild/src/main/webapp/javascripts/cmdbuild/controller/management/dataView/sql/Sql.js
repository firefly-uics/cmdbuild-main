(function() {

	Ext.define('CMDBuild.controller.management.dataView.sql.Sql', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.GridAndForm',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.dataView.sql.Sql'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.DataView}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewSqlSelectedCardGet',
			'dataViewSqlSelectedCardIsEmpty',
			'dataViewSqlSelectedCardReset',
			'dataViewSqlSelectedDataSourceGet = panelGridAndFormSelectedEntityGet',
			'dataViewSqlSelectedDataSourceIsEmpty',
			'dataViewSqlUiReset',
			'dataViewSqlUiUpdate',
			'onDataViewSqlAddButtonClick',
			'panelGridAndFormFullScreenUiSetup = dataViewSqlFullScreenUiSetup',
			'panelGridAndFormToolsArrayBuild',
			'panelGridAndFormViewModeEquals = dataViewSqlUiViewModeEquals',
			'panelGridAndFormViewModeGet = dataViewSqlUiViewModeGet',
			'panelGridAndFormViewModeSet = dataViewSqlUiViewModeSet'
		],

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.panel.form.Form}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.panel.grid.Grid}
		 */
		controllerGrid: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.form.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.grid.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.management.dataView.sql.SelectedCard}
		 *
		 * @private
		 */
		selectedCard: undefined,

		/**
		 * @property {CMDBuild.model.management.dataView.sql.DataSource}
		 *
		 * @private
		 */
		selectedDataSource: {},

		/**
		 * @property {CMDBuild.view.management.dataView.sql.SqlView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.DataView} configurationObject.parentDelegate
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.sql.SqlView', { delegate: this });

			// View reset
			this.view.removeAll();
			this.view.removeDocked(this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP));

			// Build sub-controllers
			this.controllerForm = Ext.create('CMDBuild.controller.management.dataView.sql.panel.form.Form', { parentDelegate: this });
			this.controllerGrid = Ext.create('CMDBuild.controller.management.dataView.sql.panel.grid.Grid', { parentDelegate: this });

			// Build view
			this.view.add([
				this.grid = this.controllerGrid.getView(),
				this.form = this.controllerForm.getView()
			]);
		},

		/**
		 * @returns {Void}
		 */
		dataViewSqlUiReset: function () {
			// Forward to sub-controllers
			this.controllerForm.cmfg('dataViewSqlFormReset');
			this.controllerGrid.cmfg('dataViewSqlGridReset');
		},

		/**
		 * Custom implementation because of absence of unique ID in SQL cards
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.enableFilterReset
		 * @param {Number} parameters.page
		 * @param {Number} parameters.position
		 * @param {CMDBuild.model.management.dataView.sql.panel.grid.Record} parameters.record
		 * @param {Object} parameters.scope
		 * @param {Boolean} parameters.sortersReset
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 */
		dataViewSqlUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.record = Ext.isObject(parameters.record) ? parameters.record : null;
			parameters.viewMode = Ext.isString(parameters.viewMode) ? parameters.viewMode : 'read';

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('dataViewSqlUiUpdate(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			this.dataViewSqlSelectedDataSourceReset();
			this.cmfg('dataViewSqlFullScreenUiSetup', { maximize: 'top' });
			this.cmfg('dataViewSqlSelectedCardReset');
			this.cmfg('dataViewSqlUiViewModeSet', parameters.viewMode);

			if (this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.TYPE) == 'sql')
				CMDBuild.proxy.management.dataView.sql.Sql.readAllDataSources({
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA_SOURCES];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							var dataSourceFunction = this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.SOURCE_FUNCTION),
								selectedDataSource = Ext.Array.findBy(decodedResponse, function (dataSourceObject, i) {
									return dataSourceObject[CMDBuild.core.constants.Proxy.NAME] == dataSourceFunction;
								}, this);

							if (Ext.isObject(selectedDataSource) && !Ext.Object.isEmpty(selectedDataSource)) {
								this.dataViewSqlSelectedDataSourceSet({ value: selectedDataSource });

								if (Ext.isObject(parameters.record) && !Ext.Object.isEmpty(parameters.record))
									this.dataViewSqlSelectedCardSet({ value: parameters.record.getData() });

								this.setViewTitle(this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

								// Forward to sub-controllers
								this.controllerForm.cmfg('dataViewSqlFormUiUpdate', { tabToSelect: parameters.tabToSelect });
								this.controllerGrid.cmfg('dataViewSqlGridUiUpdate', {
									enableFilterReset: parameters.enableFilterReset,
									page: parameters.page,
									position: parameters.position,
									sortersReset: parameters.sortersReset,
									scope: parameters.scope,
									callback: parameters.callback
								});
							} else {
								_error('dataViewSqlUiUpdate(): dataSource not found', this, dataSourceFunction);
							}
						} else {
							_error('dataViewSqlUiUpdate(): unmanaged response', this, decodedResponse);
						}
					}
				});
		},

		// SelectedDataSource property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewSqlSelectedDataSourceGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDataSource';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			dataViewSqlSelectedDataSourceIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDataSource';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSqlSelectedDataSourceReset: function () {
				this.propertyManageReset('selectedDataSource');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSqlSelectedDataSourceSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.sql.DataSource';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDataSource';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 */
		onDataViewSqlAddButtonClick: function (id) {
			this.cmfg('dataViewSqlSelectedCardReset');
			this.cmfg('dataViewSqlFullScreenUiSetup', { maximize: 'bottom' });

			// Forward to sub-controllers
			this.controllerForm.cmfg('onDataViewFilterSqlAddButtonClick', id);
			this.controllerGrid.cmfg('onDataViewFilterSqlAddButtonClick', id);
		},

		// SelectedCard property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewSqlSelectedCardGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			dataViewSqlSelectedCardIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			dataViewSqlSelectedCardReset: function (parameters) {
				this.propertyManageReset('selectedCard');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSqlSelectedCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.sql.SelectedCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';

					this.propertyManageSet(parameters);
				}
			}
	});

})();
