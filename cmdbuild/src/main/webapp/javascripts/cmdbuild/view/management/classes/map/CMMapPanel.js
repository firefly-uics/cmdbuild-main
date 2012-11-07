(function() {
	Ext.define("CMDBuild.view.management.map.CMMapPanelDelegate", {
		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel} mapPanel The map panel which has added the layer
		 * @param {Object} params Information about the layer
		 * @param {OpenLayers.Map} params.object The OpenLayer map which has added the layer
		 * @param {OpenLayers.Layer} params.layer The OpenLayer layer which is added
		 */
		onLayerAdded: Ext.emptyFn,

		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel} mapPanel The map panel which has removed the layer
		 * @param {Object} params Information about the layer
		 * @param {OpenLayers.Map} params.object The OpenLayer map which has removed the layer
		 * @param {OpenLayers.Layer} params.layer The OpenLayer layer which is removed
		 */
		onLayerRemoved: Ext.emptyFn,

		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel} mapPanel The map panel which has removed the layer
		 * @param {boolean} visible If the map is now visible or not
		 */
		onMapPanelVisibilityChanged: Ext.emptyFn
	});

	Ext.define("CMDBuild.view.management.map.CMMapPanel", {
		extend: "Ext.panel.Panel",

		mixins: {
			delegable: "CMDBuild.core.CMDelegable"
		},

		lon: undefined,
		lat: undefined,
		initialZoomLevel: undefined,

		constructor: function() {
			this.mixins.delegable.constructor.call(this,
					"CMDBuild.view.management.map.CMMapPanelDelegate");

			this.callParent(arguments);

			this.editingWindow = new CMDBuild.view.management.map.CMMapEditingToolsWindow({
				owner: this
			});

			this.hideMode = "offsets";
			this.cmAlreadyDisplayed = false;
			this.cmVisible = false;
		},

		initComponent: function() {

			var me = this;

			this.actualMapPanel = new Ext.panel.Panel({
				region: "center",
				frame: false,
				border: false,
				cls: "cmborderright",
				listeners: {
					render: function() {
						initMap(me);
					},
					resize: function() {
						me.getMap().updateSize();
					}
				}
			});

			var tabs = [];

			this.layerSwitcher = new CMDBuild.view.management.map.CMMapLayerSwitcher({
				title: CMDBuild.Translation.administration.modClass.layers,
				frame: false,
				border: false
			});
			tabs.push(this.layerSwitcher);

			if (CMDBuild.Config.cmdbuild.cardBrowserByDomainConfiguration) {
				this.cardBrowser = new CMDBuild.view.management.CMCardBrowserTree({
					title: CMDBuild.Translation.management.modcard.gis.gisNavigation,
					frame: false,
					border: false
				});

				tabs.push(this.cardBrowser);
			}

			this.miniCardGrid = new CMDBuild.view.management.CMMiniCardGrid({
				title: CMDBuild.Translation.management.modcard.title,
				frame: false,
				border: false
			});

			tabs.push(this.miniCardGrid);

			this.layout = "border";
			this.items = [
				this.actualMapPanel,
				{
					xtype: "tabpanel",
					region: "east",
					cls: "cmborderleft",
					width: "25%",
					split: true,
					collapsible: true, 
					collapseMode: 'mini',
					header: false,
					frame: false,
					border: false,
					plain: true,
					activeItem: 0,
					padding: "2 0 0 0",
					items: tabs
				}
			];

			this.callParent(arguments);
		},
	
		setCmVisible: function(visible) {
			this.cmVisible = visible;
			this.callDelegates("onMapPanelVisibilityChanged", [this, visible]);

			if (!this.cmAlreadyDisplayed) {
				var m = this.getMap();
				m.initBaseLayers();
				m.setCenter(m.center, m.zoom);
				this.cmAlreadyDisplayed = true;
			}
		},
	
		editMode: function() {
			if (this.editingWindow) {
				this.editingWindow.show();
			}
		},
	
		displayMode: function() {
			if (this.editingWindow) {
				this.editingWindow.hide();
			}
		},
	
		updateMap: function(entryType) {
			this.editingWindow.removeAllLayerBinding();
		},

		addLayerToEditingWindow: function(layer) {
			this.editingWindow.addLayer(layer);
		},

		getLayerSwitcherPanel: function() {
			return this.layerSwitcher;
		},

		getCardBrowserPanel: function() {
			return this.cardBrowser;
		},

		getMiniCardGrid: function() {
			return this.miniCardGrid;
		}
	});

	function initMap(me) {
		var map = CMDBuild.Management.MapBuilder.buildMap(me.actualMapPanel.body.dom.id);
		_CMMap = map;
		map.events.on({
			"addlayer": function(params) {
				me.callDelegates("onLayerAdded", [me, params]);
			},
			"removelayer": function(params) {
				me.callDelegates("onLayerRemoved", [me, params]);
			},
			scope: me
		});

		setMapCenter(me, map);

		/* expose the map ******/

		me.getMap = function() {
			return map;
		};

		me.updateSize = function() {
			map.updateSize();
		};
	}

	function setMapCenter(me, map) {
		var lon = me.lon || CMDBuild.Config.gis['center.lon'] || 0;
		var lat = me.lat || CMDBuild.Config.gis['center.lat'] || 0;
		var center = new OpenLayers.LonLat(lon,lat);
		var projectedCenter = center.transform(new OpenLayers.Projection("EPSG:4326"),map.getProjectionObject());
		var initialZoomLevel = me.initialZoomLevel || CMDBuild.Config.gis.initialZoomLevel || 0;

		map.setCenter(projectedCenter, initialZoomLevel);
	}
})();