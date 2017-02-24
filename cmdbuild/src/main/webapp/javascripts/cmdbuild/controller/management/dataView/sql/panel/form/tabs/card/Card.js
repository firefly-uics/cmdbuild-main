(function () {

	Ext.define('CMDBuild.controller.management.dataView.sql.panel.form.tabs.card.Card', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.sql.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewSqlFormTabCardReset',
			'dataViewSqlFormTabCardShow',
			'dataViewSqlFormTabCardUiUpdate'
		],

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.form.tabs.card.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.sql.panel.form.tabs.card.CardView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.sql.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.sql.panel.form.tabs.card.CardView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildForm: function () {
			if (this.cmfg('dataViewSqlUiViewModeEquals', 'edit'))
				return this.buildFormModeEdit();

			return this.buildFormModeRead();
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeEdit: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('buildFormModeEdit(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewSqlSelectedDataSourceIsEmpty'))
					return _error('buildFormModeEdit(): empty selected dataSource property', this, this.cmfg('dataViewSqlSelectedDataSourceGet'));
			// END: Error handling

			var fieldDefinition = [],
				fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
				dataSourceOutputAttributes = this.cmfg('dataViewSqlSelectedDataSourceGet', CMDBuild.core.constants.Proxy.OUTPUT);

			Ext.Array.forEach(dataSourceOutputAttributes, function (attributeModel, i, allAttributeModels) {
				if (Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel))
					if (fieldManager.isAttributeManaged(attributeModel.get(CMDBuild.core.constants.Proxy.TYPE))) {
						fieldManager.attributeModelSet(attributeModel);
						fieldManager.push(fieldDefinition, fieldManager.buildField());
					} else {
						_error('buildFormModeEdit(): unmanaged attribute model', this, attributeModel);
					}
			}, this);

			if (!Ext.isEmpty(fieldDefinition))
				this.form.add(fieldDefinition);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormModeRead: function () {
			// Error handling
				if (this.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('buildFormModeRead(): empty selected dataView property', this, this.cmfg('dataViewSelectedDataViewGet'));

				if (this.cmfg('dataViewSqlSelectedDataSourceIsEmpty'))
					return _error('buildFormModeRead(): empty selected dataSource property', this, this.cmfg('dataViewSqlSelectedDataSourceGet'));
			// END: Error handling

			var fieldDefinition = [],
				fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
				dataSourceOutputAttributes = this.cmfg('dataViewSqlSelectedDataSourceGet', CMDBuild.core.constants.Proxy.OUTPUT);

			Ext.Array.forEach(dataSourceOutputAttributes, function (attributeModel, i, allAttributeModels) {
				if (Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel))
					if (fieldManager.isAttributeManaged(attributeModel.get(CMDBuild.core.constants.Proxy.TYPE))) {
						fieldManager.attributeModelSet(attributeModel);
						fieldManager.push(fieldDefinition, fieldManager.buildField({ readOnly: true }));
					} else {
						_error('buildFormModeRead(): unmanaged attribute model', this, attributeModel);
					}
			}, this);

			if (!Ext.isEmpty(fieldDefinition))
				this.form.add(fieldDefinition);
		},

		/**
		 * @returns {Void}
		 */
		dataViewSqlFormTabCardReset: function () {
			this.form.removeAll();
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		dataViewSqlFormTabCardShow: function () {
			if (!this.cmfg('dataViewSelectedDataViewIsEmpty') && !this.cmfg('dataViewSqlSelectedCardIsEmpty')) {
				// FIXME: future implementation
				// History record save
				//CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
				//	moduleId: this.cmfg('dataViewIdentifierGet'),
				//	entryType: {
				//		description: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
				//		id: this.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
				//		object: this.cmfg('dataViewSelectedDataViewGet')
				//	},
				//	item: {
				//		description: this.cmfg('dataViewSqlSelectedCardGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
				//			|| this.cmfg('dataViewSqlSelectedCardGet', CMDBuild.core.constants.Proxy.CODE),
				//		id: this.cmfg('dataViewSqlSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
				//		object: this.cmfg('dataViewSqlSelectedCardGet')
				//	},
				//	section: {
				//		description: this.view.title,
				//		object: this.view
				//	}
				//});

				this.buildForm();

				this.form.getForm().setValues(this.cmfg('dataViewSqlSelectedCardGet', CMDBuild.core.constants.Proxy.VALUES));
			}
		},

		/**
		 * @returns {Void}
		 */
		dataViewSqlFormTabCardUiUpdate: function () {
			// UI view mode manage
			switch (this.cmfg('dataViewSqlUiViewModeGet')) {
				case 'add':
					return this.view.enable();

				default:
					return this.view.setDisabled(this.cmfg('dataViewSqlSelectedCardIsEmpty'));
			}
		}
	});

})();
