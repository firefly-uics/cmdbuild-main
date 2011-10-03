(function() {
	var TREE_NODE_NAME_ATTRIBUTE = "cmName",
		TREE_FOLDER_NODE_NAME = "folder";

	Ext.define("CMDBuild.view.common.CMBaseAccordion.Store", {
		extend: "Ext.data.TreeStore",
		fields: [
			{name: TREE_NODE_NAME_ATTRIBUTE, type: "string"},
			{name: "text", type: "string"},
			{name: "id", type: "string"},
			{name: "parent", type: "string"},
			{name: "cmIndex", type: "ingeter"}
		],
		root : {
			expanded : true,
			children : []
		},
		sorters: [{
			property : 'cmIndex',
			direction: 'ASC'
		},{
			property : 'text',
			direction: 'ASC'
		}]
	})
	
	/*
	 * this class can not be instantiated,
	 * it is a template for the accordions
	 * 
	 * It is a panel with as item a TreePanel,
	 * it may be directly a TreePanel but there are 
	 * problemps with the accordion layout
	 * */
	Ext.define("CMDBuild.view.common.CMBaseAccordion", {
		extend: 'Ext.panel.Panel',
		rootVisible: false,
		animCollapse: false,

		constructor: function(c) {
			Ext.apply(this, c);
			this.store = Ext.create('CMDBuild.view.common.CMBaseAccordion.Store');

			this.tree = Ext.create("Ext.tree.Panel", {
				store: this.store,
				border: false,
				frame: false,
				region: "center",
				bodyStyle: { "border-top": "none" },
				rootVisible: this.rootVisible,
				viewConfig: {
					// We are not using autoScroll because we are
					// not interested in horizontal scrolling
					style: {
						"overflow-y": "auto"
					}
				}
			});

			Ext.apply(this, {
				items: [this.tree],
				layout: "border",
				border: true
			});

			this.callParent(arguments);
		},

		updateStore: function(items) {
			var root = this.store.getRootNode();
			var treeStructure = this.buildTreeStructure(items);
			root.removeAll();
			root.appendChild(treeStructure);
			this.store.sort();
			
			this.afterUpdateStore();
		},

		selectNodeById: function(node) {
			var sm = this.getSelectionModel();
			node = typeof node == "object" ? node : this.store.getNodeById(node);

			if (node) {
				sm.select(node);
				node.bubble(function() {
					this.expand();
				});
			} else {
				_debug("I have not find a node with id " + nodeId);
			}
		},

		selectNodeByIdSilentry: function(nodeId) {
			this.getSelectionModel().suspendEvents();
			this.selectNodeById(nodeId);
			this.getSelectionModel().resumeEvents();
		},

		expandSilently: function() {
			this.cmSilent = true;
			this.expand();
			this.cmSilent = false;
		},

		removeNodeById: function(nodeId) {
			var node = this.store.getNodeById(nodeId);
			if (node) {
				node.remove();
			} else {
				_debug("I have not find a node with id " + nodeId);
			}
		},

		deselect: function() {
			this.getSelectionModel().deselectAll();
		},

		getSelectionModel: function() {
			return this.tree.getSelectionModel();
		},
		
		getNodeById: function(id) {
			return this.store.getNodeById(id);
		},
		
		getRootNode: function() {
			return this.tree.getRootNode();
		},

		getAncestorsAsArray: function(nodeId) {
			var out = [],
				node = this.getNodeById(nodeId);

			if (node) {
				out.push(node);
				while (node.parentNode != null) {
					out.push(node.parentNode);
					node = node.parentNode;
				}
			}
			
			return out;
		},

		isEmpty: function() {
			return !(this.store.getRootNode().hasChildNodes())
		},

		getFirtsSelectableNode: function() {
			if (this.disabled) {
				return null;
			}

			var l = this.getRootNode(),
				out = null;

			while (l) {
				if (this.nodeIsSelectable(l)) {
					out = l;
					break;
				} else {
					l = l.firstChild;
				}
			}

			_debug(this.cmName + " get first selectable node ", l);
			return l;
		},

		nodeIsSelectable: function(node) {
			var name = node.get(TREE_NODE_NAME_ATTRIBUTE),
				isFolder = (!name || name == TREE_FOLDER_NODE_NAME),
				isRootNode = (this.getRootNode() == node),
				isHidden = isRootNode && !this.rootVisible;
			return !isFolder && !isHidden;
		},

		selectFirstSelectableNode: function() {
			var l = this.getFirtsSelectableNode();

			if (l) {
				this.expand();
				// Defer the call because Ext.selection.RowModel
				// for me.views.lenght says "can not refer to length of undefined"
				Ext.Function.createDelayed(function() {
					this.selectNodeById(l);
				}, 100, this)();
			}
		},

		buildTreeStructure: function() {
			_debug("CMBaseAccordion.buildTreeStructure Unimplemented method");
		},
		
		afterUpdateStore: function() {
			_debug("CMBaseAccordion.afterUpdateStore Unimplemented method");
		}
	});
})();