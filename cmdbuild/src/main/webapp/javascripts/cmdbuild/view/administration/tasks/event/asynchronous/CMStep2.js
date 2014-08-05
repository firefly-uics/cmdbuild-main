(function() {

	Ext.define('CMDBuild.view.administration.tasks.event.asynchronous.CMStep2Delegate', {
		extend: 'CMDBuild.controller.CMBasePanelController',

		parentDelegate: undefined,

		className: undefined,
		parentDelegate: undefined,
		view: undefined,

		/**
		 * Gatherer function to catch events
		 *
		 * @param (String) name
		 * @param (Object) param
		 * @param (Function) callback
		 */
		// overwrite
		cmOn: function(name, param, callBack) {
			switch (name) {
				default: {
					if (this.parentDelegate)
						return this.parentDelegate.cmOn(name, param, callBack);
				}
			}
		},

		/**
		 * Create and draw filter tabs
		 */
		drawFilterTabs: function() {
			var me = this;

			if (this.className) {
				_CMCache.getAttributeList(
					_CMCache.getEntryTypeByName(this.className).getId(),
					function(attributes) {
						me.view.filterTabPanel.removeAll();

						// Filter tabs
						me.view.filterAttributeTab = Ext.create('CMDBuild.view.management.common.filter.CMFilterAttributes', {
							attributes: attributes
						});
						me.view.filterRelationTab = Ext.create('CMDBuild.view.management.common.filter.CMRelations', {
							className: me.className,
							height: '100%'
						});

						// To setup filters values
						if (!Ext.isEmpty(me.filterValues)) {
							if (!Ext.isEmpty(me.view.filterAttributeTab) && !Ext.isEmpty(me.filterValues.attributes))
								me.view.filterAttributeTab.setData(me.filterValues.attributes);

							if (!Ext.isEmpty(me.view.filterRelationTab) && !Ext.isEmpty(me.filterValues.relations))
								me.view.filterRelationTab.setData(me.filterValues.relations);
						}

						me.view.filterTabPanel.add([me.view.filterAttributeTab, me.view.filterRelationTab]);
						me.view.filterTabPanel.doLayout();
					}
				);
			}
		},

		/**
		 * Function to get filter's datas
		 *
		 * @return (Object) filter's tab datas
		 */
		getDataFilters: function() {
			if (
				!Ext.isEmpty(this.view.filterAttributeTab)
				&& !Ext.isEmpty(this.view.filterRelationTab)
			) {
				var returnArray = {};

				returnArray[CMDBuild.core.proxy.CMProxyConstants.ATTRIBUTE] = this.view.filterAttributeTab.getData();
				returnArray[CMDBuild.core.proxy.CMProxyConstants.RELATION] = this.view.filterRelationTab.getData();

				return returnArray;
			}

			return null;
		},

		/**
		 * To setup all filters
		 *
		 * @param (Object) filterValuesObject
		 *
		 * example:
		 * 		{
		 * 			"attributes": {...},
		 * 			"relations": {...}
		 * 		}
		 */
		setValueFilters: function(filterValuesObject) {
			this.filterValues = filterValuesObject;
		}
	});

	Ext.define('CMDBuild.view.administration.tasks.event.asynchronous.CMStep2', {
		extend: 'Ext.panel.Panel',

		delegate: undefined,

		bodyCls: 'cmgraypanel',
		border: false,
		layout: 'fit',
		overflowY: 'auto',

		initComponent: function() {
			this.delegate = Ext.create('CMDBuild.view.administration.tasks.event.asynchronous.CMStep2Delegate', this);

			this.filterTabPanel = Ext.create('Ext.tab.Panel', {
				border: false
			});

			Ext.apply(this, {
				items: [this.filterTabPanel]
			});

			this.callParent(arguments);
		},

		listeners: {
			// Draw tabs on activate
			activate: function(panel, eOpts) {
				this.delegate.drawFilterTabs();
			}
		}
	});

})();