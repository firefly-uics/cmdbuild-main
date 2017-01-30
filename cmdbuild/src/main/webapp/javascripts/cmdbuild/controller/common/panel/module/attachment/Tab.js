(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormIdentifierGet
	 * 	- panelGridAndFormPanelFormTabActiveSet
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.Tab', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.LoadMask',
			'CMDBuild.proxy.common.panel.module.attachment.Attachment'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		categories: {},

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentAddButtonClick',
			'onPanelModuleAttachmentBackButtonClick',
			'onPanelModuleAttachmentDownloadButtonClick',
			'onPanelModuleAttachmentModifyButtonClick',
			'onPanelModuleAttachmentRemoveButtonClick',
			'onPanelModuleAttachmentShow',
			'onPanelModuleAttachmentVersionsButtonClick',
			'panelModuleAttachmentCategoriesExists',
			'panelModuleAttachmentCategoriesGet',
			'panelModuleAttachmentReset',
			'panelModuleAttachmentStoreLoad'
		],
		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.Versions}
		 */
		controllerVersions: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.window.Add}
		 */
		controllerWindowAdd: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.window.Modify}
		 */
		controllerWindowModify: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.TabView}
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

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.TabView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;

			// Build sub-controllers
			this.controllerVersions = Ext.create('CMDBuild.controller.common.panel.module.attachment.Versions', { parentDelegate: this });
			this.controllerWindowAdd = Ext.create('CMDBuild.controller.common.panel.module.attachment.window.Add', { parentDelegate: this });
			this.controllerWindowModify = Ext.create('CMDBuild.controller.common.panel.module.attachment.window.Modify', { parentDelegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentAddButtonClick: function () {
			var autocompletionRules = this.cmfg('panelGridAndFormSelectedEntityGet', [
					CMDBuild.core.constants.Proxy.METADATA,
					CMDBuild.core.constants.Proxy.ATTACHMENTS,
					CMDBuild.core.constants.Proxy.AUTOCOMPLETION
				]) || {},
				templateResolverForm = this.parentDelegate.getFormForTemplateResolver(); // FIXME: waiting for refactor

			if (Ext.isObject(templateResolverForm) && !Ext.Object.isEmpty(templateResolverForm)) {
				var mergedRoules = mergeRulesInASingleMap(autocompletionRules);

				new CMDBuild.Management.TemplateResolver({
					clientForm: templateResolverForm,
					xaVars: mergedRoules,
					serverVars: this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.VALUES), // getTemplateResolverServerVars() alias applied on cards
				}).resolveTemplates({
					attributes: Ext.Object.getKeys(mergedRoules),
					scope: this,
					callback: function (out, ctx) {
						this.controllerWindowAdd.cmfg('panelModuleAttachmentWindowAddConfigureAndShow', { metadata: groupMergedRules(out) });
					}
				});
			} else {
				this.controllerWindowAdd.cmfg('panelModuleAttachmentWindowAddConfigureAndShow', { medatada: autocompletionRules });
			}
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentBackButtonClick: function () {
			this.cmfg('panelGridAndFormPanelFormTabActiveSet', 'formTabAttachment');
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} record
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentDownloadButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onPanelModuleAttachmentDownloadButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.FILE_NAME] = record.get(CMDBuild.core.constants.Proxy.FILE_NAME);

			CMDBuild.proxy.common.panel.module.attachment.Attachment.download({ params: params });
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} record
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentModifyButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onPanelModuleAttachmentModifyButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			this.controllerWindowModify.cmfg('panelModuleAttachmentWindowModifyConfigureAndShow', { record: record });
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} record
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentRemoveButtonClick: function (record) {
			Ext.Msg.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem(record);
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentShow: function () {
			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('onPanelModuleAttachmentShow(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));

				if (this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
					return _error('onPanelModuleAttachmentShow(): unmanaged selectedItem property', this, this.cmfg('panelGridAndFormSelectedItemGet'));
			// END: Error handling

			CMDBuild.core.LoadMask.show(); // Manual loadMask manage

			this.readAttachmentContext(function () {
				CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

				// History record save
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: this.cmfg('panelGridAndFormIdentifierGet'),
					entryType: {
						description: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.TEXT),
						id: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('panelGridAndFormSelectedEntityGet')
					},
					item: {
						description: this.cmfg('panelGridAndFormSelectedItemGet', 'Description') || this.cmfg('panelGridAndFormSelectedItemGet','Code'),
						id: this.cmfg('panelGridAndFormSelectedItemGet',CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('panelGridAndFormSelectedItemGet')
					},
					section: {
						description: this.view.title,
						object: this.view
					}
				});

				// UI setup
				this.view.buttonAdd.setDisabled(
					!this.cmfg('panelGridAndFormSelectedEntityGet', [
						CMDBuild.core.constants.Proxy.PERMISSIONS,
						CMDBuild.core.constants.Proxy.WRITE
					])
				);

				this.cmfg('panelModuleAttachmentStoreLoad');
			});
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} record
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentVersionsButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onPanelModuleAttachmentVersionsButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			this.controllerVersions.cmfg('panelModuleAttachmentVersionsConfigureAndShow', { record: record });
		},

		// Categories property functions
			/**
			 * @param {Object} parameters
			 * @param {String} parameters.name
			 *
			 * @returns {Boolean}
			 */
			panelModuleAttachmentCategoriesExists: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return !Ext.isEmpty(this.categories[parameters.name]);

				return false;
			},

			/**
			 * @param {Object} parameters
			 * @param {String} parameters.name
			 *
			 * @returns {CMDBuild.model.common.panel.module.attachment.category.Category or null}
			 */
			panelModuleAttachmentCategoriesGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return this.categories[parameters.name];

				return null;
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentCategoriesReset: function () {
				this.categories = {};
			},

			/**
			 * @param {Array} categories
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentCategoriesSet: function (categories) {
				this.panelModuleAttachmentCategoriesReset();

				if (Ext.isArray(categories) && !Ext.isEmpty(categories))
					Ext.Array.forEach(categories, function (categoryObject, i, allCategoryObjects) {
						if (Ext.isObject(categoryObject) && !Ext.Object.isEmpty(categoryObject)) {
							var model = Ext.create('CMDBuild.model.common.panel.module.attachment.category.Category', categoryObject);

							this.categories[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		/**
		 * @returns {Void}
		 */
		panelModuleAttachmentReset: function () {
			this.grid.getStore().removeAll();

			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		panelModuleAttachmentStoreLoad: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({ params: params });
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		readAttachmentContext: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			CMDBuild.proxy.Cache.readAttachmentDefinitions({
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CATEGORIES];

					this.panelModuleAttachmentCategoriesReset();

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
						this.panelModuleAttachmentCategoriesSet(decodedResponse);

					Ext.callback(callback, this);
				}
			});
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onPanelModuleAttachmentDownloadButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.FILE_NAME] = record.get(CMDBuild.core.constants.Proxy.FILE_NAME);

			CMDBuild.proxy.common.panel.module.attachment.Attachment.remove({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					this.cmfg('panelModuleAttachmentStoreLoad');
				}
			});
		}
	});

	/**
	 * The template resolver want the templates as a map. Our rules are grouped so I need to merge them to have a single level map
	 * To avoid name collision I choose to concatenate the group name and the meta-data name
	 * The following two routines do this dirty work
	 *
	 * @legacy
	 *
	 * FIXME: refactor
	 */
	function mergeRulesInASingleMap(rules) {
		rules = rules || {};

		var out = {};

		for (var groupName in rules) {
			var group = rules[groupName];

			for (var key in group) {
				out[groupName + '_' + key] = group[key];
			}
		}

		return out;
	}

	/**
	 * @legacy
	 *
	 * FIXME: refactor
	 */
	function groupMergedRules(mergedRules) {
		var out = {};

		for (var key in mergedRules) {
			var group = null,
				metaName = null;

			try {
				var s = key.split('_');
				group = s[0];
				metaName = s[1];
			} catch (e) {
				// Pray for my soul
			}

			if (group && metaName) {
				out[group] = out[group] || {};
				out[group][metaName] = mergedRules[key];
			}
		}

		return out;
	}

})();
