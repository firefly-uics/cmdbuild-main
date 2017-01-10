(function () {

	Ext.define('CMDBuild.view.management.dataView.filter.panel.form.tabs.note.NoteView', {
		extend: 'Ext.panel.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions2'],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.form.tabs.Note}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.form.tabs.note.FormPanel}
		 */
		form: undefined,

		border: false,
		cls: 'x-panel-body-default-framed',
		frame: false,
		itemId: 'formTabNote',
		layout: 'card',
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
							Ext.create('CMDBuild.core.buttons.icon.modify.Modify', {
								text: CMDBuild.Translation.modifyNote,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onDataViewFilterModifyButtonClick');
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
									this.delegate.cmfg('onDataViewFilterFormTabNoteSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onDataViewFilterAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.management.dataView.filter.panel.form.tabs.note.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onDataViewFilterFormTabNoteShow');
			}
		}
	});

})();
