(function () {

	/**
	 * @link CMDBuild.view.management.common.widgets.CMOpenAttachment
	 * @link CMDBuild.view.management.classes.attachments.CMCardAttachmentsPanel
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.dataView.filter.panel.form.tabs.attachments.AttachmentsView', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Attachment'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.tabs.attachments.Attachments}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		itemId: 'dataViewFilterFormTabAttachments',
		title: CMDBuild.Translation.attachments,

		eventtype: 'card',
		eventmastertype: 'class',
		hideMode: "offsets",

		initComponent: function () {
			this.addAttachmentButton = Ext.create('CMDBuild.core.buttons.icon.add.Add', {
				text: CMDBuild.Translation.management.modcard.add_attachment
			});

			Ext.apply(this, {
				loadMask: false,
				tbar:[this.addAttachmentButton],
				features: [{
					groupHeaderTpl: '{name} ({rows.length} {[values.rows.length > 1 ? CMDBuild.Translation.management.modcard.attachment_columns.items : CMDBuild.Translation.management.modcard.attachment_columns.item]})',
					ftype: 'groupingsummary'
				}],
				columns: [
					{header: CMDBuild.Translation.management.modcard.attachment_columns.category, dataIndex: 'Category', hidden: true},
					{header: CMDBuild.Translation.management.modcard.attachment_columns.creation_date, sortable: true, dataIndex: 'CreationDate', renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s'), flex: 2},
					{header: CMDBuild.Translation.management.modcard.attachment_columns.modification_date, sortable: true, dataIndex: 'ModificationDate', renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s'), flex: 2},
					{header: CMDBuild.Translation.management.modcard.attachment_columns.author, sortable: true, dataIndex: 'Author', flex: 2},
					{header: CMDBuild.Translation.management.modcard.attachment_columns.version, sortable: true, dataIndex: 'Version', flex: 1},
					{header: CMDBuild.Translation.management.modcard.attachment_columns.filename, sortable: true, dataIndex: 'Filename', flex: 4},
					{header: CMDBuild.Translation.management.modcard.attachment_columns.description, sortable: true, dataIndex: 'Description', flex: 4},
					{header: '&nbsp;', width: 80, sortable: false, renderer: this.renderAttachmentActions, align: 'center', tdCls: 'grid-button', dataIndex: 'Fake'}
				],
				store: CMDBuild.proxy.management.dataView.filter.panel.form.tabs.Attachment.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.panelListenerManagerShow();
			}
		},

		reloadCard: function() {
			this.loaded = false;
			if (this.ownerCt.layout.getActiveItem) {
				if (this.ownerCt.layout.getActiveItem().id == this.id) {
					this.loadCardAttachments();
				}
			} else {
				// it is not in a tabPanel
				this.loadCardAttachments();
			}
		},

		loadCardAttachments: function() {
			if (this.loaded) {
				return;
			}

			this.getStore().load();

			this.loaded = true;
		},

		setExtraParams: function(p) {
			this.store.proxy.extraParams = p;
		},

		clearStore: function() {
			this.store.removeAll();
		},

		renderAttachmentActions: function() {
			var tr = CMDBuild.Translation.management.modcard,
				out = '<img style="cursor:pointer" title="'+tr.download_attachment+'" class="action-attachment-download" src="images/icons/bullet_go.png"/>&nbsp;';

				if (this.writePrivileges) {
					out += '<img style="cursor:pointer" title="'+tr.edit_attachment+'" class="action-attachment-edit" src="images/icons/modify.png"/>&nbsp;'
					+ '<img style="cursor:pointer" title="'+tr.delete_attachment+'" class="action-attachment-delete" src="images/icons/delete.png"/>';
				}

				return out;
		},

		/**
		 * @param {Boolean} writePrivilege
		 */
		updateWritePrivileges: function(writePrivilege) {
			this.writePrivileges = writePrivilege;
			this.addAttachmentButton.setDisabled(!writePrivilege);
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
		onCardSelected: function(card) {
			_deprecated('onCardSelected', this);

			this.updateWritePrivileges(card.raw.priv_write);
		}
	});

})();
