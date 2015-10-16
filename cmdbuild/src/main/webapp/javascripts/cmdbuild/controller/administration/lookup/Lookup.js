(function() {

	Ext.define('CMDBuild.controller.administration.lookup.Lookup', {
		extend: 'CMDBuild.controller.common.AbstractBasePanelController',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.proxy.lookup.Type',
			'CMDBuild.model.lookup.Type'
		],

		/**
		 * @property {CMDBuild.controller.administration.lookup.List}
		 */
		controllerList: undefined,

		/**
		 * @property {CMDBuild.controller.administration.lookup.Properties}
		 */
		controllerProperties: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'controllerPropertyGet',
			'lookupSelectedLookupTypeGet',
			'lookupSelectedLookupTypeIsEmpty',
			'onLookupAddButtonClick',
			'onLookupSelected -> controllerProperties, controllerList'
		],

		/**
		 * @property {CMDBuild.model.lookup.Type} or null
		 *
		 * @private
		 */
		selectedLookupType: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.lookup.LookupView}
		 */
		view: undefined,

		/**
		 * @param {CMDBuild.view.administration.lookup.LookupView} view
		 */
		constructor: function(view) {
			this.callParent(arguments);

			this.view.tabPanel.removeAll();

			// Controller build
			this.controllerProperties = Ext.create('CMDBuild.controller.administration.lookup.Properties', { parentDelegate: this });
			this.controllerList = Ext.create('CMDBuild.controller.administration.lookup.List', { parentDelegate: this });

			// Inject tabs
			this.view.tabPanel.add(this.controllerProperties.getView());
			this.view.tabPanel.add(this.controllerList.getView());
		},

		// SelectedLookupType methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			lookupSelectedLookupTypeGet: function(attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedLookupType';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			lookupSelectedLookupTypeIsEmpty: function(attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedLookupType';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			lookupSelectedLookupTypeReset: function() {
				this.propertyManageReset('selectedLookupType');
			},

			/**
			 * @param {Object} parameters
			 */
			lookupSelectedLookupTypeSet: function(parameters) {
				parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.lookup.Type';
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedLookupType';

				this.propertyManageSet(parameters);
			},

		onLookupAddButtonClick: function() {
			this.lookupSelectedLookupTypeReset();

			this.view.tabPanel.setActiveTab(0);

			this.controllerProperties.cmfg('onLookupPropertiesAddButtonClick');
			this.controllerList.getView().disable();
		},

		/**
		 * @param {CMDBuild.model.common.accordion.Lookup} node
		 *
		 * TODO: waiting for refactor (crud + rename)
		 */
		onViewOnFront: function(node) {
			if (!Ext.isEmpty(node)) {
				var params = {};

				CMDBuild.core.proxy.lookup.Type.read({
					params: params,
					scope: this,
					success: function(response, options, decodedResponse) {
						var lookupObject = Ext.Array.findBy(decodedResponse, function(item, i) {
							return node.get(CMDBuild.core.constants.Proxy.ID) == item[CMDBuild.core.constants.Proxy.ID];
						}, this);
						lookupObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = lookupObject[CMDBuild.core.constants.Proxy.TEXT];

						this.lookupSelectedLookupTypeSet({ value: lookupObject });

						this.cmfg('onLookupSelected');

						this.setViewTitle(node.get(CMDBuild.core.constants.Proxy.DESCRIPTION));

						if (Ext.isEmpty(this.view.tabPanel.getActiveTab()))
							this.view.tabPanel.setActiveTab(0);
					}
				});
			}
		}
	});

})();