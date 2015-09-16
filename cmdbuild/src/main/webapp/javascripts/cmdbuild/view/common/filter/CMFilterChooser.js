(function() {

	Ext.define('CMDBuild.delegate.common.filter.CMFilterChooserWindowDelegate', {
		alternateClassName: 'CMDBuild.delegate.common.field.CMFilterChooserWindowDelegate', // Legacy class name
		/**
		 * @params {CMDBuild.view.common.field.CMFilterChooserWindow} filterWindow - the window that call the delegate
		 * @params {Ext.data.Model} filter -the selected record
		 */
		onCMFilterChooserWindowRecordSelect: function(filterWindow, filter) {}
	});

	Ext.define('CMDBuild.view.common.filter.CMFilterChooserWindow', {
		alternateClassName: 'CMDBuild.view.common.field.CMFilterChooserWindow', // Legacy class name
		extend: 'CMDBuild.view.management.common.filter.CMFilterWindow',

		mixins: {
			delegable: 'CMDBuild.core.CMDelegable'
		},

		layout: 'border',

		// Configuration
			className: '',
			firstShowDetectEvent: 'activate',
			saveButtonText: CMDBuild.Translation.common.buttons.confirm,
			abortButtonText: CMDBuild.Translation.common.buttons.abort,

			/**
			 * To enable/disable tabs visualization
			 */
			filterTabToEnable: {
				attributeTab: true,
				relationTab: true,
				functionTab: true
			},
		// END: Configuration

		constructor: function() {
			this.mixins.delegable.constructor.call(this, 'CMDBuild.delegate.common.field.CMFilterChooserWindowDelegate');

			this.callParent(arguments);
		},

		/**
		 * @param {Object} filter
		 */
		setFilter: function(filter) {
			this.filter = filter;
			this.filterAttributesPanel.removeAllFieldsets();

			this.filterAttributesPanel.setData(this.filter.getAttributeConfiguration());
			this.filterRelationsPanel.setData(this.filter.getRelationConfiguration());
			this.filterFunctionsPanel.setData(this.filter.getFunctionConfiguration());
		},

		/**
		 * @protected
		 * @override
		 */
		buildButtons: function() {
			var me = this;

			this.buttons = [
				{
					text: me.saveButtonText,
					handler: function() {
						me.callDelegates('onCMFilterWindowSaveButtonClick', [me, me.getFilter()]);
					}
				},
				{
					text: me.abortButtonText,
					handler: function() {
						me.callDelegates('onCMFilterWindowAbortButtonClick', [me]);
					}
				}
			];
		},

		/**
		 * @protected
		 * @override
		 */
		buildItems: function() {
			this.callParent(arguments);

			this.buildGrid();

			this.tabPanel = Ext.create('Ext.tab.Panel', {
				region: 'center',
				border: false,
				items: []
			});

			// Filter tabs
			if (this.filterTabToEnable.attributeTab)
				this.tabPanel.add(this.filterAttributesPanel); // Inherited

			if (this.filterTabToEnable.relationTab)
				this.tabPanel.add(this.filterRelationsPanel); // Inherited

			if (this.filterTabToEnable.functionTab)
				this.tabPanel.add(this.filterFunctionsPanel); // Inherited

			this.items = [
				this.grid,
				this.tabPanel
			];
		},

		/**
		 * @private
		 */
		buildGrid: function() {
			var me = this;
			var store = CMDBuild.core.proxy.Filter.newSystemStore(this.className);

			this.grid = Ext.create('Ext.grid.Panel', {
				autoScroll: true,
				store: store,
				border: false,
				cls: 'cmborderbottom',
				frame: false,
				region: 'north',
				height: '40%',
				split: true,

				columns: [
					{
						header: CMDBuild.Translation.name,
						dataIndex: CMDBuild.core.constants.Proxy.NAME,
						flex: 1
					}, {
						header: CMDBuild.Translation.description_,
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						flex: 1
					}
				],

				bbar: Ext.create('Ext.toolbar.Paging', {
					store: store,
					displayInfo: true,
					displayMsg: ' {0} - {1} ' + CMDBuild.Translation.common.display_topic_of+' {2}',
					emptyMsg: CMDBuild.Translation.common.display_topic_none
				}),

				listeners: {
					itemclick: function(grid, record, item, index, e, eOpts) {
						me.callDelegates('onCMFilterChooserWindowRecordSelect', [me, record]);
					}
				}
			});
		},

		/**
		 * @protected
		 */
		setWindowTitle: function() {
			this.title = CMDBuild.Translation.views + ' - ' + CMDBuild.Translation.filterView;
		}
	});

	var SET = CMDBuild.Translation.set;
	var UNSET = CMDBuild.Translation.not_set;

	Ext.define('CMDBuild.view.common.filter.CMFilterChooser', {
		alternateClassName: 'CMDBuild.view.common.field.CMFilterChooser', // Legacy class name
		extend: 'Ext.form.FieldContainer',

		mixins: {
			filterChooserWindowDelegate: 'CMDBuild.delegate.common.field.CMFilterChooserWindowDelegate',
			filterWindow: 'CMDBuild.view.management.common.filter.CMFilterWindowDelegate'
		},

		layout: 'hbox',

		// Configuration
			/**
			 * Used to loads the right attributes when click to the button to add a new filter
			 */
			className: null,

			/**
			 * the filter selected
			 */
			filter: null,

			/**
			 * @see CMDBUild.view.common.CMFormFunctions.enableFields
			 * @see CMDBUild.view.common.CMFormFunctions.disableFields
			 */
			considerAsFieldToDisable: true,

			/**
			 * To enable/disable tabs visualization
			 */
			filterTabToEnable: {
				attributeTab: true,
				relationTab: true,
				functionTab: true
			},
		// END: Configuration

		// override
		initComponent: function() {
			var me = this;

			this.label = Ext.create('Ext.form.field.Display', {
				value: SET,
				disabledCls: 'cmdb-displayfield-disabled'
			});

			this.chooseFilterButton = Ext.create('Ext.button.Button', {
				tooltip: CMDBuild.Translation.setFilter,
				iconCls: 'privileges',
				cls: 'cmnoborder',
				style: {
					'margin-left': '5px'
				},
				scope: me,

				handler: function() {
					me.showFilterChooserPicker();
				}
			});

			this.clearFilterButton = Ext.create('Ext.button.Button', {
				tooltip: CMDBuild.Translation.clearFilter,
				iconCls: 'privilegesClear',
				cls: 'cmnoborder',
				scope: me,
				disabled: true,

				handler: function() {
					me.clearSelection();
				}
			});

			this.items = [
				this.label,
				this.chooseFilterButton,
				this.clearFilterButton
			];

			this.callParent(arguments);
		},

		showFilterChooserPicker: function() {
			var me = this;
			var className = this.className;

			if (Ext.isEmpty(className)) {
				CMDBuild.Msg.error(CMDBuild.Translation.common.failure, Ext.String.format(CMDBuild.Translation.errors.reasons.CLASS_NOTFOUND, className));

				return;
			}

			var filter = this.filter || Ext.create('CMDBuild.model.CMFilterModel', {
				entryType: className,
				local: true,
				name: CMDBuild.Translation.management.findfilter.newfilter + ' ' + _CMUtils.nextId()
			});

			var entryType = _CMCache.getEntryTypeByName(className);

			_CMCache.getAttributeList(entryType.getId(), function(attributes) {
				var filterWindow = Ext.create('CMDBuild.view.common.field.CMFilterChooserWindow', {
					filter: filter,
					attributes: attributes,
					className: className,
					filterTabToEnable: me.filterTabToEnable
				});

				filterWindow.addDelegate(me);
				filterWindow.show();
			});
		},

		clearSelection: function() {
			this.reset();
		},

		/**
		 * @param {String} className
		 */
		setClassName: function(className) {
			this.className = className;

			var filter = this.getFilter();

			if (filter && filter.getEntryType() != className)
				this.reset();
		},

		/**
		 * @param {Object} filter
		 */
		setFilter: function(filter) {
			this.filter = filter;

			if (filter == null) {
				this.label.setValue(UNSET);
				this.clearFilterButton.disable();
			} else {
				this.label.setValue(SET);
				if (!this.label.isDisabled()) {
					this.clearFilterButton.enable();
				}
			}

			this.doLayout();
		},

		reset: function() {
			this.setFilter(null);
		},

		getFilter: function() {
			return this.filter;
		},

		/**
		 * Alias getFilter()
		 *
		 * @return {Object}
		 */
		getValue: function() {
			return this.getFilter();
		},

		/**
		 * @return {Boolean}
		 */
		isValid: function() {
			return !Ext.isEmpty(this.getFilter().getConfiguration());
		},

		disable: function() {
			this.items.each(function(item) {
				item.disable();
			});

			this.callParent(arguments);
		},

		enable: function() {
			this.items.each(function(item) {
				item.enable();
			});

			this.callParent(arguments);
		},

		// as filterChooserWindowDelegate

		/**
		 * @params {CMDBuild.view.common.field.CMFilterChooserWindow} filterWindow - the window that call the delegate
		 * @params {Ext.data.Model} filter - the selected record
		 *
		 * @override
		 */
		onCMFilterChooserWindowRecordSelect: function(filterWindow, filter) {
			filterWindow.setFilter(filter);
		},

		// as filterWindowDelegate

		/**
		 * @params {CMDBuild.view.management.common.filter.CMFilterWindow} filterWindow - The filter window that call the delegate
		 * @params {CMDBuild.model.CMFilterModel} filter - The filter to save
		 */
		onCMFilterWindowSaveButtonClick: function(filterWindow, filter) {
			this.setFilter(filter);
			filterWindow.destroy();
		},

		/**
		 * @params {CMDBuild.view.management.common.filter.CMFilterWindow} filterWindow - The filter window that call the delegate
		 */
		onCMFilterWindowAbortButtonClick: function(filterWindow) {
			filterWindow.destroy();
		}
	});

	function showFilterChooser() {
		var chooserWindow = Ext.create('CMDBuild.view.common.field.CMFilterChooserWindow', {
			store: this.store
		}).show();

		chooserWindow.addDelegate(this);
	}

})();