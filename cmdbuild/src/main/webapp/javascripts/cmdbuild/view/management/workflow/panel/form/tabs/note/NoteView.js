(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView', {
		extend: 'Ext.panel.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions2'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.Note}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.text.Back}
		 */
		buttonBack: undefined,

		/**
		 * @property {CMDBuild.core.buttons.icon.modify.Modify}
		 */
		buttonModify: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.note.FormPanel}
		 */
		form: undefined,

		border: false,
		cls: 'x-panel-body-default-framed',
		frame: false,
		itemId: 'formTabNote',
		layout: 'fit',
		title: CMDBuild.Translation.note,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							this.buttonModify = Ext.create('CMDBuild.core.buttons.icon.modify.Modify', {
								text: CMDBuild.Translation.modifyNote,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowModifyButtonClick');
								}
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowFormTabNoteSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowAbortButtonClick');
								}
							}),
							this.buttonBack = Ext.create('CMDBuild.core.buttons.text.Back', {
								hidden: true,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowFormTabNoteBackButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.note.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onWorkflowFormTabNoteShow');
			}
		}
	});

})();
