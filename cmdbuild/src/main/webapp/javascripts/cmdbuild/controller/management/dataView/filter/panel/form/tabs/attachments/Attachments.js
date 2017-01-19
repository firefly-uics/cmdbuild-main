(function () {

	/**
	 * @merged CMDBuild.controller.management.classes.attachments.CMCardAttachmentsController
	 * @merged CMDBuild.controller.management.classes.CMModCardSubController
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.management.dataView.filter.panel.form.tabs.attachments.Attachments', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.interfaces.messages.Error',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Attachment',
			'CMDBuild.proxy.index.Json'
		],

		mixins: {
			observable : "Ext.util.Observable",
			attachmentWindowDelegate: "CMDBuild.view.management.CMEditAttachmentWindowDelegate"
		},

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.tabs.attachments.AttachmentsView}
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

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.attachments.AttachmentsView', { delegate: this });

			this.card = null;
			this.entryType = null;

			this.callBacks = {
				'action-attachment-delete': this.onDeleteAttachmentClick,
				'action-attachment-edit': this.onEditAttachmentClick,
				'action-attachment-download': this.onDownloadAttachmentClick
			};

			this.confirmStrategy = null;
			this.delegate = null;

			this.mon(this.view.addAttachmentButton, "click", this.onAddAttachmentButtonClick, this);
			this.mon(this.view, 'beforeitemclick', cellclickHandler, this);
			this.mon(this.view, "itemdblclick", onItemDoubleclick, this);
			this.mon(this.view, 'activate', this.view.loadCardAttachments, this.view);

			// Build sub-controllers
			this.controllerWindowGraph = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', { parentDelegate: this });
		},

		/**
		 * Enable/Disable tab selection based
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		dataViewFilterFormTabAttachmentsUiUpdate: function () {
			if (!this.parentDelegate.cmfg('dataViewFilterSourceEntryTypeIsEmpty'))
				this.onEntryTypeSelected();

			if (!this.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty'))
				this.onCardSelected();

			// Ui view mode manage
			switch (this.parentDelegate.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.view.disable();

				case 'clone':
					return this.view.disable();

				default:
					return this.view.setDisabled(
						!CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED)
						|| this.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty')
					);
			}
		},

		onEntryTypeSelected: function () {
			// FIXME: legacy mode to remove on complete Cards UI and cardState modules refactor
			this.entryType = Ext.create('CMDBuild.cache.CMEntryTypeModel', this.parentDelegate.cmfg('dataViewFilterSourceEntryTypeGet', 'rawData'));

			this.view.disable();
			this.view.clearStore();
		},

		onCardSelected: function () {
			var card = this.parentDelegate.cmfg('dataViewFilterSelectedCardGet');

			this.card = card;

			if (this.theModuleIsDisabled() || !card) {
				return;
			}

			var et = _CMCache.getEntryTypeById(card.get("IdClass"));
			if (this.disableTheTabBeforeCardSelection(et)) {
				this.view.disable();
			} else {
				this.updateView(et);
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 * @legacy
		 */
		panelListenerManagerShow: function () {
			// History record save
			if (!this.parentDelegate.cmfg('dataViewSelectedDataViewIsEmpty') && !this.parentDelegate.cmfg('dataViewFilterSelectedCardIsEmpty'))
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

			// Ui view mode manage
			switch (this.parentDelegate.cmfg('dataViewFilterUiViewModeGet')) {
				case 'add':
					return this.onAddCardButtonClick();

				case 'clone':
					return this.onCloneCard();
			}
		},

		/**
		 * @legacy
		 */
		getView: function () {
			return this.view;
		},

		getCard: function() {
			return this.card || null;
		},

		getCardId: function() {
			var card = this.getCard();
			if (card) {
				return card.get("Id");
			}
		},

		getClassId: function() {
			if (this.card) {
				return this.card.get("IdClass");
			}
		},

		updateView: function(et) {
			this.updateViewPrivilegesForEntryType(et);
			this.setViewExtraParams();
			this.view.reloadCard();
			this.view.enable();
		},

		setViewExtraParams: function() {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(this.getClassId());
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.getCardId();

			this.view.setExtraParams(params);
		},

		disableTheTabBeforeCardSelection: function(entryType) {
			return (entryType && entryType.get("tableType") == CMDBuild.core.constants.Global.getTableTypeSimpleTable());
		},

		onAddCardButtonClick: function () {
			this.view.disable();
		},

		onShowGraphClick: function() {
			this.controllerWindowGraph.cmfg('onPanelGridAndFormGraphWindowConfigureAndShow', {
				classId: this.card.get("IdClass"),
				cardId: this.card.get("Id")
			});
		},

		onCloneCard: function() {
			this.view.disable();
		},

		updateViewPrivilegesForEntryType: function(et) {
			var writePrivileges = null;
			if (et) {
				writePrivileges = et.get("priv_write");
			}

			this.view.updateWritePrivileges(writePrivileges);
		},

		updateViewPrivilegesForTypeId: function(entryTypeId) {
			var et = _CMCache.getEntryTypeById(entryTypeId);
			this.updateViewPrivilegesForEntryType(et);
		},

		onDeleteAttachmentClick: function(record) {
			var me = this;

			Ext.Msg.confirm(tr.delete_attachment, tr.delete_attachment_confirm,
				function(btn) {
					if (btn != 'yes') {
						return;
					}
					doDeleteRequst(me, record);
		 		}, this);
		},

		onDownloadAttachmentClick: function (record) {
			var params = {};
			params['Filename'] = record.get('Filename');
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.getCardId();
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(this.getClassId());

			CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Attachment.download({ params: params });
		},

		onAddAttachmentButtonClick: function() {
			var autocompletionRules = findAutocompletionRules(this);
			var serverVars = CMDBuild.controller.management.common.widgets.CMWidgetController.getTemplateResolverServerVars(this.getCard());
			var templateResolverForm = this.parentDelegate.getFormForTemplateResolver();

			// without the form, the template resolver is not able to
			// do its work. This happen if open the attachments
			// window from the Detail Tab
			var me = this;
			if (templateResolverForm) {
				var mergedRoules = mergeRulesInASingleMap(autocompletionRules);

				new CMDBuild.Management.TemplateResolver({
					clientForm: templateResolverForm,
					xaVars: mergedRoules,
					serverVars: serverVars
				}).resolveTemplates({
					attributes: Ext.Object.getKeys(mergedRoules),
					callback: function(o) {
						createWindowToAddAttachment(me, groupMergedRules(o));
					}
				});
			} else {
				createWindowToAddAttachment(me, autocompletionRules);
			}
		},

		onEditAttachmentClick: function(record) {
			new CMDBuild.view.management.CMEditAttachmentWindow({
				metadataValues: record.getMetadata(),
				attachmentRecord: record,
				delegate: this
			}).show();

			this.confirmStrategy = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.attachments.ModifyAttachmentStrategy', this);
		},


		destroy: function() {
			this.mun(this.view.addAttachmentButton, "click", this.onAddAttachmentButtonClick, this);
			this.mun(this.view, 'beforeitemclick', cellclickHandler, this);
			this.mun(this.view, "itemdblclick", onItemDoubleclick, this);
			this.mun(this.view, 'activate', this.view.loadCardAttachments, this.view);
		},

		theModuleIsDisabled: function() {
			return !CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED);
		},

		// as attachment window delegate

		onConfirmButtonClick: function(attachmentWindow) {
			var form = attachmentWindow.form.getForm();

			if (!form.isValid()) {
				return;
			}

			if (this.confirmStrategy) {
				CMDBuild.core.LoadMask.show();
				attachmentWindow.mask();
				this.confirmStrategy.doRequest(attachmentWindow);
			}
		}
	});

	function createWindowToAddAttachment(me, metadataValues) {
		new CMDBuild.view.management.CMEditAttachmentWindow({
			metadataValues: metadataValues,
			delegate: me
		}).show();

		me.confirmStrategy = Ext.create('CMDBuild.controller.management.dataView.filter.panel.form.tabs.attachments.AddAttachmentStrategy', this);
	}

	function findAutocompletionRules(me) {
		var classId = me.getClassId();
		var rules = {};

		if (classId) {
			var entryType = _CMCache.getEntryTypeById(classId);
			if (entryType) {
				rules = entryType.getAttachmentAutocompletion();
			}
		}

		return rules;
	}

	function cellclickHandler(grid, model, htmlelement, rowIndex, event, opt) {
		var className = event.target.className;

		if (this.callBacks[className]) {
			this.callBacks[className].call(this, model);
		}
	};

	function onItemDoubleclick(grid, model, html, index, e, options) {
		this.onDownloadAttachmentClick(model);
	};

	function doDeleteRequst(me, record) {
		var params = {
			Filename: record.get("Filename")
		};

		params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(me.getClassId());
		params[CMDBuild.core.constants.Proxy.CARD_ID] = me.getCardId();

		CMDBuild.core.LoadMask.show();
		CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Attachment.remove({
			params: params,
			loadMask: false,
			scope: this,
			success: function() {
				// Defer the call because Alfresco is not responsive
				Ext.Function.createDelayed(function deferredCall() {
					CMDBuild.core.LoadMask.hide();
					me.view.reloadCard();
				}, CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ALFRESCO_DELAY), me)();
			},

			failure: function() {
				CMDBuild.core.LoadMask.hide();
			}
		});
	}

	/*
	 * The template resolver want the templates
	 * as a map. Our rules are grouped so I need
	 * to merge them to have a single level map
	 *
	 * To avoid name collision I choose to concatenate
	 * the group name and the meta-data name
	 *
	 * The following two routines do this dirty work
	 */
	var SEPARATOR = "_";
	function mergeRulesInASingleMap(rules) {
		rules = rules || {};
		var out = {};

		for (var groupName in rules) {
			var group = rules[groupName];
			for (var key in group) {
				out[groupName + SEPARATOR + key] = group[key];
			}
		}

		return out;
	}

	function groupMergedRules(mergedRules) {
		var out = {};
		for (var key in mergedRules) {
			var group = null;
			var metaName = null;
			try {
				var s = key.split(SEPARATOR);
				group = s[0];
				metaName = s[1];
			} catch (e) {
				// Pray for my soul
			}

			if (group && metaName) {
				out[group] = out[group] || {};
				out[group][metaName] = mergedRules[key];
			}
		}

		return out;
	}

})();
