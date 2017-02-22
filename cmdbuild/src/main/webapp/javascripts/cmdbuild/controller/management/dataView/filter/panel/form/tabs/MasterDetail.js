(function() {

	var MD = "detail";
	var FK = "foreignkey";

	/**
	 * @merged CMDBuild.controller.management.classes.masterDetails.CMMasterDetailsController
	 * @merged CMDBuild.controller.management.classes.CMModCardSubController
	 *
	 * @legacy
	 */
	Ext.define("CMDBuild.controller.management.dataView.filter.panel.form.tabs.MasterDetail", {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail'
		],

		mixins : {
			observable : "Ext.util.Observable"
		},

		/**
		 *  @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window}
		 */
		controllerWindowGraph: undefined,

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.masterDetail.window.Note}
		 */
		controllerWindowNote: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.tabs.masterDetail.MasterDetailView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.filter.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			Ext.apply(this, configurationObject);

			this.mixins.observable.constructor.call(this, arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.masterDetail.MasterDetailView', { delegate: this });

			this.superController = this.parentDelegate;
			this.card = null;
			this.entryType = null;

			this.currentForeignKey = null;
			this.currentDetail = null;

			this.mon(this.view.tabs,"click", onTabClick, this);
			this.mon(this.view.detailGrid, 'beforeitemclick', cellclickHandler, this);
			this.mon(this.view.detailGrid, "itemdblclick", onDetailDoubleClick, this);
			this.mon(this.view.addDetailButton, "cmClick", this.onAddDetailButtonClick, this);

			this.addEvents(["empty"]);

			this.mon(this.view, "empty", function() {
				this.fireEvent("empty", this.view.isVisible());
			}, this);

			this.callBacks = {
				'action-masterdetail-edit': this.onEditDetailClick,
				'action-masterdetail-show': this.onShowDetailClick,
				'action-masterdetail-delete': this.onDeleteDetailClick,
				'action-masterdetail-graph': this.onOpenGraphClick,
				'action-masterdetail-note': this.onOpenNoteClick,
				'action-masterdetail-attach': this.onOpenAttachmentClick
			};

			// Build sub-controllers
			this.controllerWindowGraph = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', { parentDelegate: this });
			this.controllerWindowNote = Ext.create('CMDBuild.controller.management.classes.panel.form.tabs.masterDetail.window.Note', { parentDelegate: this });
		},

		/**
		 * Enable/Disable tab selection based
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		dataViewFilterFormTabMasterDetailUiUpdate: function () {
			if (!this.parentDelegate.cmfg('dataViewFilterSourceEntryTypeIsEmpty'))
				this.onEntryTypeSelected();

			if (!this.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty'))
				this.onCardSelected();

			// UI view mode manage
			switch (this.parentDelegate.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.view.disable();

				case 'clone':
					return this.view.disable();
			}
		},

		/**
		 * @legacy
		 */
		getView: function () {
			return this.view;
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		reset: function () {
			this.view.resetDetailGrid();
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 * @legacy
		 */
		panelListenerManagerShow: function () {
			// Error handling
				if (this.parentDelegate.cmfg('dataViewSelectedDataViewIsEmpty'))
					return _error('panelListenerManagerShow(): empty selectedDataView property', this, this.parentDelegate.cmfg('dataViewSelectedDataViewGet'));

				if (this.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty'))
					return _error('panelListenerManagerShow(): empty selectedCard property', this, this.parentDelegate.cmfg('dataViewFilterSelectedCardGet'));
			// END: Error handling

			// History record save
			CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
				moduleId: this.parentDelegate.cmfg('dataViewIdentifierGet'),
				entryType: {
					description: this.parentDelegate.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					id: this.parentDelegate.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
					object: this.parentDelegate.cmfg('dataViewSelectedDataViewGet')
				},
				item: {
					description: this.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
						|| this.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CODE),
					id: this.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
					object: this.parentDelegate.cmfg('dataViewFilterSelectedCardGet')
				},
				section: {
					description: this.view.title,
					object: this.view
				}
			});

			// UI view mode manage
			switch (this.parentDelegate.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.onAddCardButtonClick();

				case 'clone':
					return this.onCloneCard();
			}
		},

		/**
		 * @param {Object} configObj
		 * 	{
		 * 		{Boolean} editable
		 * 	}
		 *
		 * @return {CMDBuild.view.management.common.CMCardWindow}
		 */
		buildWindow: function(configObj) {
			return Ext.create('CMDBuild.view.management.common.CMCardWindow', {
				referencedIdClass: this.card.get('IdClass'),
				fkAttribute: this.currentForeignKey,
				masterData: this.card,
				detail: this.currentDetail,
				cmEditMode: configObj.editable,
				withButtons: configObj.editable
			});
		},

		/**
		 * @params {Object} params
		 */
		onAddDetailButtonClick: function(params) {
			var window = this.buildWindow({
				entryType: params.classId,
				editable: true
			});

			new CMDBuild.controller.management.common.CMAddDetailWindowController(window, {
				entryType: params.classId,
				cmEditMode: true
			});

			window.show();

			window.mon(window, 'destroy', function() {
				this.view.reload();
			}, this, { single: true });
		},

		onEntryTypeSelected: function () {
			// FIXME: legacy mode to remove on complete Cards UI and cardState modules refactor
			this.entryType = Ext.create('CMDBuild.cache.CMEntryTypeModel', this.parentDelegate.cmfg('dataViewFilterSourceEntryTypeGet', 'rawData'));

			this.currentTab = null;
			this.currentForeignKey = null;
			this.currentDetail = null;

			this.view.loadDetailsAndFKThenBuildSideTabs(this.entryType.get("id"));
			this.view.resetDetailGrid();
		},

		onCardSelected: function () {
			var card = this.parentDelegate.cmfg('dataViewFilterSelectedCardGet');

			this.card = card;

			this.view.setDisabled(this.view.empty);
			// given the tab is not active but enabled
			// and we change card
			// when the tab is activated
			// then the grid should be updated
			if (tabIsActive(this.view)) {
				updateDetailGrid.call(this);
			} else {
				this.view.on('activate', updateDetailGrid, this, {single: true});
			}
		},

		onAddCardButtonClick: function () {
			this.view.disable();
		},

		onCloneCard: function () {
			this.view.disable();
		},

		/**
		 * @param {Object} model - card grid model
		 */
		onEditDetailClick: function(model) {
			var window = this.buildWindow({
				editable: true
			});

			var windowController = new CMDBuild.controller.management.common.CMDetailWindowController(window, {
				entryType: model.get('IdClass'),
				card: model.get('Id'),
				cmEditMode: true
			});

			window.mon(window, 'destroy', function() {
				this.view.reload();
				delete windowController;
				delete window;
			}, this, { single: true });

			window.show();
		},

		onShowDetailClick: function(model) {
			var w = this.buildWindow({
				editable: false
			});

			var c = new CMDBuild.controller.management.common.CMDetailWindowController(w, {
				entryType: model.get("IdClass"),
				card: model.get("Id"),
				cmEditMode: false
			});

			w.mon(w, "destroy", function() {
				delete c;
				delete w;
			}, this, {single: true});

			w.show();
		},

		onDeleteDetailClick: function(model) {
			Ext.Msg.confirm(CMDBuild.Translation.attention,
				CMDBuild.Translation.management.modcard.delete_card_confirm,
				makeRequest, this);

			var me = this;
			var detailCard = model;
			var masterCard = this.card;

			function makeRequest(btn) {
				if (btn != 'yes') {
					return;
				}

				var params = {};

				if (this.currentDetail) {
					params.domainName = me.currentDetail.get("name");
				};

				params.masterClassName = _CMCache.getEntryTypeNameById(masterCard.get("IdClass"));
				params.masterCardId = masterCard.get("Id");
				params.detailClassName = _CMCache.getEntryTypeNameById(detailCard.get("IdClass"));
				params.detailCardId = detailCard.get("Id");

				CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail.removeDetail({
					params: params,
					scope: this,
					callback: function () {
						me.view.reload();
					}
				});
			};
		},

		onOpenGraphClick: function(model) {
			this.controllerWindowGraph.cmfg('onPanelGridAndFormGraphWindowConfigureAndShow', {
				classId: model.get('IdClass'),
				cardId: model.get('id')
			});
		},

		/**
		 * @param {Ext.data.Store.ImplicitModel} model
		 *
		 * @returns {Void}
		 */
		onOpenNoteClick: function (model) {
			this.controllerWindowNote.cmfg('classesFormTabMasterDetailWindowNoteConfigureAndShow', {
				cardId: model.get(CMDBuild.core.constants.Proxy.ID),
				className: _CMCache.getEntryTypeNameById(model.get('IdClass'))
			});
		},

		onOpenAttachmentClick: function(model) {
			var w = new CMDBuild.view.management.common.CMAttachmentsWindow();
			new CMDBuild.controller.management.common.CMAttachmentsWindowController(w,modelToCardInfo(model));
			w.show();
		},

		onTabClick: onTabClick,

		/**
		 * @param {Mixed} tab
		 */
		activeTabSet: function(tab) {
			return this.view.tabs.setActiveTab(tab);
		}
	});

	function masterSide(domainRecord) {
		return {
			"1:N" : 1,
			"N:1" : 2
		}[domainRecord.get("cardinality")];
	}

	function detailSide(domainRecord) {
		return 3-masterSide(domainRecord);
	}

	function modelToCardInfo(model) {
		return {
			Id: model.get("Id"),
			IdClass: model.get("IdClass"),
			Description: model.get("Description")
		};
	}

	function onDetailDoubleClick(grid, model, html, index, e, options) {
		CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', {
			Id: model.get("Id"),
			IdClass: model.get("IdClass")
		});
	}

	function removeCard(model) {
		CMDBuild.proxy.management.dataView.filter.panel.form.tabs.MasterDetail.removeCard({
			params: {
				"IdClass": model.get("IdClass"),
				"Id": model.get("Id")
			},
			scope: this,
			success: updateDetailGrid
		});
	}

	function updateDetailGrid() {
		if (this.card != null) {
			var p = {
				masterCard: this.card
			};

			if (this.currentDetail != null) {
				p["detail"] = this.currentDetail;
				this.view.updateGrid(MD, p);
			} else if (this.currentForeignKey != null) {
				p["detail"] = this.currentForeignKey;
				this.view.updateGrid(FK, p);
			} else {
				this.view.activateFirstTab();
			}
		}
	}

	function onTabClick(tab) {
		// if building the details tables cannot select the detail on the grid
		// anyway the onTabClick is called at end of buildTabs
		if (this.view.buildingTabsDetails == true) {
			return;
		}
		if (this.currentTab === tab || !tabIsActive(this.view)) {
			return;
		}

		var targetPanel = tab.targetPanel,
			type = targetPanel.detailType,
			detail = this.view.details[type][targetPanel.detailId];

		this.view.addDetailButton.updateForEntry(this.entryType);
		this.view.addDetailButton.enable();
		this.currentTab = tab;

// TODO: future implementation
//		// History record save
//		if (!this.parentDelegate.cmfg('dataViewSelectedDataViewIsEmpty') && !this.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty'))
//			CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
//				moduleId: this.parentDelegate.cmfg('dataViewIdentifierGet'),
//				entryType: {
//					description: this.parentDelegate.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
//					id: this.parentDelegate.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
//					object: this.parentDelegate.cmfg('dataViewSelectedDataViewGet')
//				},
//				item: {
//					description: this.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
//						|| this.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CODE),
//					id: this.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
//					object: this.parentDelegate.cmfg('dataViewFilterSelectedCardGet')
//				},
//				section: {
//					description: this.view.title,
//					object: this.view
//				},
//				subSection: {
//					description: this.currentTab[CMDBuild.core.constants.Proxy.TEXT],
//					object: this.currentTab.targetPanel
//				}
//			});

		if (type == MD) {
			selectDetail.call(this, detail);
		} else {
			selectFK.call(this, detail);
		}

		updateDetailGrid.call(this);
	}

	function selectDetail(detail) {
		this.currentForeignKey = undefined;
		this.currentDetail = detail;
		this.view.selectDetail(detail);
	}

	function selectFK(fk) {
		this.currentDetail = undefined;
		this.currentForeignKey = fk;
		this.view.selectForeignKey(fk);
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

})();
