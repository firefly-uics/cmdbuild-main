(function() {
	var ID_AS_RETURNED_BY_GETCARDLIST = "Id",
		CLASS_ID_AS_RETURNED_BY_GETCARDLIST = "IdClass";

	var tr = CMDBuild.Translation.management.modcard;

	Ext.define("CMDBuild.controller.management.classes.CMCardRelationsController", {
		extend: "CMDBuild.controller.management.classes.CMModCardSubController",

		constructor: function(v, sc) {

			this.mixins.observable.constructor.call(this, arguments);

			this.callParent(arguments);
			this.hasDomains = false;

			this.callBacks = {
				'action-relation-go': this.onFollowRelationClick,
				'action-relation-edit': this.onEditRelationClick,
				'action-relation-delete': this.onDeleteRelationClick,
				'action-relation-editcard': this.onEditCardClick,
				'action-relation-viewcard': this.onViewCardClick,
				'action-relation-attach': this.onOpenAttachmentClick 
			};

			this.view.store.getRootNode().on("append", function(root, newNode) {
				// the nodes with depth == 1 are the folders
				if (newNode.get("depth") == 1) {
					newNode.on("expand", onDomainNodeExpand, this, {single: true});
				}
			}, this);

			this.mon(this.view, this.view.CMEVENTS.openGraphClick, this.onShowGraphClick, this);
			this.mon(this.view, this.view.CMEVENTS.addButtonClick, this.onAddRelationButtonClick, this);
			this.mon(this.view, 'beforeitemclick', cellclickHandler, this);
			this.mon(this.view, "itemdblclick", onItemDoubleclick, this);
			this.mon(this.view, "activate", this.loadData, this);

			this.CMEVENTS = {
				serverOperationSuccess: "cm-server-success"
			};

			this.addEvents(this.CMEVENTS.serverOperationSuccess);
		},

		onEntryTypeSelected: function(entryType) {
			this.callParent(arguments);

			this.card = null;

			if (!this.entryType || this.entryType.get("tableType") == "simpletable") {
				this.entryType = null;
			}

			this.view.disable();
			this.view.clearStore();
		},

		onCardSelected: function(card) {
			this.callParent(arguments);
			this.view.clearStore();
			this.view.disable();

			if (card) {
				this.updateCurrentClass(card);

				if (this.hasDomains) {
					this.view.enable();
					this.loadData();
				}
			}
		},

		updateCurrentClass: function(card) {
			var classId = card.get(CLASS_ID_AS_RETURNED_BY_GETCARDLIST),
				currentClass = _CMCache.getEntryTypeById(classId);

			if (this.currentClass != currentClass) {
				if (!currentClass || currentClass.get("tableType") == "simpletable") {
					currentClass = null;
				}
				this.currentClass = currentClass;
				this.hasDomains = this.view.addRelationButton.setDomainsForEntryType(currentClass);
			}
		},

		loadData: function() {
			if (this.card == null || !tabIsActive(this.view)) {
				return;
			}

			var el = this.view.getEl();
			if (el) {
				el.mask();
			}

			CMDBuild.ServiceProxy.relations.getList({
				params: {
					Id: this.card.get("Id"),
					IdClass: this.card.get("IdClass"),
					domainlimit: CMDBuild.Config.cmdbuild.relationlimit
				},
				scope: this,
				success: function(a,b, response) {
					el.unmask();
					this.view.fillWithData(response.domains);
				}
			});
		},

		onFollowRelationClick: function(model) {
			if (model.get("depth") > 1) {
				_CMMainViewportController.openCard({
					Id: model.get("dst_id"),
					IdClass: model.get("dst_cid")
				});
			}
		},

		onAddRelationButtonClick: function(d) {
			var domain = _CMCache.getDomainById(d.dom_id),
				isMany = false,
				dest = d.src == "_1" ? "_2" : "_1";

			if (domain) {
				isMany = domain.isMany(dest);
			};

			var me = this,
				a = new CMDBuild.view.management.classes.relations.CMEditRelationWindow({
					currentCard: this.card,
					relation: {
						dst_cid: d.dst_cid,
						dom_id: d.dom_id,
						rel_id: -1,
						src: d.src
					},
					selModel: new CMDBuild.selection.CMMultiPageSelectionModel({
						mode: isMany ? "MULTI" : "SINGLE",
						avoidCheckerHeader: true,
						idProperty: "Id" // required to identify the records for the data and not the id of ext
					}),
					filterType: this.view.id,
					successCb: function() {
						me.onAddRelationSuccess();
					}
				}).show();
		},

		onAddRelationSuccess: function() {
			this.defaultOperationSuccess();
		},

		onEditRelationClick: function(model) {
			var me = this,
				data = model.raw || model.data,
				a = new CMDBuild.view.management.classes.relations.CMEditRelationWindow({
					relation: {
						rel_attr: data.attr_as_obj,
						dst_cid: model.get("dst_cid"),
						dom_id: model.get("dom_id"),
						rel_id: model.get("rel_id"),
						src: model.get("src")
					},
					filterType: this.view.id,
					successCb: function() {
						me.onEditRelationSuccess();
					},
					selModel: new CMDBuild.selection.CMMultiPageSelectionModel({
						mode: "SINGLE",
						idProperty: "Id" // required to identify the records for the data and not the id of ext
					})
				}).show();
		},

		onEditRelationSuccess: function() {
			this.defaultOperationSuccess();
		},

		onDeleteRelationClick: function(model) {
			Ext.Msg.confirm(CMDBuild.Translation.management.findfilter.msg.attention,
				CMDBuild.Translation.management.modcard.delete_relation_confirm,
				makeRequest, this);

			function makeRequest(btn) {
				if (btn != 'yes') {
					return;
				}

				var o = {
					did: model.get("dom_id"),
					id: model.get("rel_id")
				};

				CMDBuild.LoadMask.get().show();
				CMDBuild.ServiceProxy.relations.remove({
					params: {
						JSON: Ext.JSON.encode(o)
					},
					scope: this,
					success: this.onDeleteRelationSuccess,
					callback: function() {
						CMDBuild.LoadMask.get().hide();
					}
				});
			};
		},

		// overridden in CMManageRelationController
		onDeleteRelationSuccess: function() {
			this.defaultOperationSuccess();
		},

		// overridden in CMManageRelationController
		defaultOperationSuccess: function() {
			if (true) { // TODO Check if the modified relation was associated to a reference
				this.fireEvent(this.CMEVENTS.serverOperationSuccess);
			} else {
				this.loadData();
			}
		},

		onEditCardClick: function(model) {
			openCardWindow.call(this, model, true);
		},

		onViewCardClick: function(model) {
			openCardWindow.call(this, model, false);
		},

		onOpenAttachmentClick: function(model) {
			var w = new CMDBuild.view.management.common.CMAttachmentsWindow();
			new CMDBuild.controller.management.common.CMAttachmentsWindowController(w,modelToCardInfo(model));
			w.show();
		}
	});


	Ext.define("CMDBuild.controller.management.workflow.CMActivityRelationsController", {
		extend: "CMDBuild.controller.management.classes.CMCardRelationsController",

		mixins: {
			wfStateDelegate: "CMDBuild.state.CMWorkflowStateDelegate"
		},

		constructor: function() {
			this.callParent(arguments);
			_CMWFState.addDelegate(this);
		},

		// override
		updateForProcessInstance: function(pi) {
			var classId = pi.getClassId();

			if (!classId) { return; }

			var entryType = _CMCache.getEntryTypeById(classId);

			if (this.lastEntryType != entryType) {
				if (!entryType || entryType.get("tableType") == "simpletable") {
					entryType = null;
				}
				this.lastEntryType = entryType;
				this.hasDomains = this.view.addRelationButton.setDomainsForEntryType(entryType);
			}
		},

		// override
		loadData: function() {
			var pi = _CMWFState.getProcessInstance();
			if (pi == null || !tabIsActive(this.view)) {
				return;
			}

			var el = this.view.getEl();
			if (el) {
				el.mask();
			}

			CMDBuild.ServiceProxy.relations.getList({
				params: {
					Id: pi.getId(),
					IdClass: pi.getClassId(),
					domainlimit: CMDBuild.Config.cmdbuild.relationlimit
				},
				scope: this,
				success: function(a,b, response) {
					el.unmask();
					this.view.fillWithData(response.domains);
				}
			});
		},

		// wfStateDelegate
		onProcessClassRefChange: function(entryType) {
			this.view.disable();
			this.view.clearStore();
		},

		onProcessInstanceChange: function(processInstance) {
			if (processInstance 
					&& processInstance.isNew()) {

				this.onProcessClassRefChange();
			} else {
				this.updateForProcessInstance(processInstance);
				if (this.hasDomains) {
					this.view.enable();
					this.loadData();
				} else {
					this.view.disable();
				}
			}
		},

		onActivityInstanceChange: Ext.emptyFn,

		// override
		buildCardModuleStateDelegate: Ext.emptyFn,
		onEntryTypeSelected: Ext.emptyFn,
		onCardSelected: Ext.emptyFn
	});

	function modelToCardInfo(model) {
		return {
			Id: model.get("dst_id"),
			IdClass: model.get("dst_cid"),
			Description: model.get("dst_desc")
		};
	}

	function openCardWindow(model, editable) {
		var w = new CMDBuild.view.management.common.CMCardWindow({
			cmEditMode: editable,
			withButtons: editable,
			title: model.get("label") + " - " + model.get("dst_desc")
		});

		if (editable) {
			w.on("destroy", function() {
				// cause the reload of the main card-grid, it is needed
				// for the case in which I'm editing the target card
				this.fireEvent(this.CMEVENTS.serverOperationSuccess);
			}, this, {single: true});
		}

		new CMDBuild.controller.management.common.CMCardWindowController(w, {
			entryType: model.get("dst_cid"), // classid of the destination
			card: model.get("dst_id"), // id of the card destination
			cmEditMode: editable
		});
		w.show();
	}

	function tabIsActive(t) {
		return t.ownerCt.layout.getActiveItem().id == t.id;
	}

	function cellclickHandler(grid, model, htmlelement, rowIndex, event, opt) {
		var className = event.target.className; 

		if (this.callBacks[className]) {
			this.callBacks[className].call(this, model);
		}
	}

	function onItemDoubleclick(grid, model, html, index, e, options) {
		this.onFollowRelationClick(model);
	}

	function onDomainNodeExpand(node) {
		if (node.get("relations_size") > CMDBuild.Config.cmdbuild.relationlimit) {
			node.removeAll();

			var el = this.view.getEl();
			if (el) {
				el.mask();
			}

			CMDBuild.ServiceProxy.relations.getList({
				params: {
					Id: this.card.get("Id"),
					IdClass: this.card.get("IdClass"),
					domainId: node.get("dom_id"),
					src: node.get("src")
				},
				scope: this,
				success: function(a,b, response) {
					var cc = this.view.convertRelationInNodes(response.domains[0].relations, 
							node.data.dom_id, 
							node.data.src,
							node.data);

					node.appendChild(cc);
					el.unmask();
				}
			});
		}
	}

})();