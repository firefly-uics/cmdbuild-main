(function () {

	/**
	 * @link CMDBuild.controller.management.workflow.panel.form.tabs.Note
	 */
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
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
			'onDataViewFilterFormTabNoteAbortButtonClick',
			'onDataViewFilterFormTabNoteAddButtonClick',
			'onDataViewFilterFormTabNoteCardSelect',
			'onDataViewFilterFormTabNoteInstanceSelect',
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
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterFormTabNoteReset: function () {
			this.view.panelFunctionReset();
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
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
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
					success: parameters.callback
				});
			} else {
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
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
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
					success: parameters.callback
				});
			} else {
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
		onDataViewFilterFormTabNoteAbortButtonClick: function () {
			if (!this.cmfg('dataViewFilterSelectedCardIsEmpty')) {
				this.cmfg('onDataViewFilterFormTabNoteShow');
			} else {
				this.itemUnlock({
					scope: this,
					callback: function () {
						this.viewModeSet('read');

						this.view.panelFunctionReset();
						this.view.panelFunctionModifyStateSet({ state: false });
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteAddButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteCardSelect: function () {
			this.view.enable();
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteInstanceSelect: function () {
			this.view.enable();
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteModifyButtonClick: function () {
			this.itemLock({
				scope: this,
				callback: function () {
					this.viewModeSet('edit');

					this.view.panelFunctionModifyStateSet({ state: true });
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteSaveButtonClick: function () {
			if (this.validate(this.view)) {
				var params = {};
				params['Notes'] = this.view.htmlField.getValue();
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CLASS_NAME);

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Note.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						params[CMDBuild.core.constants.Proxy.ID] = params[CMDBuild.core.constants.Proxy.CARD_ID];

						this.cmfg('dataViewFilterUiUpdate', {
							cardId: params[CMDBuild.core.constants.Proxy.CARD_ID],
							className: params[CMDBuild.core.constants.Proxy.CLASS_NAME],
							tabToSelect: this.view
						});
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onDataViewFilterFormTabNoteShow: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('onDataViewFilterFormTabNoteShow(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('onDataViewFilterFormTabNoteShow(): empty selected card property', this, this.cmfg('dataViewFilterSelectedCardGet'));
			// END: Error handling

			this.view.panelFunctionReset();

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

			this.itemUnlock({
				scope: this,
				callback: function () {
					var notes = this.cmfg('dataViewFilterSelectedCardGet', [CMDBuild.core.constants.Proxy.VALUES, 'Notes']);

					this.view.htmlField.setValue(notes);
					this.view.displayField.setValue(notes);

					this.viewModeSet('read');

					this.view.panelFunctionModifyStateSet({
						forceToolbarTopState: !this.cmfg('dataViewFilterSourceEntryTypeGet', [
							CMDBuild.core.constants.Proxy.PERMISSIONS,
							CMDBuild.core.constants.Proxy.WRITE
						]),
						state: false,
					});
				}
			});
		},

		/**
		 * @param {String} mode
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		viewModeSet: function (mode) {
			switch (mode) {
				case 'edit':
					return this.view.getLayout().setActiveItem(this.view.panelModeEdit);

				case 'read':
				default:
					return this.view.getLayout().setActiveItem(this.view.panelModeRead);
			}
		}
	});

})();
