(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormIdentifierGet
	 * 	- panelGridAndFormPanelFormTemplateResolverFormGet
	 * 	- panelGridAndFormPanelFormTabActiveSet
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.Window', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Grid',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.LoadMask',
			'CMDBuild.proxy.common.panel.module.attachment.Window'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentGridAddButtonClick',
			'onPanelModuleAttachmentBackButtonClick',
			'onPanelModuleAttachmentGridDownloadButtonClick',
			'onPanelModuleAttachmentGridModifyButtonClick',
			'onPanelModuleAttachmentGridRemoveButtonClick',
//			'onPanelModuleAttachmentShow',
			'onPanelModuleAttachmentGridVersionsButtonClick',
			'panelModuleAttachmentGridCategoriesExists',
			'panelModuleAttachmentGridCategoriesGet',
			'panelModuleAttachmentConfigureAndShow',
			'panelModuleAttachmentGridReset',
			'panelModuleAttachmentGridStoreLoad',

			'panelModuleAttachmentSelectedEntityGet = panelGridAndFormSelectedEntityGet',
			'panelModuleAttachmentSelectedEntityIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
		],

		/**
		 * @property {CMDBuild.model.common.panel.module.attachment.entity.Entity}
		 *
		 * @private
		 */
		selectedEntity: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.module.attachment.Item}
		 *
		 * @private
		 */
		selectedItem: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.WindowView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.WindowView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * Includes onPanelModuleAttachmentShow
		 *
		 * @param {Object} parameters
		 * @param {Number} parameters.entityId
		 * @param {Number} parameters.id
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentConfigureAndShow: function (parameters) {
_debug('panelModuleAttachmentConfigureAndShow', parameters);
			parameters = Ext.isObject(parameters) ? parameters : {};

			CMDBuild.core.LoadMask.show(); // Manual loadMask manage

			this.readEntity(parameters.entityId, function () {
				this.readItem(parameters.id, function () {
					CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

				});
			});
		},

		/**
		 * @param {Number} id
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readEntity: function (id, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (!Ext.isNumber(id) || Ext.isEmpty(id))
					return _error('readEntity(): unmanaged id parameter', this, id);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.common.panel.module.attachment.Window.readEntity({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						var entityObject = Ext.Array.findBy(decodedResponse, function(entityObject, i) {
							return entityObject[CMDBuild.core.constants.Proxy.ID] == id;
						}, this);

						if (Ext.isObject(entityObject) && !Ext.Object.isEmpty(entityObject)) {
							this.panelModuleAttachmentSelectedEntitySet({ value: entityObject });

							Ext.callback(callback, this);
						} else {
							_error('readEntity(): entity not found', this, id);
						}
					} else {
						_error('readEntity(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readItem: function (id, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (!Ext.isNumber(id) || Ext.isEmpty(id))
					return _error('readItem(): unmanaged id parameter', this, id);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = id;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelModuleAttachmentSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.common.panel.module.attachment.Window.readItem({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.panelModuleAttachmentSelectedItemSet({ value: decodedResponse });

						Ext.callback(callback, this);
					} else {
						_error('readItem(): item not found', this, id);
					}
				}
			});
		},

		// SelectedEntity property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelModuleAttachmentSelectedEntityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelModuleAttachmentSelectedEntityIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

//			/**
//			 * @returns {Boolean}
//			 *
//			 * @private
//			 */
//			panelModuleAttachmentSelectedEntityReset: function () {
//				return this.propertyManageReset('selectedEntity');
//			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentSelectedEntitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.module.attachment.entity.Entity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedItem property functions
//			/**
//			 * @param {Array or String} attributePath
//			 *
//			 * @returns {Mixed or undefined}
//			 */
//			panelModuleAttachmentSelectedItemGet: function (attributePath) {
//				var parameters = {};
//				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';
//				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
//
//				return this.propertyManageGet(parameters);
//			},
//
//			/**
//			 * @param {Array or String} attributePath
//			 *
//			 * @returns {Boolean}
//			 */
//			panelModuleAttachmentSelectedItemIsEmpty: function (attributePath) {
//				var parameters = {};
//				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';
//				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
//
//				return this.propertyManageIsEmpty(parameters);
//			},
//
//			/**
//			 * @param {Object} parameters
//			 *
//			 * @returns {Void}
//			 */
//			panelModuleAttachmentSelectedItemReset: function (parameters) {
//				this.propertyManageReset('selectedItem');
//			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentSelectedItemSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.module.attachment.Item';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';

					this.propertyManageSet(parameters);
				}
			}
	});

})();
