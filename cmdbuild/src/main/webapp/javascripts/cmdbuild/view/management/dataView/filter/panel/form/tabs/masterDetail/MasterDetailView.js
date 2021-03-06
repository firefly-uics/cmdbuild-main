(function() {

	var MD = "detail";
	var FK = "foreignkey";

	/**
	 * @legacy
	 */
	Ext.define("CMDBuild.view.management.dataView.filter.panel.form.tabs.masterDetail.MasterDetailView", {
		extend: "Ext.panel.Panel",

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.tabs.MasterDetail}
		 */
		delegate: undefined,

		/**
		 * @property {Array}
		 */
		localCacheSimpleTables: [],

		editable: true,
		eventmastertype: 'class',
		eventType: 'card',
		itemId: 'dataViewFilterFormTabMasterDetail',
		title: CMDBuild.Translation.management.modcard.tabs.detail,

		constructor: function() {
			// Build local class cache
			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail.readAllClasses({ // FIXME: use module local cache
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						decodedResponse = Ext.Array.filter(decodedResponse, function (item, index, allItems) {
							return item[CMDBuild.core.constants.Proxy.TABLE_TYPE] == CMDBuild.core.constants.Global.getTableTypeSimpleTable();
						}, this);

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
							Ext.Array.forEach(decodedResponse, function (classObject, i, allClassObjects) {
								if (Ext.isObject(classObject) && !Ext.Object.isEmpty(classObject))
									this.localCacheSimpleTables[classObject[CMDBuild.core.constants.Proxy.NAME]] = classObject;
							}, this);
					}
				}
			});

			this.addDetailButton = Ext.create('CMDBuild.core.buttons.icon.split.add.Cards', {
				classId: undefined,
				baseText: CMDBuild.Translation.management.moddetail.adddetail,
				textPrefix: CMDBuild.Translation.management.moddetail.adddetail
			});

			this.detailGrid = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.masterDetail.GridPanel', {
				editable: this.editable,
				cls: "cmdb-border-right",
				border: false,
				region: "center",
				columns: [],
				loadMask: false,
				cmAdvancedFilter: false,
				cmAddGraphColumn: false
			});

			this.tabs = new CMDBuild.view.common.CMSideTabPanel({
				region: "east"
			});

			Ext.apply(this, {
				border: false,
				frame: false
			});
			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.panelListenerManagerShow();
			}
		},

		initComponent: function() {

			Ext.apply(this, {
				layout: "border",
				tbar: [ this.addDetailButton ],
				items: [ this.detailGrid, this.tabs]
			});

			this.callParent(arguments);
		},

		loadDetailsAndFKThenBuildSideTabs: function(classId) {
			// for blocking the onTabClick events that comes during the building
			// anyway the onTabClick is called at end of buildTabs
			this.buildingTabsDetails = true;
			this.addDetailButton.disable();
			var domainList = _CMCache.getMasterDetailsForClassId(classId),
				me = this;

			this.disable();
			this.empty = true;
			this.details = {};
			this.details[MD] = {};
			this.details[FK] = {};

			for (var i = 0, len = domainList.length; i < len; i++) {
				var domain = domainList[i];
				domain['directedDomain'] = setDirectedDomain(domain);
				this.details[MD][getId(domain)] = domain;
			}

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(classId);

			CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail.readForeignKeyTargetingClass({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					this.details[FK] = {};
					this.tabs.removeAll();

					for (var i=0, l = decodedResponse.length; i < l; ++i) {
						var attr = decodedResponse[i];
						this.details[FK][getId(attr)] = attr;
					}
					this.buildingTabsDetails = false;

					if (Ext.Object.isEmpty(this.details[FK]) && Ext.Object.isEmpty(this.details[MD])) {
						this.fireEvent("empty");
					} else {
						this.empty = false;
						this.enable();
						buildTabs.call(this);
					}
				}
			});
		},

		selectDetail: function(detail) {
			var et = _CMCache.getEntryTypeById(getDetailClass(detail));

			if (et) {
				this.addDetailButton.updateForEntry(et);
			}
		},

		selectForeignKey: function(fkAttribute) {
			var et = _CMCache.getEntryTypeById(fkAttribute.idClass);

			if (et) {
				this.addDetailButton.updateForEntry(et);
			}
		},

		resetDetailGrid: function() {
			this.detailGrid.reset();
		},

		activateFirstTab: function() {
			this.tabs.activateFirst();
		},

		updateGrid: function(type, p) {
			if (type == MD) {
				this.detailGrid.loadDetails(p);
			} else {
				this.detailGrid.loadFk(p);
			}
		},

		loadDetailCardList: function(attributeList, cardId, classId, idDomain, superclass, classType) {
			this.actualAttributeList = attributeList;
			this.idDomain = idDomain;
			this.detailGrid.loadDetailCardList( {
				directedDomain: idDomain,
				cardId: cardId,
				classId: classId,
				classAttributes: attributeList,
				className: this.currentDetail.name,
				superclass: superclass,
				classType: classType
			});
		},

		loadFKCardList: function(attributes, fkClass, fkAttribute, idCard) {
			this.detailGrid.loadFKCardList(attributes, fkClass, fkAttribute, idCard);
			this.isLoaded = true;
		},

		reload: function() {
			this.detailGrid.reload();
		},

		/**
		 * @deprecated
		 */
		onAddCardButtonClick: function() {
			_deprecated('onAddCardButtonClick', this);

			this.disable();
		},

		/**
		 * @deprecated
		 */
		onClassSelected: function() {
			_deprecated('onClassSelected', this);
		}
	});

	function getId(tab) {
		if (typeof tab.get == "undefined") {
			// is a fk
			return tab.idClass + "_" + tab.name;
		} else {
			// is a md
			return tab.get("name");
		}
	}

	function setDirectedDomain(domain) {
		var cardinality = domain.get("cardinality"),
			idDomain = domain.get("id");

		if (cardinality == "1:N") {
			return idDomain + "_D";
		} else if (cardinality == "N:1") {
			return idDomain + "_I";
		} else {
			CMDBuild.log.error('Wrong cardinality');
		}
	}

	function buildTabs() {
		var details = this.details;
		function build() {
			this.tabs.removeAll(true);
			var tabs = Ext.apply(details[MD], details[FK]),
				detailLabel="",
				detailId="",
				type="",
				t;

			var sortedKeys = sortKeys(tabs);
			for (var i = 0, l=sortedKeys.length; i<l; i++) {
				var detailId = sortedKeys[i];
				t = tabs[detailId];

				if (typeof t.get == "undefined") {
					// there is a FK and t is the server serialization of the fk-attribute
					var foreignKeySourceClass = {};

					if (Ext.isString(t.owner) && !Ext.isEmpty(t.owner) && !Ext.isEmpty(this.localCacheSimpleTables[t.owner]))
						foreignKeySourceClass = this.localCacheSimpleTables[t.owner];

					type = FK;
					detailLabel = Ext.Object.isEmpty(foreignKeySourceClass) ? t.description : foreignKeySourceClass[CMDBuild.core.constants.Proxy.TEXT];
				} else {
					// there is a MD and t is the Ext model of the domain
					type = MD;
					detailLabel = t.get("md_label") || t.get("description");
				}

				this.tabs.addTabFor({
					title: detailLabel,
					tabLabel: detailLabel,
					detailType: type,
					detailId: detailId,
					on: function() {}
				}, type);
			}

			this.mon(this.tabs, "afterlayout", function() {
				this.tabs.activateFirst();
			}, this, {single: true});

			this.doLayout();
		}

		if (this.isVisible()) {
			build.call(this);
		} else {
			this.on("show", build, this, {single: true});
		}

	}

	function sortKeys(tabs) {
		var keys = [];
		for (var key in tabs) {
			keys.push(key);
		}

		return Ext.Array.sort(keys, function sortingFunction(key1, key2) {
			var obj1 = tabs[key1],
				obj2 = tabs[key2],
				data1 = obj1.data || obj1,
				data2 = obj2.data || obj2,
				string1 = data1.md_label || data1.description || key1,
				string2 = data2.md_label || data2.description || key2;

			return string1.toUpperCase() > string2.toUpperCase();
		});
	};

	function getDetailClass(detail) {
		var cardinality = detail.get("cardinality");
		if (cardinality == "1:N") {
			return detail.get("idClass2");
		} else if (cardinality == "N:1") {
			return detail.get("idClass1");
		}
	}

	function showAddDetailWindow(attributes, detail) {
		var idDomain;
		if (this.currentDetail) {
			idDomain = this.currentDetail.directedDomain;
		} else {
			idDomain = this.currentForeignKey.id;
		}

		var win = new CMDBuild.Management.AddDetailWindow( {
			titlePortion: "",
			detail: detail,
			classAttributes: attributes,
			fkAttribute: this.currentforeignKeyAttribute,
			masterData: this.actualMasterData,
			idDomain: idDomain,
			classId: detail.classId,
			className: detail.className
		});
		win.show();
	}

})();
