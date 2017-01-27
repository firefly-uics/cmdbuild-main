(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.attachments.Attachments', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.LoadMask',
			'CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments'
		],

		mixins: {
			observable: 'Ext.util.Observable'
		},

		/**
		 * @cfg {CMDBuild.controller.management.classes.CMModCardController}
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
			'classesFormTabAttachmentsCategoriesExists',
			'classesFormTabAttachmentsCategoriesGet',
			'classesFormTabAttachmentsReset',
			'classesFormTabAttachmentsSelectedCardGet',
			'classesFormTabAttachmentsSelectedCardIsEmpty',
			'classesFormTabAttachmentsSelectedEntryTypeGet',
			'classesFormTabAttachmentsSelectedEntryTypeIsEmpty',
			'classesFormTabAttachmentsStoreLoad',
			'onClassesFormTabAttachmentsAddButtonClick',
			'onClassesFormTabAttachmentsBackButtonClick',
			'onClassesFormTabAttachmentsDownloadButtonClick',
			'onClassesFormTabAttachmentsModifyButtonClick',
			'onClassesFormTabAttachmentsRemoveButtonClick',
			'onClassesFormTabAttachmentsShow',
			'onClassesFormTabAttachmentsVersionsButtonClick'
		],
		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.attachments.Versions}
		 */
		controllerVersions: undefined,

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Add}
		 */
		controllerWindowAdd: undefined,

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Modify}
		 */
		controllerWindowModify: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.management.classes.panel.form.tabs.attachments.SelectedCard}
		 *
		 * @private
		 */
		selectedCard: undefined,

		/**
		 * @returns {CMDBuild.model.management.classes.panel.form.tabs.attachments.entryType.EntryType}
		 *
		 * @private
		 */
		selectedEntryType: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.AttachmentsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.classes.CMModCardController} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.mixins.observable.constructor.call(this, arguments);

			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.AttachmentsView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;

			// Build sub-controllers
			this.controllerWindowAdd = Ext.create('CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Add', { parentDelegate: this });
			this.controllerWindowModify = Ext.create('CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Modify', { parentDelegate: this });
			this.controllerVersions = Ext.create('CMDBuild.controller.management.classes.panel.form.tabs.attachments.Versions', { parentDelegate: this });

			this.buildCardModuleStateDelegate(); // FIXME: waiting for refactor
		},

		/**
		 * @returns {Void}
		 *
		 * FIXME: waiting for refactor
		 */
		buildCardModuleStateDelegate: function () {
			var me = this;

			this.cardStateDelegate = new CMDBuild.state.CMCardModuleStateDelegate();

			this.cardStateDelegate.onEntryTypeDidChange = function (state, entryType) {
				me.onEntryTypeSelected(entryType);
			};

			this.cardStateDelegate.onModifyCardClick = function (state) {
				me.onModifyCardClick();
			};

			this.cardStateDelegate.onCardDidChange = function (state, card) {
				Ext.suspendLayouts();
				me.onCardSelected(card);
				Ext.resumeLayouts();
			};

			_CMCardModuleState.addDelegate(this.cardStateDelegate);

			if (this.view)
				this.mon(me.view, 'destroy', function (view) {
					_CMCardModuleState.removeDelegate(me.cardStateDelegate);

					delete me.cardStateDelegate;
				});
		},

		// Categories property functions
			/**
			 * @param {Object} parameters
			 * @param {String} parameters.name
			 *
			 * @returns {Boolean}
			 */
			classesFormTabAttachmentsCategoriesExists: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return !Ext.isEmpty(this.categories[parameters.name]);

				return false;
			},

			/**
			 * @param {Object} parameters
			 * @param {String} parameters.name
			 *
			 * @returns {CMDBuild.model.management.classes.panel.form.tabs.attachments.category.Category or null}
			 */
			classesFormTabAttachmentsCategoriesGet: function (parameters) {
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
			classesFormTabAttachmentsCategoriesReset: function () {
				this.categories = {};
			},

			/**
			 * @param {Array} categories
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentsCategoriesSet: function (categories) {
				this.classesFormTabAttachmentsCategoriesReset();

				if (Ext.isArray(categories) && !Ext.isEmpty(categories))
					Ext.Array.forEach(categories, function (categoryObject, i, allCategoryObjects) {
						if (Ext.isObject(categoryObject) && !Ext.Object.isEmpty(categoryObject)) {
							var model = Ext.create('CMDBuild.model.management.classes.panel.form.tabs.attachments.category.Category', categoryObject);

							this.categories[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		/**
		 * @returns {Void}
		 */
		classesFormTabAttachmentsReset: function () {
			this.grid.getStore().removeAll();

			this.view.disable();
		},

		// SelectedCard property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabAttachmentsSelectedCardGet: function (attributePath) {
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
			classesFormTabAttachmentsSelectedCardIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentsSelectedCardReset: function () {
				this.propertyManageReset('selectedCard');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentsSelectedCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.attachments.SelectedCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedEntryType property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabAttachmentsSelectedEntryTypeGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabAttachmentsSelectedEntryTypeIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentsSelectedEntryTypeReset: function () {
				return this.propertyManageReset('selectedEntryType');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentsSelectedEntryTypeSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.attachments.entryType.EntryType';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		classesFormTabAttachmentsStoreLoad: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({ params: params });
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsAddButtonClick: function () {
			var autocompletionRules = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', [
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
					serverVars: this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.VALUES), // getTemplateResolverServerVars() alias applied on cards
				}).resolveTemplates({
					attributes: Ext.Object.getKeys(mergedRoules),
					scope: this,
					callback: function (out, ctx) {
						this.controllerWindowAdd.cmfg('classesFormTabAttachmentsWindowAddConfigureAndShow', { metadata: groupMergedRules(out) });
					}
				});
			} else {
				this.controllerWindowAdd.cmfg('classesFormTabAttachmentsWindowAddConfigureAndShow', { medatada: autocompletionRules });
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsBackButtonClick: function () {
			this.parentDelegate.view.cardTabPanel.setActiveTab(0); // FIXME: waiting for refactor
		},

		/**
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} record
		 *
		 * @returns {Void}
		 *
		 * FIXME: waiting for refactor (rename)
		 */
		onClassesFormTabAttachmentsDownloadButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onClassesFormTabAttachmentsDownloadButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params['Filename'] = record.get(CMDBuild.core.constants.Proxy.FILE_NAME);
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.download({ params: params });
		},

		/**
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} record
		 *
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsModifyButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onClassesFormTabAttachmentsModifyButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			this.controllerWindowModify.cmfg('classesFormTabAttachmentsWindowModifyConfigureAndShow', { record: record });
		},

		/**
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} record
		 *
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsRemoveButtonClick: function (record) {
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
		onClassesFormTabAttachmentsShow: function () {
			// Error handling
				if (this.cmfg('classesFormTabAttachmentsSelectedEntryTypeIsEmpty'))
					return _error('onClassesFormTabAttachmentsShow(): unmanaged selectedEntryType property', this, this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet'));

				if (this.cmfg('classesFormTabAttachmentsSelectedCardIsEmpty'))
					return _error('onClassesFormTabAttachmentsShow(): unmanaged selectedCard property', this, this.cmfg('classesFormTabAttachmentsSelectedCardGet'));
			// END: Error handling

			CMDBuild.core.LoadMask.show(); // Manual loadMask manage

			this.readAttachmentContext(function () {
				CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

				// History record save
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: 'class',
					entryType: {
						description: this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.TEXT),
						id: this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet')
					},
					item: {
						description: this.cmfg('classesFormTabAttachmentsSelectedCardGet', 'Description') || this.cmfg('classesFormTabAttachmentsSelectedCardGet','Code'),
						id: this.cmfg('classesFormTabAttachmentsSelectedCardGet',CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('classesFormTabAttachmentsSelectedCardGet')
					},
					section: {
						description: this.view.title,
						object: this.view
					}
				});

				// UI setup
				this.view.buttonAdd.setDisabled(
					!this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', [
						CMDBuild.core.constants.Proxy.PERMISSIONS,
						CMDBuild.core.constants.Proxy.WRITE
					])
				);

				this.cmfg('classesFormTabAttachmentsStoreLoad');
			});
		},

		/**
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} record
		 *
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsVersionsButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onClassesFormTabAttachmentsVersionsButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			this.controllerVersions.cmfg('classesFormTabAttachmentsVersionsConfigureAndShow', { record: record });
		},

		/**
		 * @param {Ext.data.Model} card
		 *
		 * @public
		 *
		 * FIXME: waiting for refactor
		 */
		onCardSelected: function (card) {
_debug('onCardSelected', card);
			if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
				this.classesFormTabAttachmentsSelectedCardSet({ value: card.getData() });

				this.view.setDisabled(
					!CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED)
					|| this.cmfg('classesFormTabAttachmentsSelectedEntryTypeIsEmpty')
					|| this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
				);

				if (this.view.isVisible())
					this.cmfg('onClassesFormTabAttachmentsShow')
			}
		},

		/**
		 * @param {CMDBuild.cache.CMEntryTypeModel} entryType
		 *
		 * @public
		 *
		 * FIXME: waiting for refactor
		 */
		onEntryTypeSelected: function (entryType) {
_debug('onEntryTypeSelected', entryType);
			if (Ext.isObject(entryType) && !Ext.Object.isEmpty(entryType)) {
				// Local variables reset
				this.classesFormTabAttachmentsSelectedCardReset();
				this.classesFormTabAttachmentsSelectedEntryTypeReset();

				this.classesFormTabAttachmentsSelectedEntryTypeSet({ value: entryType.getData() });

				this.cmfg('classesFormTabAttachmentsReset');
			}
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

					this.classesFormTabAttachmentsCategoriesReset();

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
						this.classesFormTabAttachmentsCategoriesSet(decodedResponse);

					Ext.callback(callback, this);
				}
			});
		},

		/**
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onClassesFormTabAttachmentsDownloadButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params['Filename'] = record.get(CMDBuild.core.constants.Proxy.FILE_NAME);
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.remove({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					this.cmfg('classesFormTabAttachmentsStoreLoad');
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
