(function() {

	var tr = CMDBuild.Translation.administration.tasks.errorMessages;

	Ext.define('CMDBuild.controller.administration.tasks.CMTasksFormConnectorController', {
		extend: 'CMDBuild.controller.administration.tasks.CMTasksFormBaseController',

		/**
		 * @property {Array} array of all step delegates
		 */
		delegateStep: undefined,

		/**
		 * @property {CMDBuild.controller.administration.tasks.CMTasksController}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Int}
		 */
		selectedId: undefined,

		/**
		 * @property {Ext.selection.Model}
		 */
		selectionModel: undefined,

		/**
		 * @cfg {String}
		 */
		taskType: 'connector',

		/**
		 * @property {CMDBuild.view.administration.tasks.CMTasksForm}
		 */
		view: undefined,

		/**
		 * Gatherer function to catch events
		 *
		 * @param {String} name
		 * @param {Object} param
		 * @param {Function} callback
		 *
		 * @override
		 */
		cmOn: function(name, param, callBack) {
			switch (name) {
				case 'onAbortButtonClick':
					return this.onAbortButtonClick();

				case 'onAddButtonClick':
					return this.onAddButtonClick(name, param, callBack);

				case 'onClassSelected':
					this.onClassSelected(param.className);

				case 'onCloneButtonClick':
					return this.onCloneButtonClick();

				case 'onModifyButtonClick':
					return this.onModifyButtonClick();

				case 'onRemoveButtonClick':
					return this.onRemoveButtonClick();

				case 'onRowSelected':
					return this.onRowSelected();

				case 'onSaveButtonClick':
					return this.onSaveButtonClick();

				default: {
					if (!Ext.isEmpty(this.parentDelegate))
						return this.parentDelegate.cmOn(name, param, callBack);
				}
			}
		},

		/**
		 * Filter class store to delete unselected classes
		 *
		 * @return {Object} store
		 */
		getStoreFilteredClass: function() {
			var selectedClassArray = this.delegateStep[3].getSelectedClassArray();
			var store = Ext.create('Ext.data.Store', {
				autoLoad: true,
				fields: [CMDBuild.core.proxy.CMProxyConstants.NAME],
				data: []
			});

			for (var item in selectedClassArray) {
				var bufferObj = {};

				bufferObj[CMDBuild.core.proxy.CMProxyConstants.NAME] = selectedClassArray[item];

				store.add(bufferObj);
			}

			return store;
		},

		/**
		 * Filter source store to delete unselected views
		 *
		 * @return {Object} store
		 */
		getStoreFilteredSource: function() {
			var selectedSourceArray = this.delegateStep[3].getSelectedSourceArray();
			var store = Ext.create('Ext.data.Store', {
				autoLoad: true,
				fields: [CMDBuild.core.proxy.CMProxyConstants.NAME],
				data: []
			});

			for (var item in selectedSourceArray) {
				var bufferObj = {};

				bufferObj[CMDBuild.core.proxy.CMProxyConstants.NAME] = selectedSourceArray[item];

				store.add(bufferObj);
			}

			return store;
		},

		/**
		 * @override
		 */
		onRowSelected: function() {
			if (this.selectionModel.hasSelection()) {
				this.selectedId = this.selectionModel.getSelection()[0].get(CMDBuild.core.proxy.CMProxyConstants.ID);

				// Selected task asynchronous store query
				this.selectedDataStore = CMDBuild.core.proxy.CMProxyTasks.get(this.taskType);
				this.selectedDataStore.load({
					scope: this,
					params: {
						id: this.selectedId
					},
					callback: function(records, operation, success) {
						if (!Ext.isEmpty(records)) {
							var record = records[0];

							this.parentDelegate.loadForm(this.taskType);

							// HOPING FOR A FIX: loadRecord() fails with comboboxes, and i can't find a working fix, so i must set all fields manually

							// Set step1 [0] datas
							this.delegateStep[0].setValueActive(record.get(CMDBuild.core.proxy.CMProxyConstants.ACTIVE));
							this.delegateStep[0].setValueDescription(record.get(CMDBuild.core.proxy.CMProxyConstants.DESCRIPTION));
							this.delegateStep[0].setValueId(record.get(CMDBuild.core.proxy.CMProxyConstants.ID));
							this.delegateStep[0].setValueNotificationAccount(record.get(CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_EMAIL_ACCOUNT));
							this.delegateStep[0].setValueNotificationFieldsetCheckbox(record.get(CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_ACTIVE));
							this.delegateStep[0].setValueNotificationTemplateError(record.get(CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_EMAIL_TEMPLATE_ERROR));

							// Set step2 [1] datas
							this.delegateStep[1].setValueAdvancedFields(record.get(CMDBuild.core.proxy.CMProxyConstants.CRON_EXPRESSION));
							this.delegateStep[1].setValueBase(record.get(CMDBuild.core.proxy.CMProxyConstants.CRON_EXPRESSION));

							// Set step3 [2] datas
							this.delegateStep[2].setValueDataSourceConfiguration(
								record.get(CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_TYPE),
								record.get(CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_CONFIGURATION)
							);

							// Set step4 [3] datas
							this.delegateStep[3].setData(record.get(CMDBuild.core.proxy.CMProxyConstants.CLASS_MAPPING));

							// Set step5 [4] datas
							this.delegateStep[4].setData(record.get(CMDBuild.core.proxy.CMProxyConstants.ATTRIBUTE_MAPPING));

							// Set step6 [5] datas

							this.view.disableModify(true);
						}
					}
				});

				this.parentDelegate.changeItem(0);
			}
		},

		/**
		 * @override
		 */
		onSaveButtonClick: function() {
			var formData = this.view.getData(true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.proxy.CMProxyConstants.ACTIVE])) {
				CMDBuild.LoadMask.get().show();

				// Fieldset submitting filter to avoid to send datas if fieldset are collapsed
					var notificationFieldsetCheckboxValue = this.delegateStep[0].getValueNotificationFieldsetCheckbox();
					if (notificationFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_ACTIVE] = notificationFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_EMAIL_ACCOUNT] = formData[CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_EMAIL_ACCOUNT];
						submitDatas[CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_EMAIL_TEMPLATE_ERROR] = formData[CMDBuild.core.proxy.CMProxyConstants.NOTIFICATION_EMAIL_TEMPLATE_ERROR];
					}

				submitDatas[CMDBuild.core.proxy.CMProxyConstants.CRON_EXPRESSION] = this.delegateStep[1].getCronDelegate().getValue();

				// Form submit values formatting
					var dataSourceType = this.delegateStep[2].getTypeDataSource();
					if (dataSourceType) {
						var configurationObject = {};

						switch (dataSourceType) {
							case 'db': {
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_ADDRESS] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_ADDRESS];
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_NAME] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_NAME];
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_PASSWORD] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_PASSWORD];
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_PORT] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_PORT];
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_TYPE] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_TYPE];
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_USERNAME] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_USERNAME];
								configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_TABLE_VIEW_PREFIX] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_TABLE_VIEW_PREFIX];

								if (!Ext.isEmpty(formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_INSATANCE_NAME]))
									configurationObject[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_INSATANCE_NAME] = formData[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_DB_INSATANCE_NAME];
							} break;

							default:
								_debug('CMTasksFormConnectorController: onSaveButtonClick() datasource type not recognized');
						}

						submitDatas[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_TYPE] = dataSourceType;
						submitDatas[CMDBuild.core.proxy.CMProxyConstants.DATASOURCE_CONFIGURATION] = Ext.encode(configurationObject);
					}

					var classMappingData = this.delegateStep[3].getData();
					if (!Ext.isEmpty(classMappingData))
						submitDatas[CMDBuild.core.proxy.CMProxyConstants.CLASS_MAPPING] = Ext.encode(classMappingData);

					var attributeMappingData = this.delegateStep[4].getData();
					if (!Ext.isEmpty(attributeMappingData))
						submitDatas[CMDBuild.core.proxy.CMProxyConstants.ATTRIBUTE_MAPPING] = Ext.encode(attributeMappingData);

				// Data filtering to submit only right values
				submitDatas[CMDBuild.core.proxy.CMProxyConstants.ACTIVE] = formData[CMDBuild.core.proxy.CMProxyConstants.ACTIVE];
				submitDatas[CMDBuild.core.proxy.CMProxyConstants.DESCRIPTION] = formData[CMDBuild.core.proxy.CMProxyConstants.DESCRIPTION];
				submitDatas[CMDBuild.core.proxy.CMProxyConstants.ID] = formData[CMDBuild.core.proxy.CMProxyConstants.ID];

				if (Ext.isEmpty(formData[CMDBuild.core.proxy.CMProxyConstants.ID])) {
					CMDBuild.core.proxy.CMProxyTasks.create({
						type: this.taskType,
						params: submitDatas,
						scope: this,
						success: this.success,
						callback: this.callback
					});
				} else {
					CMDBuild.core.proxy.CMProxyTasks.update({
						type: this.taskType,
						params: submitDatas,
						scope: this,
						success: this.success,
						callback: this.callback
					});
				}
			}
		},

		/**
		 * Task validation
		 *
		 * @param {Boolean} enable
		 *
		 * @return {Boolean}
		 *
		 * @override
		 */
		validate: function(enable) {
			// Notification validation
			this.delegateStep[0].getNotificationDelegate().validate(
				this.delegateStep[0].getValueNotificationFieldsetCheckbox()
				&& enable
			);

			// Cron field validation
			this.delegateStep[1].getCronDelegate().validate(enable);

			// DataSource configuration validation
			this.delegateStep[2].validate(enable);

			// Class-mapping validation
			if (Ext.isEmpty(this.delegateStep[3].getData()) && enable) {
				CMDBuild.Msg.error(CMDBuild.Translation.common.failure, tr.taskConnector.emptyClassLevelMapping, false);

				this.delegateStep[3].markInvalidTable("x-grid-invalid");

				return false;
			} else {
				this.delegateStep[3].markValidTable("x-grid-invalid");
			}

			// Attribute-mapping validation
			if (Ext.isEmpty(this.delegateStep[4].getData()) && enable) {
				CMDBuild.Msg.error(CMDBuild.Translation.common.failure, tr.taskConnector.emptyAttributeLevelMapping, false);

				this.delegateStep[4].markInvalidTable("x-grid-invalid");

				return false;
			} else {
				this.delegateStep[4].markValidTable("x-grid-invalid");
			}

			// Reference-mapping validation
			// TODO: future implementation
//			if (Ext.isEmpty(this.delegateStep[5].getData()) && enable) {
//				CMDBuild.Msg.error(CMDBuild.Translation.common.failure, tr.taskConnector.emptyReferenceLevelMapping, false);
//
//				return false;
//			}

			return this.callParent(arguments);
		},

		/**
		 * Function to validate single step grids deleting invalid fields
		 *
		 * @param {Object} gridStore
		 */
		validateStepGrid: function(gridStore) {
			if (gridStore.count() > 0) {
				gridStore.each(function(record, id) {
					if (
						!Ext.isEmpty(record.get(CMDBuild.core.proxy.CMProxyConstants.CLASS_NAME))
						&& !Ext.Array.contains(this.delegateStep[3].getSelectedClassArray(), record.get(CMDBuild.core.proxy.CMProxyConstants.CLASS_NAME))
					)
						record.set(CMDBuild.core.proxy.CMProxyConstants.CLASS_NAME, '');

					if (
						!Ext.isEmpty(record.get(CMDBuild.core.proxy.CMProxyConstants.SOURCE_NAME))
						&& !Ext.Array.contains(this.delegateStep[3].getSelectedSourceArray(), record.get(CMDBuild.core.proxy.CMProxyConstants.SOURCE_NAME))
					)
						record.set(CMDBuild.core.proxy.CMProxyConstants.SOURCE_NAME, '');
				}, this);
			}
		}
	});

})();