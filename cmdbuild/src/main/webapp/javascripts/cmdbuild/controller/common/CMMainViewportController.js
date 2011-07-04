(function() {
	Ext.ns("CMDBuild.controller");
	var ns = CMDBuild.controller;
	
	ns.CMMainViewportController = function(viewport) {
		this.viewport = viewport;
		
		this.accordionControllers = {};
		this.panelControllers = {};
		
		this.viewport.foreachAccordion(function(accordion) {
			if (typeof accordion.cmControllerType == "function") {
				this.accordionControllers[accordion.cmName] = new accordion.cmControllerType(accordion);
			} else {
				this.accordionControllers[accordion.cmName] = new ns.accordion.CMBaseAccordionController(accordion);
			}
		}, this);
		
		this.viewport.foreachPanel(function(panel) {
			if (typeof panel.cmControllerType == "function") {
				this.panelControllers[panel.cmName] = new panel.cmControllerType(panel);
			} else {
				this.panelControllers[panel.cmName] = new ns.CMBasePanelController(panel);
			}
		}, this);
	};
	
	ns.CMMainViewportController.prototype.bringTofrontPanelByCmName = function(cmName, params) {
//		try {
			this.viewport.bringTofrontPanelByCmName(cmName, params);
//		} catch (e) {
//			_debug("Cannot bring to front the panel " + cmName, e);
//		}
	};
	
	ns.CMMainViewportController.prototype.deselectAccordionByName = function(cmName) {
		try {
			this.viewport.deselectAccordionByName(cmName);
		} catch (e) {
			_debug("Cannot unselect the accordion " + cmName, e);
		}
	};
	
	ns.CMMainViewportController.prototype.disableAccordionByName = function(cmName) {
		try {
			this.viewport.disableAccordionByName(cmName);
		} catch (e) {
			_debug("Cannot disable the accordion " + cmName, e);
		}
	};
	
	ns.CMMainViewportController.prototype.enableAccordionByName = function(cmName) {
		try {
			this.viewport.enableAccordionByName(cmName);
		} catch (e) {
			_debug("Cannot enable the accordion " + cmName, e);
		}
	};
	
	ns.CMMainViewportController.prototype.findAccordionByCMName = function(cmName) {
		return this.viewport.findAccordionByCMName(cmName);
	};
	
	ns.CMMainViewportController.prototype.findModuleByCMName = function(cmName) {
		return this.viewport.findModuleByCMName(cmName);
	};
	
	ns.CMMainViewportController.prototype.getFirstAccordionWithANodeWithGivenId = function(id) {
		return this.viewport.getFirstAccordionWithANodeWithGivenId(id);
	};
})();

//(function() {	
///**
// * p = {
// * 		table: the table of the card to open
// * 		cardId: the id of the card to open
// * 		tabToOpen: (optional) the name of the tab to open
// * 			after the selection of the card
// * } 
// **/
//var onOpenCard = function(p) {
//	var expandedTreePanel = getExpandedTreePanel(this.treePanels);
//	var selected = false;
//	if (expandedTreePanel) {
//		var controllerOfExTP = getControllerOfTreePanel(expandedTreePanel.id, this.treePanelControllers);
//		selected = controllerOfExTP.openCard(p);
//	}	
//
//	for (var i=0, l=this.treePanels.length; i<l; ++i) {
//		var treePanel = this.treePanels[i];
//		var controller = getControllerOfTreePanel(treePanel.id, this.treePanelControllers);
//		selected |= controller.openCard(p, silent = selected);			
//	}
//	
//};
//
//var getExpandedTreePanel = function(treePanels) {
//	for (var i=0; i<treePanels.length; ++i) {
//		var tp = treePanels[i];
//		if (!tp.collapsed) {
//			return tp;
//		}
//	}
//	return undefined;
//};
//
//var getControllerOfTreePanel = function(treePanelId, treeControllers) {
//	for (var i=0; i<treeControllers.length; ++i) {
//		if (treeControllers[i].treePanel.id == treePanelId) {
//			return treeControllers[i];
//		}
//	}
//	return undefined;
//};
//
//CMDBuild.MainViewportController = Ext.extend(Ext.Component, {
//	viewport: undefined, // passed in construction
//	initComponent : function() {
//		CMDBuild.MainViewportController.superclass.initComponent.apply(this, arguments);		
//		this.treePanels = this.viewport.getTreePanels();
//		this.treePanelControllers = [];		
//		this.initSubControllers();		
//		var selected = this.selectStartingClass();
//		if (!selected) {
//			this.expandFirstPanel();
//		}
//		
//		this.subscribe("cmdb-opencard", onOpenCard, this);
//	},
//	
//	initSubControllers: function() {		
//		for (var i=0, len=this.treePanels.length; i<len; ++i) {
//			var t = this.treePanels[i];
//			var c = new CMDBuild.TreePanelController({
//				treePanel: t
//			});			
//			c.on("selectionchange", function(p) {
//				for (var i=0, len=this.treePanels.length; i<len; ++i) {
//					var t = this.treePanels[i];
//					var node = t.searchNodeById(p.selection.id);
//					if ((t.id != p.controllerId) && node) {
//						t.silentSelectNodeById(node.id);
//					}
//				}
//			}, this);
//			
//			this.treePanelControllers.push(c);
//		}
//	},
//
//	selectStartingClass: function() {
//		var startingClass = CMDBuild.Runtime.StartingClassId;
//		var selected = false;
//		for (var i=0; i<this.treePanels.length; ++i) {
//			var treePanel =  this.treePanels[i];
//			var treeRoot = treePanel.root;
//			if (treePanel.selectNodeById(startingClass, expandAfter = true)) {
//				selected = true;
//				break;
//			}
//		}
//		return selected;
//	},
//	
//	expandFirstPanel: function() {
//		if (this.treePanels.length > 0) {
//            var panel = this.treePanels[0];
//            panel.on("render", function() {
//                (function() {
//                    panel.expand();
//                }).defer(1, this);
//            }, panel);
//        }	
//	}
//});
//})();