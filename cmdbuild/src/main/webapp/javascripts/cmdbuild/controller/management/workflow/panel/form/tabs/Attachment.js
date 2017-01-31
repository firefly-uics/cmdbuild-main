(function () {

	/**
	 * @override
	 * @legacy
	 *
	 * FIXME: waiting for refactor
	 */
	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.Attachment', { // TODO WIP
		extend: 'CMDBuild.controller.common.panel.module.attachment.Grid',

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
		 * @property {CMDBuild.model.management.classes.panel.form.tabs.attachment.SelectedCard}
		 *
		 * @private
		 */
		selectedCard: undefined,

		/**
		 * @returns {CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Entity}
		 *
		 * @private
		 */
		selectedEntity: undefined,

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
				'classesFormTabAttachmentSelectedCardGet = panelGridAndFormSelectedItemGet',
				'classesFormTabAttachmentSelectedCardIsEmpty = panelGridAndFormSelectedItemIsEmpty',
				'classesFormTabAttachmentSelectedEntityGet = panelGridAndFormSelectedEntityGet',
				'classesFormTabAttachmentSelectedEntityIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
				'onClassesFormTabAttachmentShowCallback = onPanelModuleAttachmentShowCallback',
				'panelGridAndFormIdentifierGet',
				'panelGridAndFormPanelFormTemplateResolverFormGet'
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
			classesFormTabAttachmentSelectedCardGet: function (attributePath) {
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
			classesFormTabAttachmentSelectedCardIsEmpty: function (attributePath) {
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
			classesFormTabAttachmentSelectedCardReset: function () {
				this.propertyManageReset('selectedCard');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.attachment.SelectedCard';
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
			classesFormTabAttachmentSelectedEntityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabAttachmentSelectedEntityIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedEntityReset: function () {
				return this.propertyManageReset('selectedEntity');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedEntitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Entity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentShowCallback: function () {
			// Business rule: read a configuration parameter to enable the editing of attachments of closed activities
			// TODO: implementation - CMDBuild.configuration.workflow.get(CMDBuild.core.constants.Proxy.ENABLE_ADD_ATTACHMENT_ON_CLOSED_ACTIVITIES)
//			var priv = false;
//			var pi = _CMWFState.getProcessInstance();
//
//			if (CMDBuild.configuration.workflow.get(CMDBuild.core.constants.Proxy.ENABLE_ADD_ATTACHMENT_ON_CLOSED_ACTIVITIES)
//					&& pi
//					&& pi.isStateCompleted()) {
//
//				priv = true;
//			}
//
//			this.view.updateWritePrivileges(priv);

			Ext.reauire('CMDBuild.core.constants.WorkflowStates'); // TODO

			// UI setup
			this.view.buttonAdd.setDisabled(
				this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.TYPE) == CMDBuild.core.constants.Global.getTableTypeWorkflow()
					? ( // Workflow evaluation // TODO: end implementation
						this.cmfg('panelGridAndFormSelectedItemIsEmpty', CMDBuild.core.constants.Proxy.ID) // On instance's first step
						|| !( // EnableAddAttachmentOnClosedActivities configuration manage
							CMDBuild.configuration.workflow.get(CMDBuild.core.constants.Proxy.ENABLE_ADD_ATTACHMENT_ON_CLOSED_ACTIVITIES)
							&& this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getCompletedCapitalized()
						)
						|| !this.cmfg('panelGridAndFormSelectedEntityGet', [ // TODO
							CMDBuild.core.constants.Proxy.PERMISSIONS,
							CMDBuild.core.constants.Proxy.WRITE
						])
					)
					: ( // Class evaluation
						!this.cmfg('panelGridAndFormSelectedEntityGet', [
							CMDBuild.core.constants.Proxy.PERMISSIONS,
							CMDBuild.core.constants.Proxy.WRITE
						])
					)
			);

			this.cmfg('panelModuleAttachmentGridStoreLoad');
		},

		/**
		 * @param {Ext.data.Model} card
		 *
		 * @public
		 */
		onCardSelected: function (card) {
			if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
				this.classesFormTabAttachmentSelectedCardSet({ value: card.getData() });

				this.view.setDisabled(
					!CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED)
					|| this.cmfg('classesFormTabAttachmentSelectedEntityIsEmpty')
					|| this.cmfg('classesFormTabAttachmentSelectedEntityGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
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
				this.classesFormTabAttachmentSelectedCardReset();
				this.classesFormTabAttachmentSelectedEntityReset();

				this.classesFormTabAttachmentSelectedEntitySet({ value: entryType.getData() });

				this.cmfg('panelModuleAttachmentGridReset');
			}
		},

		/**
		 * @returns {Ext.form.Basic or null}
		 */
		panelGridAndFormPanelFormTemplateResolverFormGet: function () {
			return this.parentDelegate.getFormForTemplateResolver();
		},

		/**
		 * @returns {String}
		 */
		panelGridAndFormIdentifierGet: function () {
			return CMDBuild.core.constants.ModuleIdentifiers.getClasses();
		}
	});

})();
