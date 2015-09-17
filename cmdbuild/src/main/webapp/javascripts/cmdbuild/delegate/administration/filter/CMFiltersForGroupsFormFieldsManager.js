(function() {

	var ENTRY_TYPE = _CMProxy.parameter.ENTRY_TYPE;
	var FILTER = _CMProxy.parameter.FILTER;

	Ext.define('CMDBuild.delegate.common.field.CMFilterChooserWindowDelegate', {
		/**
		 * @params {CMDBuild.view.common.field.CMFilterChooserWindow} filterWindow - the window that call the delegate
		 * @params {Ext.data.Model} filter - the selected record
		 */
		onCMFilterChooserWindowRecordSelect: function(filterWindow, filter) {}
	});

	Ext.define('CMDBuild.delegate.administration.common.dataview.CMFiltersForGroupsFormFieldsManager', {
		extend: 'CMDBuild.delegate.administration.common.basepanel.CMBaseFormFiledsManager',

		mixins: {
			delegable: 'CMDBuild.core.CMDelegable'
		},

		constructor: function() {
			this.mixins.delegable.constructor.call(this, 'CMDBuild.delegate.administration.common.dataview.CMFilterDataViewFormDelegate');

			this.callParent(arguments);
		},

		/**
		 * @return {array} an array of Ext.component to use as form items
		 */
		build: function() {
			var me = this;

			var fields = this.callParent(arguments);

			Ext.apply(this.description, {
				translationsKeyType: 'Filter',
				translationsKeyField: 'Description'
			});

			this.classes = Ext.create('CMDBuild.field.ErasableCombo', {
				fieldLabel: CMDBuild.Translation.targetClass,
				labelWidth: CMDBuild.LABEL_WIDTH,
				width: CMDBuild.ADM_BIG_FIELD_WIDTH,
				name: ENTRY_TYPE,
				valueField: CMDBuild.core.constants.Proxy.NAME,
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				editable: false,

				store: _CMCache.getClassesAndProcessesAndDahboardsStore(),
				queryMode: 'local',

				listeners: {
					select: function(combo, records, options) {
						var className = null;

						if (Ext.isArray(records) && records.length > 0) {
							var record = records[0];

							className = record.get(me.classes.valueField);
						}

						me.callDelegates('onFilterDataViewFormBuilderClassSelected', [me, className]);
					}
				}
			});

			this.filterChooser = Ext.create('CMDBuild.view.common.field.CMFilterChooser', {
				fieldLabel: CMDBuild.Translation.filter,
				labelWidth: CMDBuild.LABEL_WIDTH,
				name: FILTER,
				filterTabToEnable: {
					attributeTab: true,
					relationTab: true,
					functionTab: false
				}
			});

			this.defaultForGroups = Ext.create('CMDBuild.view.common.field.CMGroupSelectionList', {
				name: CMDBuild.core.constants.Proxy.DEFAULT_FOR_GROUPS,
				fieldLabel: CMDBuild.Translation.defaultForGroups,
				height: 300,
				valueField: CMDBuild.core.constants.Proxy.NAME,
				labelWidth: CMDBuild.LABEL_WIDTH,
				maxWidth: CMDBuild.ADM_BIG_FIELD_WIDTH,
				anchor: '100%'
			});

			fields.push(this.classes);
			fields.push(this.filterChooser);
			fields.push(this.defaultForGroups);

			return fields;
		},

		setFilterChooserClassName: function(className) {
			this.filterChooser.setClassName(className);
		},

		/**
		 *
		 * @param {Ext.data.Model} record - the record to use to fill the field values
		 *
		 * @override
		 */
		loadRecord: function(record) {
			this.callParent(arguments);

			var className = record.get(ENTRY_TYPE);

			this.filterChooser.setFilter(record);
			this.classes.setValue(className);

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID);

			_CMProxy.Filter.getDefaults({
				params: params,
				scope: this,
				success: function(result, options, decodedResult) {
					decodedResult = decodedResult.response.elements;

					this.defaultForGroups.setValue(decodedResult);
				}
			});

			// The set value programmatic does not fire the select event, so call the delegates manually
			Ext.apply(this.description, {
				translationsKeyName: record.get(CMDBuild.core.constants.Proxy.NAME)
			});

			this.callDelegates('onFilterDataViewFormBuilderClassSelected', [this, className]);
		},

		/**
		 * @return {object} values - a key/value map with the values of the fields
		 *
		 * @override
		 */
		getValues: function() {
			var values = this.callParent(arguments);

			values[ENTRY_TYPE] = this.classes.getValue();
			var filter = this.filterChooser.getFilter();

			if (filter)
				values[FILTER] = filter;

			values[CMDBuild.core.constants.Proxy.DEFAULT_FOR_GROUPS] = this.defaultForGroups.getValue();

			return values;
		},

		/**
		 * Clear the values of his fields
		 *
		 * @override
		 */
		reset: function() {
			this.callParent(arguments);

			this.classes.reset();
			this.filterChooser.reset();
		}
	});

})();