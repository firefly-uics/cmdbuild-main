(function () {

	/**
	 * @merged CMDBuild.controller.management.classes.CMCardPanelController
	 * @merged CMDBuild.controller.management.classes.CMBaseCardPanelController
	 * @merged CMDBuild.controller.management.classes.CMModCardSubController
	 *
	 * @legacy
	 */
	Ext.define("CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card", {

		requires: [
			'CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.StaticsController',
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.Message',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card'
		],

		mixins : {
			observable : "Ext.util.Observable"
		},

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		parentDelegate: undefined,

		cardDataProviders: [],

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.filter.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			Ext.apply(this, configurationObject);

			this.mixins.observable.constructor.call(this, arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.card.CardView', { delegate: this });

			this.card = null;
			this.entryType = null;

			var ev = this.view.CMEVENTS;

			this.CMEVENTS = {
				cardSaved: "cm-card-saved",
				abortedModify: "cm-card-modify-abort",
				editModeDidAcitvate: ev.editModeDidAcitvate,
				displayModeDidActivate: ev.displayModeDidActivate,
				cardRemoved: "cm-card-removed",
				cloneCard: "cm-card-clone"
			};
			var ev = this.view.CMEVENTS;

			this.addEvents(
				this.CMEVENTS.cardSaved,
				this.CMEVENTS.abortedModify,
				this.CMEVENTS.cardRemoved,
				this.CMEVENTS.cloneCard,
				this.CMEVENTS.cardSaved,
				this.CMEVENTS.editModeDidAcitvate,
				this.CMEVENTS.displayModeDidActivate,
				ev.editModeDidAcitvate,
				ev.displayModeDidActivate
			);
			this.relayEvents(this.view, [ev.editModeDidAcitvate, ev.displayModeDidActivate]);

			this.mon(this.view, ev.widgetButtonClick, this.onWidgetButtonClick, this);
			this.mon(this.view, ev.editModeDidAcitvate, this.onCardGoesInEdit, this);

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });
			this.controllerWindowGraph = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', { parentDelegate: this });
		},

		/**
		 * @legacy
		 */
		getView: function () {
			return this.view;
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		reset: function () {
			this.view.displayMode();
			this.view.clear();

			// Manually disable all buttons
			this.view.form.modifyCardButton.disable();
			this.view.form.deleteCardButton.disable();
		},

		changeClassUIConfigurationForGroup: function(disabledModify, disabledClone, disabledRemove) {
			this.view.form.modifyCardButton.disabledForGroup = disabledModify;
			this.view.form.cloneCardButton.disabledForGroup = disabledClone;
			this.view.form.deleteCardButton.disabledForGroup = disabledRemove;
			if (this.view.form.modifyCardButton.disabledForGroup)
				this.view.form.modifyCardButton.disable();
			else
				this.view.form.modifyCardButton.enable();
			if (this.view.form.cloneCardButton.disabledForGroup)
				this.view.form.cloneCardButton.disable();
			else
				this.view.form.cloneCardButton.enable();
			if (this.view.form.deleteCardButton.disabledForGroup)
				this.view.form.deleteCardButton.disable();
			else
				this.view.form.deleteCardButton.enable();
		},

		/**
		 * @param {Object} params
		 */
		doFormSubmit: function (params) {
			CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card.update({
				params: Ext.Object.merge(params, this.view.getForm().getValues()),
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					// Adapter to old method behaviour for classes witch extends this one
					var fakeOperation = {};
					fakeOperation['result'] = decodedResponse;
					fakeOperation['params'] = options.params;

					this.cloneCard = false;
					this.view.displayMode();

					var cardData = {
						Id: fakeOperation.result[CMDBuild.core.constants.Proxy.ID] || this.card.get("Id"), // if is a new card, the id is given by the request
						IdClass: this.entryType.get(CMDBuild.core.constants.Proxy.ID)
					};

					this.fireEvent(this.CMEVENTS.cardSaved, cardData);

					_CMCache.onClassContentChanged(this.entryType.get(CMDBuild.core.constants.Proxy.ID));

					this.parentDelegate.cmfg('dataViewFilterUiUpdate', {
						cardId: fakeOperation.result[CMDBuild.core.constants.Proxy.ID] || this.card.get("Id"), // if is a new card, the id is given by the request
						className: params[CMDBuild.core.constants.Proxy.CLASS_NAME],
						forceStoreLoad: true
					});
				}
			});
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 */
		onPrintCardMenuClick: function (format) {
			if (Ext.isString(format) && !Ext.isEmpty(format)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.entryType.get(CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.card.get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.FORMAT] = format;

				this.controllerPrintWindow.cmfg('panelGridAndFormPrintWindowShow', {
					format: format,
					mode: 'cardDetails',
					params: params
				});
			} else {
				_error('onPrintCardMenuClick(): unmanaged format parameter', this);
			}
		},

		onEntryTypeSelected: function() {
			this.cloneCard = false;
			this.unlockCard();

			if (this.view.isInEditing()) {
				this.view.displayMode();
			}

			// FIXME: legacy mode to remove on complete Cards UI and cardState modules refactor
			this.entryType = Ext.create('CMDBuild.cache.CMEntryTypeModel', this.parentDelegate.cmfg('dataViewFilterSourceEntryTypeGet', 'rawData'));
			this.loadFields(this.entryType.get("id"));

			if (this.widgetControllerManager) {
				this.widgetControllerManager.removeAll();
			}

			var privileges = CMDBuild.core.Utils.getEntryTypePrivileges(_CMCache.getEntryTypeById(
				this.parentDelegate.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.ID))
			);

			this.changeClassUIConfigurationForGroup(
				!(privileges.write && !privileges.crudDisabled.modify),
				!(privileges.write && !privileges.crudDisabled.clone),
				!(privileges.write && !privileges.crudDisabled.remove)
			);
		},

		onRemoveCardClick: function() {
			var me = this,
				idCard = me.card.get("Id"),
				idClass = me.entryType.get("id");

			function makeRequest(btn) {
				if (btn != 'yes') {
					return;
				}

				CMDBuild.core.LoadMask.show();
				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card.remove({
					params : {
						IdClass: idClass,
						Id: idCard
					},
					loadMask: false,
					success : function() {
						_CMCache.onClassContentChanged(idClass);
					},
					callback : function() {
						CMDBuild.core.LoadMask.hide();
					}
				});
			};

			Ext.Msg.confirm(
				CMDBuild.Translation.attention,
				CMDBuild.Translation.management.modcard.delete_card_confirm,
				makeRequest,
				this
			);
		},

		onCloneCardClick: function() {
			this.cloneCard = true;
			this.onModifyCardClick();
		},

		onCardSelected: function (card) {
			card = Ext.isObject(card) && !Ext.Object.isEmpty(card) ? card : this.parentDelegate.cmfg('dataViewFilterSelectedCardGet');

			this.cloneCard = false;
			var me = this;

			this.unlockCard();

			this.card = card;

			if (this.view.isInEditing())
				this.view.displayMode();

			this.view.reset();

			if (!this.entryType || !this.card)
				return;

			// The right way it should work is to execute the getCard query to the server every time i select a new card in grid
			var loadRemoteData = true;

			// Defer this call to release the UI event manage
			Ext.defer(buildWidgetControllers, 1, this, [card]);

			this.loadFields(this.card.get("IdClass"), function() {
				me.loadCard(loadRemoteData);
			});
		},

		onCardGoesInEdit: function() {
			if (this.widgetControllerManager) {
				this.widgetControllerManager.onCardGoesInEdit();
			}
		},

		/**
		 * @param {Number} classId
		 *
		 * @returns {Void}
		 */
		onAddCardButtonClick: function (classId) {
			// Error handling
				if (!Ext.isNumber(classId) || Ext.isEmpty(classId))
					return _error('onAddCardButtonClick(): unmanaged classId parameter', this, classId);
			// END: Error handling

			this.onCardSelected(new CMDBuild.DummyModel({
				IdClass: classId,
				Id: -1
			}));

			this.view.editMode();
		},

		addCardDataProviders: function(dataProvider) {
			this.cardDataProviders.push(dataProvider);
		},

		loadFields: function(entryTypeId, cb) {
			var me = this;
			_CMCache.getAttributeList(entryTypeId, function(attributes) {
				me.view.fillForm(attributes, editMode = false);
				if (cb) {
					cb();
				}
			});
		},

		/**
		 * @param {Boolean} loadRemoteData
		 * @param {Object} params
		 * @param {Function} cb
		 */
		loadCard: function(loadRemoteData, params, cb) {
			var me = this;
			var cardId;

			if (params) {
				cardId = params.Id || params.cardId;
			} else {
				cardId = me.card.get('Id');
			}

			if (cardId && cardId != '-1' && (loadRemoteData || me.view.hasDomainAttributes())) {
				if (!params) {
					var params = {};
					params[CMDBuild.core.constants.Proxy.CARD_ID] = me.card.get('Id');
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(me.card.get('IdClass'));
				}

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card.read({
					params: params,
					loadMask: false,
					success: function(result, options, decodedResult) {
						var data = decodedResult.card;

						if (me.card) {
							// Merge the data of the selected card with the remote data loaded from the server. The reason is that in the activity list
							// the card have data that are not returned from the server, so use the data already in the record. For activities, the privileges
							// returned from the server are of the class and not of the activity
							data = Ext.Object.merge((me.card.raw || me.card.data), data);
						}

						addRefenceAttributesToDataIfNeeded(decodedResult.referenceAttributes, data);
						var card = Ext.create('CMDBuild.DummyModel', data);

						(typeof cb == 'function') ? cb(card) : me.loadCardStandardCallBack(card);
					}
				});
			} else {
				me.loadCardStandardCallBack(me.card);
			}
		},

		loadCardStandardCallBack: function(card) {
			var me = this;
			me.view.loadCard(card);
			if (card) {
				if (me.isEditable(card)) {
					if (card.get("Id") == -1 || me.cmForceEditing) {
						me.view.editMode();
						me.cmForceEditing = false;
					} else {
						me.view.displayMode(enableTBar = true);
					}
				} else {
					me.view.displayModeForNotEditableCard();
				}
			}
		},

		/**
		 * @param {Function} success
		 */
		lockCard: function(success) {
			if (CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)) {
				if (
					this.card
					&& this.card.get("Id") >= 0 // Avoid lock on card create
				) {
					CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card.lock({
						params: {
							id: this.card.get("Id")
						},
						loadMask: false,
						success: success
					});
				}
			} else {
				success();
			}
		},

		unlockCard: function() {
			if (CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)) {
				if (
					this.card
					&& this.view.isInEditing()
					&& this.card.get("Id") >= 0 // Avoid unlock on card create
				) {
					CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Card.unlock({
						params: {
							id: this.card.get("Id")
						},
						loadMask: false
					});
				}
			}
		},

		isEditable: function(card) {
			if (!card)
				return false;

			var privileges = CMDBuild.core.Utils.getEntryTypePrivileges(_CMCache.getEntryTypeById(card.get('IdClass')));

			return (privileges.create);
		},

		onAbortCardClick: function() {
			if (this.card && this.card.get("Id") == -1) {
				this.onCardSelected(null);
			} else {
				this.onCardSelected(this.card);
			}

			this.fireEvent(this.CMEVENTS.abortedModify);
		},

		onModifyCardClick: function() {
			var me = this;

			// If wanna clone the card skip the locking
			if (this.cloneCard && this.isEditable(this.card)) {
				me.loadCard(true, null, function() { // Force card load before entering in edit mode
					me.view.editMode();
				});
			} else {
				if (this.isEditable(this.card)) {
					var me = this;

					this.lockCard(function() {
						me.loadCard(true, null, function() { // Force card load before entering in edit mode
							me.view.editMode();
						});
					});
				}
			}
		},

		onSaveCardClick: function() {
			var me = this;

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cloneCard ? -1 : this.card.get("Id");
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(this.card.get("IdClass"));
			addDataFromCardDataPoviders(me, params);

			if (thereAraNotWrongAttributes(me)) {
				this.doFormSubmit(params);
			}
		},

		onShowGraphClick: function() {
			this.controllerWindowGraph.cmfg('onPanelGridAndFormGraphWindowConfigureAndShow', {
				classId: this.card.get("IdClass"),
				cardId: this.card.get("Id")
			});
		},

		onWidgetButtonClick: function(w) {
			if (this.widgetControllerManager) {
				this.widgetControllerManager.onWidgetButtonClick(w);
			}
		},

		setWidgetManager: function(wm) {
			this.widgetManager = wm;
		},

		// widgetManager delegate
		ensureEditPanel: function() {
			this.view.ensureEditPanel();
		}
	});

	function buildWidgetControllers(card) {
		if (this.widgetControllerManager) {
			this.widgetControllerManager.buildControllers(card);
		}
	}

	function addDataFromCardDataPoviders(me, params) {
		for (var provider in me.cardDataProviders) {
			provider = me.cardDataProviders[provider];
			if (typeof provider.getCardData == "function") {
				var values = provider.getCardData(params);
				if (values) {
					params[provider.getCardDataName()] = values;
				}
			}
		}

		return params;
	}

	function thereAraNotWrongAttributes(me) {
		var form = me.view.getForm();
		var invalidAttributes = CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.StaticsController.getInvalidAttributeAsHTML(form);
		if (invalidAttributes != null) {
			var msg = Ext.String.format("<p class=\"{0}\">{1}</p>", CMDBuild.core.constants.Global.getErrorMsgCss(), CMDBuild.Translation.errors.invalid_attributes);
			CMDBuild.core.Message.error(null, msg + invalidAttributes, false);
			return false;
		} else {
			return true;
		}
	}

	function addRefenceAttributesToDataIfNeeded(referenceAttributes, data) {
		// the referenceAttributes are like this:
		//	referenceAttributes: {
		//		referenceName: {
		//			firstAttr: 32,
		//			secondAttr: "Foo"
		//		},
		//		secondReference: {...}
		//	}
		var ra = referenceAttributes;
		if (ra) {
			for (var referenceName in ra) {
				var attrs = ra[referenceName];
				for (var attribute in attrs) {
					data["_" + referenceName + "_" + attribute] = attrs[attribute];
				}
			}
		}
	}

})();
