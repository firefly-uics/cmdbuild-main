(function () {

	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
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
			'onDataViewFilterFormCardAddTabNoteButtonClick',
			'onDataViewFilterFormCardCloneTabNoteButtonClick',
			'onDataViewFilterFormTabNoteSaveButtonClick',
			'onDataViewFilterFormTabNoteShow',
			'onDataViewFilterFormTabNoteUiUpdate'
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
		buildForm: function () {
			if (this.cmfg('dataViewFilterUiViewModeIsEdit'))
				return this.buildFormModeEdit();

			return this.buildFormModeRead();
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeEdit: function () {
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
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('dataViewFilterSelectedCardIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note.lock({
					params: params,
					scope: parameters.scope,
					success: Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn
				});
			} else if (Ext.isFunction(parameters.callback)) {
				Ext.callback(parameters.callback, parameters.scope);
			}
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
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('dataViewFilterSelectedCardIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note.unlock({
					params: params,
					scope: parameters.scope,
					success: Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn
				});
			} else if (Ext.isFunction(parameters.callback)) {
				Ext.callback(parameters.callback, parameters.scope);
			}
		},

		/**
		 * Card panel button event
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormCardAddTabNoteButtonClick: function () {
			this.view.disable();
		},

		/**
		 * Card panel button event
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormCardCloneTabNoteButtonClick: function () {
			this.view.disable();
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
						params[CMDBuild.core.constants.Proxy.ID] = params[CMDBuild.core.constants.Proxy.CARD_ID];

						this.cmfg('dataViewFilterUiUpdate', {
							cardId: params[CMDBuild.core.constants.Proxy.CARD_ID],
							className: params[CMDBuild.core.constants.Proxy.CLASS_NAME],
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

			if (this.cmfg('dataViewFilterUiViewModeIsEdit'))
				return this.itemLock({
					scope: this,
					callback: this.showEventCallback
				});

			return this.itemUnlock({
				scope: this,
				callback: this.showEventCallback
			});
		},

		/**
		 * Enable disable tab based on selection validity
		 *
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteUiUpdate: function () {
			this.view.setDisabled(this.cmfg('dataViewFilterSelectedCardIsEmpty'));
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		showEventCallback: function () {
			this.buildForm();

			this.form.getForm().setValues(this.cmfg('dataViewFilterSelectedCardGet', [CMDBuild.core.constants.Proxy.VALUES]));

			this.view.panelFunctionModifyStateSet({
				forceToolbarTopState: !( // TODO: check
					!this.cmfg('dataViewFilterUiViewModeIsEdit')
					&& this.cmfg('dataViewFilterSourceEntryTypeGet', [
						CMDBuild.core.constants.Proxy.PERMISSIONS,
						CMDBuild.core.constants.Proxy.WRITE
					])
				),
				state: this.cmfg('dataViewFilterUiViewModeIsEdit')
			});
		}
	});

})();
