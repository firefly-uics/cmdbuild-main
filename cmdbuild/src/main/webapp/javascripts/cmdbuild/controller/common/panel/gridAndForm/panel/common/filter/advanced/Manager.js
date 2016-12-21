(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityGet
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelGridAndFormCommonFilterAdvancedManagerAddButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedManagerCloneButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedManagerModifyButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedManagerRemoveButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedManagerSaveButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedManagerViewShow',
			'panelGridAndFormCommonFilterAdvancedManagerSave',
			'panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet',
			'panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty',
			'panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet',
			'panelGridAndFormCommonFilterAdvancedManagerStoreIsEmpty',
			'panelGridAndFormCommonFilterAdvancedManagerViewClose',
			'panelGridAndFormCommonFilterAdvancedManagerViewShow'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.FilterEditor}
		 */
		controllerFilterEditor: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.SaveDialog}
		 */
		controllerSaveDialog: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter}
		 *
		 * @private
		 */
		selectedFilter: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.ManagerWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.manager.ManagerWindow', { delegate: this });

			// Build sub-controllers
			this.controllerFilterEditor = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.FilterEditor', { parentDelegate: this });
			this.controllerSaveDialog = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.SaveDialog', { parentDelegate: this});

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManagerAddButtonClick: function () {
			var emptyFilterObject = {};
			emptyFilterObject[CMDBuild.core.constants.Proxy.ENTRY_TYPE] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);
			emptyFilterObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.newSearchFilter;

			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', { value: emptyFilterObject }); // Manual save call (with empty data)

			this.controllerFilterEditor.getView().show();
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManagerCloneButtonClick: function (filter) {
			// Error handling
				if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter))
					return _error('onPanelGridAndFormCommonFilterAdvancedManagerCloneButtonClick(): unmanaged filter parameter', this, filter);
			// END: Error handling

			var clonedFilterObject = filter.getData();
			clonedFilterObject[CMDBuild.core.constants.Proxy.ID] = null;
			clonedFilterObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.copyOf + ' ' + filter.get(CMDBuild.core.constants.Proxy.NAME);

			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', { value: clonedFilterObject }); // Manual save call (with cloned data)

			this.controllerFilterEditor.getView().show();
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManagerModifyButtonClick: function (filter) {
			// Error handling
				if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter))
					return _error('onPanelGridAndFormCommonFilterAdvancedManagerModifyButtonClick(): unmanaged filter parameter', this, filter);
			// END: Error handling

			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', { value: filter }); // Manual save call (with filter data)

			this.controllerFilterEditor.getView().show();
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManagerRemoveButtonClick: function (filter) {
			Ext.MessageBox.confirm(
				CMDBuild.Translation.attention,
				CMDBuild.Translation.common.confirmpopup.areyousure,
				function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem(filter);
				},
				this
			);
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManagerSaveButtonClick: function (filter) {
			// Error handling
				if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter))
					return _error('onPanelGridAndFormCommonFilterAdvancedManagerSaveButtonClick(): unmanaged filter parameter', this, filter);
			// END: Error handling

			// Remove name and description to force save dialog show
			var filterObject = filter.getData();
			delete filterObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
			delete filterObject[CMDBuild.core.constants.Proxy.NAME];

			this.cmfg('panelGridAndFormCommonFilterAdvancedLocalFilterRemove', filter);
			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', { value: filterObject }); // Manual save call (with filter data)
			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSave');
		},

		/**
		 * On show event define window details:
		 * 	- reset selections
		 * 	- set correct position
		 * 	- add event to manage view outside click manage
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedManagerViewShow: function () {
			if (this.grid.getSelectionModel().hasSelection())
				this.grid.getSelectionModel().deselectAll();

			var buttonBox = this.cmfg('panelGridAndFormCommonFilterAdvancedViewGet').getBox();

			if (!Ext.isEmpty(buttonBox))
				this.view.setPosition(buttonBox.x, buttonBox.y + buttonBox.height);

			Ext.getBody().on('click', this.onViewOutsideClick, this); // Outside click manage
		},

		/**
		 * Hide on outside click
		 *
		 * @param {Object} e
		 * @param {Object} t
		 * @param {Object} eOpts
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		onViewOutsideClick: function (e, t, eOpts) {
			var el = this.view.getEl();

			if (!(el.dom === t || el.contains(t))) {
				Ext.getBody().un('click', this.onViewOutsideClick, this);

				this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleStateReset');
				this.view.close();
			}
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter} filter
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function (filter) {
			// Error handling
				if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter))
					return _error('removeItem(): unmanaged filter parameter', this, filter);
			// END: Error handling

			this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose');

			if (Ext.isEmpty(filter.get(CMDBuild.core.constants.Proxy.ID))) { // Remove from local storage
				if (filter.get(CMDBuild.core.constants.Proxy.ID) == this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.ID))
					this.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick');

				this.cmfg('panelGridAndFormCommonFilterAdvancedLocalFilterRemove', filter);
				this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet');
				this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewShow');
			} else { // Remove from server
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = filter.get(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						if (filter.get(CMDBuild.core.constants.Proxy.ID) == this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.ID))
							this.cmfg('onPanelGridAndFormCommonFilterAdvancedClearButtonClick');

						this.cmfg('panelGridAndFormCommonFilterAdvancedManageToggleButtonLabelSet');
						this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewShow');
					}
				});
			}
		},

		/**
		 * @param {Boolean} enableApply
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		saveActionManage: function (enableApply) {
			enableApply = Ext.isBoolean(enableApply) ? enableApply : false;

			// Error handling
				if (this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty'))
					return _error('saveActionManage(): empty selected filter', this, this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet'));
			// END: Error handling

			var filter = this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet');

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = filter.get(CMDBuild.core.constants.Proxy.ENTRY_TYPE); // FIXME: i read entryType and write className (rename)
			params[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.encode(filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION));
			params[CMDBuild.core.constants.Proxy.DESCRIPTION] = filter.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
			params[CMDBuild.core.constants.Proxy.NAME] = filter.get(CMDBuild.core.constants.Proxy.NAME);

			if (Ext.isEmpty(filter.get(CMDBuild.core.constants.Proxy.ID))) {
				CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager.create({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.FILTER];

						if (Ext.isObject(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							this.controllerSaveDialog.cmfg('onPanelGridAndFormCommonFilterAdvancedSaveDialogAbortButtonClick'); // Close save dialog view
							this.controllerFilterEditor.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
							this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose'); // Close manager view

							if (enableApply) { // Apply filter to store
								this.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterSelect', Ext.create('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', decodedResponse));
								this.panelGridAndFormCommonFilterAdvancedManagerSelectedFilterReset();
							} else { // Otherwise reopen manager window
								this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewShow');
							}
						} else {
							_error('saveActionManage(): unmanaged create response', this, decodedResponse);
						}
					}
				});
			} else {
				params[CMDBuild.core.constants.Proxy.ID] = filter.get(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						// FIXME: hack as workaround, should be fixed on server side returning all saved filter object
						decodedResponse = params;
						decodedResponse[CMDBuild.core.constants.Proxy.ENTRY_TYPE] = decodedResponse[CMDBuild.core.constants.Proxy.CLASS_NAME];
						decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.decode(decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION]);

						if (Ext.isObject(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							this.controllerSaveDialog.cmfg('onPanelGridAndFormCommonFilterAdvancedSaveDialogAbortButtonClick'); // Close save dialog view
							this.controllerFilterEditor.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
							this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewClose'); // Close manager view

							if (enableApply) {// Apply filter to store
								this.cmfg('onPanelGridAndFormCommonFilterAdvancedFilterSelect', Ext.create('CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter', decodedResponse));
								this.panelGridAndFormCommonFilterAdvancedManagerSelectedFilterReset();
							} else { // Otherwise reopen manager window
								this.cmfg('panelGridAndFormCommonFilterAdvancedManagerViewShow');
							}
						} else {
							_error('saveActionManage(): unmanaged update response', this, decodedResponse);
						}
					}
				});
			}
		},

		/**
		 * SelectedFilter property methods
		 *
		 * Not real selected filter, is just filter witch FilterEditor will manage.
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			panelGridAndFormCommonFilterAdvancedManagerSelectedFilterReset: function () {
				this.propertyManageReset('selectedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.gridAndForm.panel.common.filter.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.enableApply
		 * @param {Boolean} parameters.enableSaveDialog
		 *
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedManagerSave: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enableApply = Ext.isBoolean(parameters.enableApply) ? parameters.enableApply : false;
			parameters.enableSaveDialog = Ext.isBoolean(parameters.enableSaveDialog) ? parameters.enableSaveDialog : true;

			// Error handling
				if (this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty'))
					return _error(
						'panelGridAndFormCommonFilterAdvancedManagerSave(): cannot save empty filter',
						this,
						this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet')
					);
			// END: Error handling

			if (parameters.enableSaveDialog)
				return this.controllerSaveDialog.cmfg('panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow', { enableApply: parameters.enableApply });

			return this.saveActionManage(parameters.enableApply);
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedManagerStoreIsEmpty: function () {
			return this.grid.getStore().count() == 0;
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedManagerViewClose: function () {
			this.view.close();
		},

		/**
		 * Shows and configures manager or filter window before evaluation after filter grid load (acts like beforeshow event)
		 *
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedManagerViewShow: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({
				params: params,
				scope: this,
				callback: function (records, operation, success) {
					if (success) {
						// Add local cached filters to store
						if (!this.cmfg('panelGridAndFormCommonFilterAdvancedLocalFilterIsEmpty')) {
							this.grid.getStore().add(this.cmfg('panelGridAndFormCommonFilterAdvancedLocalFilterGet'));
							this.grid.getStore().sort();
						}

						if (this.grid.getStore().count() == 0) {
							this.cmfg('onPanelGridAndFormCommonFilterAdvancedManagerAddButtonClick');
						} else {
							this.view.show();
						}
					}
				}
			});
		}
	});

})();
