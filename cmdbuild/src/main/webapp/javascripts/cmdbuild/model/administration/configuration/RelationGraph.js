(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.configuration.RelationGraph', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.BASE_LEVEL, type: 'int', defaultValue: 1, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLUSTERING_THRESHOLD, type: 'int', defaultValue: 5, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.DISPLAY_LABEL, type: 'string', defaultValue: CMDBuild.core.constants.Proxy.NONE },
			{ name: CMDBuild.core.constants.Proxy.EDGE_COLOR, type: 'string', defaultValue: '#000000' },
			{ name: CMDBuild.core.constants.Proxy.ENABLE_EDGE_TOOLTIP, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.ENABLE_NODE_TOOLTIP, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.SPRITE_DIMENSION, type: 'int', defaultValue: 40, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.STEP_RADIUS, type: 'int', defaultValue: 200, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VIEW_POINT_DISTANCE, type: 'int', defaultValue: 50, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VIEW_POINT_HEIGHT, type: 'int', defaultValue: 50, useNull: true }
		],

		/**
		 * @returns {Object}
		 */
		getParamsObject: function () {
			var data = this.getData();

			return {
				'baseLevel': data[CMDBuild.core.constants.Proxy.BASE_LEVEL],
				'clusteringThreshold': data[CMDBuild.core.constants.Proxy.CLUSTERING_THRESHOLD],
				'displayLabel': data[CMDBuild.core.constants.Proxy.DISPLAY_LABEL],
				'edgeColor': data[CMDBuild.core.constants.Proxy.EDGE_COLOR],
				'enabled': data[CMDBuild.core.constants.Proxy.ENABLED],
				'enableEdgeTooltip': data[CMDBuild.core.constants.Proxy.ENABLE_EDGE_TOOLTIP],
				'enableNodeTooltip': data[CMDBuild.core.constants.Proxy.ENABLE_NODE_TOOLTIP],
				'spriteDimension': data[CMDBuild.core.constants.Proxy.SPRITE_DIMENSION],
				'stepRadius': data[CMDBuild.core.constants.Proxy.STEP_RADIUS],
				'viewPointDistance': data[CMDBuild.core.constants.Proxy.VIEW_POINT_DISTANCE],
				'viewPointHeight': data[CMDBuild.core.constants.Proxy.VIEW_POINT_HEIGHT]
			};
		}
	});

})();
