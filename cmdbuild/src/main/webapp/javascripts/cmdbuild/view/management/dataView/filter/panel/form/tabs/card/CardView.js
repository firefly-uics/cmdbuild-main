(function () {

	/**
	 * @merged CMDBuild.view.management.classes.CMCardPanel
	 * @merged CMDBuild.view.management.common.CMFormWithWidgetButtons
	 *
	 * @legacy
	 */
	Ext.define("CMDBuild.view.management.dataView.filter.panel.form.tabs.card.CardView", {
		extend: "Ext.panel.Panel",

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.Utils'
		],

		mixins: {
			widgetManagerDelegate: "CMDBuild.view.management.common.widgets.CMWidgetManagerDelegate"
		},

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.tabs.card.Card}
		 */
		delegate: undefined,

		border: false,
		itemId: 'dataViewFilterFormTabCard',
		title: CMDBuild.Translation.card,

		initComponent: function() {
			this.form = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.card.FormPanel', {
				delegate: this.delegate,
				region: "center"
			});

			CMDBuild.core.Utils.forwardMethods(this, this.form, [
				"loadCard",
				"getValues",
				"reset",
				"getInvalidAttributeAsHTML",
				"fillForm",
				"getForm",
				"hasDomainAttributes",
				"ensureEditPanel",
				"isInEditing"
			]);

			this.widgets = new CMDBuild.view.management.common.widget.CMWidgetButtonsPanel({
				region: 'east',
				hideMode: 'offsets',
				cls: "cmdb-border-left",
				autoScroll: true,
				frame: true,
				border: false,
				items: []
			});

			CMDBuild.core.Utils.forwardMethods(this, this.widgets, ["removeAllButtons", "addWidget"]);
			this.widgets.hide();

			Ext.apply(this, {
				layout: "border",
				items: [this.form, this.widgets]
			});

			this.callParent(arguments);

			this.CMEVENTS = Ext.apply(this.form.CMEVENTS, this.widgets.CMEVENTS);
			this.relayEvents(this.widgets, [this.widgets.CMEVENTS.widgetButtonClick]);

			var ee = this.form.CMEVENTS;
			this.relayEvents(this.form, [
				ee.editModeDidAcitvate,
				ee.displayModeDidActivate
			]);

			this.mon(this, "activate", function() {
				this.form.fireEvent("activate");
			}, this);
		},

		listeners: {
			show: function(panel, eOpts) {
				// History record save
				if (!this.delegate.parentDelegate.cmfg('dataViewSelectedDataViewIsEmpty') && !this.delegate.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty'))
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: this.delegate.parentDelegate.cmfg('dataViewIdentifierGet'),
						entryType: {
							description: this.delegate.parentDelegate.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
							id: this.delegate.parentDelegate.cmfg('dataViewSelectedDataViewGet', CMDBuild.core.constants.Proxy.ID),
							object: this.delegate.parentDelegate.cmfg('dataViewSelectedDataViewGet')
						},
						item: {
							description: this.delegate.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
								|| this.delegate.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.CODE),
							id: this.delegate.parentDelegate.cmfg('dataViewFilterSelectedCardGet', CMDBuild.core.constants.Proxy.ID),
							object: this.delegate.parentDelegate.cmfg('dataViewFilterSelectedCardGet')
						},
						section: {
							description: this.title,
							object: this
						}
					});
			}
		},

		clear: function() {
			this.form.removeAll(true);
			this.widgets.removeAll(true);
			this.widgets.hide();
			this.displayMode();
		},

		displayMode: function(enableCMTbar) {
			this.form.displayMode(enableCMTbar);
			this.widgets.displayMode();
		},

		displayModeForNotEditableCard: function() {
			this.form.displayModeForNotEditableCard();
			this.widgets.displayMode();
		},

		editMode: function() {
			this.form.editMode();
			this.widgets.editMode();
		},

		isTheActivePanel: function() {
			var out = true;
			try {
				out = this.ownerCt.layout.getActiveItem() == this;
			} catch (e) {
				// if fails, the panel is not in a TabPanel, so don't defer the call
			}

			return out;
		},

		formIsVisisble: function() {
			return this.form.isVisible(deep = true);
		},

		// CMWidgetManagerDelegate

		getFormForTemplateResolver: function() {
			return this.form.getForm();
		},

		showCardPanel: Ext.emptyFn,

		getWidgetButtonsPanel: function() {
			return this.widgets;
		}
	});

})();
