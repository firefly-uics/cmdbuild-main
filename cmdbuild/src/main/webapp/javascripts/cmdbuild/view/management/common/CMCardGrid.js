(function() {

	Ext.define('CMDBuild.selection.CheckboxModel', {
	    extend: 'Ext.selection.CheckboxModel',
	    
		//overrid
		bind: function(store, initial) {
			this.callParent(arguments);
			this.cmInverseSelection = false;
			this.cmSelections = [];

			store.on("load", this.onStoreLoad, this);
		},
	    
		//override
	    onHeaderClick: function(headerCt, header, e) {
			if (header.isCheckerHd) {
				e.stopEvent();
				var isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');

				this.cmInverseSelection = !isChecked;
				this.cmSelections = [];
				this.cmSelections[this.cmCurrentPage] = this.buildMixedCollection();

				if (isChecked) {
					// We have to supress the event or it will scrollTo the change
					this.deselectAll(true);
				} else {
					// We have to supress the event or it will scrollTo the change
					this.selectAll(true);
				}
			}
		},
	
		// override
	    onRowMouseDown: function(view, record, item, index, e) {
			this.callParent(arguments);

			var pageSelections = this.cmSelections[this.cmCurrentPage];	
	        var selectedRecord = pageSelections.get(record.get("Id"));

    	    if (typeof selectedRecord == "undefined") {
    	    	pageSelections.add(record);
    	    } else {
	    	    pageSelections.remove(selectedRecord);
    	    }

		},
		
		onStoreLoad: function(store, records) {
			this.cmCurrentPage = store.currentPage;

			if (typeof this.cmSelections[this.cmCurrentPage] == "undefined") {
				this.cmSelections[this.cmCurrentPage] = this.buildMixedCollection();
			}
			
			if (this.cmInverseSelection) {
				//select all the non cmSected records
				this.selectAll();

				var selections = this.cmSelections[this.cmCurrentPage];
				selections.each(function(s) {
					var r = store.find("Id", s.get("Id"));
					if (r != -1) {
						this.deselect(r);
					}
				}, this);

			} else {

				var selections = this.cmSelections[this.cmCurrentPage];
				selections.each(function(s) {
					var r = store.find("Id", s.get("Id"));
					if (r != -1) {
						this.select(r);
					}
				}, this);

			}
			
			this.toggleUiHeader(this.cmInverseSelection);
		},
		
		getCmSelections: function() {
			var out = [];

			for (var i=0, l=this.cmSelections.length; i<l; ++i) {
				var s = this.cmSelections[i];
				if (s) {
					s.each(function(item) {
						out.push(item);
					});
				}
			}
			
			return out;
		},
		
		//private
		buildMixedCollection: function() {
			return new Ext.util.MixedCollection(false, function(el){
			   return el.get("Id");
			});
		},
		
		//override
		onSelectChange: function() {
			this.callParent(arguments);
			this.toggleUiHeader(this.cmInverseSelection);
		},
		
		cmDeselectAll: function() {
			this.deselectAll(arguments);

			this.cmSelections = [];
			this.cmSelections[this.cmCurrentPage] = this.buildMixedCollection();
		}
		

	});

	Ext.define("CMDBuild.view.management.common.CMCardGrid", {
		extend: "Ext.grid.Panel",
		columns: [],

		filterCategory: undefined,
		filterSubcategory: undefined,
		cmStoreUrl: 'services/json/management/modcard/getcardlist',
		cmPaginate: true, // to say if build or not a paging bar, default true
		cmBasicFilter: true, // to add a basic search-field to the paging bar 
		cmAdvancedFilter: true, // to add a button to set an advanced filter
		cmAddGraphColumn: true, // to say if build or not a column to open the mystical graph window, default true

		constructor: function(c) {
			Ext.apply(this, c);
			this.loadMask = false;
			this.store = this.getStoreForFields.call(this, []);

			if (this.cmPaginate) {
				buildPagingBar.call(this);
			}

			this.callParent(arguments);
		},

		initComponent: function() {
			this.callParent(arguments);
			this.on('beforeitemclick', cellclickHandler, this);
		},

		updateStoreForClassId: function(classId, o) {
			this.currentClassId = classId;
			_CMCache.getAttributeList(classId, 
				Ext.bind(function(attributes) {
					this.setColumnsForClass(attributes);
					if (o && o.cb) {
						o.cb.call(o.scope || this);
					} else {
						this.store.loadPage(1);
					}
				}, this)
			);
		},
		

		/*
		 * p = {
				Id: the id of the card
				IdClass: the id of the class which the card belongs
			}
		 */
		openCard: function(p) {
			p['FilterCategory'] = this.filterCategory;

			CMDBuild.ServiceProxy.card.getPosition({
				params: p,
				scope: this,
				failure: onGetPositionFailure,
				success: function onGetPositionSuccess(response, options, resText) {
					var position = resText.position,
						pageNumber = getPageNumber(position),
						pageSize = parseInt(CMDBuild.Config.cmdbuild.rowlimit),
						relativeIndex = (position - 1) % pageSize;

					this.updateStoreForClassId(p.IdClass, {
						scope: this,
						cb: function cbOfUpdateStoreForClassId() {
							this.loadPage(pageNumber, {
								cb: function callBackOfLoadPage(records, operation, success) {
									try {
										this.getSelectionModel().select(relativeIndex);
									} catch (e) {
										_debug("I was not able to select the record at " + relativeIndex, p);
										_trace();
										
									}
								}
							});
						}
					});
				}
			});
		},

		loadPage: function(pageNumber, o) {
			o = o || {};
			scope = o.scope || this;
			cb = o.cb || Ext.emptyFn;

			// store.loadPage does not allow the definition of a callBack
			this.store.on("load", cb, scope, {single: true});
			this.store.loadPage(Math.floor(pageNumber));
		},

		clearFilter: clearFilter,

		reload: function(reselect) {
			var cb = Ext.emptyFn;
			
			if (reselect) {
				var s = this.getSelectionModel().getSelection();
				cb = function() {
					if (s && s.length > 0) {
						var r = this.store.findRecord("Id", s[0].get("Id"));
						if (r) {
							this.getSelectionModel().select(r);
						}
					} else {
						this.getSelectionModel().select(0);
					}
				}
			}

			this.store.load({
				scope: this,
				callback: cb
			});
		},
		
		//private, can be overridden
		setColumnsForClass: function(classAttributes) {
			this.classAttributes = classAttributes;
			var headers = [];
			var fields = [];

			if (_CMUtils.isSuperclass(this.currentClassId)) {
				headers.push(buildClassColumn());
			}

			for (var i=0; i<classAttributes.length; i++) {
				var attribute = classAttributes[i];
				var header = CMDBuild.Management.FieldManager.getHeaderForAttr(attribute);
				if (header) {
					if (attribute.name != "Notes") {
						headers.push(header);
					}
					fields.push(header.dataIndex);
				}
			}

			headers = headers.concat(this.buildExtraColumns());

			if (this.cmAddGraphColumn) {
				buildGraphIconColumn.call(this, headers);
			}

			var s = this.getStoreForFields(fields);
			this.reconfigure(s, headers);

			if (this.pagingBar) {
				this.pagingBar.bindStore(s);
			}
		},
		
		// private, could be overridden
		getStoreForFields: function(fields) {
			fields.push({name: "Id", type: "int"});
			fields.push({name: "IdClass", type: "int"});
			fields.push("IdClass_value");
			var pageSize;
			try {
				pageSize = parseInt(CMDBuild.Config.cmdbuild.rowlimit);
			} catch (e) {
				pageSize = 20;
			}

			var s = new Ext.data.Store({
				fields: fields,
				pageSize: pageSize,
				remoteSort: true,
				proxy: {
					type: "ajax",
					url: this.cmStoreUrl,
					reader: {
						root: 'rows',
						type: "json",
						totalProperty: 'results'
					},
					extraParams: this.getStoreExtraParams()
				},
				autoLoad: false
			});

			this.mon(s, "beforeload", function() {
				this.fireEvent("beforeload", arguments);
			}, this);

			this.mon(s, "load", function() {
				this.fireEvent("load", arguments);
			}, this);

			return s;
		},

		//private, could be overridden
		getStoreExtraParams: function() {
			var p = {
				IdClass : this.currentClassId || -1,
				FilterCategory: this.filterCategory || "",
				FilterSubcategory: this.filterSubcategory || ""
			};

			if (this.CQL) {
				p = Ext.apply(p, this.CQL);
			}

			return p;
		},

		//private, could be overridden
		buildExtraColumns: function() {
			return [];
		}
	});

	function onGetPositionFailure(response, options, decoded) {
		this.store.loadPage(1);
		if (decoded && decoded.reason == 'CARD_NOTFOUND') {
			CMDBuild.Msg.info(undefined, CMDBuild.Translation.info.card_not_found);
		}
		return false;
	}

	function buildPagingBar() {
		var items = [];

		if (this.cmBasicFilter) {
			this.gridSearchField = new CMDBuild.field.GridSearchField({grid: this});
			items.push(this.gridSearchField);
		}

		if (this.cmAdvancedFilter) {
			this.openFilterButton = new Ext.button.Button({
				scope: this,			
				iconCls: 'find',
				text: CMDBuild.Translation.management.findfilter.set_filter,
				handler: onOpenFilterButtonClick
			});

			this.clearFilterButton = new Ext.button.Button({
				scope: this,			
				iconCls: 'clear_find',
				text: CMDBuild.Translation.management.findfilter.clear_filter,
				handler: clearFilter,
				disabled: true
			});

			items.push(this.openFilterButton, this.clearFilterButton);
		}

		this.pagingBar = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			displayMsg: ' {0} - {1} ' + CMDBuild.Translation.common.display_topic_of+' {2}',
			emptyMsg: CMDBuild.Translation.common.display_topic_none,
			items: items
		});
		
		this.bbar = this.pagingBar;
	}

	function buildClassColumn(headers) {
		return {
			header: CMDBuild.Translation.management.modcard.subclass,
			flex: 1,
			sortable: true,
			dataIndex: 'IdClass_value'
		}
	}

	function buildGraphIconColumn(headers) {
		 var c = _CMCache.getClassById(this.currentClassId);

		 if (c && c.get("tableType") != "simpletable") {
			var graphHeader = {
				header: '&nbsp', 
				width: 30, 
				fixed: true, 
				sortable: false, 
				renderer: renderGraphIcon, 
				align: 'center', 
				dataIndex: 'Id',
				menuDisabled: true,
				hideable: false
			};
			headers.push(graphHeader);
		}
	};

	function renderGraphIcon() {
		return '<img style="cursor:pointer" title="'
			+ CMDBuild.Translation.management.graph.icon_tooltip
			+'" class="action-open-graph" src="images/icons/chart_organisation.png"/>';
	}

	function onOpenFilterButtonClick() {
		new CMDBuild.Management.SearchFilterWindow({
			attributeList: this.classAttributes,
			IdClass: this.currentClassId,
			grid: this,

			filterCategory: this.filterCategory,
			filterSubcategory: this.filterSubcategory
		}).show();
	}
	
	function clearFilter(cb) {
		CMDBuild.Ajax.request({
			url: 'services/json/management/modcard/resetcardfilter',
			params: {
				FilterCategory: this.filterCategory
			},
			scope: this,
			success: function(response) {
				if (this.clearFilterButton) {
					this.clearFilterButton.disable();
				}

				if (this.pagingBar) {
					this.store.loadPage(1);
				} else {
					this.reload();
				}

				if (typeof cb == "function") {
					cb();
				}
			}
		});
	}
	
	function cellclickHandler(grid, model, htmlelement, rowIndex, event, opt) {
		if (event.target.className == 'action-open-graph') {
//			CMDBuild.Management.showGraphWindow(model.get("IdClass"), model.get("Id"));

//			alert("@@ The graph");
		}
	}
	
	// TODO 3 to 4 qualcosa non va
	function getPageNumber(cardPosition) {
		var pageSize = parseInt(CMDBuild.Config.cmdbuild.rowlimit),
			pageNumber = 1;

		if (cardPosition) {
			pageNumber = (parseInt(cardPosition) - 1) / pageSize;
		}

		return pageNumber + 1;
	}
})();