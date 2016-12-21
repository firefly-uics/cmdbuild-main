(function () {

	/**
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Email', {
		extend: 'CMDBuild.controller.management.common.tabs.email.Email',

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.tabs.email.Email'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Ext.data.Model}
		 */
		card: undefined,

		/**
		 * @property {CMDBuild.state.CMCardModuleStateDelegate}
		 */
		cardStateDelegate: undefined,

		/**
		 * @cfg {CMDBuild.controller.management.classes.CMModCardController}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.cache.CMEntryTypeModel}
		 */
		entryType: undefined,

		/**
		 * @property {CMDBuild.view.management.common.tabs.email.EmailView}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 * @param {CMDBuild.controller.management.dataView.filter.panel.form.Form} configObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function(configObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.common.tabs.email.EmailView', { delegate: this });
			this.view.add(this.grid);
		},

		onAbortCardClick: function() {
			this.cmfg('tabEmailEditModeSet', false);
			this.cmfg('tabEmailConfigurationReset');
		},

		/**
		 * @returns {Void}
		 */
		onCardSelected: function () {
			var card = this.cmfg('dataViewFilterSelectedCardGet');

			if (!Ext.isEmpty(card)) {
				this.card = card;

				this.cmfg('tabEmailConfigurationReset');
				this.cmfg('tabEmailConfigurationSet', {
					propertyName: CMDBuild.core.constants.Proxy.READ_ONLY,
					value: false
				});
				this.cmfg('tabEmailEditModeSet', false);
				this.cmfg('tabEmailSelectedEntitySet', {
					selectedEntity: this.card,
					scope: this,
					callbackFunction: function(options, success, response) {
						this.cmfg('tabEmailRegenerateAllEmailsSet', Ext.isEmpty(this.card));
						this.forceRegenerationSet(Ext.isEmpty(this.card));
						this.cmfg('onTabEmailPanelShow');
					}
				});
			}
		},

		onCloneCard: function() {
			this.card = null;

			this.cmfg('tabEmailConfigurationSet', {
				propertyName: CMDBuild.core.constants.Proxy.READ_ONLY,
				value: false
			});

			this.cmfg('tabEmailEditModeSet', true);

			this.cmfg('tabEmailSelectedEntitySet', {
				selectedEntity: this.card,
				scope: this,
				callbackFunction: function(options, success, response) {
					this.cmfg('tabEmailRegenerateAllEmailsSet', Ext.isEmpty(this.card));
					this.forceRegenerationSet(Ext.isEmpty(this.card));
					this.cmfg('onTabEmailPanelShow');
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onEntryTypeSelected: function () {
			// FIXME: legacy mode to remove on complete Cards UI and cardState modules refactor
			this.entryType = Ext.create('CMDBuild.cache.CMEntryTypeModel', this.cmfg('dataViewFilterSourceEntryTypeGet', 'rawData'));

			this.cmfg('tabEmailConfigurationSet', {
				propertyName: CMDBuild.core.constants.Proxy.READ_ONLY,
				value: false
			});

			this.cmfg('tabEmailEditModeSet', false);
		},

		/**
		 * Works in place of ManageEmail widget for Workflows
		 *
		 * @override
		 */
		onModifyCardClick: function() {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(this.card.get('IdClass'));
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.card.get(CMDBuild.core.constants.Proxy.ID);

			CMDBuild.proxy.common.tabs.email.Email.isEmailEnabledForCard({
				params: params,
				scope: this,
				loadMask: true,
				success: function(response, options, decodedResponse) {
					this.cmfg('tabEmailConfigurationSet', {
						propertyName: CMDBuild.core.constants.Proxy.READ_ONLY,
						value: !decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE]
					});

					this.cmfg('tabEmailEditModeSet', decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE]);

					if (!this.grid.getStore().isLoading())
						this.cmfg('onTabEmailGlobalRegenerationButtonClick');
				}
			});
		},

		/**
		 * Launch regeneration on save button click and send all draft emails
		 */
		onSaveCardClick: function() {
			this.cmfg('tabEmailSendAllOnSaveSet', true);

			if (!this.grid.getStore().isLoading()) {
				this.cmfg('tabEmailRegenerateAllEmailsSet', true);
//				this.cmfg('onTabEmailPanelShow');
			}
		},

		/**
		 * @override
		 */
		onTabEmailPanelShow: function() {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('onTabEmailPanelShow(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('onTabEmailPanelShow(): empty selected card property', this, this.cmfg('dataViewFilterSelectedCardGet'));
			// END: Error handling

			// History record save
			CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
				moduleId: this.cmfg('dataViewIdentifierGet'),
				entryType: {
					description: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					id: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
					object: this.cmfg('dataViewSelectedDataViewGet')
				},
				item: {
					description: this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
						|| this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CODE),
					id: this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
					object: this.cmfg('dataViewFilterSelectedCardGet')
				},
				section: {
					description: this.view.title,
					object: this.view
				}
			});

			this.callParent(arguments);
		}
	});

})();
