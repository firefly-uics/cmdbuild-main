(function () {

	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.History', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewFilterFormTabHistoryReset',
			'dataViewFilterFormTabHistoryUiUpdate',
			'onDataViewFilterFormTabHistoryPanelShow = onDataViewFilterFormTabHistoryIncludeRelationCheck', // Reloads store to be consistent with includeRelationsCheckbox state
			'onDataViewFilterFormTabHistoryRowExpand'
		],

		/**
		 * Attributes to hide
		 *
		 * @cfg {Array}
		 *
		 * @private
		 */
		filteredAttributeNames: [
			'Id',
			'IdClass',
			'IdClass_value',
			CMDBuild.core.constants.Proxy.BEGIN_DATE,
			CMDBuild.core.constants.Proxy.CLASS_NAME,
			CMDBuild.core.constants.Proxy.ID,
			CMDBuild.core.constants.Proxy.USER,
			CMDBuild.core.constants.Proxy.VALUES
		],

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.tabs.history.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.tabs.history.HistoryView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.filter.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.history.HistoryView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * Adds current card to history store for a better visualization of differences from last history record and current one. As last function called on store build
		 * collapses all rows on store load.
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		addCurrentCardToStore: function () {
			this.getRowExpanderPlugin().collapseAll();

			var currentCardObject = {};
			currentCardObject[CMDBuild.core.constants.Proxy.BEGIN_DATE] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.BEGIN_DATE);
			currentCardObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);
			currentCardObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			currentCardObject[CMDBuild.core.constants.Proxy.USER] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.USER);
			currentCardObject[CMDBuild.core.constants.Proxy.VALUES] = this.formatAndCompare(this.getFilteredSelectedCardValues()); // Formats values only

			this.clearStoreAdd(Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord', currentCardObject));
		},

		/**
		 * Clear store and re-add all records to avoid RowExpander plugin bug that happens with store add action that won't manage correctly expand/collapse events
		 *
		 * @param {Array} items
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		clearStoreAdd: function (items) {
			items = Ext.isArray(items) ? Ext.Array.clean(items) : Ext.Array.clean([items]);

			if (!Ext.isEmpty(items))
				this.grid.getStore().loadData(Ext.Array.merge(this.grid.getStore().getRange(), items));
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterFormTabHistoryReset: function () {
			this.view.setDisabled(this.cmfg('dataViewFilterSelectedCardIsEmpty'));
		},

		/**
		 * Enable/Disable tab selection based
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		dataViewFilterFormTabHistoryUiUpdate: function () {
			// Ui view mode manage
			switch (this.parentDelegate.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.view.disable();

				case 'clone':
					return this.view.disable();

				default:
					return this.view.setDisabled(this.cmfg('dataViewFilterSelectedCardIsEmpty'));
			}
		},

		/**
		 * If subjectValue is different than toCompareVvalue modified is true, false otherwise
		 *
		 * @param {Object} subjectObject
		 * @param {Object} toCompareObject
		 *
		 * @returns {Object} resultObject
		 *
		 * @private
		 */
		formatAndCompare: function (subjectObject, toCompareObject) {
			subjectObject = Ext.isObject(subjectObject) ? Ext.clone(subjectObject) : {};
			toCompareObject = Ext.isObject(toCompareObject) ? Ext.clone(toCompareObject) : {};

			var resultObject = subjectObject;

			if (Ext.isObject(subjectObject) && !Ext.Object.isEmpty(subjectObject))
				Ext.Object.each(subjectObject, function (key, value, myself) {
					var attributeModel = this.cmfg('dataViewFilterSelectedCardAttributesGet', key),
						changed = false;

					// Build subjectObject properties models
					var subjectObjectValues = Ext.isObject(value) ? value : { description: value };
					subjectObjectValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeModel.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
					subjectObjectValues[CMDBuild.core.constants.Proxy.INDEX] = attributeModel.get(CMDBuild.core.constants.Proxy.INDEX);

					resultObject[key] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', subjectObjectValues);

					// Build toCompareObject properties models
					if (Ext.isObject(toCompareObject) && !Ext.Object.isEmpty(toCompareObject)) {
						if (Ext.isEmpty(toCompareObject[key]))
							toCompareObject[key] = null;

						var toCompareObjectValues = Ext.isObject(toCompareObject[key]) ? toCompareObject[key] : { description: toCompareObject[key] };
						toCompareObjectValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeModel.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
						toCompareObjectValues[CMDBuild.core.constants.Proxy.INDEX] = attributeModel.get(CMDBuild.core.constants.Proxy.INDEX);

						toCompareObject[key] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', toCompareObjectValues);
					}

					changed = Ext.Object.isEmpty(toCompareObject) ? false : !Ext.Object.equals(subjectObject[key].getData(), toCompareObject[key].getData());

					resultObject[key].set(CMDBuild.core.constants.Proxy.CHANGED, changed);
				}, this);

			return resultObject;
		},

		/**
		 * @param {Object} relationObject
		 *
		 * @returns {Object} formattedObject
		 *
		 * @private
		 */
		formatAndCompareRelation: function (relationObject) {
			var formattedObject = {};

			if (Ext.isObject(relationObject) && !Ext.Object.isEmpty(relationObject)) {
				formattedObject[CMDBuild.core.constants.Proxy.DOMAIN] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.domain,
					description: relationObject[CMDBuild.core.constants.Proxy.DOMAIN],
					index: 0
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_CLASS] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.classLabel,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_CLASS],
					index: 1
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_CODE] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.code,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_CODE],
					index: 2
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_DESCRIPTION] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.descriptionLabel,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_DESCRIPTION],
					index: 3
				});

				// Merge values property to object
				Ext.Object.each(relationObject[CMDBuild.core.constants.Proxy.VALUES], function (key, value, myself) {
					var attributeModel = this.cmfg('dataViewFilterSelectedCardAttributesGet', key);

					// Build relationObject properties models
					if (Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel)) {
						var attributeValues = Ext.isObject(value) ? value : { description: value };
						attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeModel.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
						attributeValues[CMDBuild.core.constants.Proxy.INDEX] = attributeModel.get(CMDBuild.core.constants.Proxy.INDEX);

						formattedObject[key] = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.Attribute', attributeValues);
					}
				}, this);
			}

			return Ext.Object.isEmpty(formattedObject) ? relationObject : formattedObject;
		},

		/**
		 * @returns {Object} filteredValues
		 *
		 * @private
		 */
		getFilteredSelectedCardValues: function () {
			var filteredValues = {},
				values = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.VALUES);

			Ext.Object.each(values, function (name, valueObject, myself) {
				if (!Ext.Array.contains(this.filteredAttributeNames, name) && name.indexOf('_') != 0)  {
					var attributeModel = this.cmfg('dataViewFilterSelectedCardAttributesGet', name);

					if (Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel) && !attributeModel.get(CMDBuild.core.constants.Proxy.HIDDEN))
						filteredValues[name] = valueObject;
				}
			}, this);

			return filteredValues;
		},

		/**
		 * Finds same type (card or relation) record predecessor
		 *
		 * @param {CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord or CMDBuild.model.management.dataView.filter.panel.form.tabs.history.RelationRecord} record
		 *
		 * @returns {CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord or CMDBuild.model.management.dataView.filter.panel.form.tabs.history.RelationRecord or null} predecessor
		 *
		 * @private
		 */
		getPredecessorRecord: function (record) {
			var i = this.grid.getStore().indexOf(record) + 1,
				predecessor = null;

			if (Ext.isObject(record) && !Ext.Object.isEmpty(record))
				while (i < this.grid.getStore().getCount() && Ext.isEmpty(predecessor)) {
					var inspectedRecord = this.grid.getStore().getAt(i);

					if (
						Ext.isObject(inspectedRecord) && !Ext.Object.isEmpty(inspectedRecord)
						&& record.get(CMDBuild.core.constants.Proxy.IS_CARD) == inspectedRecord.get(CMDBuild.core.constants.Proxy.IS_CARD)
						&& record.get(CMDBuild.core.constants.Proxy.IS_RELATION) == inspectedRecord.get(CMDBuild.core.constants.Proxy.IS_RELATION)
					) {
						predecessor = inspectedRecord;
					}

					i = i + 1;
				}

			return predecessor;
		},

		/**
		 * @returns {CMDBuild.view.management.dataView.filter.panel.form.tabs.history.RowExpander or null}
		 *
		 * @private
		 */
		getRowExpanderPlugin: function () {
			return this.grid.getPlugin('dataViewFilterFormTabHistoryRowExpander');
		},

		/**
		 * Loads store and if includeRelationsCheckbox is checked fills store with relations rows
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormTabHistoryPanelShow: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('onDataViewFilterFormTabHistoryPanelShow(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('onDataViewFilterFormTabHistoryPanelShow(): empty selected card property', this, this.cmfg('dataViewFilterSelectedCardGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);

			this.grid.getStore().load({
				params: params,
				scope: this,
				callback: function (records, operation, success) {
					this.addCurrentCardToStore();

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

					// Ui view mode manage
					switch (this.parentDelegate.cmfg('dataViewFilterUiViewModeGet')) {
						case 'add':
							return this.view.disable();

						case 'clone':
							return this.view.disable();
					}

					if (this.grid.includeRelationsCheckbox.getValue())
						CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History.readRelations({
							params: params,
							loadMask: false,
							scope: this,
							success: function (response, options, decodedResponse) {
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ELEMENTS];

								if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
									var referenceElementsModels = [];

									// Build reference records
									Ext.Array.forEach(decodedResponse, function (cardObject, i, allCardObjects) {
										if (Ext.isObject(cardObject) && !Ext.Object.isEmpty(cardObject))
											referenceElementsModels.push(
												Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.RelationRecord', cardObject)
											);
									});

									this.clearStoreAdd(referenceElementsModels);
								}
							}
						});
				}
			});
		},

		/**
		 * @param {CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord or CMDBuild.model.management.dataView.filter.panel.form.tabs.history.RelationRecord} record
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormTabHistoryRowExpand: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onDataViewFilterFormTabHistoryRowExpand(): unmanaged record parameter', this, record);
			// END: Error handling

			if (record.get(CMDBuild.core.constants.Proxy.IS_CARD)) {
				if (this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID) == record.get(CMDBuild.core.constants.Proxy.ID))
					return this.rowExpandCardCurrent(record);

				return this.rowExpandCardHistoric(record);
			}

			return this.rowExpandRelation(record);
		},

		/**
		 * @param {CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		rowExpandCardCurrent: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record) || !record.get(CMDBuild.core.constants.Proxy.IS_CARD))
					return _error('rowExpandCardCurrent(): unmanaged record parameter', this, record);
			// END: Error handling

			var predecessorRecord = this.getPredecessorRecord(record);

			if (Ext.isObject(predecessorRecord) && !Ext.Object.isEmpty(predecessorRecord)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = predecessorRecord.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History.readHistoric({ // Get expanded predecessor's card data
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							// Setup record property with historic card details to use XTemplate functionalities to render
							record.set(
								CMDBuild.core.constants.Proxy.VALUES,
								this.formatAndCompare(
									this.getFilteredSelectedCardValues(),
									decodedResponse[CMDBuild.core.constants.Proxy.VALUES]
								)
							);
						} else {
							_error('rowExpandCardHistoric(): unmanaged response', this, decodedResponse);
						}
					}
				});
			}
		},

		/**
		 * @param {CMDBuild.model.management.dataView.filter.panel.form.tabs.history.CardRecord} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		rowExpandCardHistoric: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record) || !record.get(CMDBuild.core.constants.Proxy.IS_CARD))
					return _error('rowExpandCardHistoric(): unmanaged record parameter', this, record);
			// END: Error handling

			this.view.setLoading(true);

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = record.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);

			CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History.readHistoric({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						var historicCard = Ext.create('CMDBuild.model.management.dataView.filter.panel.form.tabs.history.HistoricCard', decodedResponse),
							predecessorRecord = this.getPredecessorRecord(record);

						if (Ext.isObject(predecessorRecord) && !Ext.Object.isEmpty(predecessorRecord)) {
							params[CMDBuild.core.constants.Proxy.CARD_ID] = predecessorRecord.get(CMDBuild.core.constants.Proxy.ID);

							CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History.readHistoric({ // Get expanded predecessor's card data
								params: params,
								loadMask: false,
								scope: this,
								success: function (response, options, decodedResponse) {
									decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

									if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
										this.view.setLoading(false);

										// Setup record property with historic card details to use XTemplate functionalities to render
										record.set(
											CMDBuild.core.constants.Proxy.VALUES,
											this.formatAndCompare(
												historicCard.get(CMDBuild.core.constants.Proxy.VALUES),
												decodedResponse[CMDBuild.core.constants.Proxy.VALUES]
											)
										);
									} else {
										_error('rowExpandCardHistoric(): unmanaged response', this, decodedResponse);
									}
								}
							});
						} else {
							this.view.setLoading(false);

							// Setup record property with historic card details to use XTemplate functionalities to render
							record.set(
								CMDBuild.core.constants.Proxy.VALUES,
								this.formatAndCompare(historicCard.get(CMDBuild.core.constants.Proxy.VALUES)) // Formats values only
							);
						}
					} else {
						_error('rowExpandCardHistoric(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {CMDBuild.model.management.dataView.filter.panel.form.tabs.history.RelationRecord} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		rowExpandRelation: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record) || !record.get(CMDBuild.core.constants.Proxy.IS_RELATION))
					return _error('rowExpandRelation(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.DOMAIN] = record.get(CMDBuild.core.constants.Proxy.DOMAIN);
			params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID);

			CMDBuild.proxy.management.dataView.filter.panel.form.tabs.History.readHistoricRelation({
				params: params,
				loadMask: this.view,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						// Setup record property with historic relation details to use XTemplate functionalities to render
						record.set(CMDBuild.core.constants.Proxy.VALUES, this.formatAndCompareRelation(decodedResponse)); // Formats values only
					} else {
						_error('rowExpandRelation(): unmanaged response', this, decodedResponse);
					}
				}
			});
		}
	});

})();
