(function() {
	var tr = CMDBuild.Translation.administration.modClass.domainProperties;

	Ext.define("CMDBuild.Administration.DomainGrid", {
		extend: "Ext.grid.Panel",

		initComponent: function() {
		
			this.addAction = new Ext.Button({	
				iconCls : 'add',
				text : tr.add_domain
			});
	
			var columns = [{
				header : tr.name,
				dataIndex : 'name',
				flex : 1
			}, {
				header : tr.description,
				dataIndex : 'description',
				flex : 1
			}, {
				header : tr.description_direct,
				dataIndex : 'descrdir',
				flex : 1
			}, {
				header : tr.description_inverse,
				dataIndex : 'descrinv',
				flex : 1
			}, {
				header : tr.class_target,
				dataIndex : 'class1',
				flex : 1
			}, {
				header : tr.class_destination,
				dataIndex : 'class2',
				flex : 1
			}, {
				header : tr.cardinality,
				dataIndex : 'cardinality',
				flex : 1
			}, {
				header : tr.m_d,
				dataIndex : 'md',
				flex : 1
			}];
	
			Ext.apply(this, {
				tbar: [
					this.addAction,
					'->',
					{
						xtype: 'checkbox',
						boxLabel: CMDBuild.Translation.administration.modClass.include_inherited,
						checked: true,
						handler: function(obj, checked) {
							this.filterInherited(!checked);
						},
						scope: this
					}
				],
				columns : columns,
				store: CMDBuild.ServiceProxy.administration.domain.getGridStore()
			});

			this.callParent();
			this.getSelectionModel().on('rowselect', this.onDomainSelected , this);
			
			_CMEventBus.subscribe('cmdb-init-'+this.eventtype, this.loadData, this);
			_CMEventBus.subscribe('cmdb-modified-'+this.eventtype+'domain', this.loadData, this);
		},
		
		loadData: function(params) {
			if (params.idClass) {
				var table = CMDBuild.Cache.getTableById(params.idClass);
				if (table.tableType == CMDBuild.Constants.cachedTableType.simpletable) {
					return;
				}
			}

			this.getStore().load( {
				params : {
					idClass : params.idClass || -1
				},
				callback : function() {
					this.filterInherited(this.filtering);
				},
				scope : this
			});
		},
	
		filterInherited: function(filter) {
			this.filtering = filter;
			if (filter) {
				this.getStore().filterBy(function(record) {
					return !record.json.inherited
				});
			} else {
				this.getStore().filterBy(function(record) {
					return true
				});
			}
		},
	
		onDomainSelected: function(sm, row, rec) {
			var eventParams = {
				record: new Ext.data.Record(rec.json)
			}
	
			this.publish('cmdb-load-'+this.eventtype+'domain', eventParams);
		}

	});

})();