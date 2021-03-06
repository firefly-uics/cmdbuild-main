(function () {

	/**
	 * @link CMDBuild.view.management.dataView.filter.panel.form.tabs.history.RowExpander
	 */
	Ext.define('CMDBuild.view.management.classes.tabs.history.RowExpander', {
		extend: 'Ext.grid.plugin.RowExpander',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		expandOnEnter: false,
		selectRowOnExpand: false,

		// XTemplate formats all values to an array of key-value objects before display
		rowBodyTpl: new Ext.XTemplate(
			'<tpl exec="this.formatter(' + CMDBuild.core.constants.Proxy.VALUES + ')"></tpl>',
			'<tpl for="this.formattedArray">',
				'<tpl if="' + CMDBuild.core.constants.Proxy.CHANGED + '">',
					'<div class="changedRow">',
				'<tpl else>',
					'<div>',
				'</tpl>',
				'<b>{attribute}:</b> {value}</div>',
			'</tpl>',
			'<tpl if="this.formattedArray.length == 0">',
				'<p>' + CMDBuild.Translation.noAvailableData + '<p>',
			'</tpl>',
			{
				/**
				 * @param {Object} values
				 *
				 * @returns {Void}
				 */
				formatter: function (values) {
					this.formattedArray = [];

					if (Ext.isObject(values) && !Ext.Object.isEmpty(values)) {
						Ext.Object.each(values, function (key, value, myself) {
							this.formattedArray.push({
								attribute: value.get(CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION) || key,
								changed: value.get(CMDBuild.core.constants.Proxy.CHANGED),
								index: value.get(CMDBuild.core.constants.Proxy.INDEX),
								value: value.get(CMDBuild.core.constants.Proxy.DESCRIPTION)
							});
						}, this);

						// Sort by index value (CMDBuild attribute sort order)
						CMDBuild.core.Utils.objectArraySort(this.formattedArray, CMDBuild.core.constants.Proxy.INDEX);
					}
				}
			}
		)
	});

})();
