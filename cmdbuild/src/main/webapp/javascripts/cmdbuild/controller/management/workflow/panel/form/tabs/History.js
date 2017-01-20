(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.History', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.proxy.management.workflow.panel.form.tabs.History'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * Attributes to hide
		 *
		 * @cfg {Array}
		 *
		 * @private
		 */
		attributesKeysToFilter: [
			'Id',
			'IdClass',
			'IdClass_value',
			CMDBuild.core.constants.Proxy.BEGIN_DATE,
			CMDBuild.core.constants.Proxy.CLASS_NAME,
			CMDBuild.core.constants.Proxy.USER
		],

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowFormTabHistoryIncludeSystemActivitiesCheck',
			'onWorkflowFormTabHistoryRowExpand',
			'onWorkflowFormTabHistoryShow = onWorkflowFormTabHistoryIncludeRelationCheck',
			'workflowFormTabHistoryReset',
			'workflowFormTabHistoryUiUpdate'
		],

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.history.GridPanel}
		 */
		grid: undefined,

		/**
		 * @cfg {Array}
		 *
		 * @private
		 */
		managedStatuses: ['ABORTED', 'COMPLETED', 'OPEN', 'SUSPENDED', 'TERMINATED'],

		/**
		 * @cfg {Object}
		 *
		 * Ex. {
		 *		ABORTED: '...',
		 *		COMPLETED: '...',
		 *		OPEN: '...',
		 *		SUSPENDED: '...',
		 *		TERMINATED: '...'
		 *	}
		 *
		 * @private
		 */
		statusTranslationObject: {},

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.history.HistoryView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.history.HistoryView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;

			this.statusBuildTranslationObject( ); // Build status translation object from lookup
		},

		/**
		 * Adds clear and re-apply filters functionalities
		 *
		 * @param {Array or Object} itemsToAdd
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		clearStoreAdd: function (itemsToAdd) {
			itemsToAdd = Ext.isArray(itemsToAdd) ? Ext.Array.clean(itemsToAdd) : Ext.Array.clean([itemsToAdd]);

			this.grid.getStore().clearFilter();
			this.grid.getStore().loadData(Ext.Array.merge(this.grid.getStore().getRange(), itemsToAdd));

			this.cmfg('onWorkflowFormTabHistoryIncludeSystemActivitiesCheck');
		},

		/**
		 * Adds current card to history store for a better visualization of differences from last history record and current one. As last function called on store build
		 * collapses all rows on store load.
		 *
		 * It's implemented with ugly workarounds because of server side ugly code.
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		currentInstanceStoreAdd: function () {
			var performers = [],
				selectedEntityAttributes = {};

			// Filter selectedEntity's attributes values to avoid the display of incorrect data
			Ext.Object.each(this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.VALUES), function (key, value, myself) {
				if (!Ext.Array.contains(this.attributesKeysToFilter, key) && key.indexOf('_') != 0)
					selectedEntityAttributes[key] = value;
			}, this);

			this.valuesFormattingAndCompare(selectedEntityAttributes); // Formats values only

			// Build performers array
			Ext.Array.forEach(this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST), function (activityObject, i, array) {
				if (!Ext.isEmpty(activityObject[CMDBuild.core.constants.Proxy.PERFORMER_NAME]))
					performers.push(activityObject[CMDBuild.core.constants.Proxy.PERFORMER_NAME]);
			}, this);

			var currentInstanceModel = {};
			currentInstanceModel[CMDBuild.core.constants.Proxy.ACTIVITY_NAME] = this.cmfg('workflowSelectedInstanceGet', 'Code');
			currentInstanceModel[CMDBuild.core.constants.Proxy.BEGIN_DATE] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.BEGIN_DATE);
			currentInstanceModel[CMDBuild.core.constants.Proxy.ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
			currentInstanceModel[CMDBuild.core.constants.Proxy.PERFORMERS] = performers;
			currentInstanceModel[CMDBuild.core.constants.Proxy.STATUS] = this.statusTranslationGet(this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS));
			currentInstanceModel[CMDBuild.core.constants.Proxy.USER] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.USER);
			currentInstanceModel[CMDBuild.core.constants.Proxy.VALUES] = selectedEntityAttributes;

			this.clearStoreAdd(Ext.create('CMDBuild.model.management.workflow.panel.form.tabs.history.CardRecord', currentInstanceModel));

			this.getRowExpanderPlugin().collapseAll();
		},

		/**
		 * @param {CMDBuild.model.classes.tabs.history.CardRecord} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		currentInstanceRowExpand: function (record) {
			var predecessorRecord = this.grid.getStore().getAt(1), // Get expanded record predecessor record
				selectedEntityAttributes = {};

			// Filter selectedEntity's attributes values to avoid the display of incorrect data
			Ext.Object.each(this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.VALUES), function (key, value, myself) {
				if (!Ext.Array.contains(this.attributesKeysToFilter, key) && key.indexOf('_') != 0)
					selectedEntityAttributes[key] = value;
			}, this);

			if (!Ext.isEmpty(predecessorRecord)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = predecessorRecord.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.management.workflow.panel.form.tabs.History.readHistoric({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.valuesFormattingAndCompare(selectedEntityAttributes, decodedResponse.response[CMDBuild.core.constants.Proxy.VALUES]);

						// Setup record property with historic card details to use XTemplate functionalities to render
						record.set(CMDBuild.core.constants.Proxy.VALUES, selectedEntityAttributes);
					}
				});
			}
		},

		/**
		 * Finds same type (card or relation) current record predecessor
		 *
		 * @param {CMDBuild.model.management.workflow.panel.form.tabs.history.RelationRecord} record
		 *
		 * @returns {CMDBuild.model.management.workflow.panel.form.tabs.history.RelationRecord} predecessor or null
		 *
		 * @private
		 */
		getRecordPredecessor: function (record) {
			var i = this.grid.getStore().indexOf(record) + 1,
				predecessor = null;

			if (Ext.isObject(record) && !Ext.Object.isEmpty(record))
				while (i < this.grid.getStore().getCount() && Ext.isEmpty(predecessor)) {
					var inspectedRecord = this.grid.getStore().getAt(i);

					if (
						!Ext.isEmpty(inspectedRecord)
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
		 * @returns {CMDBuild.view.management.common.tabs.history.RowExpander} or null
		 *
		 * @private
		 */
		getRowExpanderPlugin: function () {
			var rowExpanderPlugin = null;

			if (!Ext.isEmpty(this.grid.plugins) && Ext.isArray(this.grid.plugins))
				Ext.Array.forEach(this.grid.plugins, function (plugin, i, allPlugins) {
					if (plugin instanceof Ext.grid.plugin.RowExpander)
						rowExpanderPlugin = plugin;
				});

			return rowExpanderPlugin;
		},

		/**
		 * Include or not System activities rows in history grid
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabHistoryIncludeSystemActivitiesCheck: function () {
			this.getRowExpanderPlugin().collapseAll();

			if (this.grid.includeSystemActivitiesCheckbox.getValue()) { // Checked: Remove any filter from store
				if (this.grid.getStore().isFiltered()) {
					this.grid.getStore().clearFilter();
					this.grid.getStore().sort(); // Resort store because clearFilter() breaks it
				}
			} else { // Unchecked: Apply filter to hide 'System' activities rows
				this.grid.getStore().filterBy(function (record, id) {
					return record.get(CMDBuild.core.constants.Proxy.USER).indexOf('system') < 0; // System user name
				}, this);
			}
		},

		/**
		 * @param {CMDBuild.model.classes.tabs.history.CardRecord or CMDBuild.model.management.workflow.panel.form.tabs.history.RelationRecord} record
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabHistoryRowExpand: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onWorkflowFormTabHistoryRowExpand(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};

			if (record.get(CMDBuild.core.constants.Proxy.IS_CARD)) { // Card row expand
				if (this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID) == record.get(CMDBuild.core.constants.Proxy.ID)) { // Expanding current card
					this.currentInstanceRowExpand(record);
				} else {
					params[CMDBuild.core.constants.Proxy.CARD_ID] = record.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

					CMDBuild.proxy.management.workflow.panel.form.tabs.History.readHistoric({ // Get expanded card data
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							var cardValuesObject = decodedResponse.response[CMDBuild.core.constants.Proxy.VALUES];
							var predecessorRecord = this.getRecordPredecessor(record);

							if (!Ext.isEmpty(predecessorRecord)) {
								var predecessorParams = {};
								predecessorParams[CMDBuild.core.constants.Proxy.CARD_ID] = predecessorRecord.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
								predecessorParams[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

								CMDBuild.proxy.management.workflow.panel.form.tabs.History.readHistoric({ // Get expanded predecessor's card data
									params: predecessorParams,
									scope: this,
									success: function (response, options, decodedResponse) {
										decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

										this.valuesFormattingAndCompare(cardValuesObject, decodedResponse[CMDBuild.core.constants.Proxy.VALUES]);

										// Setup record property with historic card details to use XTemplate functionalities to render
										record.set(CMDBuild.core.constants.Proxy.VALUES, cardValuesObject);
									}
								});
							} else {
								this.valuesFormattingAndCompare(cardValuesObject); // Formats values only

								// Setup record property with historic card details to use XTemplate functionalities to render
								record.set(CMDBuild.core.constants.Proxy.VALUES, cardValuesObject);
							}
						}
					});
				}
			} else { // Relation row expand
				params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID); // Historic relation ID
				params[CMDBuild.core.constants.Proxy.DOMAIN] = record.get(CMDBuild.core.constants.Proxy.DOMAIN);

				CMDBuild.proxy.management.workflow.panel.form.tabs.History.readHistoricRelation({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						// Setup record property with historic relation details to use XTemplate functionalities to render
						record.set(CMDBuild.core.constants.Proxy.VALUES, this.valuesFormattingAndCompareRelation(decodedResponse)); // Formats values only
					}
				});
			}
		},

		/**
		 * Reloads store to be consistent with includeRelationsCheckbox state
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabHistoryShow: function () {
			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('onWorkflowFormTabHistoryShow(): empty selected workflow property', this, this.cmfg('workflowSelectedWorkflowGet'));

				if (this.cmfg('workflowSelectedInstanceIsEmpty'))
					return _error('onWorkflowFormTabHistoryShow(): empty selected instance property', this, this.cmfg('workflowSelectedInstanceGet'));
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({
				params: params,
				scope: this,
				callback: function (records, operation, success) {
					this.getRowExpanderPlugin().collapseAll();

					// History record save
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: CMDBuild.core.constants.ModuleIdentifiers.getWorkflow(),
						entryType: {
							description: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
							id: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
							object: this.cmfg('workflowSelectedWorkflowGet')
						},
						item: {
							description: null, // Instances hasn't description property so display ID and no description
							id: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
							object: this.cmfg('workflowSelectedInstanceGet')
						},
						section: {
							description: this.view.title,
							object: this.view
						}
					});

					// UI view mode manage
					switch (this.parentDelegate.cmfg('workflowUiViewModeGet')) {
						case 'add':
							return this.view.disable();
					}

					if (this.grid.includeRelationsCheckbox.getValue()) {
						CMDBuild.proxy.management.workflow.panel.form.tabs.History.readRelations({
							params: params,
							loadMask: false,
							scope: this,
							success: function (response, options, decodedResponse) {
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ELEMENTS];

								if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
									var referenceElementsModels = [];

									// Build reference models
									Ext.Array.forEach(decodedResponse, function (element, i, allElements) {
										referenceElementsModels.push(Ext.create('CMDBuild.model.management.workflow.panel.form.tabs.history.RelationRecord', element));
									});

									this.clearStoreAdd(referenceElementsModels);
								}

								this.currentInstanceStoreAdd();
							}
						});
					} else {
						this.currentInstanceStoreAdd();
					}
				}
			});
		},

		// Status translation management
			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			statusBuildTranslationObject: function () {
				var params = {};
				params[CMDBuild.core.constants.Proxy.TYPE] = 'FlowStatus';
				params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
				params[CMDBuild.core.constants.Proxy.SHORT] = false;

				CMDBuild.proxy.management.workflow.panel.form.tabs.History.readLookups({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS];

						if (!Ext.isEmpty(decodedResponse) && Ext.isArray(decodedResponse))
							Ext.Array.forEach(decodedResponse, function (lookup, i, array) {
								switch (lookup['Code']) {
									case CMDBuild.core.constants.WorkflowStates.getAborted(): {
										this.statusTranslationObject['ABORTED'] = lookup['Description'];
									} break;

									case CMDBuild.core.constants.WorkflowStates.getCompleted(): {
										this.statusTranslationObject['COMPLETED'] = lookup['Description'];
									} break;

									case CMDBuild.core.constants.WorkflowStates.getOpen(): {
										this.statusTranslationObject['OPEN'] = lookup['Description'];
									} break;

									case CMDBuild.core.constants.WorkflowStates.getSuspended(): {
										this.statusTranslationObject['SUSPENDED'] = lookup['Description'];
									} break;
								}
							}, this);
					}
				});
			},

			/**
			 * @param {String} status
			 *
			 * @returns {String or null}
			 *
			 * @private
			 */
			statusTranslationGet: function (status) {
				if (Ext.Array.contains(this.managedStatuses, status))
					return this.statusTranslationObject[status];

				return null;
			},

		/**
		 * If value1 is different than value2 modified is true, false otherwise. Strips also HTML tags from "description".
		 *
		 * @param {Object} object1 - currently expanded record
		 * @param {Object} object2 - predecessor record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		valuesFormattingAndCompare: function (object1, object2) {
			object1 = object1 || {};
			object2 = object2 || {};

			if (!Ext.isEmpty(object1) && Ext.isObject(object1)) {
				Ext.Object.each(object1, function (key, value, myself) {
					var changed = false;

					// Get attribute's index and description
					var attributeDescription = this.cmfg('workflowSelectedWorkflowAttributesGet', {
							name: key,
							property: CMDBuild.core.constants.Proxy.DESCRIPTION
						}),
						attributeIndex = this.cmfg('workflowSelectedWorkflowAttributesGet', {
							name: key,
							property: CMDBuild.core.constants.Proxy.INDEX
						});

					// Build object1 properties models
					var attributeValues = Ext.isObject(value) ? value : { description: value };
					attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeDescription;
					attributeValues[CMDBuild.core.constants.Proxy.INDEX] = attributeIndex;

					object1[key] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', attributeValues);

					// Build object2 properties models
					if (!Ext.Object.isEmpty(object2)) {
						if (!object2.hasOwnProperty(key))
							object2[key] = null;

						attributeValues = Ext.isObject(object2[key]) ? object2[key] : { description: object2[key] };
						attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeDescription;
						attributeValues[CMDBuild.core.constants.Proxy.INDEX] = attributeIndex;

						object2[key] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', attributeValues);
					}

					changed = Ext.Object.isEmpty(object2) ? false : !Ext.Object.equals(object1[key].getData(), object2[key].getData());

					object1[key].set(CMDBuild.core.constants.Proxy.CHANGED, changed);
				}, this);
			}
		},

		/**
		 * @param {Object} relationObject
		 *
		 * @returns {Object} formattedObject
		 *
		 * @private
		 */
		valuesFormattingAndCompareRelation: function (relationObject) {
			var formattedObject = {};

			if (Ext.isObject(relationObject) && !Ext.Object.isEmpty(relationObject)) {
				formattedObject[CMDBuild.core.constants.Proxy.DOMAIN] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.domain,
					description: relationObject[CMDBuild.core.constants.Proxy.DOMAIN],
					index: 0
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_CLASS] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.classLabel,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_CLASS],
					index: 1
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_CODE] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.code,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_CODE],
					index: 2
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_DESCRIPTION] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.descriptionLabel,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_DESCRIPTION],
					index: 3
				});

				// Merge values property to object
				Ext.Object.each(relationObject[CMDBuild.core.constants.Proxy.VALUES], function (key, value, myself) {
					// Build object1 properties models
					var attributeValues = Ext.isObject(value) ? value : { description: value };
					attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = his.cmfg('workflowSelectedWorkflowAttributesGet', {
						name: key,
						property: CMDBuild.core.constants.Proxy.DESCRIPTION
					});
					attributeValues[CMDBuild.core.constants.Proxy.INDEX] = this.cmfg('workflowSelectedWorkflowAttributesGet', {
						name: key,
						property: CMDBuild.core.constants.Proxy.INDEX
					});

					formattedObject[key] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', attributeValues);
				}, this);
			}

			return Ext.Object.isEmpty(formattedObject) ? relationObject : formattedObject;
		},

		/**
		 * @returns {Void}
		 */
		workflowFormTabHistoryReset: function () {
			this.grid.getStore().removeAll();

			this.view.disable();
		},

		/**
		 * Enable/Disable tab selection based
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		workflowFormTabHistoryUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('workflowUiViewModeGet')) {
				case 'add':
					return this.view.disable();

				default:
					return this.view.setDisabled(this.cmfg('workflowSelectedInstanceIsEmpty'));
			}
		}
	});

})();
