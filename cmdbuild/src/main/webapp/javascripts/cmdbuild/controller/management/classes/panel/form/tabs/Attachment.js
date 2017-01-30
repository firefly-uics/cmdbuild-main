(function () {

	/**
	 * @override
	 * @legacy
	 *
	 * FIXME: waiting for refactor
	 */
	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.Attachment', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Tab',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy'
		],

		mixins: {
			observable: 'Ext.util.Observable'
		},

		/**
		 * @cfg {CMDBuild.controller.management.classes.CMModCardController}
		 */
		parentDelegate: undefined,

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
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.classes.CMModCardController} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.mixins.observable.constructor.call(this, arguments);

			this.cmfgCatchedFunctions = Ext.Array.push(this.cmfgCatchedFunctions, [
				'classesFormTabAttachmentsSelectedCardGet = panelGridAndFormSelectedItemGet',
				'classesFormTabAttachmentsSelectedCardIsEmpty = panelGridAndFormSelectedItemIsEmpty',
				'classesFormTabAttachmentsSelectedEntryTypeGet = panelGridAndFormSelectedEntityGet',
				'classesFormTabAttachmentsSelectedEntryTypeIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
				'panelGridAndFormIdentifierGet'
			]);

			this.callParent(arguments);

			this.buildCardModuleStateDelegate();
		},

		/**
		 * @returns {Void}
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
		 *
		 * @override
		 */
		onPanelModuleAttachmentAddButtonClick: function () {
			var autocompletionRules = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', [
					CMDBuild.core.constants.Proxy.METADATA,
					CMDBuild.core.constants.Proxy.ATTACHMENTS,
					CMDBuild.core.constants.Proxy.AUTOCOMPLETION
				]) || {},
				templateResolverForm = this.parentDelegate.getFormForTemplateResolver();

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
						this.controllerWindowAdd.cmfg('panelModuleAttachmentWindowAddConfigureAndShow', { metadata: groupMergedRules(out) });
					}
				});
			} else {
				this.controllerWindowAdd.cmfg('panelModuleAttachmentWindowAddConfigureAndShow', { medatada: autocompletionRules });
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onPanelModuleAttachmentBackButtonClick: function () {
			this.parentDelegate.view.cardTabPanel.setActiveTab(0);
		},

		/**
		 * @param {Ext.data.Model} card
		 *
		 * @public
		 */
		onCardSelected: function (card) {
			if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
				this.classesFormTabAttachmentsSelectedCardSet({ value: card.getData() });

				this.view.setDisabled(
					!CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED)
					|| this.cmfg('classesFormTabAttachmentsSelectedEntryTypeIsEmpty')
					|| this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
				);

				if (this.view.isVisible())
					this.cmfg('onPanelModuleAttachmentShow')
			}
		},

		/**
		 * @param {CMDBuild.cache.CMEntryTypeModel} entryType
		 *
		 * @public
		 */
		onEntryTypeSelected: function (entryType) {
			if (Ext.isObject(entryType) && !Ext.Object.isEmpty(entryType)) {
				// Local variables reset
				this.classesFormTabAttachmentsSelectedCardReset();
				this.classesFormTabAttachmentsSelectedEntryTypeReset();

				this.classesFormTabAttachmentsSelectedEntryTypeSet({ value: entryType.getData() });

				this.cmfg('panelModuleAttachmentReset');
			}
		},

		/**
		 * @returns {String}
		 */
		panelGridAndFormIdentifierGet: function () {
			return CMDBuild.core.constants.ModuleIdentifiers.getClasses();
		}
	});

	/**
	 * The template resolver want the templates as a map. Our rules are grouped so I need to merge them to have a single level map
	 * To avoid name collision I choose to concatenate the group name and the meta-data name
	 * The following two routines do this dirty work
	 *
	 * @legacy
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
