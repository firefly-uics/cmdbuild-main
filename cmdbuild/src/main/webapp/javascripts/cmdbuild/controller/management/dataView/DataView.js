(function () {

	Ext.define('CMDBuild.controller.management.dataView.DataView', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.dataView.DataView'
		],

		mixins: ['CMDBuild.controller.management.dataView.ExternalServices'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewPreviousCardReset -> controllerFilter', // Previous card can't be managed in Sql views
			'dataViewSelectedDataViewGet',
			'dataViewSelectedDataViewIsEmpty',
			'dataViewUiUpdate',
			'identifierGet = dataViewIdentifierGet',
			'onDataViewExternalServicesNavigationChronologyRecordSelect', // From mixins
			'onDataViewModuleInit = onModuleInit'
		],

		/**
		 * @property {CMDBuild.controller.management.dataView.filter.Filter}
		 */
		controllerFilter: undefined,

		/**
		 * @property {CMDBuild.controller.management.dataView.sql.Sql}
		 */
		controllerSql: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.model.management.dataView.DataView}
		 *
		 * @private
		 */
		selectedDataView: undefined,

		/**
		 * @cfg {CMDBuild.view.management.dataView.DataViewView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.MainViewport} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.DataViewView', { delegate: this });

			// Build sub-controllers
			this.controllerFilter = Ext.create('CMDBuild.controller.management.dataView.filter.Filter', { parentDelegate: this });
			this.controllerSql = Ext.create('CMDBuild.controller.management.dataView.sql.Sql', { parentDelegate: this });

			// View build
			this.view.add([
				this.controllerFilter.getView(),
				this.controllerSql.getView()
			]);
		},

		// SelectedDataView property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			dataViewSelectedDataViewGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDataView';

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			dataViewSelectedDataViewIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDataView';

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSelectedDataViewReset: function () {
				return this.propertyManageReset('selectedDataView');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewSelectedDataViewSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.dataView.DataView';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDataView';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.disableForward
		 * @param {CMDBuild.model.common.Accordion} parameters.node
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onDataViewModuleInit: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.disableForward = Ext.isBoolean(parameters.disableForward) ? parameters.disableForward : false;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (Ext.isObject(parameters.node) && !Ext.Object.isEmpty(parameters.node)) {
				// Error handling
					if (!Ext.isNumber(parameters.node.get(CMDBuild.core.constants.Proxy.ENTITY_ID)) || Ext.isEmpty(parameters.node.get(CMDBuild.core.constants.Proxy.ENTITY_ID)))
						return _error('onDataViewModuleInit(): unmanaged node entityId property', this, parameters.node.get(CMDBuild.core.constants.Proxy.ENTITY_ID));
				// END: Error handling

				this.cmfg('dataViewPreviousCardReset');
				this.cmfg('dataViewUiUpdate', { entityId: parameters.node.get(CMDBuild.core.constants.Proxy.ENTITY_ID) });
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.cardId
		 * @param {Number} parameters.entityId
		 * @param {Object} parameters.scope
		 * @param {Object} parameters.tabToSelect
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 */
		dataViewUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.cardId = Ext.isNumber(parameters.cardId) ? parameters.cardId : null;
			parameters.entityId = Ext.isNumber(parameters.entityId) ? parameters.entityId : null;

			// Error handling
				if (Ext.isEmpty(parameters.entityId))
					return _error('dataViewUiUpdate(): unmanaged entityId parameter', this, parameters.entityId);
			// END: Error handling

			this.dataViewSelectedDataViewReset();

			CMDBuild.proxy.management.dataView.DataView.readAll({
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.VIEWS];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						var viewObject = Ext.Array.findBy(decodedResponse, function (view, index) {
								return view[CMDBuild.core.constants.Proxy.ID] == parameters.entityId;
							}, this);

						if (Ext.isObject(viewObject) && !Ext.Object.isEmpty(viewObject)) {
							this.dataViewSelectedDataViewSet({ value: viewObject });

							this.setActivePanel();

							// Forward to sub-controllers
							this.controllerFilter.cmfg('dataViewFilterUiUpdate', {
								cardId: parameters.cardId,
								enableFilterReset: true,
								resetSorters: true,
								tabToSelect: parameters.tabToSelect,
								viewMode: parameters.viewMode,
								scope: parameters.scope,
								callback: parameters.callback
							});
							this.controllerSql.cmfg('dataViewSqlUiUpdate', {
								enableFilterReset: true,
								resetSorters: true,
								viewMode: parameters.viewMode,
								scope: parameters.scope,
								callback: parameters.callback
							});

							// History record save
							CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
								moduleId: this.cmfg('dataViewIdentifierGet'),
								entryType: {
									description: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.TEXT),
									id: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
									object: this.cmfg('dataViewSelectedDataViewGet')
								}
							});
						} else {
							_error('onDataViewModuleInit(): dataView not found', this, dataViewId);
						}
					} else {
						_error('onDataViewModuleInit(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		setActivePanel: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('setActivePanel(): unmanaged dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));
			// END: Error handling

			switch (this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.TYPE)) {
				case 'filter':
					return this.view.getLayout().setActiveItem(this.controllerFilter.getView());

				case 'sql':
					return this.view.getLayout().setActiveItem(this.controllerSql.getView());

				default:
					return _error(
						'setActivePanel(): unmanaged dataView type property',
						this,
						this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.TYPE)
					);
			}
		}
	});

})();
