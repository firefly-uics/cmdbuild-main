(function () {

	// External implementation to avoid overrides
	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.model.common.Accordion'
	]);

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.common.abstract.Accordion', {
		extend: 'Ext.tree.Panel',

		/**
		 * @cfg {Object}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		storeModelName: 'CMDBuild.model.common.Accordion',

		autoRender: true,
		border: true,
		floatable: false,
		layout: 'border',
		rootVisible: false,
		collapsed: false,

		bodyStyle: {
			background: '#ffffff'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.applyIf(this, {
				store: Ext.create('Ext.data.TreeStore', {
					autoLoad: true,
					model: this.storeModelName,
					root: {
						expanded: true,
						children: []
					},
					sorters: [
						{ property: 'cmIndex', direction: 'ASC' },
						{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
					]
				})
			});

			this.callParent(arguments);

			// Add listener for accordion expand
			this.on('expand', function (accordion, eOpts) {
				if (!Ext.isEmpty(this.delegate))
					this.delegate.cmfg('onAccordionExpand');
			}, this);

			// Add listener for beforeitemclick
			this.on('beforeitemclick', function (view, record, item, index, e, eOpts) {
				if (!Ext.isEmpty(this.delegate))
					return this.delegate.cmfg('onAccordionBeforeItemClick', record);
			}, this);
		}
	});

})();
