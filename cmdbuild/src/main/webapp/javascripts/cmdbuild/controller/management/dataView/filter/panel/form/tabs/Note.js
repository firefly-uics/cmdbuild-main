(function () {

	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WidgetType',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewFilterFormTabNoteReset',
			'dataViewFilterFormTabNoteUiUpdate',
			'dataViewFilterFormTabNoteValueGet',
			'onDataViewFilterFormTabNoteAbortButtonClick',
			'onDataViewFilterFormTabNoteBackButtonClick',
			'onDataViewFilterFormTabNoteModifyButtonClick',
			'onDataViewFilterFormTabNoteSaveButtonClick',
			'onDataViewFilterFormTabNoteShow'
		],

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.tabs.note.NoteView}
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

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.note.NoteView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeEdit: function () {
			this.form.removeAll(false);
			this.form.add(
				Ext.create('CMDBuild.view.common.field.HtmlEditor', {
					name: 'Notes',
					border: false,
					hideLabel: true
				})
			);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeRead: function () {
			this.form.removeAll(false);
			this.form.add(
				Ext.create('Ext.container.Container', {
					border: false,
					cls: 'cmdb-blue-panel-no-padding',
					frame: false,
					overflowY: 'auto',

					items: [
						Ext.create('Ext.form.field.Display', {
							disablePanelFunctions: true,
							name: 'Notes',
							padding: '5px'
						})
					]
				})
			);
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterFormTabNoteReset: function () {
			this.form.removeAll(false);

			this.view.disable();
		},

		/**
		 * Enable disable tab based on selection validity
		 *
		 * @returns {Void}
		 */
		dataViewFilterFormTabNoteUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.view.setDisabled(
						!this.cmfg('dataViewFilterFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote())
						&& false // NOTE: view disabled because implementation similar to workflow's one
					);

				case 'clone':
					return this.view.setDisabled(
						!this.cmfg('dataViewFilterFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote())
						&& false // NOTE: view disabled because implementation similar to workflow's one
					);

				default:
					return this.view.setDisabled(this.cmfg('dataViewFilterSelectedCardIsEmpty'));
			}
		},

		/**
		 * @returns {String}
		 */
		dataViewFilterFormTabNoteValueGet: function () {
			return this.view.panelFunctionValueGet({ propertyName: 'Notes' });
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		formModeEditSetup: function () {
			this.buildFormModeEdit();

			this.form.getForm().setValues(this.cmfg('dataViewFilterSelectedCardGet', [CMDBuild.core.constants.Proxy.VALUES]));

			this.view.panelFunctionModifyStateSet({ state: true });
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		formModeReadSetup: function () {
			this.buildFormModeRead();

			this.form.getForm().setValues(this.cmfg('dataViewFilterSelectedCardGet', [CMDBuild.core.constants.Proxy.VALUES]));

			this.view.panelFunctionModifyStateSet({
				forceToolbarTopState: !(
					this.cmfg('dataViewFilterFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote())
					&& this.cmfg('dataViewFilterSourceEntryTypeGet', [
						CMDBuild.core.constants.Proxy.PERMISSIONS,
						CMDBuild.core.constants.Proxy.WRITE
					])
				),
				state: false
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		itemLock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('dataViewFilterSelectedCardIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);

				return CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note.lock({
					params: params,
					scope: parameters.scope,
					success: parameters.callback
				});
			}

			return Ext.callback(parameters.callback, parameters.scope);
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		itemUnlock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('dataViewFilterSelectedCardIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);

				return CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note.unlock({
					params: params,
					scope: parameters.scope,
					success: parameters.callback
				});
			}

			return Ext.callback(parameters.callback, parameters.scope);
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteAbortButtonClick: function () {
			this.itemUnlock({
				scope: this,
				callback: this.formModeReadSetup
			});
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteBackButtonClick: function () {
			this.cmfg('dataViewFilterFormTabActiveSet');
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteModifyButtonClick: function () {
			if (this.cmfg('dataViewFilterFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()))
				return this.itemLock({
					scope: this,
					callback: this.formModeEditSetup
				});

			return this.itemUnlock({
				scope: this,
				callback: this.formModeReadSetup
			});
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteSaveButtonClick: function () {
			if (this.validate(this.form)) {
				CMDBuild.core.LoadMask.show();

				var params = {};
				params['Notes'] = this.view.panelFunctionDataGet({ target: this.form });
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note.update({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('dataViewUiUpdate', {
							cardId: this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
							entityId: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
							tabToSelect: this.view,
							callback: function () {
								CMDBuild.core.LoadMask.hide();
							}
						});
					}
				});
			}
		},

		/**
		 * Performance optimization to avoid to do all computation on UiUpdate action
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteShow: function () {
			var previousValue = this.cmfg('dataViewFilterFormTabNoteValueGet');

			this.form.removeAll(false);

			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('onDataViewFilterFormTabNoteShow(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('onDataViewFilterFormTabNoteShow(): empty selected card property', this, this.cmfg('dataViewFilterSelectedCardGet'));
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

			// Buttons setup
			this.view.buttonBack.setVisible(
				this.cmfg('dataViewFilterFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote())
				&& false // NOTE: button disabled because implementation similar to workflow's one
			);

			this.itemUnlock({
				scope: this,
				callback: this.formModeReadSetup
			});
		}
	});

})();
